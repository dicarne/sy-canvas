# sy-canvas
## 简介
这是一个简单的思源画板。一般用于简单的笔记，最好不要拿来画画，这太考验设备性能了……  
你可以选择不同颜色、粗细的画笔，也可以修改背景颜色。  
提供简单的撤销功能。还贴心的提供了锁定功能，防止无意的修改。  
**锁定规则**：  
1. 刚创建的画板会自动解锁。
2. 当文档关闭后，再打开，画板会自动锁定，需要点击解锁按钮。

## 设置
现在支持通过代码块进行全局配置。  
1. 在任意一个文档中创建一个代码块，选择格式为json。  
2. 在里面输入一些东西，例如：

```json
{
    "colors": ["black", "#66ccff"]
}
```
3. 然后复制这个块的超链接，粘贴到画板设置里对应的文本框内。  
4. 点击确认。
### 局限
不能为不同块配置不同的文件，目前全局会使用同一个配置文件。

## 其他
如果觉得丑并且有什么好建议，欢迎告诉我！