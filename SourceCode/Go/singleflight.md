源码链接：[singleflight.go - Go](https://cs.opensource.google/go/x/sync/+/refs/tags/v0.14.0:singleflight/singleflight.go)

结构体：
```go
type Group struct {
	mu sync.Mutex       // protects m
	m  map[string]*call // lazily initialized
}
```