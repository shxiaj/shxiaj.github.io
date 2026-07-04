---
title: 'PatchDock 分子对接使用'
date: 2022-10-02 15:55:55
tags: [Gromacs, shell]
---

# PatchDock 分子对接使用
log


### Install PacthDock
```bash
unzip xxx
export PATH=/home/software/PatchDock:${PATH}
# test
buildParams.pl
```
### Usage
- 看看程序自带的README写的详细的很
```bash
gmx editconf -f em.gro -o go.pdb
# 蛋白受体, 表面配体, 生成params.txt
buildParams.pl 1b4v.pdb go.pdb
# 直接运行 patch_dock.Linux <params_file> <output_file>
patch_dock.Linux params.txt retData
# 分析导出对接pdb transOutput.pl <output file name> <first result> <last result>
transOutput.pl retData 1 5
```
### MD Initial orientation
先叠加f2 到 f1 上
```bash
gmx confrms -f1 go.pdb -f2 retData.2.pdb
sed '/TITLE/,/TITLE/d' fit.pdb > dock.pdb
```
旋转删除,应该就行了
