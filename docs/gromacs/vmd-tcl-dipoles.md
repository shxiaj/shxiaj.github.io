---
title: 'Tcl绘制Vmd里面的静电偶级'
date: 2022-06-08 14:07:53
tags: [Vmd,Tcl,Gromacs]
---
重写了diploes.sh，更快更方便

调用方法:
`diploes x y z ?s ?t`
x y z 分别代表Mtot.xvg的三个分量，Mtot.xvg 由gmx dipoles获得
s  t 分别都有默认值3，0.9，分别控制圆柱的长度和圆锥的长度, 是可选输入
依赖 massCenter 函数的结果，在最下面。
执行完成后，会在工作目录生成vmdDipoles文件，查看即可
同时可能会默认输出，看电脑环境变量的设置
```tcl
# dipoles过程
proc dipoles {dx dy dz {s 3} {t 0.9}} {
  set mc [massCenter]
  set mx [expr [lindex $mc 0]/10]
  set my [expr [lindex $mc 1]/10]
  set mz [expr [lindex $mc 2]/10]

  for {set i 0} {$i < 1000} {incr i} {
    set dxi [expr $dx/$i]
    set dyi [expr $dy/$i]
    set dzi [expr $dz/$i]
    if {-$s < $dxi && $dxi < $s && -$s < $dyi && $dyi < $s && -$s < $dzi && $dzi < $s} {
      break
    }
  }
  set x2 [expr ($mx+$dxi)*10]
  set y2 [expr ($my+$dyi)*10]
  set z2 [expr ($mz+$dzi)*10]
  set x3 [expr ($mx+$dx/($t*$i))*10]
  set y3 [expr ($my+$dy/($t*$i))*10]
  set z3 [expr ($mz+$dz/($t*$i))*10]
  set mx [expr $mx*10]
  set my [expr $my*10]
  set mz [expr $mz*10]

  set fn [open "vmdDipoles" w+]
  puts $fn [format "偶极分量: %.3f %.3f %.3f" $dx $dy $dz]
  puts $fn [format "蛋白质心坐标(A): %.3f %.3f %.3f" $mx $my $mz]
  puts $fn [format "缩放偶极坐标(A): %.3f %.3f %.3f" $x2 $y2 $z2]
  puts $fn [format "偶极尖尖坐标(A): %.3f %.3f %.3f" $x3 $y3 $z3]
  puts $fn "缩放次数: $i"
  puts $fn "draw delete all\ndraw color purple"
  puts $fn [format "draw cylinder {%.3f %.3f %.3f} {%.3f %.3f %.3f} radius 0.5 filled yes resolution 20" $mx $my $mz $x2 $y2 $z2]
  puts $fn [format "draw cone {%.3f %.3f %.3f} {%.3f %.3f %.3f} radius 1.5 resolution 20" $x2 $y2 $z2 $x3 $y3 $z3]
  close $fn
  # 调用cat命令查看文件，不全部都有用
  exec cat vmdDipoles | iconv -f UTF-8 -t GBK
}

# massCenter过程
proc massCenter {} {
  set mcid [atomselect 0 "protein or resname FAD"]
  measure center $mcid weight mass
}
```