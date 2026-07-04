---
title: 'Awk，Python与各种小工具'
date: 2021-12-16 16:56:10
tags: [Gromacs,shell]
---
一个学习记录的过程


## 1. Awk

awk 正则匹配语法：regexp[https://www.runoob.com/regexp/regexp-syntax.html]

awk BEGIN+过滤+主体{}+END 语法编写顺序

```bash
awk 'BEGIN{i = 1} !/^(#|@)/ {theta = $4 / $5; print $1 "     " theta}' Mtot.xvg > dipoles
```

awk 命令行与脚本实例对比

```bash
awk '!/^(#|@)/ {for (i = 2; i <= NF; ++i) {freq[i] += $i; print freq[i] "  " $i "  " i}} END {print NR; for(i in freq) printf("%8.3f\n",freq[i]/NR*2)}'
```



```c
#!/usr/bin/awk -f
# awk解释器位置


BEGIN {
    T = 2;
    printf("ok\n");
}

# 正则匹配模式，必须连接在一起
!/^(#|@)/ {
    for (i = 2; i <= NF; ++i) {
        freq[i] += $i;
        #print $0;
    }
}

END {
    print NR;
    for(i in freq)
        printf("%15.3f", freq[i] / NR * T);
    printf("\n");
}

# 数组索引并非是连续的
!/^(#|@)/ {
    if(bg == 0) {bg = FNR;}
    if(NR == FNR) {
        v1[FNR] = $2;
    } else {
        v2[FNR] = $2;
    }
} 
END {
    len = length(v1);
    for (i = bg; i < len + bg; ++i) {
        printf("%12.4f%12.4f%12.4f\n", v1[i], v2[i], (v1[i]+v2[i])/2);
    }
}

# awk 文件行列转置，列转行
{
    for(i=1;i<=NF;i++) 
        a[i,NR]=$i
}
END {
    for(i=1;i<=NF;i++) {
        for(j=1;j<=NR;j++) printf("%10.4f ",a[i,j]);
        printf("\n");
        }
}
```

### 传递数组
当需要shell的数组时，把shell当成字符串输入，awk里在使用split()函数将其分解；
awk使用的是扩展的正则表达式；awk字符串函数说明
[字符串函数教程](https://www.twle.cn/c/yufei/awk/awk-basic-string-functions.html)
[正则表达式语法](https://www.cnblogs.com/chengmo/archive/2010/10/10/1847287.html)

- 在使用if语句的时候，**一定要加{}，就算后面只有一条语句也得加**，否则不会执行。大大的教训
- 改变$1 $2的结果时，同时也会改变$0的值，**但是这时候的$0，会自作多情的给你在每列值之间添加上空格分隔符**。所以当改变列值时，要么使用printf格式化输出每列值，要么就$1 $2 $3....一个个打出来
```bash
# substr 提取字符串，awk字符串索引竟然是从1开始的
awk '{atomName=substr($12,1,1) substr($3,2);print atomName}' unit.pdb > unit
# awk筛选行, gsub替换字符串
awk -v arr="$(cat unit)" '
BEGIN {
    FIELDWIDTHS="8 7 53";
    split(arr,atomName);
    i=-1;
    len=length(atomName)
}
{   if (i > len) {i -= len};
    if (NR > 2 && NR < 45723) {gsub("[^[:space:]].*$", atomName[i], $2)};
    print $1 $2 $3;
    i++;}' nvt.gro > tt.gro

# 简单的方法就可以完成，根本用不着替换字符串，方向错了
# linux适用
awk '{atomName=substr($12,1,1) substr($3,2);print atomName}' unit.pdb > unit
awk -v arr="$(cat unit)" 'BEGIN {FIELDWIDTHS="8 7 53";
split(arr,atomName);i=-1;len=length(atomName)}
{if (i > len) {i -= len} if ($1 ~ /PCA/) {printf("%s%7s%s\n",$1,atomName[i],$3)}
else {print $0} i++;}' nvt.gro > tt.gro

# linux上显示参数过多，win可以
awk '{atomName=substr($12,1,1) substr($3,2);print atomName}' pc.pdb > pc
awk -v arr="$(awk '{atomName=substr($12,1,1) substr($3,2);print atomName}' pc.pdb)" 'BEGIN {
    FIELDWIDTHS="8 7 53";
    split(arr,atomName);}
    {if ($1 ~ /PCA/) {printf("%s%7s%s\n",$1,atomName[NR-2],$3)}
    else {print $0}
    }' nvt.gro > tt.gro
```



统计一下下rmsd>0.2的resid

```bash
awk '{if($2>0.2||$3>0.2||$4>0.2||$5>0.2||$6>0.2) {print $0}}' rmsf.dat
# 打印数字时，第一个数字出现了bug显示为0，不知道为什么还是使用%s吧
awk '{if($2>0.2||$3>0.2||$4>0.2||$5>0.2||$6>0.2) printf("%d ",$1)}' rmsf.dat
awk '{if($2>0.2||$3>0.2||$4>0.2||$5>0.2||$6>0.2) printf("%s ",$1)}' rmsf.dat > rmsfGreater2A
# 破案了格式问题dos2unix即可，发现不正常的文件读取大概率都是这个原因
```

```bash
# 统计蛋白质z轴坐标最小值随时间的变化
function proMinz {
  mkdir minz
  # 2>&1 将gmx的错误输出到标准输出, 这样可以使用管道传递, 使用sed获取Protein组所在的id
  proteinIdx=$(echo 3000 | gmx trjconv -f md.xtc -s md.tpr 2>&1 | sed -n 's/^Group *\(.*\)( *Protein).*$/\1/p')
  echo $proteinIdx | gmx trjconv -f md.xtc -s md.tpr -skip 2 -o ./minz/protein.gro
  # gro文件的第一行一般都不是空格开头, 所以可以判断文件是否读取到了下一帧的第一行
  awk 'BEGIN {
    FIELDWIDTHS="36 8";
    min = 100;
  } 
  { if ($1 !~ /^ / && NR != 1) {
      print min;
      min = 100;
    }
    if ($2 ~ /[0-9]\.[0-9]{3}$/ && $2 < min) {
      min = $2;
    }
  }
  END {
    print min;
  }' ./minz/protein.gro > ./minz/minz.dat
}
```


## 4. Sed用法

详细的教程，虽然没看过但是肯定有用[sed教程](https://www.twle.cn/c/yufei/sed/sed-basic-index.html)

## 3. ffmpeg
转换图片格式
```bash
ffmpeg -hide_baatomNameer -y -i $fileName.bmp -pix_fmt rgb24 -c tiff -compression_algo lzw $fileName.tif
```


## 2. Python

```python
import matplotlib
# 使用非交互后端，加速运行速度
matplotlib.use('Agg')
```
```bash
conda clean -p      #删除没有用的包
conda clean -t       #tar打包
conda clean -y -a   #删除所有的安装包及cache
conda config --set changeps1 false #关闭conda的环境提示
```



## 5.  Shell

- 搞一个生成md模板的函数
- gitbash初始化文件位置"H:\Software\PortableGit\etc\bash.bashrc"
- `mdblog filename`

```bash
function mdblog {
  echo \
'---
title: '标题'
date: 2022-01-08 15:55:55
tags: [Gromacs, shell]
published: true
hideInList: false
feature: 
isTop: false
---


' > $1.md
}
```

### 5.1 tail tailf tail -f
md运行的nohup.out日志, 使用tail 或者 tail -f 查看都有大问题, 不知道为什么, 总是会默认读取所有的行
只有使用`tailf` 这样才比较正常, 以后就用这个了.
