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
## RASP
### 什么是RASP
- 在2014年的时候，Gartner引入了“Runtime application self-protection”一词，简称为RASP。它是一种新型应用安全保护技术，它将保护程序像疫苗一样注入到应用程序中，应用程序融为一体，能实时检测和阻断安全攻击，使应用程序具备自我保护能力，当应用程序遭受到实际攻击伤害，就可以自动对其进行防御，而不需要进行人工干预。
- RASP技术可以快速的将安全防御功能整合到正在运行的应用程序中，它拦截从应用程序到系统的所有调用，确保它们是安全的，并直接在应用程序内验证数据请求。Web和非Web应用程序都可以通过RASP进行保护。该技术不会影响应用程序的设计，因为RASP的检测和保护功能是在应用程序运行的系统上运行的。
- 随着 Web 应用攻击手段变得复杂，基于请求特征的防护手段，已经不能满足企业安全防护需求。早在2014 Gartner 引入了“Runtime application self-protection”一词，简称为RASP，属于一种新型应用安全保护技术，它将防护功能"注入"到应用程序中，与应用程序融为一体，通过Hook少量关键函数,来实时观测程序运行期间的内部情况。当应用出现可疑行为时,RASP根据当前上下文环境精准识别攻击事件，并给予实时阻断，使应用程序具备自我防护能力，而不需要进行人工干预。
- RASP 通过实时采集 Web 应用的高风险行为，通过特征规则、上下文语义分析及第三方安全产品数据关联分析等多种安全模型来提升检测准确率，相较于传统 Web 应用安全产品，RASP从海量的攻击中排除掉了大量的无效攻击，聚焦发现真实的已知和未知安全威胁。并且在发出的报警信息上, RASP可以清晰的还原出代码行级别的攻击路径，对漏洞重现与修复具有极大的帮助。
  ![[Pasted image 20230909145600.png]]
### RASP vs WAF