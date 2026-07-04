---
title: 'Pymol 计算蛋白质静电势，渲染导出动画'
date: 2022-06-08 12:32:28
tags: [pymol]
published: true
hideInList: false
feature: 
isTop: false
---



### 安装Pymol开源版
参考：https://blog.csdn.net/weixin_45564533/article/details/115671036
```bash
conda install -c conda-forge pymol-open-source
```
无语了，开源版没计算的工具，卸载吧
```bash
conda uninstall pymol-open-source
```
### 安装非开源版Pymol

https://anaconda.org/schrodinger/pymol
```bash
conda install -c schrodinger pymol
```

申请教育用户证书，我已经申请过了，点连接下载，输入密码，下载2.0版本的
Thank you for your interest in PyMOL.
DOWNLOAD URL: https://pymol.org/ep
USERNAME: jun2021
PASSWORD: betabarrel

或者直接点下面的连接
**PyMOL 2.0 (September 2017)**
License File: [pymol-edu-license.lic](https://pymol.org/ep/download-edu-lic-file.php)

然后导入

![image-20220608130352036](/images/image-20220608130352036.png)

搞定

![image-20220608130513142](/images/image-20220608130513142.png)

### 画静电势

导入蛋白质，点plugin---apbs---run，无脑下一步
![image-20220608130628184](/images/image-20220608130628184.png)

完成后就这样
![image-20220608130922073](/images/image-20220608130922073.png)

### 渲染导出保存图片和视频

```bash
# 设置背景为白色
bg_color white
# 所有的图片都能保存为PNG格式，通过"png"命令或"File"菜单的"Export Image As"选项。图片通常被保存为和viewer 窗口一样的大小：
ray
cd desktop
png my_image.png
# 或者通过下面的命令可改变图片大小：语法 ray width,height
# 宽和高都必须是整数，它们的默认是零或当前窗口大小
# 例如 ray 1024,480
# 更多关于ray的信息通过命令“help ray”获得。
```

渲染视频

```bash
mset 1 x120               #定义动画
util.mroll 1,120,1         #mdo命令创建旋转360度的120帧动画 
```
点击播放图标即可预览
![image-20220608132337545](/images/image-20220608132337545.png)

相关的教程：
![image-20220608132210674](/images/image-20220608132210674.png)

保存视频

![image-20220608132708735](/images/image-20220608132708735.png)

![image-20220608132733999](/images/image-20220608132733999.png)

也可以先去掉底下的颜色标尺在保存，框里其中某一个点击关闭就行

![image-20220608132925438](/images/image-20220608132925438.png)

### **大功告成**

**[渲染出来的视频.mp4](/images/proteinrotate.mp4)**


#### **完结撒花**

### 相关的有用的教程

[Pymol-CommandLine](/images/pymol-commandline.pdf)
Frontiers | A script to highlight hydrophobicity and charge on protein surfaces | Molecular Biosciences
https://www.frontiersin.org/articles/10.3389/fmolb.2015.00056/full

PyMOL中文教程 — PyMOL中文教程 2020.09 文档
http://pymol.chenzhaoqiang.com/index.html

**pymol 教程
https://360ai.org/pymol 最相关的教程**

PyMOL tutorial -Hydrophobicity-
http://www.protein.osaka-u.ac.jp/rcsfp/supracryst/suzuki/jpxtal/Katsutani/en/hydrophobicity.php

Displaying Biochemical Properties - PyMOLWiki
https://pymolwiki.org/index.php/Displaying_Biochemical_Properties
