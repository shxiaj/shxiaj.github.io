---
title: '分子动力学模拟常用 Shell 函数'
date: 2022-06-08 14:07:53
tags: [Vmd,Tcl,Gromacs,shell]
---

# 分子动力学模拟常用 Shell 函数
## 1.建模部分

```bash
# 获取gro文件Z轴最大值最小值
function g_zev {
  awk 'BEGIN {FIELDWIDTHS="36 8"; min = 100} {if ($2 ~ /[0-9]\.[0-9]{3}$/ && \
       $2 < min) min = $2} END {print min}' $1
  awk 'BEGIN {FIELDWIDTHS="36 8"; max = -50} {if ($2 ~ /[0-9]\.[0-9]{3}$/ && \
       $2 > max) max = $2} END {print max}' $1
}

# 调整蛋白质与表面位置 gro_adjust
function g_adj {
  if [ -z $1 ]; then p1="ptw1.gro"; else p1=$1; fi
  if [ -z $2 ]; then p2="ptw2.gro"; else p2=$2; fi
  dist=$(awk 'BEGIN {FIELDWIDTHS="36 8"; min = 100} {if ($2 ~ /[0-9]\.[0-9]{3}$/ && $2 < min) min=$2} \
       END {dist = min - 0.6; print dist}' $p1 )
  gmx editconf -f $p1 -o $p2 -translate 0 0 -${dist}
}

# 合并盒子 gro_merge
function g_mer {
  if [ -z $1 ]; then echo "No surface's .gro file"; return; else surf=$1; fi
  if [ -z $2 ]; then p4="ptw4.gro"; else p4=$2; fi
  sed '$d' $p4 > box.gro
  sed '1,2d' $surf >> box.gro
  line_number=$((`cat box.gro|wc -l` - 3))
  sed -i -e "2s/.*/${line_number}/1" box.gro
}

# 加个0.25的墙、调整ions.gro的Z值
function g_boxz {
  if [ -z $1 ]; then groFile="ions.gro"; else groFile=$1; fi
  boxz=`awk 'BEGIN {FIELDWIDTHS="36 8"; max = -50} {if ($2 ~ /[0-9]\.[0-9]{3}$/ && \
      $2 > max) max = $2} END {print max+0.25}' $groFile`
  sed -i -e "\$s/[0-9]*.[0-9]*\$/${boxz}/" $groFile
}

function g_free {
  cur=($(sar -P ALL -u 1 1 | awk 'NR==40, NR==71 {print int($3)}'))
  if ((cur[0] < 5)) ;    then  gpu_id=0; pinoffset=0
  elif ((cur[4] < 5)) ;  then  gpu_id=1; pinoffset=8
  elif ((cur[8] < 5)) ;  then  gpu_id=2; pinoffset=16
  elif ((cur[12] < 5)) ; then  gpu_id=3; pinoffset=24
  elif ((cur[16] < 5)) ; then  gpu_id=0; pinoffset=1
  elif ((cur[20] < 5)) ; then  gpu_id=1; pinoffset=9
  elif ((cur[24] < 5)) ; then  gpu_id=2; pinoffset=17
  elif ((cur[28] < 5)) ; then  gpu_id=3; pinoffset=25
  else gpu_id=5; echo -e "$(date)\nThere is no free\n"; fi
  if ((gpu_id != 5)); then
    echo -e "$(date)\nOK\n"
    mdParm="-pin on -ntmpi 1 -ntomp 4 -pinstride 2 -pme auto -nb gpu -gpu_id $gpu_id -pinoffset $pinoffset"
  fi
}

function gmxem {
  gmx grompp -f em.mdp -c ions.gro -p topol.top -o ./em/em.tpr -po ./em/emout.mdp -n
  gmx mdrun -v -deffnm ./em/em $mdParm
}

function gmxnvt {
  gmx grompp -f nvt.mdp -c ./em/em.gro -p topol.top -o ./nvt/nvt.tpr -po ./nvt/nvtout.mdp -n -r ./em/em.gro
  gmx mdrun -v -deffnm ./nvt/nvt $mdParm
}

function gmxmd {
  gmx grompp -f md.mdp -c ./nvt/nvt.gro -p topol.top -o ./md/md.tpr -po ./md/mdout.mdp -n -r ./nvt/nvt.gro
  gmx mdrun -v -deffnm ./md/md $mdParm
}

function gmxrerun {
  gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./ene-ProSurf/ene-ProSurf.tpr -po ./ene-ProSurf/ene-ProSurf.mdp
  gmx mdrun -v -rerun ./md/md.trr -deffnm ./ene-ProSurf/ene-ProSurf
  
  gmx grompp -f energy.mdp -n -c ./nvt/nvt.gro -p topol.top -o ./ene-ResSurf/ene-ResSurf.tpr -po ./ene-ResSurf/ene-ResSurf.mdp
  gmx mdrun -v -rerun ./md/md.trr -deffnm ./ene-ResSurf/ene-ResSurf
}

function gmx_model {
  cd model
  gmx genconf -f sam-cooh-unit.gro -o sam_cooh.gro -nbox 10 10 1

  lines=($(java RandomGet))
  ## 1
  for i in ${lines[@]}; do
    sed -n "/ ${i}SAM/p" sam_cooh.gro
  done > sbm.gro
  sed -i -e "/SAM      H/d; s/SAM/SBM/" sbm.gro
  ## 2
  for i in ${lines[@]}; do
    sed -i -e "/ ${i}SAM/d" sam_cooh.gro
  done
  ## 3 合并sam_cooh，sbm\\\手动
  tail -n 1 sam_cooh.gro >> sbm.gro
  sed -i -e "\$d" sam_cooh.gro
  cat sbm.gro >> sam_cooh.gro
  atomNums=$((`cat sam_cooh.gro | wc -l` - 3))
  sed -i -e "2s/.*/${atomNums}/" sam_cooh.gro

  cp sam_cooh.gro ../
  cd -
}

# SAM表面的解离随机数
function randomGet {
  total=400
  dissociation=84
  array=($(seq $total))
  for (( i = 0; i < $dissociation; i++ )); do
    let last=total-i-1
    let index=RANDOM%last
    let ret[i]=array[index]
    let array[index]=array[last]
  done
  echo ${ret[@]} | tr ' ' '\n' | sort -n | tr '\n' ' '| fold -sw 30; echo
}

# Check当前体系模拟状态
function check {
  runTime=$(tail -15 md.log | awk '{if($2=="Time") flag=NR+1; if(NR==flag) printf("%d",$2)}')
  if [ ! -z $runTime ]; then 
    echo 0 | gmx trjconv -f md.trr -s md.tpr -dump $runTime -o md_$runTime.gro
  fi
}
```




