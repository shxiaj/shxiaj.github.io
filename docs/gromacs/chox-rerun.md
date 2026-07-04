---
title: 'ChOx 分析(1): Rerun 能量计算'
date: 2021-10-28 15:40:28
tags: [Gromacs]
---

ChOx分析1-Rerun
==== 
### 一、Protein & Surface 相互作用能
```bash
# 建立索引，表面组、蛋白组
gmx make_ndx -f ./md/md.tpr -n

# 修改energy.mdp

# qsub提及任务
gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./energy/energy.tpr -po ./energy/energy.mdp
gmx mdrun -v -rerun ./md/md.trr -deffnm ./energy/energy
```
### 二、Residue & Surface 相互作用能

- vmd获得接触残基
```bash
set aid [atomselect 0 {protein within 3.5 of {resname SDM SEM SAM SBM}}]
$aid get resid
$aid get resname
```

- 建索引
```bash
# VMD得到的结果填进去
rid=()
rname=()

flag=-1
# 重置这两变量
unset resid resname

# 用于建索引
for (( i = 0; i < ${#rid[@]}; i++ )); do
  if [ ${rid[$i]} -ne $flag ]; then
    flag=${rid[$i]}
    echo r ${rid[$i]}
    resid[${#resid[@]}]=r_${rid[$i]}
    resname[${#resname[@]}]=${rname[$i],,}
  fi
done

# 用于写mdp
echo ${resid[@]}
echo ${resname[@]^}

# 用于python作图使用
for (( i = 0; i < ${#resname[@]}; i++ )); do
  echo -e -n "\"${resname[$i]^}${resid[$i]:2}\", "
done && echo

# 将建索引输出的结果填进去，建立残基的索引
gmx make_ndx -f md/md.gro -n 
```
- qsub提交任务
```bash
gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./energy1/energy.tpr -po ./energy1/energy.mdp
gmx mdrun -v -rerun ./md/md.trr -deffnm ./energy1/energy
```
- Col+Vdw能量处理
```python
import numpy as np

data = np.loadtxt('energy.xvg',
                  dtype=float, usecols=(0, 1, 2), comments=['#', '@'])
data = data[::2, ]
totEne = np.add(data[:, 1], data[:, 2])
ene = np.insert(data, 3, values=totEne, axis=1)

np.savetxt('ene.txt', ene, fmt='%15.5f', delimiter='')
```
```bash
awk '!/^(#|@)/ {tot = $2 + $3; printf("%12f%14f%14f%14f\n",$1,$2,$3,tot) }' energy.xvg > ene.txt
```
