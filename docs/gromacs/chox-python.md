---
title: 'ChOx 分析(3): Python 数据处理与可视化'
date: 2021-10-28 13:40:28
tags: [Gromacs]
---

# ChOx 分析(3): Python 数据处理与可视化
ChOx分析3-Python
==== 
### 一、偶极分布图
使用计算出来的'dipoles'文件，统计200ns后的结果

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

plt.rc('font', family='Times New Roman')
xy = np.loadtxt('dipoles', dtype=float, usecols=(0, 1))

ax = sns.histplot(data=xy[:, 1], stat='percent', bins=100, kde=True, color="white", kde_kws={"cut": 200},
                  line_kws={"linewidth": 1}, legend=True, fill=False, binrange=[-1, 1])
ax.lines[0].set_color('crimson')

ax.set_xlim(-1, 1)
ax.set_ylabel('percent %', fontsize=15)
plt.show()
```
### 二、能量
rerun后的.edr文件
统计后100ns的平均作用能
一般用短程库伦作用能（Coul-SR）和短程范德华作用能（LJ-SR）
```bash
gmx energy -s energy.tpr -f energy.edr -o energy.xvg
gmx energy -s ene*.tpr -f ene*.edr -o ene-ProSurf.xvg
gmx energy -s ene*.tpr -f ene*.edr -o ene-ResSurf.xvg
# 全部写成function
# 22: 表示多少个残基, 19表示edr索引标号开始
g_eneidx 22 19 | g_ene
```
隔四个取一个,统计接触残基能量，蛋白质整体能量。
```python
#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt

plt.rc('font', family='Times New Roman')

resname = ["Gly30", "Glu31", "Ala32", "Gly33", "Asp145", "Arg146", "Arg150", "Ser153", "Lys163", "Arg202", "Glu207", "Gly238", "Thr239", "Gly240", "Lys241", "Lys503"]
xy = np.loadtxt('energy1.xvg', dtype=float, comments=['#', '@'])
ene = np.mean(xy[10000:, :], axis=0)

# 库伦作用在前，vdw作用在后
temp1 = ene[1::2].copy()
temp1[temp1 > 0] = 0
temp2 = ene[1::2].copy()
temp2[temp2 < 0] = 0

temp3 = ene[2::2].copy()
temp3[temp3 > 0] = 0
temp4 = ene[2::2].copy()
temp4[temp4 < 0] = 0


plt.bar(resname, temp1, color="red", label="Coul")
plt.bar(resname, temp2, color="red")
# plt.bar(resname, ene[2::2], color="black", label="Vdw", bottom=ene[1::2])
# plt.bar(resname, ene[2::2], color="black", label="Vdw")
plt.bar(resname, temp3, color="black", label="Vdw", bottom=temp1)
plt.bar(resname, temp4, color="black", bottom=temp2)

# plt.ylim(-160, -20)
plt.xlabel('Times (ns)', fontsize=25)
plt.ylabel('energy (kJ/mol)', fontsize=25)
ax = plt.gca()
ax.xaxis.set_ticks_position('top')
# plt.gca().xaxis.set_ticks_position('top')
plt.tick_params(top=False)
plt.xticks(rotation=45)
plt.xticks(fontsize=18)
plt.yticks(fontsize=18)
plt.legend(loc='best', frameon=False, fontsize=20)
plt.show()
```
### 三、距离
gmx distance与gmx mindist
```bash
gmx make_ndx -f md.tpr -n

# 建立活性中心的索引组
echo -e "a O6 O7 N6 N7 N9 C19 C17 C16 C15 \n q" | gmx make_ndx -f md.tpr -n
echo -e "a O6 O7 N6 N7 N9 \n q" | gmx make_ndx -f md.tpr -n # 结果更好
xmgrace ./rms/rmsd.xvg

# 分析活性中心，蛋白质整体与表面最小距离
gmx mindist -s md.tpr -f md.xtc -tu ns -n -od -on
gmx distance -s md.tpr -f md.xtc -oxyz -tu ns -n -select "[0,0,1.519] plus group 28" # 1.519 负电
gmx distance -s md.tpr -f md.xtc -oxyz -tu ns -n -select "[0,0,1.632] plus group 30" # 1.632 正电
```

### 四、RMSD & RMSF & 回旋半径
```bash
# 计算均方根偏差，选择蛋白质组 MainChain
echo 5 5 | gmx rms -s md.tpr -f md.xtc -tu ns -n

# 计算原子的均方根波动，选择蛋白质组
echo 1 | gmx rmsf -s md.tpr -f md.xtc -res -n -b 200000

# 计算回旋半径
echo 1 | gmx gyrate -s md.tpr -f md.xtc -n
awk '!/^(#|@)/ {printf("%5.2f\t%6.3f\n",$1/1000,$2)}' gyrate.xvg > gyrate.dat

# 计算关于主轴的回旋半径
gmx gyrate -s md.tpr -f md.xtc -n -p
# 两个结果总值相同，xyz分量的值不同

# 残基接触图 正电
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.982' -tu ns -dt 0.1 -seltype res_com -oi
# 200-300ns残基接触比例
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.982' -tu ns -dt 0.05 -seltype res_com -oi -of -b 200 -e 300

# 残基接触图 负电
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.869' -tu ns -dt 0.1 -seltype res_com -oi
# 200-300ns残基接触比例
gmx select -f md.xtc -s md.tpr -select 'resid 9 to 506 and z < 1.869' -tu ns -seltype res_com -oi -of -b 200 -e 300

# 查看残基接触时间占比
awk '!/^(#|@)/ {if ($2 > 0.8) printf("%7d%10.4f\n",$1+8,$2)}' occupancy.xvg
# 用作Origin画残基接触图
awk '{for(i=3;i<=NF;i++) printf("%8.2f%6d\n",$1/1000,$i)}' index.dat > resOrigin

# 输出蛋白质所有残基的id到index.dat
gmx select -f md.gro -s md.tpr -select 'group protein' -oi -seltype res_com
# 输出蛋白质端基序号
awk '{print $3 " " $NF}' index.dat
# 输出蛋白质残基序号到resid, 用于gmx make_ndx输入
awk '{for(i=3;i<=NF;++i) print $i; print "q"}' index.dat > resid

# 废弃
# for (( i = 9; i <= 506; i++ )); do
#   echo r $i
# done > resid
# echo q >> resid

gmx make_ndx -f ../md.tpr -n < resid

seq 26 524 > mindid

gmx mindist -f md.xtc -s md.tpr -n -od -tu ns -b 200 -e 300 -dt 0.1 -ng 498 < mindid
```
