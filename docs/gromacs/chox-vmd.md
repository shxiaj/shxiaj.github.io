---
title: 'ChOx 分析(2): VMD 轨迹与偶极分析'
date: 2021-09-30 13:40:28
tags: [Gromacs]
---
ChOx分析2-VMD
==== 
### 一、处理trr轨迹文件
防止蛋白质分子裂开，帧总数为1/2，提取最后一帧gro文件
```bash
# -skip 间隔帧数输出
echo 0 | gmx trjconv -s md.tpr -f md.trr -o md.xtc -pbc mol -ur compact -skip 2
# 提取最后一帧，不带水分子
# echo 20 | gmx trjconv -s md.tpr -f md.xtc -o md.gro -dump 300000
g_group 1 | gmx trjconv -s md.tpr -f md.xtc -o md.gro -dump 300000
```
### 二、xtc中导出dipoles
```bash
# 建立索引，将蛋白质、FAD索引合并，否则分子不完整
echo -e "1 | 13\nq\n" | gmx make_ndx -f ./md.tpr 
# gmx dipoles计算静电偶极、是物理意义
g_group 3 | gmx dipoles -s md.tpr -f md.xtc -n
# 200ns过后的dp
g_group 3 | gmx dipoles -s md.tpr -f md.xtc -b 200000 -n
# echo 28 | gmx dipoles -s md.tpr -f md.xtc -n
# 计算偶极与Z轴的夹角的余弦值，写入dipoles
awk '!/^(#|@)/ {theta = $4 / $5; print $1 "     " theta}' Mtot.xvg > dipoles.dat
# 疏水偶极,200ns起始时间,100ns区间时间,2500区间
awk '!/^(#|@)/ {printf("%5.2f\t%6.3f\n",200+100/2500*$1, $6)}' hdv.dat > hpdpCos.dat
```
### 三、VMD画偶极
##### 1. 蛋白质分子质心坐标
打开md.gro， 蛋白质居中（自定义命令pc）见附录，然后保存再打开
重新打开后输入tcl命令
```tcl
## VMD获取质心坐标， mass_center_x     mass_center_y     mass_center_z
set mcid [atomselect 0 "protein or resname FAD"]
measure center $mcid weight mass
```

##### 2. 直接用脚本画，缩放目标可能需要调整，文件名：dipoles.sh
```bash
脚本目录：${HOME}/sx/script/dipoles.sh
用法./dipoles.sh     mass_center_x     mass_center_y     mass_center_z
```
脚本内容：附录

##### 3. VMD 中画偶极
使用脚本输出的vmd命令直接画
```bash
display resetview
rotate x by -90
rotate y by -90
source {E:\Notes\Script\VMD\color.tcl}
draw delete all
draw color purple
# 下面两条命令替换成脚本得到的
draw cylinder {41.048 34.253 47.490} {56.475 62.396 17.579} radius 0.5 filled yes resolution 20
draw cone {56.475 62.396 17.579} {58.058 65.282 14.511} radius 1.5 resolution 20
```
##### 4. VMD 保存图片
调整一下视角，背景白色，二级结构，设置好工作目录，渲染保存
缩放vmd视图看起来是透视，但是渲染出来的是正常的
```bash
# 缩放
scale by 1.00

# 关闭坐标轴
axes location Off
# 背景白色
bw
# 关闭景深
display depthcue off
# 开灯
light 2 on
# render文件
render Tachyon vmdscene.dat 
# 渲染
tachyon_WIN32.exe vmdscene.dat -aasamples 24 -format BMP -mediumshade -trans_vmd -res 2560 1440 -numthreads 4 -o dipole.bmp

render Tachyon vmdscene.dat
set fileName [clock seconds]
tachyon_WIN32.exe vmdscene.dat -aasamples 24 -format BMP -mediumshade -trans_vmd -res 1200 1200 -numthreads 8 -o ${fileName}.bmp
```

tachyon_WIN32.exe我自己已经写到环境变量，可直接调用

#### 5.PTMC的偶极
设置盒子大小10 10 10
```tcl
pbc wrap -center com -centersel "serial 1 to 498" -compound residue -all
set mcid [atomselect 0 "serial 1 to 498"]
measure center $mcid weight mass
```

### 附vmd初始化脚本：vmd.rc

```tcl
display projection orthographic

proc bw {} {color Display Background white}
proc bb {} {color Display Background black}
proc bx {} {pbc box}

proc sam {} {
    display resetview
    rotate x by -90
    rotate y by -90


    mol delrep 0 0

    mol modcolor 0 0 Structure
    mol modstyle 0 0 NewCartoon 0.300000 10.000000 4.100000 0
    mol color Structure
    mol representation NewCartoon 0.300000 10.000000 4.100000 0
    mol selection not water
    mol material Glossy
    mol addrep 0

    mol modselect 1 0 {resname SAM SBM SEM SDM}
    mol color Name
    mol representation Lines 1.000000
    mol selection {resname SAM SBM SEM SDM}
    mol material Glossy
    mol addrep 0

    mol modselect 2 0 resname FAD
    mol modcolor 2 0 ColorID 0
    mol modcolor 2 0 ColorID 7
    mol modstyle 2 0 VDW 1.000000 12.000000
    mol color ColorID 7
    mol representation VDW 1.000000 12.000000
    mol selection resname FAD
    mol material Glossy
    mol modrep 2 0
    mol addrep 0
}

proc pc {} {
  pbc wrap -center com -centersel "protein" -compound residue -all
}
```



