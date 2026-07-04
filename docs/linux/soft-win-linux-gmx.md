---
title: 'Windows下的Linux基础环境 & 程序'
date: 2022-06-19 02:04:43
tags: []
---
简洁美观，但是无比折腾

## 1.Linux基础环境 Git for Windows Portable
### 1.1 最快
首先那肯定最推荐`64-bit Git for Windows Portable`便捷版
其中包含了git awk sed bash等等常用的linux工具，使用自带的Bash.exe客户端也不用忍受的win的反斜杠
链接里下载便携版直接解压就行
[https://git-scm.com/download/win](https://git-scm.com/download/win)
使用git-bash就能获得基础的linux使用环境了，bashrc在etc文件夹里。
![image-20220619171026579](/images/image-20220619171026579.png)
### 1.2 进阶
再将里面的bin目录添加到win环境变量就能直接在cmd里
输入bash.exe打开git-bash了，由于电脑里还装了Wsl，命令还会冲突，所以我就把bin里文件改了个名字gbash，以防冲突
![image-20220619171545974](/images/image-20220619171545974.png)
直接在文件管理器地址栏输入`cmd`回车打开工作目录就是当前的目录，再输入gbash就直接Ok了
![image-20220619171900903](/images/image-20220619171900903.png)
### 1.3 折腾
自带cmd命令行，不好用，字体难找到美观的
win10应用商店搜索下载 terminal 程序，用来替代自带的cmd窗口。
我的莫名其妙，重启电脑了过后，文件夹右键菜单才才出现了‘在当前文件夹打开终端’这个选项，如果没出现网上搜索教程。
如图，这个界面才是流行的风格，舒服了。
![image-20220619172605430](/images/image-20220619172605430.png)
里面集成了有Wsl、cmd、powersh的命令终端，添加一个新配置，同时设置新选项默认使用gsh打开界面
![image-20220619172905657](/images/image-20220619172905657.png)
![image-20220619173112951](/images/image-20220619173112951.png)
空白处右击，完美
![image-20220619173745959](/images/image-20220619173745959.png)

### 1.4 总结
折腾折腾再折腾，看起来很简单，实际上试过很多其他的方式，轻量使用还是这个最为方便了。
win10在装个miniconda3，基本工具都有了。
想到一句话，差生文具多。

## 2.Gromacs win10编译版
win下编译Gromacs还是比较麻烦的，不过没事，有人帮编译好了呀。
sob的教程，同时也给出了编译好的文件了
[http://sobereva.com/458](http://sobereva.com/458)
建议下载：
2020.6 CUDA GPU加速版，AVX2指令集（88 MB）：http://sobereva.com/soft/gmx/gmx2020.6_AVX2_CUDA_win64.rar（nVidia显卡驱动需>=471.11版）
2018.8虽然小，但是和我的xtc轨迹文件不兼容呀，无语子。
解压，添加bin目录到win环境变量里
![image-20220619174624605](/images/image-20220619174624605.png)
gmx使用，OK大功告成
![image-20220619174744446](/images/image-20220619174744446.png)
然后后续使用还有小小坑，无语子，缺dssp。
实测分析轨迹数据还是很快的，我还是喜欢吧xtc文件搞到本地，处理出来各种xvg文件保存也比较方便

## 3. win10软件推荐
软件的第一要义，好看，不好看都是白扯，除非必须要用比如vmd，丑着丑着也就习惯了
### 3.1 字体
字体肯定是要用Source Code Pro，好看啊
### 3.1 sublime文本编辑器
可以收费，但是免费功能也一样，安装个汉化插件、Covert to Utf-8插件就能直接用了
优点是：高亮的颜色都比较舒服，写bash较方便; 各种软件内动画都非常的流畅，使用不卡顿
缺点：多行编辑不好用，不过我也没怎么用到过，字多的文档用sed、awk呗
所有的设置都是Json形式的，改改字体就行啦
还有个设置：当失去焦点时，自动保存。 好用啊
界面如图
![image-20220619183243819](/images/image-20220619183243819.png)
设置json文件:
```json
{
	"ignored_packages":
	[
		"Markdown",
        "Rails",
    ],
    "font_face":"Source Code Pro",
    "theme": "Default.sublime-theme",
    "color_scheme": "Mariana.sublime-color-scheme",
    // "translate_tabs_to_spaces": true,
    "word_wrap": false,
    "draw_white_space": "all",
    "font_size": 11,
    "auto_find_in_selection": true,
    "caret_style": "smooth",
    "ensure_newline_at_eof_on_save": true,
    "index_files": false,
    "save_on_focus_lost": true,
    "open_files_in_new_window": false,
    "update_check": false,
    "dark_theme": "Default.sublime-theme",
    "light_theme": "Default.sublime-theme",
    "dark_color_scheme": "MarkdownEditor-Dark.sublime-color-scheme",
    "light_color_scheme": "Monokai.sublime-color-scheme",
}
```

### 3.2 ssh终端客户端 xshell6
虽然git bash也能用ssh，但是没怎么习惯用。
刚来的使用的secureCRT客户端，破解安装麻烦就不说了，界面怎么能那么的丑啊。
发现了这也就是我以前搞免流的时候用的类似软件，赶紧换成了xshell
一定要安装xmanager6，相当于全家桶，里面的组件能让你打开linux的gui图形软件，垃圾sCRT不行
不过要钱，只能下载Crack版喽，安装包就60M。舒服
xshell6：优点是好看，比xshell7安装包小很多，对于不习惯选中右键直接复制的我比较友好。
调个舒服的背景色就能用了
![image-20220619183218543](/images/image-20220619183218543.png)

### 3.3 Cover 文件多窗口管理器
文件管理器多窗口标签页呗，流畅，不过肯定比不了原生的了
多窗口切换的我人都麻了，有了这个好很多
![image-20220619183813439](/images/image-20220619183813439.png)
也有类似word的窗口，不好用，没必要，又开不了几个word

### 3.3 SingleFile 浏览器插件
保存网页页面的，好用就完事了。浏览器自带的保存，会出现一坨东西，这个就一个单个的html，方便的很
没有细看过图片是以什么方式编码在里面的呢？

### 3.4 Adobe软件
windows画图工具原本是天下无敌的，结果终究是败了。
偶尔还是需要用到全家桶的，推荐一键安装的版本，啥也不用管，无脑且方便
搜索：Adobe系列软件大全 一键安装版 By：Ansifa
Ansifa这个人的绿色版真滴方便呀
单个搜索也行，单个安装
![image-20220619200019941](/images/image-20220619200019941.png)

### 3.5 PdgCntEditor目录（书签）编辑器
PdgCntEditor是什么？这是一个目录（书签）编辑器。当每次下载的PDF没有目录时，可以直接搜索书名，在购物平台的详情页一般都会有目录介绍。复制下来用该程序导入到PDF中，具体使用方法Google。