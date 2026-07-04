---
title: 'Sublime Text 右键打开当前文件夹'
date: 2022-01-19 12:51:19
tags: [soft]
---

# Sublime Text 右键打开当前文件夹
使用sublime 右键打开资源管理器里的当前文件夹


### 1. 打开注册表编辑器
Win+R打开运行工具，输入regedit，回车运行

![image-20220119125611707](/images/image-20220119125611707.png)

### 2. 建立右键打开项

- 点开HKEY_CLASSES_ROOT\Directory\shell；

- 当前文件夹新建一个新的项，命名为sublime，设置默认值Open Folder as SublimeText，这个默认值是显示在右键名称上的;

- 新建一个字符串值，命名为Icon，设置值为C:\Program Files\Sublime Text\sublime_text.exe（具体程序位置）

![image-20220119130237523](/images/image-20220119130237523.png)

- sublime里再新建一个项，命名为command，设置默认值为C:\Program Files\Sublime Text\sublime_text.exe %1（具体程序位置加上 %1）；

![image-20220119130411654](/images/image-20220119130411654.png)

OK，完成。

### 3. 测试

实际如下图

![image-20220119130726387](/images/image-20220119130726387.png)
