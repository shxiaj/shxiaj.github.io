---
title: 'SAM 体系 MD 模拟全流程'
date: 2020-12-16 13:40:28
tags: [Gromacs]
---
#### 好多的酶
### PTMC
```bash
sed -i '/ANISOU/d' 5z0f-single.pdb
```

#### MD
#######################################################################
#### 创建表面
```bash
gmx genconf -f COOH_25%_UnitCell.gro -o sam_cooh.gro -nbox 8 9 1
gmx genconf -f NH2_25%_UnitCell.gro -o sam_cooh.gro -nbox 8 9 1

sed -e '/SBM/d' sam_cooh.gro > sam
sed -n -e '/SBM/p' sam_cooh.gro > sbm
cat sam sbm > sam_cooh.gro

sed -e '/SEM/d' sam_nh2.gro.bak > sdm
sed -n -e '/SEM/p' sam_nh2.gro.bak > sem
cat sdm sem > sam_nh2.gro
```
######################################################################
#### 改下CU标识
```bash
echo 1 | gmx pdb2gmx -o protein.gro -water tip3p -f -ignh 
```

#### 留个加墙的空0.2nm
```bash
gmx editconf -f protein.gro -d 1.2 && rm out.gro
gmx editconf -o protein.gro -d 1.2 -f md_

gmx editconf -f protein.gro -o ptw1.gro -box  7.99184  7.78626  
gmx editconf -f protein.gro -o ptw1.gro -box  9.98980  8.65140  
gmx editconf -f protein.gro -o ptw1.gro -box  10.98867  10.38168 

g_min
g_max
```
#### 蛋白调到底边
```bash
g_adj ptw1.gro ptw2.gro
gmx editconf -f ptw2.gro -o ptw2.gro -translate 0 0 -0.1

gmx solvate -cp ptw2.gro -cs spc216.gro -o ptw3.gro -p topol.top

## SAMs 负电厚度1.316nm正电厚度1.432 加0.2nm用墙
gmx editconf -f ptw3.gro -o ptw4.gro -translate 0 0 1.539 # 负电
gmx editconf -f ptw3.gro -o ptw4.gro -translate 0 0 1.652 # 正电
```
#### 合并盒子
``` bash
g_mer sam_nh3.gro
```
```bash
## 修改top，SAM268 SBM20 建立CU的键 写入AB DE.itp
## 修改top，SAM216 SBM72 建立CA,FE的键 写入AB DE.itp  492 36

 # 4563 944  1 0.198 500000.0
 # 4563 704  1 0.217 500000.0
 # 4564 3608 1 0.191 500000.0
 # 4564 3185 1 0.196 500000.0
 # 4564 3257 1 0.199 500000.0

// ## 2p3x //
 # 5330   1322   1   0.207   500000.0
 # 5330   1636   1   0.216   500000.0
 # 5330   1790   1   0.234   500000.0
 # 5331   3696   1   0.204   500000.0
 # 5331   3763   1   0.215   500000.0
 # 5331   4204   1   0.202   500000.0

// ## 6atj //
  687  4695     1   0.232  500000.0
  733  4695     1   0.235  500000.0
  794  4695     1   0.251  500000.0
 2580  4696     1   0.239  500000.0
 3434  4696     1   0.248  500000.0
 3481  4696     1   0.243  500000.0
 2562  4697     1   0.206  500000.0
 #  582  4697     1   0.647  500000.0
 # 2548  4697     1   0.611  500000.0
 
mkdir ion em nvt md energy energy1
update user set authentication_string=password("dingliang") where user='root';
```
#### 插离子
```bash
gmx grompp -f ion.mdp -c box.gro -p topol.top -o ./ion/ions.tpr -po ./ion/ionout.mdp -maxwarn 1
gmx genion -s ./ion/ions.tpr -o ions.gro -p topol.top -np 31 -pname NA -pq 1 -nn 0 -nname CL -nq -1
gmx genion -s ./ion/ions.tpr -o ions.gro -p topol.top -np 3 -pname NA -pq 1 -nn 28 -nname CL -nq -1
# cat ions.gro surf-cooh.gro > box.gro
```
#### 索引
```bash
echo -e "a S\n q" | gmx make_ndx -f ions.gro -o
a S q
```

#### ions.gro留空加0.3nm真空
```bash 
g_zev ions.gro 
```

