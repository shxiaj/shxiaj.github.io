---
title: '蛋白质二级结构图绘制 (dssp/xpm2ps)'
date: 2022-06-19 02:06:59
tags: [Gromacs]
---
又是无比折腾的一次体验，用到的文件都在最后可以下载

### 1.dssp
gmx do_dssp 读取轨迹文件，并调用第三方程序 dssp 计算每一时间帧蛋白的二级结构。如果你尚未安装 dssp 程序，请到 http://swift.cmbi.ru.nl/gv/dssp 下载安装。
gmx do_dssp 假定 dssp 可执行文件的路径为 /usr/local/bin/dssp。 否则，需要设置一个环境变量 DSSP，其值为 dssp 可执行文件的完整路径，
例如在 csh 中可以使用：setenv DSSP=/opt/dssp/bin/dssp。如果使用 bash，可以使用 export DSSP='/opt/dssp/bin/dssp'，也可以直接将该变量添加到 bash 的配置文件 .bashrc 中。
```bash
# 选择protein组, 默认输出ss.xpm, 最好设置单位为ns, -dt 控制输出帧数，最好少点太多画图很难用
# 我用的1500帧，不多不少
echo 1 | gmx do_dssp -f md.xtc -s md.tpr -o -tu ns -dt 0.1
```
*折腾的过程*
1.原本在服务器使用这个，一点问题没有，可是当我在win本地使用时，没有dssp！
这时候那没办法了，只能去找找了，网上说conda可以安装，结果试了半天，linux版的！没有conda的win版
然后又看见一篇知乎文章说，关注公众号领取，结果根本没有这个公众号！
2.最后退而求其次只能使用linux的dssp了，找了半天，最终找到好人编译好的
[http://bbs.keinsci.com/thread-14384-1-1.html](http://bbs.keinsci.com/thread-14384-1-1.html)
放在Wsl系统里, `export DSSP=/dssp文件的全路径/`
在最后终于搞定了dssp。
3.然而当我把图全部搞完了过后，不死心，既然有人说有win版的，然后就找，通过几个关键字搜索终于找到了
唯一一个呀！
[https://github.com/ecapriotti/lb1-2/tree/master/dssp](https://github.com/ecapriotti/lb1-2/tree/master/dssp)
下载到win里，`export DSSP=/XXX/dssp.exe`
终于能用了

### 2.xpm2ps
使用xpm2ps工具将生成的ss.xpm 转换成 eps格式文件，用ps打开保存。
gmx xpm2ps默认的工具导出来会很奇怪，使用刘大佬的修改编译后的gmx_xpm2ps工具导出的图片格式比较正常美观
教程：[http://bbs.keinsci.com/thread-20056-1-1.html](http://bbs.keinsci.com/thread-20056-1-1.html)
```bash
# -bx -by 可以设置最终图的大小，不同情况需要字体调
# -di 输入的图片其他参数的设置
gmx_xpm2ps -f ss.xpm -o -bx 0.125 -by 0.25 -di ss.m2p
```
```
black&white              = no
linewidth                = 1
titlefont                = Helvetica
titlefontsize            = 5
legend                   = yes
legendfont               = Helvetica
legendlabel              = 
legend2label             = 
legendfontsize           = 5
xbox                     = 0
ybox                     = 0
等等~~
具体看后面的下载链接，gmx手册里有对文件参数得详解
主要是字体大小需要调节，当图片大小为9cm*9cm时，上面设置比较合理
```
将输出的eps文件用ps打开，或者说用win画图工具，修修剪剪也可以
最终四个图和一块效果如下：
![image-20220619213435535](/images/image-20220619213435535.png)
### 3.所用程序文件
软件加文件:
- dssp.exe
- gmx_xpm2ps.exe
- libmmd.dll
- ss.m2p
下载链接:[dssp.7z](/images/dssp.7z)
其他非必需的，帖子的提到的:https://pan.baidu.com/s/1WRUk7UJEW5oUPuEdCQNgRw?pwd=255s 
提取码：255s
