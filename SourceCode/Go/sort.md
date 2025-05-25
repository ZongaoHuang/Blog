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