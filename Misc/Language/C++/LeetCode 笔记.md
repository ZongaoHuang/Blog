# 双端队列的应用
## 题目
你的笔记本键盘存在故障，每当你在上面输入字符 `'i'` 时，它会反转你所写的字符串。而输入其他字符则可以正常工作。

给你一个下标从 **0** 开始的字符串 `s` ，请你用故障键盘依次输入每个字符。

返回最终笔记本屏幕上输出的字符串。
## 详解
理解题意，当字符串进行反转后，在末尾添加字符等价于「不对字符串进行反转，并且在开头添加字符」。因此，我们可以使用一个双端队列和一个布尔变量`head`来维护答案：
代码如下：
```C++
class Solution {

public:

    string finalString(string s) {

        deque<char> q;

        bool head = false;

        for(char ch : s){

            if(ch != 'i'){

                if(head){

                    q.push_front(ch);

                }

                else{

                    q.push_back(ch);

                }

            }

            else{

                head = !head;

            }

        }

        string ans = (head ? string{q.rbegin(), q.rend()} : string{q.begin(), q.end()});

        return ans;

    }

};
```
## 扩展
在 C++ 中，`string{q.rbegin(), q.rend()}` 是一种构造字符串的方法，它利用了 C++ 的初始化列表和迭代器来创建一个新的字符串。这里的 `q.rbegin()` 和 `q.rend()` 分别是双端队列 `q` 的反向迭代器的开始和结束位置。

- `q.rbegin()` 返回一个反向迭代器，指向双端队列 `q` 的最后一个元素。
- `q.rend()` 返回一个反向迭代器，指向双端队列 `q` 的第一个元素之前的位置。

当你使用 `string{q.rbegin(), q.rend()}` 时，实际上是调用了 `std::string` 的构造函数，该构造函数接受两个迭代器作为参数。这两个迭代器定义了一个序列的范围，构造函数会复制这个范围内的元素来创建一个新的字符串。

因此，`string{q.rbegin(), q.rend()}` 会从 `q` 的末尾开始，到 `q` 的开头结束，复制这个范围内的所有字符来创建一个新的字符串。这实际上是将队列中的元素顺序反转并创建一个新的字符串。如果 `head` 为 `true`，这意味着最终的字符串应该是反转后的结果；否则，如果 `head` 为 `false`，则使用 `string{q.begin(), q.end()}` 以正常顺序构建字符串。