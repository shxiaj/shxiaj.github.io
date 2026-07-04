---
title: 'Gromacs程序安装&使用'
date: 2021-08-25 13:28:05
tags: [Gromacs]
published: true
hideInList: false
feature: 
isTop: false
---

###### by DingLiAng
### cmake安装, 去官网下载Binary distributions二进制版
解压就能用，方便
```bash
wget https://github.com/Kitware/CMake/releases/download/v3.22.0-rc2/cmake-3.22.0-rc2-linux-x86_64.tar.gz
```
### fftw安装
```bash
wget http://www.fftw.org/fftw-3.3.10.tar.gz
# 解压
./configure --prefix=${HOME}/soft/fftw --enable-sse2 --enable-avx --enable-float --enable-shared --enable-avx2
make install -j 4
```
### Gromacs安装，CPU版本
```bash
wget ftp://ftp.gromacs.org/pub/gromacs/gromacs-2019.6.tar.gz
# 解压，安装fftw，cmake，gcc > 4.8.1;
# 注意安装fftw时加上AVX2指令集
tar xvzf xxx
cd gromacs
mkdir build
cd build
cmake .. -DCMAKE_INSTALL_PREFIX=指定安装目录 -DGMX_SIMD=AVX2_256 \ 
         -DCMAKE_PREFIX_PATH=fftw安装目录 \ 
         -DCMAKE_C_COMPILER=gcc文件全路径
         -DCMAKE_CXX_COMPILER=g++文件全路径 
         -DGMX_GPU=off
         # gcc是自己安装的需要指定，系统自带则不需要
# exmaple：cmake .. -DCMAKE_INSTALL_PREFIX=${HOME}/soft/gromacs \
# -DGMX_SIMD=AVX_256 -DCMAKE_PREFIX_PATH=/public/home/DLA/soft/fftw \ 
# -DCMAKE_C_COMPILER=/public/apps/gcc/bin/gcc -DCMAKE_CXX_COMPILER=/public/apps/gcc/bin/g++
make install -j xxx  # xxx 为编译时使用的核数，int型
```
[gromacs官网安装手册](https://manual.gromacs.org/documentation/2020/install-guide/index.html)

### CPU参数

```bash
# 查看逻辑核心个数
cat /proc/cpuinfo | grep name | cut -f2 -d: | uniq -c

# 查看cpu运行频率
cat /proc/cpuinfo |grep MHz|uniq
watch grep \"cpu MHz\" /proc/cpuinfo 

# 查看物理CPU个数
cat /proc/cpuinfo| grep "physical id"| sort| uniq| wc -l

# 查看每个物理CPU中core的个数(即核数)
cat /proc/cpuinfo| grep "cpu cores"| uniq

# 查看逻辑CPU的个数
cat /proc/cpuinfo| grep "processor"| wc -l
```


## Gromacs提交任务
```bash
# -nt 指定总线程数，即为所使用的的CPU核数
nohup gmx mdrun -v -deffnm md -nt 28 -ntomp 14 -pinoffset 14 > task.log 2>&1 & 
# nt = MPI*OpenMP = 任务使用核心数; -ntmpi 指定MPI; -ntomp 指定OpenMP;
```
- 测试结果:
chox体系进行的测试，8w原子， box = 9 * 9 * 10大约

```bash
# 8个CPU，总共256核(实际上是双线程，物理核心数128); 默频2.2Ghz, 全核2.2Ghz
switch(MPI * OpenMP) {
	case：4 * 64		18ns/day
	case：8 * 32		33ns/day
	case：16 * 16	39ns/day
	case：32 * 8		56ns/day
	case：64 * 4		46ns/day
	case：128 * 2	48ns/day
	case：256 * 1	58ns/day # 直接使用-nt 256
	case：64 * 1		28ns/day # 真垃圾
}

# 2个CPU，总共28核(单线程); 默频2.4Ghz，全核2.8Ghz
switch(MPI * OpenMP) {
	case：2 * 14		17ns/day
	case：4 * 7		20ns/day
	case：7 * 4		20ns/day
	case：28 * 1		28ns/day
}
```
- 总结
设置OpenMP = 1; MPI设为使用核数，最快。
但可能会出现报错，适当调整即可。

## Gromacs2021.3 And GTX3070 And 28核2.7Ghz测试
chox体系进行的测试，8.5w原子，box = 9.99 * 8.65 * 9.85

- 命令：```htop``` 查看CPU核心以及任务情况

![image-20211215092513100](/images/image-20211215092513100.png)

28核双线程，两块CPU，每个逻辑核是完全相同的。

- 命令：```sensors``` 查看CPU温度

![image-20211215093321509](/images/image-20211215093321509.png)

- 命令：```nvidia-smi```查看GPU工作情况

![image-20211215093041585](/images/image-20211215093041585.png)

重点在于：温度、功耗、利用率

- 提交命令

  gmx mdrun 参数："-pin on -ntmpi 1 -ntomp 9 -pme gpu -nb gpu -gpu_id 0 -pinoffset 56"

  - ```-ntomp 9```9核效果比较好，单个任务GPU利用率52%，体系85ns/day
  - ```-pinoffset 56``` 绑定起始CPU核心，调用CPU时会按照顺序调用
  - pinoffset计算方法：内部编号与htop显示出来的编号并不相同，转换方法：(htop的编号 - 1) * 2 = pinoffset编号
  - 例如：想从htop上面序号为1的核心开始，pinoffset = (1 - 1) * 2 = 0;
    第十个开始，pinoffset = 18;
  - ```-gpu_id 0``` 0或者1 看GPU喽

- 核心测试，GPU单个任务

| CPU核数 | GPU利用率% | CPU核数 | GPU利用率% |
| :-----: | :--------: | :-----: | :--------: |
|    4    |     40     |    9    |     52     |
|    5    |     42     |   10    |     53     |
|    6    |     45     |   14    |     54     |
|    7    |     48     |   28    |     53     |
|    8    |     50     |         |            |

一个GPU两个任务时，利用率82-88%都遇见过，不能到100%，疑惑，但是88%时，GPU功耗将近满载220W，疑惑。
一个GPU一个任务时，测试体系85ns/day * 1，一个GPU两个任务时75ns/day  * 2
使用核数7,8,9，认为都可以，按照任务数量调节，任务少就多用，任务多就少用。

一个GPU提交3个任务，每个任务用7个核，利用率最高97%左右，总体速度应该是最优的，实测61ns/day * 3

![image-20211219185219554](/images/image-20211219185219554.png)

- 我的提交方式
```bash
#!/usr/bin/bash


# 前台执行：./task.sh 2>&1 | tee task.log
# 后台执行：nohup ./task.sh > task.log 2>&1 &
# 后台查看进程：ps -ef | grep [t]ask.sh

function gmxem {
  gmx grompp -f em.mdp -c ions.gro -p topol.top -o ./em/em.tpr -po ./em/emout.mdp -n
  gmx mdrun -v -deffnm ./em/em -nt 30
}

function gmxnvt {
  gmx grompp -f nvt.mdp -c ./em/em.gro -p topol.top -o ./nvt/nvt.tpr -po ./nvt/nvtout.mdp -n -r ./em/em.gro
  gmx mdrun -v -deffnm ./nvt/nvt $logogram
}

function gmxmd {
  gmx grompp -f md.mdp -c ./nvt/nvt.gro -p topol.top -o ./md/md.tpr -po ./md/mdout.mdp -n -r ./nvt/nvt.gro
  gmx mdrun -v -deffnm ./md/md $logogram
}

function gmxrerun {
  gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./energy/energy.tpr -po ./energy/energy.mdp
  gmx mdrun -v -rerun ./md/md.trr -deffnm ./energy/energy 
}
###############################################################

logogram="-pin on -ntmpi 1 -ntomp 9 -pme gpu -nb gpu -gpu_id 0 -pinoffset 56"

gmxem
gmxnvt
gmxmd
```
