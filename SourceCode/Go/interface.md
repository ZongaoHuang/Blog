## 接口数据结构
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