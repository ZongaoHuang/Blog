# 格式化代码
`gofmt`工具可以对代码进行格式化
- 在命令行输入`gofmt -w program.go`会格式化该源文件的代码然后将格式化后的代码覆盖原始内容（如果不加参数 `-w` 则只会打印格式化后的结果而不重写文件）。
- `gofmt -w *.go`会格式化并重写所有 Go 源文件。
- `gofmt map1`会格式化并重写 map1 目录及其子目录下的所有 Go 源文件。
# 字符串和切片
字符串是一种值类型，且值不可变，即创建某个文本后你无法再次修改这个文本的内容；更深入地讲，字符串是字节的定长数组。

# 递归中的切片复制
## 代码
```go
func combinationSum(candidates []int, target int) (ans [][]int) {

    comb := []int{}

    var dfs func(target, idx int)

    dfs = func(target, idx int){

        if idx == len(candidates){

            return

        }

        if target == 0{

            ans = append(ans, append([]int(nil), comb...))

            return

        }

  

        dfs(target, idx + 1)

  

        if target-candidates[idx] >= 0{

            comb = append(comb, candidates[idx])

            dfs(target-candidates[idx], idx)

            comb = comb[:len(comb) - 1]

        }

    }

    dfs(target, 0)

    return

}
```
## 详解
主要说一下其中的`ans = append(ans, append([]int(nil), comb...))`这段代码：
在 Go 语言中，`append([]int(nil), comb...)` 这行代码执行了两个主要功能：

1. **创建一个新的整数切片**：通过使用 `[]int(nil)`，这部分代码创建了一个 `nil` 的整数切片。在 Go 中，`nil` 是切片的零值，可以视作一个空切片。因此，`[]int(nil)` 等同于声明一个新的空切片。
    
2. **复制 `comb` 切片中的所有元素**：通过使用 `append` 函数和扩展操作符 `...`，这段代码将 `comb` 切片中的所有元素复制到新创建的空切片中。这里的 `...` 符号用于将一个切片的元素展开，作为 `append` 函数的多个参数传入。
    
**为什么需要复制切片？**
在递归过程中，`comb` 切片被用作一个临时变量，存储当前路径或组合的一部分。由于切片在 Go 中是引用类型，直接将 `comb` 添加到结果列表 `ans` 中会导致所有结果都指向同一个切片，这个切片在递归过程中不断被修改。

为了避免这个问题，需要在将 `comb` 添加到 `ans` 之前创建它的一个副本。这样，每个组合都有一个独立的切片副本，它们的内容在递归过程中不会被改变。这是处理引用类型数据（如切片和映射）时常见的问题和解决方法。