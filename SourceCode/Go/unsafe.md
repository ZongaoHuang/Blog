# unsafe
源码链接：[unsafe.go - Go](https://cs.opensource.google/go/go/+/refs/tags/go1.24.3:src/unsafe/unsafe.go)

主要使用类型：`type Pointer *ArbitraryType`，Pointer 可以指向任意类型，实际上它类似于 C 语言里的 `void*`。

`unsafe` 包提供了 2 点重要的能力：
1. 任何类型的指针和 `unsafe.Pointer` 可以相互转换。
2. `uintptr` 类型和 `unsafe.Pointer` 可以相互转换。

![](attachments/Pasted%20image%2020250512154103.png)

`pointer` 不能直接进行数学运算，但可以把它转换成 `uintptr`，对 `uintptr` 类型进行数学运算，再转换成 `pointer` 类型。

应用举例：
1. 利用 unsafe.Pointer 获取 slice & map 的长度
2. 利用 unsafe.Pointer 修改私有成员
3. 实现字符串和byte切片的零拷贝转换

详细说一下第三个例子：

```go
//String底层
type StringHeader struct {
	Data uintptr
	Len  int
}

//Slice底层
type SliceHeader struct {
	Data uintptr
	Len  int
	Cap  int
}

//共享底层的Data和Len实现zero-copy
func string2bytes(s string) []byte {
	return *(*[]byte)(unsafe.Pointer(&s))
}
func bytes2string(b []byte) string{
	return *(*string)(unsafe.Pointer(&b))
}

```