### 附Script:  dipoles.sh

```bash
# Usage: 需要Mtot.xvg、 md.gro (都为最后一帧)
# Author: Ding
#########################################################

function fun1 {
  # 获取偶极xyz分量
  awk 'END {printf("%15.3f%15.3f%15.3f\n",$2,$3,$4)}' Mtot.xvg
}

function fun2 {
  # md.gro 最后一行的残基编号和原子总数
  awk 'BEGIN {FIELDWIDTHS="5 3 7 5"} \
       {a=aa;b=bb;aa=$1;bb=$4;} END {print a " " b}' md.gro
}

function fun3 {
  # 缩放的坐标，质心、偶极、尖尖
  awk 'BEGIN {
       mx = "'$mx'" / 10 ; my = "'${my}'" / 10; mz = "'${mz}'" / 10;
       dx = "'${dip[0]}'"; dy = "'${dip[1]}'"; dz = "'${dip[2]}'";
       s = 3; t = 8;
       for (i = 1; i < 200; ++i) {
            dxi=dx/i; dyi=dy/i; dzi=dz/i;
            if (-s < dxi && dxi < s && -s < dyi && dyi < s && -s < dzi && dzi < s) break;
       }
       x2=mx+dxi; y2=my+dyi; z2=mz+dzi;
       x3=mx+dx/(0.9*i); y3=my+dy/(0.9*i); z3=mz+dz/(0.9*i);
       printf("%8.3f%8.3f%8.3f\n",x2,y2,z2);
       printf("%8.3f%8.3f%8.3f\n",mx*10,my*10,mz*10);
       printf("%8.3f%8.3f%8.3f\n",x2*10,y2*10,z2*10);
       printf("%8.3f%8.3f%8.3f\n",x3*10,y3*10,z3*10);
       printf("%5d\n",i)
     }'
}

function fun4 {
  # 缩放后坐标写入md.gro，一个质心一个偶极箭头点
  # echo $1 $2 $3
  awk 'BEGIN {FIELDWIDTHS="5 3 7 5 8 8 8"; 
       num = "'${atom_num[1]}'";rid = "'${atom_num[0]}'";
       x1 = "'$mx'" / 10 ; y1 = "'${my}'" / 10; z1 = "'${mz}'" / 10;
       x2 = "'${f_dip[0]}'";y2 = "'${f_dip[1]}'";z2 = "'${f_dip[2]}'"}
       {if (NR == 2) print $1+2; else print $0 ; if (NR == num + 2){
        printf("%5d%3s%7s%5d%8.3f%8.3f%8.3f\n", rid+1,"LOG","CA",num+1,x1,y1,z1);
        printf("%5d%3s%7s%5d%8.3f%8.3f%8.3f\n", rid+1,"LOG","CA",num+2,x2,y2,z2)
       }}' md.gro
}

function fun5 {
  # 计算静电偶级与Z轴的夹角Cos theta值
  awk '!/^(#|@)/ {theta = $4 / $5; print $0 "     " theta}' Mtot.xvg > dipoles
}

#########################################################
       # printf("%8.3f%8.3f%8.3f\n",mx,my,mz);
       # printf("%8.3f%8.3f%8.3f\n",dx,dy,dz);
# fun4 
# echo ${atom_num[@]}
# echo ${f_dip[@]}

# atomselect 0 "protein or resname FAD"
# measure center atomselect0 weight mass
#########################################################

### mass center's coordinate (units A) ###
mx=$1; my=$2; mz=$3


### diploes_coordinate ###
dip=($(fun1))
echo -e "\n偶极分量: ${dip[@]}"


### atom_numbers ###
atom_num=($(fun2))
echo -e "残基编号&原子总数: ${atom_num[@]}"


### log_atom_coordinate ###
f_dip=($(fun3))
echo -e "蛋白质心坐标(A): ${f_dip[3]} ${f_dip[4]} ${f_dip[5]}"
echo -e "缩放偶极坐标(A): ${f_dip[6]} ${f_dip[7]} ${f_dip[8]}"
echo -e "偶极尖尖坐标(A): ${f_dip[9]} ${f_dip[10]} ${f_dip[11]}"
echo -e "缩放次数: ${f_dip[12]}"
echo -e "draw cylinder {${f_dip[3]} ${f_dip[4]} ${f_dip[5]}} {${f_dip[6]} ${f_dip[7]} ${f_dip[8]}} radius 0.5 filled yes resolution 20"
echo -e "draw cone {${f_dip[6]} ${f_dip[7]} ${f_dip[8]}} {${f_dip[9]} ${f_dip[10]} ${f_dip[11]}} radius 1.5 resolution 20"

### write in gro ###
# fun4 > md_dipoles.gro
```

