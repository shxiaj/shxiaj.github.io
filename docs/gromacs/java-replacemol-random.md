---
title: '大文件按比率随机替换指定字符 (Java)'
date: 2022-09-26 12:51:50
tags: [Java,shell,Gromacs]
---

# 大文件按比率随机替换指定字符 (Java)
在一定比率下的随机替换指定行中的大文本字符串 java i/o 实现方法


### 1. 需求
mol2 分子坐标文件，120Mb大小，包含300w原子，需要将其中240多w的D原子按照20%的比例替换成W原子
为什么不使用Bash工具？ 生成随机数太慢了，不知道因为什么，可能就是生成不出来吧。 匹配行号替换 awk sed 感觉都不好用，总不能循环读取修改文件40多w次吧

### 2. 解决思路
- 生成有序随机数：按照比率生成总数一定不重复的随机数，表示着将要替换的行数
- java 输入流：按行读取，存入List&lt;String&gt;中
- 逻辑实现： 输入流索引（行号）与随机数生成的行号对比，如果相同执行替换命令
- java 输出流： 将每一行写入到另一个文件中
- 细节：生成的随机数从1开始，替换行号间需要转换

#### 随机数生成
```java
    public static int[] getRandom(int range, int count) {
        int[] array = new int[range];
        for (int i = 1; i <= range; i++) {
            array[i - 1] = i;
        }
        Random random = new Random();
        for (int i = 0; i < count; i++) {
            int last = range - i - 1;
            int currIndex = random.nextInt(last + 1);
            int temp = array[currIndex];
            array[currIndex] = array[last];
            array[last] = temp;
        }
        array = Arrays.copyOfRange(array, range - count, range);
        Arrays.sort(array);
        return array;
    }

```
range 表示总数，count 表示随机数的数量，返回有序的随机数int数组

#### 输入输出流
使用java1.7引入的Files类直接读取所有行，将每行存为字符串
使用FileWriter类，将每行重新写入文件中（如果文件已存在，默认会抹除文件）
path: 原文件路径   fname: 生成文件路径  startLine: 起始行 lineNum: 随机数行号
```java
    public static void replaceFile(int[] lineNum, String path, String fname, int startLine) throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(path));
        FileWriter fw = new FileWriter(fname);
        for (int i = 0,j = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            // 防止j超出索引; +startLine-1 表示行号转换
            if (j < lineNum.length && i == lineNum[j] + startLine - 1) {
                j++;
                // 替换当前符合行的字符或字符串
                line = line.replace('D', 'W');
                // fw.write(line);
            }
            // 写入文件
            fw.write(line);
            // 加上系统默认换行符
            fw.write(System.getProperty("line.separator"));
        }
        fw.flush();
        fw.close();
    }
```

#### Main函数入口参数
startLine :（区间的第一行行号 - 1）
endLine :（区间的最后一行行号）
rate : 随机替换比率
```java
    public static void main(String[] args) {
        // 源文件
        String path = "./particles.0000000000.mol2";
        // 生成文件
        String fname = "./particlesReplace.mol2";
        // 修改参数, D的前一行行号, D的最后一行行号
        int startLine = 599949;
        int endLine = 3000005;
        double rate = 0.2;

        int range = endLine - startLine;
        int count = (int) (range * rate);

        int[] lineNum = getRandom(range, count);

        try {
            replaceFile(lineNum, path, fname, startLine);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```

### 运行
要求：>=java1.8
运行命令：
```bash
# 编译生成ReplaceMol.class 文件
javac ReplaceMol.java
# 运行，不需要加.class
java ReplaceMol
```
**注意：编译性语言修改过源程序后需要重新编译class文件再运行**
#### 程序： ReplaceMol.java
**文件名需要与类名相同不能出错**

```java
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

public class ReplaceMol {
    public static int[] getRandom(int range, int count) {
        int[] array = new int[range];
        for (int i = 1; i <= range; i++) {
            array[i - 1] = i;
        }
        Random random = new Random();
        for (int i = 0; i < count; i++) {
            int last = range - i - 1;
            int currIndex = random.nextInt(last + 1);
            int temp = array[currIndex];
            array[currIndex] = array[last];
            array[last] = temp;
        }
        array = Arrays.copyOfRange(array, range - count, range);
        Arrays.sort(array);
        return array;
    }

    public static void replaceFile(int[] lineNum, String path, String fname, int startLine) throws IOException {
        FileWriter fw = new FileWriter(fname);
        List<String> lines = Files.readAllLines(Paths.get(path));
        for (int i = 0,j = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            if (j < lineNum.length && i == lineNum[j] + startLine - 1) {
                j++;
                line = line.replace('D', 'W');
                // fw.write(line);
            }
            fw.write(line);
            fw.write(System.getProperty("line.separator"));
        }
        fw.flush();
        fw.close();
    }

    public static void main(String[] args) {
        // 源文件
        String path = "./particles.0000000000.mol2";
        // 生成文件
        String fname = "./particlesReplace.mol2";
        // 修改参数, D的前一行行号, D的最后一行行号
        int startLine = 599949;
        int endLine = 3000005;
        double rate = 0.2;

        int range = endLine - startLine;
        int count = (int) (range * rate);

        int[] lineNum = getRandom(range, count);

        try {
            replaceFile(lineNum, path, fname, startLine);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 3. 实例

mol2文件

![image-20220926134623194](/images/image-20220926134623194.png)

![image-20220926134643252](/images/image-20220926134643252.png)

将D替换成W
