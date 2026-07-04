---
title: '接触残基梯度图绘制 (beta coloring)'
date: 2022-10-22 19:00:09
tags: [Gromacs,shell]
---
多样化绘图接触残基


### 1. 思路
- VMD 可以根据beta的值着色
- 根据残基接触距离区间帧占比,修改beta
- VMD 画图
### 2. 占比加修改
残基与表面的最小距离gmx mindist
分析最后100ns的占比 ($1 >= 200) 可以修改
按照距离大小给予权重 0.35 0.8 1.6 .. (nm)
- 实测gawk >=5.1没问题, gawk 4.x版本不正确,可能是 END结构中的for循环实现效果不一样.
```bash
awk '!/^(#|@)/ && $1 >= 200 {
  for (j = 2; j <= NF; j++) {
    if ($j < 0.2) {
      freq[j] += 1;
    } else if ($j < 0.35) {
      freq[j] += 0.9;
    } else if ($j < 0.5) {
      freq[j] += 0.7;
    } else if ($j < 0.9) {
      freq[j] += 0.5;
    } else if ($j < 1.6) {
      freq[j] += 0.3;
    } else {
      freq[j] += 0;
    }
  }
  count++;
} END {
  for (i in freq) {
    printf("%5.2f\n", freq[i] / count);
  }
}' mindist.xvg > occ.dat
```

#### 后续改进的线性方式计算占比

频率权重按照距离大小,从0到1线性比例计算出来,单位nm
$$
freq\begin{cases}
  & 1,mindist < 0.35\\
  & 1 - \cfrac{mindist - 0.35}{6 - 0.35}, 0.35 &lt;= mindist <= 0.6\\
  & 0, mindist &gt; 0.6
\end{cases}
$$

```bash
# 150: 表示150ns后的数据
# 6 0.35表示最大边界,超出边界的freq直接设置为0和1
awk '!/^(#|@)/ && $1 >= 150 {
  for (j = 2; j <= NF; j++) {
    f = 1 - ($j - 0.35)/(6 - 0.35);
    if (f < 0) {f = 0}
    if (f > 1) {f = 1}
    freq[j] += f;
  }
  count++;
} END {
  for (i in freq) {
    printf("%5.2f\n", freq[i] / count);
  }
}' res-mindist.xvg > occ.dat
```
pdb文件格式
```
ATOM      1 N    ASP     6       1.914  52.857 -32.006  1.00150.00           N
ATOM      2 H1   ASP     6       2.466  53.680 -31.871  1.00150.00            
ATOM      3 H2   ASP     6       0.996  53.009 -31.640  1.00150.00            
ATOM      4 H3   ASP     6       2.340  52.088 -31.530  1.00150.00            
ATOM      5 CA   ASP     6       1.823  52.546 -33.488  1.00150.00           C
ATOM      6 HA   ASP     6       1.294  53.255 -33.954  1.00150.00            
ATOM      7 CB   ASP     6       3.309  52.515 -33.994  1.00150.00           C
.............
```
pdb格式如果与上面不相同的, 无法正确的格式化

占比: x150 倍扩大差异; -5:残基第一个ID值 - 1
```bash
awk -v bs="`cat occ.dat`" '
BEGIN { split(bs, b); }
{
  $10 = b[$5 - 5] * 150;
  printf("%-6s%5d %-4s %3s A%4d    %8.3f%8.3f%8.3f%6.2f%6.2f          %2s\n",$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11);
}' proFad.pdb > res.pdb

```
### 3. 绘制图
VMD -> beta -> surf
![image-20221022210819547](/images/image-20221022210819547.png)