## 2.Tcl Vmd部分
```tcl
display projection orthographic

rotate x by -90
rotate y by -90

proc bw {} {
  color Display Background white
  axes location Off
  display depthcue off
  light 2 on
}

proc bb {} {
  color Display Background black
}

proc bx {} {
  pbc box
}

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
    mol modcolor 2 0 Name
    mol color Name
    mol representation VDW 1.000000 12.000000
    mol selection resname FAD
    mol material Glossy
    mol addrep 0

}

proc pc {} {
  pbc wrap -center com -centersel "protein" -compound residue -all
}

# render picture
proc renderPic {} {
  render Tachyon vmdscene.dat
  set fileName [clock seconds]
  exec tachyon_WIN32.exe vmdscene.dat -aasamples 24 -format BMP -mediumshade -trans_vmd -res 1200 1200 -o $fileName.bmp | echo $fileName.bmp
}

proc massCenter {} {
  set mcid [atomselect 0 "protein or resname FAD"]
  measure center $mcid weight mass
}

proc resContact {} {
  # 选择接触残基的原子
  set aid [atomselect 0 {protein within 3.5 of {resname SDM SEM SAM SBM}}]

  # 保存原子所在的id和name,具有重复值
  set resids [$aid get resid]
  set resnames [$aid get resname]

  # 对resids去重为resid
  foreach i $resids {dict set resid $i 0}

  # for循环小写残基名，拼接上id，去重输出;
  for {set i 0} {$i < [llength $resids]} {incr i} {
    dict set idname "[string tolower [lindex $resnames $i] 1 end][lindex $resids $i]" 0
  }
  # 将变量值保存成文件,cat 获取
  set fn [open "resContact" w+]
  puts $fn "Build index:"
  foreach i [dict keys $resid] {puts $fn "r $i"}
  puts $fn "Build mdp:"
  foreach i [dict keys $resid] {puts $fn "r_$i"}
  puts $fn "Origin:"
  foreach i [dict keys $idname] {puts $fn $i}
  close $fn
  exec cat resContact
}

proc dipoles {dx dy dz} {
  set s 3
  set t 0.9
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
  exec cat vmdDipoles | iconv -f UTF-8 -t GBK
}


# Jmol Style Color
proc jmolColor {} {
  color change rgb 101 1.00 1.00 1.00
  color change rgb 102 0.85 1.00 1.00
  color change rgb 103 0.80 0.50 1.00
  color change rgb 104 0.76 1.00 0.00
  color change rgb 105 1.00 0.71 0.71
  color change rgb 106 0.56 0.56 0.56
  color change rgb 107 0.19 0.31 0.97
  color change rgb 108 1.00 0.05 0.05
  color change rgb 109 0.56 0.88 0.31
  color change rgb 110 0.70 0.89 0.96
  color change rgb 111 0.67 0.36 0.95
  color change rgb 112 0.54 1.00 0.00
  color change rgb 113 0.75 0.65 0.65
  color change rgb 114 0.94 0.78 0.63
  color change rgb 115 1.00 0.50 0.00
  color change rgb 116 1.00 1.00 0.19
  color change rgb 117 0.12 0.94 0.12
  color change rgb 118 0.50 0.82 0.89
  color change rgb 119 0.56 0.25 0.83
  color change rgb 120 0.24 1.00 0.00
  color change rgb 121 0.90 0.90 0.90
  color change rgb 122 0.75 0.76 0.78
  color change rgb 123 0.65 0.65 0.67
  color change rgb 124 0.54 0.60 0.78
  color change rgb 125 0.61 0.48 0.78
  color change rgb 126 0.88 0.40 0.20
  color change rgb 127 0.94 0.56 0.63
  color change rgb 128 0.31 0.82 0.31
  color change rgb 129 0.78 0.50 0.20
  color change rgb 130 0.49 0.50 0.69
  color change rgb 131 0.76 0.56 0.56
  color change rgb 132 0.40 0.56 0.56
  color change rgb 133 0.74 0.50 0.89
  color change rgb 134 1.00 0.63 0.00
  color change rgb 135 0.65 0.16 0.16
  color change rgb 136 0.36 0.72 0.82
  color change rgb 137 0.44 0.18 0.69
  color change rgb 138 0.00 1.00 0.00
  color change rgb 139 0.58 1.00 1.00
  color change rgb 140 0.58 0.88 0.88
  color change rgb 141 0.45 0.76 0.79
  color change rgb 142 0.33 0.71 0.71
  color change rgb 143 0.23 0.62 0.62
  color change rgb 144 0.14 0.56 0.56
  color change rgb 145 0.04 0.49 0.55
  color change rgb 146 0.00 0.41 0.52
  color change rgb 147 0.75 0.75 0.75
  color change rgb 148 1.00 0.85 0.56
  color change rgb 149 0.65 0.46 0.45
  color change rgb 150 0.40 0.50 0.50
  color change rgb 151 0.62 0.39 0.71
  color change rgb 152 0.83 0.48 0.00
  color change rgb 153 0.58 0.00 0.58
  color change rgb 154 0.26 0.62 0.69
  color change rgb 155 0.34 0.09 0.56
  color change rgb 156 0.00 0.79 0.00
  color change rgb 157 0.44 0.83 1.00
  color change rgb 158 1.00 1.00 0.78
  color change rgb 159 0.85 1.00 0.78
  color change rgb 160 0.78 1.00 0.78
  color change rgb 161 0.64 1.00 0.78
  color change rgb 162 0.56 1.00 0.78
  color change rgb 163 0.38 1.00 0.78
  color change rgb 164 0.27 1.00 0.78
  color change rgb 165 0.19 1.00 0.78
  color change rgb 166 0.12 1.00 0.78
  color change rgb 167 0.00 1.00 0.61
  color change rgb 168 0.00 0.90 0.46
  color change rgb 169 0.00 0.83 0.32
  color change rgb 170 0.00 0.75 0.22
  color change rgb 171 0.00 0.67 0.14
  color change rgb 172 0.30 0.76 1.00
  color change rgb 173 0.30 0.65 1.00
  color change rgb 174 0.13 0.58 0.84
  color change rgb 175 0.15 0.49 0.67
  color change rgb 176 0.15 0.40 0.59
  color change rgb 177 0.09 0.33 0.53
  color change rgb 178 0.82 0.82 0.88
  color change rgb 179 1.00 0.82 0.14
  color change rgb 180 0.72 0.72 0.82
  color change rgb 181 0.65 0.33 0.30
  color change rgb 182 0.34 0.35 0.38
  color change rgb 183 0.62 0.31 0.71
  color change rgb 184 0.67 0.36 0.00
  color change rgb 185 0.46 0.31 0.27
  color change rgb 186 0.26 0.51 0.59
  color change rgb 187 0.26 0.00 0.40
  color change rgb 188 0.00 0.49 0.00
  color change rgb 189 0.44 0.67 0.98
  color change rgb 190 0.00 0.73 1.00
  color change rgb 191 0.00 0.63 1.00
  color change rgb 192 0.00 0.56 1.00
  color change rgb 193 0.00 0.50 1.00
  color change rgb 194 0.00 0.42 1.00
  color change rgb 195 0.33 0.36 0.95

  #Element
  color Element H  101
  color Element He 102
  color Element Li 103
  color Element Be 104
  color Element B  105
  color Element C  106
  color Element N  107
  color Element O  108
  color Element F  109
  color Element Ne 110
  color Element Na 111
  color Element Mg 112
  color Element Al 113
  color Element Si 114
  color Element P  115
  color Element S  116
  color Element Cl 117
  color Element Ar 118
  color Element K  119
  color Element Ca 120
  color Element Sc 121
  color Element Ti 122
  color Element V  123
  color Element Cr 124
  color Element Mn 125
  color Element Fe 126
  color Element Co 127
  color Element Ni 128
  color Element Cu 129
  color Element Zn 130
  color Element Ga 131
  color Element Ge 132
  color Element As 133
  color Element Se 134
  color Element Br 135
  color Element Kr 136
  color Element Rb 137
  color Element Sr 138
  color Element Y  139
  color Element Zr 140
  color Element Nb 141
  color Element Mo 142
  color Element Tc 143
  color Element Ru 144
  color Element Rh 145
  color Element Pd 146
  color Element Ag 147
  color Element Cd 148
  color Element In 149
  color Element Sn 150
  color Element Sb 151
  color Element Te 152
  color Element I  153
  color Element Xe 154
  color Element Cs 155
  color Element Ba 156
  color Element La 157
  color Element Ce 158
  color Element Pr 159
  color Element Nd 160
  color Element Pm 161
  color Element Sm 162
  color Element Eu 163
  color Element Gd 164
  color Element Tb 165
  color Element Dy 166
  color Element Ho 167
  color Element Er 168
  color Element Tm 169
  color Element Yb 170
  color Element Lu 171
  color Element Hf 172
  color Element Ta 173
  color Element W  174
  color Element Re 175
  color Element Os 176
  color Element Ir 177
  color Element Pt 178
  color Element Au 179
  color Element Hg 180
  color Element Tl 181
  color Element Pb 182
  color Element Bi 183
  color Element Po 184
  color Element At 185
  color Element Rn 186
  color Element Fr 187
  color Element Ra 188
  color Element Ac 189
  color Element Th 190
  color Element Pa 191
  color Element U  192
  color Element Np 193
  color Element Pu 194
  color Element Am 195

  #Name
  color Name H  101
  color Name O  108
  color Name N  107
  color Name C  106
  color Name S  116
  color Name P  115
  # color Name L  103
  # color Name F  109

  #Type
  color Type H  101
  color Type O  108
  color Type N  107
  color Type C  106
  color Type S  116
  color Type P  115
  # color Type L  103
  # color Type F  109

  color change rgb 201 0.78 0.78 0.78
  color change rgb 202 0.08 0.35 1.00
  color change rgb 203 0.00 0.86 0.86
  color change rgb 204 0.90 0.04 0.04
  color change rgb 205 0.90 0.90 0.00
  color change rgb 206 0.00 0.86 0.86
  color change rgb 207 0.90 0.04 0.04
  color change rgb 208 0.92 0.92 0.92
  color change rgb 209 0.51 0.51 0.82
  color change rgb 210 0.06 0.51 0.06
  color change rgb 211 0.06 0.51 0.06
  color change rgb 212 0.08 0.35 1.00
  color change rgb 213 0.90 0.90 0.00
  color change rgb 214 0.20 0.20 0.67
  color change rgb 215 0.86 0.59 0.51
  color change rgb 216 0.98 0.59 0.00
  color change rgb 217 0.98 0.59 0.00
  color change rgb 218 0.71 0.35 0.71
  color change rgb 219 0.20 0.20 0.67
  color change rgb 220 0.06 0.51 0.06
  color change rgb 221 1.00 0.41 0.71
  color change rgb 222 1.00 0.41 0.71

  #Resname
  color Resname ALA 201
  color Resname ARG 202
  color Resname ASN 203
  color Resname ASP 204
  color Resname CYS 205
  color Resname GLN 206
  color Resname GLU 207
  color Resname GLY 208
  color Resname HIS 209
  color Resname ILE 210
  color Resname LEU 211
  color Resname LYS 212
  color Resname MET 213
  color Resname PHE 214
  color Resname PRO 215
  color Resname SER 216
  color Resname THR 217
  color Resname TRP 218
  color Resname TYR 219
  color Resname VAL 220

  # structure
  color change rgb 301  1.000 0.000 0.502
  color change rgb 302  0.627 0.000 0.502
  color change rgb 303  0.376 0.000 0.502
  color change rgb 304  1.000 0.784 0.000
  color change rgb 305  0.376 0.502 1.000
  color change rgb 306  1.000 1.000 1.000

  color Structure {Alpha Helix} 301
  color Structure {3_10_Helix}  302
  color Structure {Pi_Helix}    303
  color Structure {Extended_Beta} 304
  color Structure {Bridge_Beta} 306
  color Structure {Turn} 305
  color Structure {Coil} 306
}
```


## 3.其他
```bash
# 大写文件名
for fileName in `ls | grep mp4`; do
temp=${fileName%%.*}
newName=${temp^^}-.${fileName##*.}
mv ${fileName} ${newName}
done
```

