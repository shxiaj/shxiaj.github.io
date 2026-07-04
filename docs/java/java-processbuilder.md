---
title: 'Java 调用 Shell 命令与脚本'
date: 2022-10-25 15:55:09
tags: [Java]
---

# Java 调用 Shell 命令与脚本
### 1. Process类
对于Process类可以使用Runtime类创建一个进程实例, 稍微有点点麻烦
https://www.panziye.com/java/3846.html
对于Linux命令的输出, 就是进程类的输入流, InputStream
使用正常的流处理类就能搞定, 不过还是有点点麻烦

### 2.ProcessBuilder类
功能比较强大, 可以设置环境, 运行目录, 重定向输出

### 3. Hutools工具包
对于流处理很方便, 尽管最后我好像没有用到, 测试的时候倒是用了

### 4. 遇到Bug
对于某一个进程, 当输入流的缓冲区被堵塞时, 进程也会被阻塞.
遇到了进程都在ps -ef里, 但就是不运行的问题, 使用BufferRead类, 或者直接使用ProcessBuilder类的重定向到文件, 就没有什么问题了

### 5. 位移操作
** 乘方, 简写一下
a &lt;< b == a * (2 ** b)
a &gt;> b == a / (2 ** b)

`CmdTest.java`
```java
package xyz.shxiaj.pso;

import cn.hutool.core.io.FastByteArrayOutputStream;
import cn.hutool.core.io.IoUtil;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

/**
 * @Author shxiaj.github.io
 * @Date 2022/10/24 20:33
 */
public class CmdTest {

	public static Process callScript(List<String> cmdArgs) throws IOException {
		// 添加List的命令列表, 执行命令
		ProcessBuilder processBuilder = new ProcessBuilder(cmdArgs);
		// List<String> cmdArgs = new ArrayList<>();
		// cmdArgs.add("ls");
		// cmdArgs.add("-a");
		// processBuilder.command(cmdArgs);
		// 创建一个File实例, 实测会覆盖掉原有的文件.
		File log = new File("./log.log");
		// 重定向输出到文件, 解决缓冲区被堵塞的问题
		processBuilder.redirectOutput(log);
		processBuilder.redirectError(log);
		// 会往Linux命令里做输入
		// processBuilder.redirectInput(log);
		Process process = processBuilder.start();
		// String out = IoUtil.read(process.getInputStream(), Charset.defaultCharset());
		// System.out.println(out);
		return process;
	}

	public static void run() {
		String[] s1 = {"bash", "psoem.sh", "10", "30", "40", "0.5", "0.2", "1"};
		String[] s2 = {"bash", "psoem.sh", "20", "30", "40", "0.3", "0.2", "2"};
		String[] s3 = {"bash", "psoem.sh", "30", "30", "40", "0.4", "0.2", "3"};
		String[] s4 = {"ipconfig", "/all"};
		try {
			Process p1 = callScript(List.of(s1));
			// Process p2 = callScript(List.of(s2));
			// Process p3 = callScript(List.of(s3));
			// 必须等待进程结束, 不然java程序运行完, 这个子进程默认就被kill了
			// 返回值是shell命令执行后的状态码, 为0,正确执行,非0, 执行出错
			int i = p1.waitFor();
			System.out.println(i);
			// p2.waitFor();
			// p3.waitFor();
			// callScript(List.of(s4));
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		run();
	}
}
```
