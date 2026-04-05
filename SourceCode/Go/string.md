关于字符串的拼接：[Go 字符串拼接6种，最快的方式 -- strings.builder - 技术颜良 - 博客园](https://www.cnblogs.com/cheyunhua/p/15769717.html)

使用 `strings.builder` 性能最好：

`Go`语言提供了一个专门操作字符串的库`strings`，使用`strings.Builder`可以进行字符串拼接，提供了`writeString`方法拼接字符串，使用方式如下：

```go
var builder strings.Builder
builder.WriteString("asong")
builder.String()
```

`strings.builder`的实现原理很简单，结构如下：

```go
type Builder struct {
    addr *Builder // of receiver, to detect copies by value
    buf  []byte // 1
}
```

`addr`字段主要是做`copycheck`，`buf`字段是一个`byte`类型的切片，这个就是用来存放字符串内容的，提供的`writeString()`方法就是像切片`buf`中追加数据：

```go
func (b *Builder) WriteString(s string) (int, error) {
 b.copyCheck()
 b.buf = append(b.buf, s...)
 return len(s), nil
}
```

提供的`String`方法就是将`[]]byte`转换为`string`类型，这里为了避免内存拷贝的问题，使用了强制转换来避免内存拷贝：

```go
func (b *Builder) String() string {
 return *(*string)(unsafe.Pointer(&b.buf))
}
```