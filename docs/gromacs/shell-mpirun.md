---
title: 'shell中实现并行控制执行-ptmc的运行'
date: 2022-10-20 15:55:55
tags: [Gromacs, shell]
published: true
hideInList: false
feature: 
isTop: false
---
运行ptmc程序的批处理脚本

### 1. ptmc文件设置
报错的warning, 源码的bug, 新的gcc编译器会出现warning, 编译加上-fno-align-commons可解决一个
```
ptmc.for:3649.50:

        call MK_SWAP (swap_pairs_flag, configbuf, exchflagbuf)          
                                                  1
Warning: Actual argument contains too few elements for dummy argument 'exchflagbuf' (300/601800) at (1)
ptmc.for:4913.23:

      common /prothyph/   iresname, hres                                
                       1
Warning: Padding of 1 bytes required before 'hres' in COMMON 'prothyph' at (1); reorder elements or use -fno-align-commons
ptmc.for:563.23:
```
问题不大
对于相互作用参数的文件, 格式一定要按照原来的文件格式, 不然报错, 因为Fortran代码里就是那么写的, 不够智能
残基的个数也不能只有20个, 也会报错, 加上原来的用不上的就行
都是报错后, 发现的问题. 小问题
### 2. shell并行执行控制
首先是简单的 & 和 wait, 后台处理和等待处理完成
不过我控制的并行的个数, 因为一次执行需要使用5个cpu核心, 并行4个差不多了
使用的方法 : 利用命名管道来做任务队列, 可百度搜索
感觉类似像锁一样, 包含在ptmcRun这个函数里, read 后面的 {} 中内容为需要并行执行的命令
具体的脚本如下, 包含所有的内容
`ptmcRun.pbs`
```bash
#!/bin/bash

#PBS -N ptmc

#PBS -l nodes=1:ppn=24
#PBS -j n
#PBS -e ${PBS_JOBNAME}.err
#PBS -o ${PBS_JOBNAME}.out

[[ $PBS_O_WORKDIR != "" ]] && cd $PBS_O_WORKDIR
###########################################################
# p means: Protein
function proNumAndName {
  pFileName=`ls *.pdb` && pId=${pFileName:0:4}
  atomNum=`awk '{if($1 == "ATOM") i += 1} END{print i}' $pFileName`
}

function ptmcArgsSetting {
  cp ${pId}.pdb ${wd}/mold
  sed -i -e "1s/.*/${pId}.pdb,/g; 6s/.*/${pId}_1.pdb,/g" ./mold/finfo.txt
  sed -i -e "16s/[0-9]*/${bX}/1; 17s/[0-9]*/${bY}/1; 18s/[0-9]*/${bZ}/1; \
             15s/[0-9]*/${atomNum}/1" ./mold/parainfo.dat
  sed -i -e "4s/[0-9]*/${rZ}/1" ./mold/iconfig.dat
}

function ptmcRun {
  # 创建有名管道
  rm ./fifoFile
  mkfifo ./fifoFile
  # 创建文件描述符，以可读（<）可写（>）的方式关联管道文件，这时候文件描述符3就有了有名管道文件的所有特性
  exec 3<> ./fifoFile
  # 删除文件, 只需要使用描述符
  rm ./fifoFile
  # 创建令牌个数, 当管道里还有令牌时可以进行计算
  for i in {1..4}; do
    # echo 每次输出一个换行符, 代表一个令牌
    echo >&3                   
  done

  for scd in ${SCD[@]};do
    for is in ${IS[@]};do
      # 读取管道内令牌
      read -u3
      {
        if [ `echo "${scd} > 0" | bc` -gt 0 ]; then 
          dflag=p.
        else
          dflag=n.
        fi
        mkdir ${wd}/${dflag}${scd}_${is}
        cp -r ${wd}/mold/* ${wd}/${dflag}${scd}_${is}
        cd ${wd}/${dflag}${scd}_${is}
        mv rspara_${dflag}dat rspara.dat
        sed -i -e "35s/.*/${scd}       ,SCD/1; 36s/.*/${is}       ,IS/1" parainfo.dat
        mpif90 ptmc.for
        mpirun -n 5 ./a.out > ptmc.out
        echo -e "1\n3\n" | gmx confrms -f1 pspdb00.pdb -f2 ${pId}.pdb -o ${pId}_ptmc.pdb
        sed '/MODEL/,/MODEL/d' ${pId}_ptmc.pdb > ${pId}_${scd}_${is}.pdb
        # 执行完成后将令牌放回
        echo >&3
      } &   # &符号执行并行
    done
  done
  wait
  # 等待循环条件全部跑完, 关闭管道读写
  exec 3<&-                       # 关闭文件描述符的读
  exec 3>&-                       # 关闭文件描述符的写
}

function ptmcAnalys {
  cd ${wd}
  pdir=$( ls | grep _ )
  mkdir -p ${wd}/analys/data ${wd}/analys/pdb
  for dir in ${pdir[@]}; do
    cd ${wd}/${dir}
    cp histpornt00.dat ${wd}/analys/data/${dir}-UOP.dat
    cp ${pId}_${dir:2}.pdb ${wd}/analys/pdb/

    cd ${wd}/analys/data
    echo -e "\n[[ ${dir:2} ]]" >> total.dat
    echo -e "Frame     Cos    Probability   Total_Energy   Vdw_Ene     Coulomb_Ene" > r_${dir}.dat
    awk '{ if ($2 > 1) printf("%5d%10.4f%10.3f%16.3f%12.3f%14.3f\n", \
         NR, $1, $2, $3, $4, $5)}' ${dir}-UOP.dat >> r_${dir}.dat
    cat r_${dir}.dat >> total.dat
  done
}

###########################################################

SCD=(0.001 -0.001)
IS=(0.01 0.03 0.05 0.1 0.3)

bX=100
bY=100
bZ=100
rZ=50

wd=$PWD

proNumAndName
ptmcArgsSetting
ptmcRun
ptmcAnalys
```
