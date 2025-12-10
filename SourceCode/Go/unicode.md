在 Go 中，`unicode` 包的所有操作对象都是 `rune`（即 `int32` 的别名）。它代表一个 Unicode 码点，而不是字节。
- `unicode` 包：负责**字符属性**（它是字母吗？是汉字吗？是空格吗？）
- `unicode/utf8` 包：负责**编码实现**（`rune` 和 `[]byte` 之间的转换）

常用功能分类
- `unicode.IsDigit(r)`: 是否为十进制数字 (0-9)。
- `unicode.IsNumber(r)`: 是否为数字字符 (包括罗马数字 Ⅷ 等)。
- `unicode.IsLetter(r)`: 是否为字母 (包括汉字、希腊字母等)。
- `unicode.IsSpace(r)`: 是否为空白字符 (包括空格、制表符 `\t`、换行 `\n`，以及全角空格等)**更安全**。
- `unicode.IsControl(r)`: 是否为控制字符。
- `unicode.IsPunct(r)`: 是否为标点符号。
- `unicode.IsPrint(r)`: 是否为可打印字符。
- `unicode.ToUpper(r)`: 转大写。
- `unicode.ToLower(r)`: 转小写。
- `unicode.ToTitle(r)`: 转标题格式（对某些连字通常也是大写，但在某些特殊语言如克罗地亚语中有区别）。

底层数据结构**RangeTable**，以时间换空间：二分查找+RangeTable
```go
// 源码结构简化
type RangeTable struct {
    R16         []Range16 // 16位范围 (BMP平面，绝大多数常用字符)
    R32         []Range32 // 32位范围 (增补平面，如 Emoji)
    LatinOffset int       // 优化：快速跳过 Latin-1 字符
}

type Range16 struct {
    Lo     uint16 // 起始码点
    Hi     uint16 // 结束码点
    Stride uint16 // 步长 (通常是1，但在某些交替出现的字符集中可能是2)
}
```