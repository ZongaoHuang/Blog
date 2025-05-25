
# sync

未完待续
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

