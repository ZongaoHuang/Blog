## Zen方法
参照：https://github.com/BeehiveInnovations/zen-mcp-server
全程在Claude code背景下：
1. 用 Gemini pro 和 o3 进行 Planner，生成一个 detailed plan
2. 然后 CC 根据这个plan执行具体的任务
3. 执行后再返回给 Gemini 和 o3 进行最终的 final pre-commit review

相关链接：https://openrouter.ai/


可以改进的地方:
- 自定义中转api，参照[2025-07-14](../../Diary/2025-07-14.md)，目前已经更新到我的分支中了。

## VibeCoding 工作流
当前的工具组合包括：
- Claude Code + Copilot 
- Gemini CLI + Copilot
- Qwen + Augment
- Zen MCP：调用 Gemini api 进行 plan 和 analyze

主要是使用 CC，目前是两种方式调用：Pro账号和转发的API，但是由于这两种在工作时间使用都容易 API Error，因此一定要用其他的模型工具来弥补这个 Busy Time

辅助使用Copilot和Augment，来进行小问题分析，Mermaid流程图绘制，MD文档输出

然后就是对于使用的时间和方法：
- 在早上10.前、下午2.30前和晚上8.后，CC使用会非常的流畅，因此要抓紧这两个时间主要进行Feat和Fix，同时在这几个时间节点前，要先把思路和Prompt理清楚，方便api空闲时可以直接调用，避免错过时间。
- 在API繁忙的时候，可以利用Chat进行相关文档的输出和总结，深入学习一下知识，形成自己的体系。

