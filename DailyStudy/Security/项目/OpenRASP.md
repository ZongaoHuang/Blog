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
- RASP技术可以快速的将安全防御功能整合到正在运行的应用程序中，它拦截从应用程序到系统的所有调用，确保它们是安全的，并直接在应用程序内验证数据请求。Web和非Web应用程序都可以通过RASP进行保护。该技术不会影响应用程序的设计，因为RASP的检测和保护功能是在应用程序运行的系统上运行的。
- 随着 Web 应用攻击手段变得复杂，基于请求特征的防护手段，已经不能满足企业安全防护需求。早在2014 Gartner 引入了“Runtime application self-protection”一词，简称为RASP，属于一种新型应用安全保护技术，它将防护功能"注入"到应用程序中，与应用程序融为一体，通过Horootok少量关键函数,来实时观测程序运行期间的内部情况。当应用出现可疑行为时,RASP根据当前上下文环境精准识别攻击事件，并给予实时阻断，使应用程序具备自我防护能力，而不需要进行人工干预。
- RASP 通过实时采集 Web 应用的高风险行为，通过特征规则、上下文语义分析及第三方安全产品数据关联分析等多种安全模型来提升检测准确率，相较于传统 Web 应用安全产品，RASP从海量的攻击中排除掉了大量的无效攻击，聚焦发现真实的已知和未知安全威胁。并且在发出的报警信息上, RASP可以清晰的还原出代码行级别的攻击路径，对漏洞重现与修复具有极大的帮助。
  ![[Pasted image 20230909145600.png]]
### RASP vs WAF
![[Pasted image 20230910165255.png]]
#### WAF的优势
（1）攻击前流量预警：攻击者在实施真正的攻击前，会产生大量的异常流量，这些流量包括推测服务器环境信息、可注入点尝试等。这些流量通常不会直接造成危害，因此RASP可能无法获悉全量的攻击流量（只会处理可能有危害的流量），而WAF可以完整记录异常流量。
（2）对于CC攻击、爬虫、恶意扫描和脚本小子（script kiddie）这些大流量的攻击或者有明显攻击特征的流量，如果让其直接打到装有RASP插桩的应用上，会造成不必要的性能占用；另外由于RASP会占用应用程序的计算资源，因此也不适合进行过于复杂的计算。所以对于此类攻击，最好的办法就是使用WAF从流量侧对其分析和拦截。
#### RASP的优势
1. 拦截混淆和加密的流量：如前文所述，RASP并不需要对流量进行解密，可以根据场景对恶意行为进行分析，有效拦截被精心设计的攻击流量。
2. 针对业务场景进行优化：基于RASP函数Hook的特性，不仅可以对通用类、框架类的函数进行插桩，也可以对自研代码部分进行插桩。例如对于应用在交付前来不及修补的漏洞，可以通过函数级别的虚拟补丁提供防护，保证应用按时交付。
3. 极低的维护成本：除了根据需要配置虚拟补丁外，由于RASP从底层函数进行保护，所以基本上不需要对RASP的规则做任何调整即可实现应用的安全内建。
4. 兼顾东西向流量安全：RASP工作在应用程序内部，不仅可以分析南北向流量的风险，也可以分析企业内部，应用之间东西向流量的风险。例如微服务架构中涉及多个模块间的调用，它们之间通常会使用rpc等非http协议来进行数据交换，传统的 WAF 通常对其无能为力。而 RASP 则可以很好的解决这样的问题。
5. 防御0day漏洞：RASP可以保护应用运行时环境中的所有代码，包括自研代码、第三方组件、Web应用容器（Tomcat、Django、Flask等）。例如最近几个波及范围较广的0day漏洞：Log4j2 RCE（CVE-2021-44228）、Spring4Shell（CVE-2022-22965）、Fastjson反序列化漏洞（[https://github.com/alibaba/fastjson/wiki/security_update_20220523](https://link.zhihu.com/?target=https%3A//github.com/alibaba/fastjson/wiki/security_update_20220523)），虽然攻击方式有变化，但是最终实施攻击总是需要调用一些底层的方法/函数。无论攻击入口如何变化、攻击手段如何隐蔽，都无法绕开最终关键函数的执行过程，因此RASP一定能对其进行有效拦截。
## OpenRASP
### 介绍
![[Pasted image 20230910171045.png]]
