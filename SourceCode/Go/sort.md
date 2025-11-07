# sort
源码链接：[sort package - sort - Go Packages](https://pkg.go.dev/sort)

sort.Interface 接口：需要实现Len，Less，Swap三个方法，然后调用 sort.Sort()
```go
type Interface interface { 
	// Len is the number of elements in the collection. 
	Len() int 
	// Less reports whether the element with // index i should sort before the element with index j. 
	Less(i, j int) bool 
	// Swap swaps the elements with indexes i and j.
	Swap(i, j int) 
```

常用结构和函数：
- `type IntSlice/StringSlice/Float64Slice`：自带的三种排序类型
- `func Search(n int, f func(int) bool) int`：在 `[0, n)` 之间查找满足 `func f` 条件的下标（使用二分查找），返回的是要插入的下标
- `func Find(n int, cmp func(int) int) (i int, found bool)` : 在 `[0, n)` 之间满足 `func cmp` 条件的下标（使用二分查找）， 返回下标和是否找到

利用append实现字符串反转，代码示例：
```go
package mainimport "fmt"func main() {

   // initializing an array
   array := make([]string, 0, 5)
   array = append(array, "x", "y", "z", "a", "b")
   fmt.Println("The given array is:", array)
   var rev []string
   for _, n := range array {
   //关键步骤
      rev = append([]string{n}, rev...)
   }
   fmt.Println("The new array formed after reversing the above array is:", rev)}
```

这个循环体是反转操作的关键，它利用了 Go 语言 `append` 函数的以下特点：

|**部分**|**含义**|**结果**|
|---|---|---|
|`[]string{n}`|创建一个新的、只包含当前元素 `n` 的切片。|**新切片的头部**|
|`rev...`|将 `rev` 切片中的所有元素**展开**作为 `append` 的单独参数。|**新切片的尾部**|
|`append(...)`|将展开的 `rev` 元素附加到 `{n}` 这个新切片的后面。|`rev` 的内容被添加到了 `n` 的后面。|