#### em nvt md
```bash
g_free
gmx grompp -f em.mdp -c ions.gro -p topol.top -o ./em/em.tpr -po ./em/emout.mdp -n
gmx mdrun -v -deffnm ./em/em $logogram2

gmx grompp -f nvt.mdp -c ./em/em.gro -p topol.top -o ./nvt/nvt.tpr -po ./nvt/nvtout.mdp -n -r ./em/em.gro
gmx mdrun -v -deffnm ./nvt/nvt -cpi ./nvt/nvt.cpt $logogram 

gmx grompp -f md.mdp -c ./nvt/nvt.gro -p topol.top -o ./md/md.tpr -po ./md/mdout.mdp -n -r ./nvt/nvt.gro
gmx mdrun -v -deffnm ./md/md -cpi ./md/md.cpt $logogram 
===================================================================================
gmx grompp -f em.mdp -c ions.gro -p topol.top -o ./em/em.tpr -po ./em/emout.mdp -n
gmx mdrun -v -deffnm ./em/em

gmx grompp -f nvt.mdp -c ./em/em.gro -p topol.top -o ./nvt/nvt.tpr -po ./nvt/nvtout.mdp -n
gmx mdrun -v -deffnm ./nvt/nvt

# Segmentation fault 能量最小化出问题，重新跑
gmx grompp -f md.mdp -c ./nvt/nvt.gro -p topol.top -o ./md/md.tpr -po ./md/mdout.mdp -n
gmx mdrun -v -deffnm ./md/md
```
#### 分析
```bash
gmx trjconv -s md.tpr -f md.xtc -o md_1.xtc -pbc mol -ur compact
gmx rms -s md.tpr -f md_1.xtc -o rmsd.xvg -tu ns
gmx rmsf -s md.tpr -f md_1.xtc -res -o rmsf.xvg
gmx dipoles -f md.xtc -s md.tpr -o -b 0 -e 100000 -a aver.xvg -cos cosaver.xvg
gmx distance -s md.tpr -f md_1.xtc -oall -oav -tu ns -select "com of group 1 plus com of group 18"
gmx mindist -s md.tpr -f md_1.xtc -od -tu ns

# 低版本不支持指定单位 归一化用不上
gmx rdf -s md.tpr -f md_1.xtc -tu ns -o rdf.xvg -cn rdf-cn.xvg
echo -e '27\n30\n'| gmx rdf -s md.tpr -f md_1.xtc -n ../index.ndx -o -cn -b 80000

# rerun 重跑能量
gmx grompp -f md.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./energy/energy.tpr -po ./energy/energy.mdp
gmx mdrun -v -rerun ./md/md.trr -deffnm ./energy/energy

gmx energy -s energy.tpr -f energy.edr -o ene-HAP-Cal.xvg

awk '! {if ($2 ~ /^[0-9]/ && \
     $2 < min) min = $2} END {print min}' surf-NH2.gro
awk '!/^(#|@)/ {ecc = 1 - (($2 + $3 + $4 ) / 3) / $1; print $0 "      " res}' moi.xvg
awk '!/^(#|@)/ {ecc = 1 - (($2 + $3 + $4 ) / 3) / $2; print $0 "      " ecc}' moi.xvg > tt
export PATH=/home/dila/soft/gawk/bin:$PATH
  
awk 'BEGIN {FIELDWIDTHS="36 8"; min = 100} {if ($2 ~ / [0-9]/) print $2}' ptw1.gro

awk '!/^(#|@)/ { print $0 "  "}' Mtot.xvg > tt

awk '!/^(#|@)/ {cos = $4 / $5; print $0 "     " cos}' Mtot.xvg
```
------------------------------------------------------------------
#### VMD
```
atomselect 0 {protein within 3.5 of resname SDM SEM SAM SBM}
atomselect0 writepdb connect_res.pdb
set aid [atomselect 0 same residue as {protein within 3.5 of {resname SDM SEM SAM SBM}}]
$aid get resid > tt 
```
#### FAD分析
```bash
gmx make_ndx -f ./md/md.gro -n
echo 0 | gmx trjconv -s md.tpr -f md.trr -o md.xtc -pbc mol -ur compact -skip 3
echo 26 | gmx dipoles -s *.tpr -f *.xtc -n 

gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./energy/energy.tpr -po ./energy/energy.mdp
gmx mdrun -v -rerun ./md/md.trr -deffnm ./energy/energy $logogram3

gmx energy -s energy.tpr -f energy.edr
gmx distance -s md.tpr -f md.xtc -oxyz -tu ns -n -select "[0,0,1.520] plus group 27"
```
