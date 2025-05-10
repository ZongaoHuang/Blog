源码链接：[sort package - sort - Go Packages](https://pkg.go.dev/sort)

sort.Interface 接口：需要实现Len，Less，Swap三个方法，然后调用 sort.Sort()
```go
type Interface interface { 
	// Len is the number of elements in the collection. 
	Len() int 
	// Less reports whether the element with // index i should sort before the element with index j. 
	Less(i, j int) bool 
	// Swap swaps the elements with indexes i and j.
	Swap(i, j int) }
```

常用结构和函数：
- type IntSlice
- func Search()