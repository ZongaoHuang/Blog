# Linux安装Oracle
[Linux CentOS 7安装Oracle11g超完美教程_centos7安装oracle11g_蜗牛er的博客-CSDN博客](https://blog.csdn.net/qq_37768368/article/details/121384247)

[centos7 下载安装 oracle11 最新必成功_oracle11g依赖包下载-CSDN博客](https://blog.csdn.net/secretWHD/article/details/117847099)
## 安装细节
### Oracle用户组建立
Oracle的安装需要图形化界面，所以身为命令形式的[Linux操作系统](https://baike.baidu.com/item/Linux)就需要安装图形化界面：[VNC](https://baike.baidu.com/item/VNC/2906305?fr=aladdin)；为了安全起见，不建议使用root做为[vnc](https://so.csdn.net/so/search?q=vnc&spm=1001.2101.3001.7020)用户，所以，安装oracle时要建立单独的用户去安装oracle相关。
```Linux
# 在Linux中创建名为oinstall的用户组
groupadd oinstall
# 创建dba用户组
groupadd dba
# 创建oper用户组
groupadd oper
# 为dba和oper用户组创建oracle用户
  # -g 主用户组
  # -G 附加组
useradd -g oinstall -G dba,oper oracle
# 将oracle用户的密码设置为oracle
echo "oracle"|passwd oracle --stdin
```
### Linux chown 命令
[Linux chown 命令 | 菜鸟教程 (runoob.com)](https://www.runoob.com/linux/linux-comm-chown.html)
- Linux chown（英文全拼：**change owner**）命令用于设置文件所有者和文件关联组的命令。
- **使用权限** : root
- 将当前前目录下的所有文件与子目录的拥有者皆设为 runoob，群体的使用者 runoobgroup:```chown -R runoob:runoobgroup * ```
