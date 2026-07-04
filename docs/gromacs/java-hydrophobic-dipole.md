---
title: '蛋白质疏水偶极计算 (Java)'
date: 2022-10-04 12:35:51
tags: [Java,Gromacs]
---
重写了计算脚本, 在学习一下用java怎么处理这种数据吧, 尽管java不适合干这个

### 1. gmx 导出帧
```bash
# 只能导出仅仅含有蛋白的gro文件, 如果是其他的后续处理没考虑会出问题
# 默认导进新建hd文件夹
gmx trjconv -f md.xtc -s md.tpr -sep -o ./hd/md.gro
```
### 2. Java 处理
Java确实看起来复杂的很, 写个简简单单的东西, 代码看起来像是敲锣打鼓通天响
处理步骤:
- 处理gro文件,存为字符串二维数组
- 将坐标的字符串数组转为double数组
- 计算几何中心
- 计算疏水偶极, cos值, 存为列表
- 最终写入文件
默认处理文件名md0.gro - mdxxx.gro,不好用算了
服务器java8,自己用的java11, 经常写出来的1.8的不支持,脑壳疼,我全给服务器额外下载了java11
编译运行, 生成hdv.dat
javac xxx
java xxx &lt;? String&gt;
默认处理当前目录下的hd目录, 要改就输入 ./xxx
尽管一大串看起来巨繁琐, 不过竟然比Fortran还快, 是我没想到的
```bash
Ding@21:~/sx/1003>>$ javac HydrophobicDipoles.java 
Ding@21:~/sx/1003>>$ time java HydrophobicDipoles

real    0m20.839s
user    0m24.568s
sys 0m1.568s
#####################################
Ding@21:~/sx/1003/hd>>$ time ./a.out 
At line 14 of file ./hm_side-all.f90 (unit = 47)
Fortran runtime error: Cannot open file 'md2501.gro': No such file or directory

Error termination. Backtrace:
#0  0x7fc4ae9673dc in already_open
    at ../../../libgfortran/io/open.c:719
#1  0x40105b in ???
#2  0x401974 in ???
#3  0x7fc4adc2a554 in ???
#4  0x400c38 in ???
#5  0xffffffffffffffff in ???

real    0m48.964s
user    0m48.479s
sys 0m0.484s
```
`HydrophobicDipoles.java`
```java
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Pattern;

public class HydrophobicDipoles {
    private final String[] resName = new String[]{"ILE", "PHE", "VAL", "LEU", "TRP", "MET", "ALA", "GLY", "CYS", "TYR", "PRO", "THR", "SER", "HIS", "GLU", "ASN", "GLN", "ASP", "LYS", "ARG"};
    private final Double[] hydrophobicIndex = new Double[]{1.38, 1.19, 1.08, 1.06, 0.81, 0.64, 0.62, 0.48, 0.29, 0.26, 0.12, -0.05, -0.18, -0.4, -0.74, -0.78, -0.85, -0.9, -1.5, -2.53};
    private final Map<String, Double> map = new HashMap<>();
    private final File dir;

    private final List<double[]> hdv = new ArrayList<>();

    public HydrophobicDipoles(String path) {
        for (int i = 0; i < resName.length; i++) {
            map.put(resName[i], hydrophobicIndex[i]);
        }
        dir = new File(path);
    }

    // public String[] getFiles() throws IOException {
    //     String[] fileNames = dir.list();
    //     Arrays.sort(fileNames);
    //     return fileNames;
    // }

    public String[][] readFiles(File file) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(file.getPath()), StandardCharsets.US_ASCII);
        // 移除gro文件1,2,$行
        // lines.remove(0);
        // lines.remove(0);
        // lines.remove(lines.size() - 1);
        String[][] stringData = new String[lines.size() - 3][6];
        for (int i = 2; i < lines.size() - 1; i++) {
            // 去掉前后空格才能正确的split
            stringData[i - 2] = lines.get(i).trim().split("\\s+");
            // 对于残基种类的赋值
            stringData[i - 2][0] = lines.get(i).substring(5, 8);
        }
        return stringData;
    }

    public double[][] convertStringData(String[][] stringData) {
        double[][] xyzData = new double[stringData.length][3];
        for (int i = 0; i < stringData.length; i++) {
            for (int j = 3; j < 6; j++) {
                xyzData[i][j - 3] = Double.parseDouble(stringData[i][j]);
            }
        }
        return xyzData;
    }

    public double[] calGeometricCenter(double[][] xyzData) {
        double[] cog = new double[3];
        for (double[] xyz : xyzData) {
            cog[0] += xyz[0];
            cog[1] += xyz[1];
            cog[2] += xyz[2];
        }
        int len = xyzData.length;
        cog[0] /= len;
        cog[1] /= len;
        cog[2] /= len;
        return cog;
    }

    public void calHydrophobicDipole(double[] cog, String[][] stringData, double[][] xyzData) {
        double[] dp = new double[5];
        for (int i = 0; i < stringData.length; i++) {
            String res = stringData[i][0];
            String at = stringData[i][1];
            if (at.equals("CA") && map.containsKey(res)) {
                double hpi = map.get(res);
                dp[0] += (xyzData[i][0] - cog[0]) * hpi;
                dp[1] += (xyzData[i][1] - cog[1]) * hpi;
                dp[2] += (xyzData[i][2] - cog[2]) * hpi;
            }
        }
        dp[3] = Math.sqrt(dp[0] * dp[0] + dp[1] * dp[1] + dp[2] * dp[2]);
        dp[4] = dp[2] / dp[3];
        hdv.add(dp);
    }

    public void writerFile() throws IOException {
        FileWriter fw = new FileWriter("hdv.dat", false);
        String s1 = String.format("%-6s%9s%9s%9s%9s%9s", "# Index", "x", "y", "z", "value", "cos");
        fw.write(s1);
        fw.write(System.getProperty("line.separator"));
        for (int i = 0; i < hdv.size(); i++) {
            double[] h = hdv.get(i);
            String s2 = String.format("%6d%9.3f%9.3f%9.3f%9.3f%9.3f", i, h[0], h[1], h[2], h[3], h[4]);
            fw.write(s2);
            fw.write(System.getProperty("line.separator"));
        }
        fw.flush();
        fw.close();
    }

    public void run() throws IOException {
        for (int i = 0; i < 50000; i++) {
            String fn = "md" + i + ".gro";
            File file = new File(dir, fn);
            if (file.exists()) {
                String[][] stringData = readFiles(file);
                double[][] xyzData = convertStringData(stringData);
                double[] cog = calGeometricCenter(xyzData);
                calHydrophobicDipole(cog, stringData, xyzData);
            } else break;
        }
        writerFile();
    }

    public static void main(String[] args) {
        HydrophobicDipoles hd = new HydrophobicDipoles("./hd");
        try {
            hd.run();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```
