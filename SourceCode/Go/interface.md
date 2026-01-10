## 接口数据结构
Interface 是一组方法签名的集合。一个类型只要实现了接口中定义的所有方法，它就自动实现了该接口。不需要写 `implements` 关键字。

Go Runtime定义了两种接口结构：

1.eface (Empty Interface) —— 空接口 interface{}，于表示没有方法的接口（即 `any`）。因为它不需要查方法表，所以结构简单。
```go
type eface struct {
    _type *_type          // 1. 动态类型：指向这个数据的类型信息（它是 int? string? 还是 Dog?）
    data  unsafe.Pointer  // 2. 动态值：指向具体数据的内存地址
}
```

2.iface (Non-empty Interface) —— 非空接口，用于包含方法的接口。它需要知道怎么调用那些方法
```go
type iface struct {
    tab  *itab           // 1. 接口表：包含类型信息 + 方法分发表（函数指针列表）
    data unsafe.Pointer  // 2. 动态值：指向具体数据的内存地址
}
```
- **`tab` (itable)**：这是一个核心结构，存储了接口类型、具体类型以及方法实现的函数指针列表。通过它，Go 实现了动态派发（调用时才知道具体执行哪个函数）。
- **`data`**：指向具体数据的指针。

itab不是在编译期静态生成的，而是在**运行时 (Runtime)** 第一次将某个具体类型赋值给某个接口类型时，动态生成（或从缓存获取）的。
```go
type itab struct {
    inter *interfacetype // 1. 静态：接口自身的类型信息 (如 "io.Reader")
    _type *_type         // 2. 静态：具体类型的类型信息 (如 "*os.File")
    hash  uint32         // 3. 动态：_type.hash 的拷贝，用于快速类型断言
    _     [4]byte        //    (内存对齐填充)
    fun   [1]uintptr     // 4. 动态：函数指针数组 (可变长度)
}
```

### 具体例子说明如下：
```go
// 1. 定义接口 (2个方法)
type Sayer interface {
    Hello()
    World()
}

// 2. 定义具体类型 (3个方法)
type Cat struct { id int }

// Cat 实现了 Sayer，还多了一个 Eat 方法
func (c Cat) Eat()   { println("eat") }   // 首字母 E
func (c Cat) Hello() { println("hello") } // 首字母 H
func (c Cat) World() { println("world") } // 首字母 W

func main() {
    var s Sayer
    c := Cat{id: 1}
    s = c // 关键时刻：生成/查找 itab
    s.Hello()
}
```

`itab` 的构建过程 (Runtime)：当执行 `s = c` 时，Go Runtime 会检查系统中是否已经存在 `(Sayer, Cat)` 这一对组合的 `itab`。如果不存在，就开始构建：
- 获取元数据：拿到 `Sayer` 的方法列表：`[Hello, World]` (已排序)。拿到 `Cat` 的方法列表：`[Eat, Hello, World]` (已排序)
- 双指针算法 `(O(N+M))` 填充 `fun`：Runtime 会同时遍历上面两个列表。它在 `Cat` 的方法里找 `Hello`和`World`。把 `Cat.Hello` 的函数地址填入 `itab.fun[0]`。把 `Cat.World` 的函数地址填入 `itab.fun[1]`。`Cat.Eat` 方法会被**忽略**，因为它不在接口定义中。

最终内存结构：
```
变量 s (iface)
+-------+-------+
|  tab  | data  |
+---|---+---|---+
    |       |
    |       +----> [ Cat实例: {id: 1} ]
    |
    v (itab)
+-------------------------+
| inter: (Sayer 类型信息)   |
| _type: (Cat 类型信息)     |
| hash:  (Cat 的哈希值)     |
| fun[0]: &Cat.Hello      | <--- 真正调用的地址
| fun[1]: &Cat.World      |
+-------------------------+
```

当代码执行 `s.Hello()` 时，底层的汇编逻辑是这样的：
- 解引用 tab：读取 `s.tab`，拿到 `itab` 地址。
- 查表：`Hello` 是 `Sayer` 接口的第 1 个方法。所以直接读取 `itab.fun[0]`。
- 跳转：`CALL` 这个地址，并将 `s.data` (即 `Cat` 实例) 作为第一个参数（接收者）传进去。

### 设计优点
- 空间换时间 (Caching)：
    - `itab` 不是每次赋值都重新计算。Runtime 有一个全局的 Hash 表用来缓存 `itab`。
    - 对于 `(io.Reader, *os.File)` 这种高频组合，`itab` 只会生成一次，之后都是 O(1) 获取。
- O(1) 的动态派发：
    - 对比 Java/C++，Go 的接口方法调用是直接通过数组索引拿地址的（`fun[0]`, `fun[1]`）。不需要像某些动态语言那样遍历方法名字符串来查找。
    - 虽然比直接调用慢一点（多了一次内存寻址 `tab -> fun`），但依然非常快。
- Duck Typing 的代价：
    - C++ 的虚函数表是编译期生成好的，因为类继承关系是写死的。
    - Go 的接口是隐式的，编译期不知道哪个 struct 会赋值给哪个 interface。所以必须在**运行时**动态生成 `itab`。这也是 Go 二进制文件稍微大一点、启动稍微慢一点点的原因之一


## 接口nil的判断
题目：
```go
func main() {
    var p *int = nil      // 定义一个空的 int 指针
    var i interface{} = p // 把这个空指针赋值给接口

    if i == nil {
        fmt.Println("i 是 nil")
    } else {
        fmt.Println("i 不是 nil")
    }
}
```

输出：i不是nil, 原因：`i == nil` 的标准是：Type 和 Data 必须同时为 nil。此时 i 的内部结构是 `(*int, nil)`。虽然数据是空的，但类型不是空的，所以接口本身不等于 nil。

避坑的写法：
```go
// 错误写法
func GetObject() interface{} {
    var p *Object = nil
    return p // 返回了一个 (*Object, nil)，判空会失败
}

// 正确写法
func GetObject() interface{} {
    return nil // 返回 (nil, nil)
}
```