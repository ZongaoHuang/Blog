## sync.pool

顶层结构

```go
type Pool struct {
	noCopy noCopy     // 1. 防止结构体被值拷贝（静态检查机制）

	local     unsafe.Pointer // 2. 指向 [P]poolLocal 数组的指针, 数组长度等于 GOMAXPROCS，每个P对应数组中的一个元素
	localSize uintptr        // 3. 数组的大小 (等于 P 的数量，GOMAXPROCS)

	victim     unsafe.Pointer // 4. 受害者缓存 (上一轮 GC 幸存者)
	victimSize uintptr

	New func() any // 5. 自定义构造函数 (池子空时调用)
}
```

P的本地池 `poolLocal`（local数据中具体的元素）
```go
type poolLocal struct {
	poolLocalInternal // 核心存储区

	// 【面试杀手锏】CPU 缓存行填充 (Cache Line Padding)
	// 防止 False Sharing (伪共享) 导致性能下降。
	pad [128 - unsafe.Sizeof(poolLocalInternal{})%128]byte
}
```
**pad 的作用**：CPU 的 L1/L2 缓存是按 Cache Line (通常 64 或 128 字节) 读取的。如果 P1 和 P2 的 poolLocal 挨得太近（在同一个 Cache Line 里），当 P1 修改自己的数据时，P2 的缓存行也会失效，导致 P2 必须强制重新从内存读取。pad 强行把它们撑开，保证每个 P 的数据独占一个缓存行。

内部存储 `poolLocalInternal`
```go
type poolLocalInternal struct {
	private any       // 1. 私有区 (只能被 owner P 访问)
	shared  poolChain // 2. 共享区 (双向链表，支持 Steal)
}
```

- `private`：**速度最快，完全无锁**。只能存放 1 个对象。Get/Put 优先操作这里。
- `shared`：双端队列 (Deque)。
    - Owner P：从 Head 存取 (PushHead/PopHead)。
    - Thief P (其他 P)：从 Tail 偷取 (PopTail)。
    - 底层是一个无锁/乐观锁链表 (`poolChain`)。

### `Get` 和 `Put` 流程

#### Get()：获取对象流程

2. Pin (绑定)：调用 `runtime_procPin()`。这将当前 G 固定在当前 P 上，禁止抢占，同时返回 P 的 ID (`pid`)。
3. 查 Private：
    - 查看 `local[pid].private`。
    - 如果不为空：清空 `private`，返回对象。**（耗时约 1ns，极快）**
4. 查 Shared (Head)：`private` 为空。去 `local[pid].shared` 的头部弹出一个。
5. Steal (偷窃)：
    - `shared` 也空了。
    - 遍历其他 P 的 `shared` 尾部，尝试偷一个 (PopTail)。
    - 注：为了防止一直偷不到导致 CPU 空转，这里使用了基于随机的 Steal 策略
6. 查 Victim：都没偷到。去 `victim` (受害者缓存) 里找一遍（流程同上：先 private 后 shared）。
7. New：实在没有了。调用用户定义的 `New()` 函数创建一个新的。
8. Unpin：解除 P 绑定。

####  Put()：归还对象流程

调用 `pool.Put(x)`：
1. Pin：固定当前 P。
2. 存 Private：如果 `local[pid].private` 是空的，直接把 x 放在这里。
3. 存 Shared：如果 `private` 已经占了，把 x 推入 `local[pid].shared` 的头部。
4. Unpin。
## Once

