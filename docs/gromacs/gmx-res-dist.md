---
title: 'gromacs绘制蛋白质残基接触图'
date: 2022-06-13 21:24:14
tags: [shell,awk,Gromacs]
---

两种方法，一种感觉并不通用

### A. gmx select工具

使用selec工具分析距离表面上方0.35nm以内的残基
使用mask.xvg分析占据比例，最后一步的index.dat画图

#### 1. 分析残基接触比例
查看蛋白质残基的端基的resid序号, 结果为 9 506

```bash
# 输出蛋白质所有残基的id到index.dat
gmx select -f md.gro -s md.tpr -select 'group protein' -oi -seltype res_com
# 输出蛋白质端基序号
awk '{print $3 " " $NF}' index.dat
```

动态选区接触残基输出mask.xvg, 选中的为1
```bash
# 正电表面的厚度是1.632, 加上0.35即为选中的范围，resid 9 to 506上面得到的结果
# 200ns-300ns的统计结果
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.982' -tu ns -dt 0.1 -seltype res_com -oi -of -b 200 -e 300
```
接触占时间比例超过0.8的输出来，默认端基的id是从1开始的，所以awk输出+8
```bash
# print里+8按照resid实际情况修改一下
awk '!/^(#|@)/ {if ($2 > 0.8) printf("%7d%10.4f\n",$1+8,$2)}' occupancy.xvg
```
#### 2. 残基接触图
输出全部时间的选区里的残基即可, dt 控制总帧数，不用搞太多
```bash
# 输出要用的index.dat，第一列时间，第二列所选取的数量，后面列是resid
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.982' -tu ns -dt 0.1 -seltype res_com -oi
# 用作Origin画残基接触图
awk '{for(i=3;i<=NF;i++) printf("%8.2f%6d\n",$1/1000,$i)}' index.dat > resOrigin
```
用文件`resOrigin`导入origin画个散点图

### B. gmx mindist工具, 更通用
#### 1. gmx make_ndx 建立所有残基和表面的索引
```bash
# 先建立表面的索引, 如23和24为表面的原子
echo -e "23|24\nq\n" | gmx make_ndx -f md.tpr # samsurface
echo -e "22\nq\n" | gmx make_ndx -f md.tpr # tco&mos
# echo -e "15\nq\n" | gmx make_ndx -f md.tpr # gosurface
# 输出蛋白质所有残基的id到index.dat, 因为经常修改md.gro, 所以用完整的nvt.gro, 一般不会动
gmx select -f ../nvt/nvt.gro -s md.tpr -select 'group protein' -oi -seltype res_com
# 输出蛋白质端基序号
awk '{print $3 " " $NF}' index.dat
# 输出蛋白质残基序号到resid, 用于gmx make_ndx输入
awk '{for(i=3;i<=NF;++i) print "r  " $i; print "q"}' index.dat > resid
# 生成单个的残基组
gmx make_ndx -f md.tpr -n < resid
```
#### 2. 计算距表面的最小距离
准备输入，输出。
例如index.ndx索引的第26个是表面，27-524是残基组
```bash
# 首先准备要输入的表面组和残基组
seq 26 524 > minid
seq 24 528 > minid #tco&mos
# seq 24 528 > minid # gosurface
# 计算最小距离，-ng x 表示第一个组与后面x组做计算，例如27-524一共498个
gmx mindist -f md.xtc -s md.tpr -n -od -tu ns -dt 0.1 -ng 498 < minid
gmx mindist -f md.xtc -s md.tpr -n -od -tu ns -dt 0.1 -ng 504 < minid #tco&mos
```
`-od `输出的文件名默认是mindist.xvg

#### 3. Python统计数据绘图
python分析mindist文件，举例总共300ns，1501帧。
默认端基以0输出，按照需要加某值，举例+9
`resContactCal.py`:
```python
import numpy as np


# 残基吸附占据总时间的比例, >0.8的残基输出
# 输入要统计的起始/结束帧, C端端基id
# dist竟然是全局变量都不用传进方法里，离谱
def funOcc(began, end, beganID):
    occ = np.mean(dist[began:end, :], axis=0)
    for i in range(occ.size):
        if occ[i] > 0.8:
            print("%5d%10.5f" % (i + beganID, occ[i]))


data = np.loadtxt('mindist.xvg', dtype=float, comments=['#', '@'])

dist = data[:, 1:]
# 距离小于0.35nm的赋值为1，大于赋值为0
index = dist < 0.35
dist[index] = 1
dist[~index] = 0

# 可用可不用
funOcc(0, 501, 9)

# 非零值的索引
index = np.nonzero(dist)
originData = np.empty((index[0].size, 2))
originData[:, 0] = data[index[0], 0]
originData[:, 1] = index[1] + 9

np.savetxt('resOrigin.dat', originData, fmt='%7.2f%5d')

# 废弃的for循环方法，巨呆
# for i in range(dist.shape[0]):
#     for j in range(dist.shape[1]):
#         if dist[i, j] == 0:
#             print(data[i, 0], j + 9)
```
用文件`resOrigin`导入origin画个散点图
A方法不好用于曲面，写判断也能写，不方便，没试过能不能用。
