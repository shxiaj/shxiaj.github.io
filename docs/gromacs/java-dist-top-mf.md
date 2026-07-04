---
title: '二维散点数据线性插值计算对应自变量的值-java'
date: 2023-4-26 19:00:09
tags: [Java,Gromacs]
published: true
hideInList: false
feature: 
isTop: false
---
左边是已知数据. 一个dat文件, 右边是所需要求得数据列表,另一个dat文件
```
#  dist           ene   |   targetDist  time  targetEne
-0.28295    -33.02512   |   -0.39624    xxx           
-1.01E-01   -32.68187   |   -0.38924    xxx           
-0.01417    -31.80614   |   -0.38424    xxx           
0.02772     -30.1726    |   -0.38124    xxx           
0.04128     -29.38776   |   .....       xxx           
0.05483     -30.6218    |   -0.26124    xxx           
0.06839     -30.99713   |   -0.26124    xxx           
0.08195     -31.4469    |   -0.26024    xxx           
0.0955      -31.18567   |   -0.26024    xxx           
0.10906     -30.35387   |   ......      xxx           
0.12261     -29.38833   |    2.39176    xxx            
0.13617     -28.38347   |    2.40676    xxx            
0.14973     -28.0361    |    2.43676    xxx            
0.16328     -27.8113    |    2.44176    xxx            
0.17684     -28.09536   |    2.45976    xxx            
0.19039     -28.27295   |    2.49676    xxx            
0.20395     -27.9215    |    2.51276    xxx            
0.21751     -27.53844   |                          
0.23106     -27.31849   |                          
0.24462     -27.41703   |                          
```

Java11 运行, java8应该也没问题, 特意避免了新的方法
主要是处理边界有点麻烦, 中间直接用线性插值就行, 找不到的默认就是0

```java
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

/**
 * @Author shxiaj.github.io
 * @Date 2023/04/26 17:34
 */
public class DistToPMF {
    public static void main(String[] args) throws Exception {
        String p1 = args[0]; // distpmf
        String p2 = args[1]; // disttime
        double[][] pmf = readFile(p1);
        double[][] time = readFile(p2);
        double[] ret = new double[time.length];
        FileWriter fw = new FileWriter("./pmfpred.dat", false);

        int j = 0;
        for (int i = 0; i < time.length; i++) {
            while (j < pmf.length && pmf[j][0] < time[i][0]) {
                j++;
            }
            if (j == pmf.length && Math.abs(pmf[j - 1][0] - time[i][0]) < 0.01) {
                ret[i] = pmf[j - 1][1];
            } else if (j == 0 && Math.abs(pmf[j][0] - time[i][0]) < 0.01) {
                ret[i] = pmf[j][1];
            } else if (j != pmf.length && j != 0) {
                double v = pmf[j - 1][1] + (pmf[j][1] - pmf[j - 1][1]) *
                        (time[i][0] - pmf[j - 1][0]) / (pmf[j][0] - pmf[j - 1][0]);
                ret[i] = v;
            }
        }
        String desc = String.format("%6s%8s%8s%8s", "index", "dist", "pmf", "time");
        fw.write(desc);
        fw.write(System.getProperty("line.separator"));
        for (int i = 0; i < ret.length; i++) {
            String s = String.format("%6d%8.4f%8.3f%8.2f", i, time[i][0], ret[i], time[i][1]);
            fw.write(s);
            fw.write(System.getProperty("line.separator"));
        }
        fw.close();
    }

    public static double[][] readFile(String path) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(path), StandardCharsets.UTF_8);
        double[][] vals = new double[lines.size()][2];
        for (int i = 0; i < lines.size(); i++) {
            String[] s = lines.get(i).trim().split("\\s+");
            vals[i][0] = Double.parseDouble(s[0]);
            vals[i][1] = Double.parseDouble(s[1]);
        }
        return vals;
    }
}
```
