# 更改权限（成功）

step1：定位`AdobeGCClient`文件夹
打开文件资源管理器，导航到以下路径：

```
C:\Program Files (x86)\Common Files\Adobe\AdobeGCClient
```

step2：修改文件夹权限
右键点击`AdobeGCClient`文件夹，选择“属性”。

在属性窗口中，点击“安全”选项卡，然后点击“编辑”按钮。

step3：设置权限
在“组或用户名”列表中，除了SYSTEM和你自己的用户账户外，选择其他所有用户或组。

在权限设置中，勾选“拒绝”列下的“修改”权限。

点击“应用”并确认更改。

step4：验证效果

完成上述步骤后，重新启动电脑，检查是否还会出现Adobe的弹窗提示。