源码链接：[once.go - Go](https://cs.opensource.google/go/go/+/refs/tags/go1.24.3:src/sync/once.go)

应用：
- 单例模式
结构体：
```go

// In the terminology of [the Go memory model],
// the return from f “synchronizes before”
// the return from any call of once.Do(f).

type Once struct {
	_ noCopy
	
	//`0`表示函数`f`没有执行，`1`则表示已执行；排在结构体的第一个字段位置是因为并发场景下绝大部分 goroutine 只会使用到`done`，而用不到`m Mutex`，这样方便 CPU 对`done`进行相关指令优化；
	done atomic.Uint32
	//在`sync.Once`结构体中除了`done`字段还有一个`m`字段，是一把`sync.Mutex`互斥锁，可以用这把锁保护`done`字段的访问，以确保并发场景下只有一个 goroutine 能够执行函数`f`
	m    Mutex


}
```
Do：
```go
func (o *Once) Do(f func()) {
	// Note: Here is an incorrect implementation of Do:
	//
	//	if o.done.CompareAndSwap(0, 1) {
	//		f()
	//	}
	

	if o.done.Load() == 0 {
		// Outlined slow-path to allow inlining of the fast-path.
		o.doSlow(f)
	}
}
```

sync.Once()的要求：
1. 传入的函数`f`只被执行一次；
2. 传入的函数`f`的执行与返回必须发生于任何`Do`调用的返回之前。

注释里举了一个错误示例，`CAS`操作只满足了`f`只执行一次，却忽略了第二个条件。这是因为`Once`的目的是执行一次`f`，如果`A`获得了锁，但执行f失败，之后的其他`goroutin`e会因为`CAS`而直接返回，`f`一直无法执行。用`load`的话是原子的取出`done`值来判断，可以避免这种错误。

```go
func (o *Once) doSlow(f func()) {
	o.m.Lock()
	defer o.m.Unlock()
	if o.done.Load() == 0 {
		defer o.done.Store(1)
		f()
	}
}
```

doSlow中首先加锁，然后对done进行二次检查，这里的目的是避免重复执行f，如图。
![](attachments/Pasted%20image%2020250515154802.png)

## OnceFunc
源码链接：[oncefunc.go - Go](https://cs.opensource.google/go/go/+/refs/tags/go1.24.3:src/sync/oncefunc.go)

go1.21加入的，封装了 sync.Once 来更好的实现单例模式

`func OnceFunc(f func()) func()`：**参数 `f func()`**: 你希望确保只执行一次的无参数、无返回值的函数。**返回值 `func()`**: 一个新的函数。调用这个新函数会（在首次调用时）执行 `f`

源码：
```go
func OnceFunc(f func()) func() {
	var (
		once  Once
		valid bool
		p     any
	)
	// Construct the inner closure just once to reduce costs on the fast path.
	g := func() {
		defer func() {
			p = recover()
			if !valid {
				// Re-panic immediately so on the first call the user gets a
				// complete stack trace into f.
				panic(p)
			}
		}()
		f()
		f = nil      // Do not keep f alive after invoking it.
		valid = true // Set only if f does not panic.
	}
	return func() {
		once.Do(g)
		if !valid {
			panic(p)
		}
	}
}
```
- 定义了一个`Once`变量，用来使用`sync.Once`确保执行一次
- 使用`vaild`标志，主要用于判断在执行过程中是否出现 `panic`。
- 定义了 `p any`用来存储`panic`，同时在内部定义了一个闭包函数，使用 `defer-recover` 来延迟捕获`panic`，如果第一次发生了`panic`，对于后续的调用都会返回同样的 `panic`

示例：
```go
package main

import (
	"fmt"
	"sync"
	"time"
)

var data string

func initializeData() {
	fmt.Println("Initializing data...")
	time.Sleep(100 * time.Millisecond) // 模拟一些耗时操作
	data = "Hello, OnceFunc!"
}

// 使用 OnceFunc 包装 initializeData
var getDataOnceFunc = sync.OnceFunc(initializeData)

func getData() string {
	getDataOnceFunc() // 调用包装后的函数
	return data
}

func main() {
	var wg sync.WaitGroup
	for i := 0; i < 5; i++ {
		wg.Add(1)
		go func(id int) {
			defer wg.Done()
			fmt.Printf("Goroutine %d trying to get data.\n", id)
			val := getData()
			fmt.Printf("Goroutine %d: %s\n", id, val)
		}(i)
	}
	wg.Wait()

	fmt.Println("--------------------")
	// 再次调用，initializeData 不会再执行
	fmt.Println("Main goroutine (1st call):", getData())
	fmt.Println("Main goroutine (2nd call):", getData())
}
```
## WaitGroup
涉及到race和runtime。源码之后再看吧

结构体：

```go
type WaitGroup struct {
	noCopy noCopy

	state atomic.Uint64 // high 32 bits are counter, low 32 bits are waiter count.
	sema  uint32
}
```

三个函数：
- `func (wg *WaitGroup) Add(delta int)`
- `func (wg *WaitGroup) Done()`
- `func (wg *WaitGroup) Wait()`

## Cond

源码链接：[cond.go - Go](https://cs.opensource.google/go/go/+/refs/tags/go1.24.3:src/sync/cond.go)

`sync.Cond` 条件变量用来协调想要访问共享资源的那些 `goroutine`，当共享资源的状态发生变化的时候，它可以用来通知被互斥锁阻塞的 `goroutine`。

适合场景：多个`goroutine`等待，一个`goroutine`通知时间发生的场景。

结构体：
```go
type Cond struct {
	noCopy noCopy

	// L is held while observing or changing the condition
	L Locker

	notify  notifyList
	checker copyChecker
}	
```

每个 `Cond` 实例都会关联一个锁 L（互斥锁 `Mutex`，或读写锁 `RWMutex`），当修改条件或者调用 `Wait` 方法时，必须加锁。如果在调用Wait方法前未加锁，此时会直接panic。（**调用 Wait() 函数前，需要先获得条件变量的成员锁，原因是需要互斥地变更条件变量的等待队列。在 Wait() 返回前，会重新上锁。重新上锁的原因是主调在 Wait 后会进行解锁操作，避免重复解锁引发 panic**）

```go
func (c *Cond) Wait() {
	c.checker.check()
	t := runtime_notifyListAdd(&c.notify)
	c.L.Unlock()
	runtime_notifyListWait(&c.notify, t)
	c.L.Lock()
}
```

`checker`：用于禁止运行期间发生拷贝，双重检查`(Double check)`

当调用Wait方法时，此时Wait方法会释放所持有的锁，然后将自己放到notifyList等待队列中等待。此时会将当前协程加入到等待队列的尾部，然后进入阻塞状态。使用方法示例如下：

```go
// Wait returns. Instead, the caller should Wait in a loop:
//
	c.L.Lock()
	for !condition() {
	    c.Wait()
	}
	... make use of condition ...
	c.L.Unlock()
```

这里使用 `for !condition()`，由于`Wait`函数被唤醒时存在**虚假唤醒**等情况，导致唤醒后发现，条件依旧不成立，因此需要使用 for 语句来循环地进行等待，直到条件成立为止。

在多核处理器下，`pthread_cond_signal`可能会激活多于一个线程（阻塞在条件变量上的线程）。结果就是，当一个线程调用`pthread_cond_signal()`后，多个调用`pthread_cond_wait()`或`pthread_cond_timedwait()`的线程返回。这种效应就称为“虚假唤醒”。

虚假唤醒举例：

举个例子，我们现在有一个生产者-消费者队列和三个线程。
**1）** 1号线程从队列中获取了一个元素，此时队列变为空。
**2）** 2号线程也想从队列中获取一个元素，但此时队列为空，2号线程便只能进入阻塞(cond.wait())，等待队列非空。
**3）** 这时，3号线程将一个元素入队，并调用cond.notify()唤醒条件变量。
**4）** 处于等待状态的2号线程接收到3号线程的唤醒信号，便准备解除阻塞状态，执行接下来的任务(获取队列中的元素)。
**5）** 然而可能出现这样的情况：当2号线程准备获得队列的锁，去获取队列中的元素时，此时1号线程刚好执行完之前的元素操作，返回再去请求队列中的元素，1号线程便获得队列的锁，检查到队列非空，就获取到了3号线程刚刚入队的元素，然后释放队列锁。
**6）** 等到2号线程获得队列锁，判断发现队列仍为空，1号线程“偷走了”这个元素，所以对于2号线程而言，这次唤醒就是“虚假”的，它需要再次等待队列非空。


其他函数：
- `func NewCond(l Locker) *Cond`：创建实例，需要先定义一个`Locker`
- `func (c *Cond) Broadcast()`：广播唤醒所有协程
- `func (c *Cond) Signal()`：唤醒一个协程

使用示例：
```go
var done = false  
  
func read(name string, c *sync.Cond) {  
	c.L.Lock()  
	for !done {  
		c.Wait()  
	}  
	log.Println(name, "starts reading")  
	c.L.Unlock()  
}  
  
func write(name string, c *sync.Cond) {  
	log.Println(name, "starts writing")  
	time.Sleep(time.Second)  
	c.L.Lock()  
	done = true  
	c.L.Unlock()  
	log.Println(name, "wakes all")  
	c.Broadcast()  
}  
  
func main() {  
	cond := sync.NewCond(&sync.Mutex{})  
  
	go read("reader1", cond)  
	go read("reader2", cond)  
	go read("reader3", cond)  
	write("writer", cond)  
  
	time.Sleep(time.Second * 3)  
}
```

## sync.map

博客：https://golangstar.cn/go_series/go_principles/sync.map_principles.html#sync-map

### 总结
- sync.Map是一个线程安全的map,可以多线程并发安全执行
- sync.Map的核心思想是采用空间换时间,内置了两个map来存储数据,read和dirty,其中read支持原子操作,read的操作不加锁,dirty操作需要加锁
- sync.Map将增删改查四个操作都做了细分,只有新增操作直接加锁操作dirty,其余的改,查,还有删除都是优先不加锁操作read,在发现read中没有对应key或者需要同步数据到dirty的时候才会加锁操作dirty,这样尽可能减少加锁次数,提升程序性能
- 在删除一个key的时候,如果key存在于read中则是延迟删除,key存在于dirty,不存在于read会立即删除
- dirty和read都会依靠另一个进行重建,在dirty不为空的时候,dirtyf包含map中的所有有效key,在dirty为空的时候,read包含map中的所有有效key
- read中的key在dirty中可能存在,也可能不存在;dirty中的key在reatd中也可能存在,可能不存在
- sync.Map中的entry里的p指针有三种状态,nil,正常值还有expungged