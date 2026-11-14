# WSL代理配置
主要是通过镜像网络模式让WSL和Windows主机共享相同的网络接口，从而实现 localhost 互通，VPN 共享和代理共享。

```bash
wsl --version
//确认WSL版本>2
```

创建 `.wslconfig` ，并添加配置
```
notepad $env:USERPROFILE\.wslconfig

[wsl2]
localhostForwarding=true
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
[experimental]
autoMemoryReclaim=gradual
```

重启WSL `wsl --shutdown`