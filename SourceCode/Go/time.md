# time
源码链接：[time.go - Go](https://cs.opensource.google/go/go/+/refs/tags/go1.24.3:src/time/time.go)

Time的结构体代码如下：
```go
type Time struct {
	wall uint64
	ext int64
	loc *Location
}
```

Timer:
```go
type Timer struct {
	C         <-chan Time
	initTimer bool
}```

Ticker：
```go
type Ticker struct {
	C          <-chan Time 
	// The channel on which the ticks are delivered.
	initTicker bool
}
```

常用类型和函数
- `func Now() Time`：当前时间
- `func (t Time) Add(d Duration) Time`：返回 t + d
- `func (t Time) After(u Time) bool`：判断t是否在u之后
- `func (t Time) Before(u Time) bool`：判断t是否在u之前
- `type Duration int64`：时间间隔类型
- `func Since(t Time) Duration`：现在距离t过了多久
- `func NewTimer(d Duration) *Timer`：创建一个计时器，本质上是一个缓冲区为1的`channel`
- `func (t *Timer) Stop() bool`：用`defer t.Stop()`
- `func AfterFunc(d Duration, f func()) *Timer`：在过了d时间后，创建一个`goroutine`执行`f`，返回一个`Timer`用来取消`goroutine`
- `func NewTicker(d Duration) *Ticker`：创建一个定时器，本质上是一个缓冲区为1的`channel`，每隔d时间向通道发送当前时间
- `func (t *Ticker) Stop()`：用 `defer t.Stop()`
- `func After(d duration) <- chan Time`：一般用在超时处理

```go
func main(){
	select {
	case m := <-c:
		handle(m)
	case <-time.After(10 * time.Second):
		fmt.Println("timed out")
	}
}
```
- `func Sleep(d Duration)`: 
	`time.Sleep()`函数的内部实现基于Go语言的调度器。调度器负责管理goroutines的执行，确保它们按照预定的顺序执行。以下是`time.Sleep()`函数的工作原理：
	
	1. 调度器将当前goroutine的状态设置为`waiting`，并从运行队列中移除。
	2. 当前goroutine将不再占用系统资源，直到暂停时间结束。
	3. 经过指定的暂停时间后，调度器将当前goroutine的状态设置为`runnable`，并重新将其加入运行队列。
	4. 当前goroutine将继续执行，直到它再次进入`waiting`状态或程序结束。
	
	这种设计使得`time.Sleep()`函数非常高效，因为它不会创建新的goroutine或线程，而是简单地让当前goroutine在指定时间内不占用系统资源。
