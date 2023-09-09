# 相关链接
[百度安全的OpenRASP项目，究竟是什么？ - FreeBuf网络安全行业门户](https://www.freebuf.com/articles/web/164413.html)
# 实施方案
## IPS和WAF
### 什么是WAF
- [Web应用防火墙](https://cn.radware.com/cyberpedia/application-security/what-is-waf/)（WAF）是一种[硬件设备、虚拟设备或基于云的服务](https://cn.radware.com/cyberpedia/application-security/3-types-of-waf/)，位于最前方或位于面向Web的应用之前，以检测和防止各种恶意攻击。WAF专注于监测Web应用流量（HTTP/S），并在网络中面向互联网的区域保护各种应用。
- WAF可以使用多种技术来了解是应该放行还是拦截通过应用的流量，包括行为算法（机器学习和[主动安全模型](https://www.radware.com/cyberpedia/application-security/what-is-a-positive-security-model/)）或被动安全模型。
- 最后，WAF正在从独立工具过渡到完全集成的Web应用和API保护（WAAP）产品，其中包括[API防护](https://www.radware.com/cyberpedia/application-security/what-is-api-security/)、僵尸程序管理和风险缓解功能、[第7层应用层DDoS防护](https://www.radware.com/cyberpedia/application-security/application-layer-ddos-layer-7/)、Web应用安全等一整套功能。
### 什么是IPS
入侵防护系统（IPS）是一种==网络安全设备==，可在战略点监测网络以扫描恶意活动并按配置报告、拦截或摆脱恶意流量。IPS通常部署在网络中的防火墙之后和WAF之前。
### 为什么需要WAF和IPS安全解决方案？
IPS与WAF/WAAP解决方案相辅相成，通常一起部署。WAF部署保护Web应用流量，而IPS部署则通过检查所有数据包在网络级别进行扫描和保护。IPS通常采用内联方式部署至传入流量，扫描大多数网络协议中的威胁，并在OSI第4-7层发挥作用。WAF和WAAP解决方案主要部署于IPS之后，针对传入流量并扫描OSI第7层的应用威胁。