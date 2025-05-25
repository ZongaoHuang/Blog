# strconv
主要是一些类型转换的函数

| Func                                                                            | 功能                                      | 示例                                                                                                                                                           |
| ------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `func Atoi(s string) (int, error)`                                              | `sting`转`int`                           | `i, err := strconv.Atoi("-42")`                                                                                                                              |
| `func Itoa(i int) string`                                                       | `int`转`string`                          | `s := strconv.Itoa(-42)`                                                                                                                                     |
| `func ParseBool(str string) (bool, error)`                                      | `string`转`Bool`                         | `b, err := strconv.ParseBool("true")`                                                                                                                        |
| `func ParseFloat(s string, bitSize int) (float64, error)`                       | `string`转`Float`                        | `f, err := strconv.ParseFloat("3.1415", 64)`                                                                                                                 |
| `func ParseInt(s string, base int, bitSize int) (i int64, err error)`           | `string`按照`base`（10进制）转`size`（64位）`int` | `i, err := strconv.ParseInt("-42", 10, 64)`                                                                                                                  |
| `FormatBool, FormatFloat, FormatInt, and FormatUint convert values to strings:` | 其他类型转`string`                           | `s := strconv.FormatBool(true)`<br>`s := strconv.FormatFloat(3.1415, 'E', -1, 64)`<br>`s := strconv.FormatInt(-42, 16)`<br>`s := strconv.FormatUint(42, 16)` |
关于其中的`Quote`方法，返回字符串中的控制字符和不可打印字符使用 `Go` 转义序列(`\t、\n、\xFF、\u0100`)

例如：
```go

import "strconv"
s := strconv.Quote("Hello, world!\n")
fmt.Println(s)

//输出
"Hello, world!\n"

```
实际用途：日志输出、数据库存储等场景，以确保程序的稳定性和可靠性。

## 类型转换相关
- 断言：使用类似`var s = x.(T)`或者`s, ok := x.(T)`的形式，还可以使用类型`switch`
```go
switch i := x.(type) {
case nil:
    printString("x is nil")                // type of i is type of x (interface{})
case int:
    printInt(i)                            // type of i is int
case float64:
    printFloat64(i)                        // type of i is float64
case func(int) float64:
    printFunction(i)                       // type of i is func(int) float64
case bool, string:
    printString("type is bool or string")  // type of i is type of x (interface{})
default:
    printString("don't know the type")     // type of i is type of x (interface{})
}

```
- 强制类型转换，主要使用`unsafe.Pointer`
- 显示类型转换：使用转换表达式`T(x)`,例如：`text[]byte("ssss")`
- 隐式类型转换：主要在接口的类型赋值上。