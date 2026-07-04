---
title: 'XSD 文件坐标与成键信息提取'
date: 2022-10-19 20:55:55
tags: [soft, shell, awk]
---

# XSD 文件坐标与成键信息提取
练习活动

xsd文件粗粒化由Materials Studio软件产生, 提取所需要的信息, 用于galamost的模型建立.
用法:`xsd2bond &lt;filename&gt;`
生成的文件包含坐标和成键信息
```bash
function xsd2bond {
  sed -n 's/.*<Bead ID="\(.*\)" DisplayStyle.*XYZ="\(.*\)" Connections.*/\1  \2/gp;
          s/.*<BeadConnector ID=.*Connects="\(.*\)".*/\1/gp' $1 |
  sed 's/,/ /g' |
  awk 'BEGIN {i = 1}
  {
    if (NF > 2) {
      dict[$1]=i;
      printf("%8d%15.6f%15.6f%15.6f\n",i,$2,$3,$4)
      i++;
    } else {
      printf("%d-%d\n",dict[$1],dict[$2]);
    }
  }' > xsd2bond.dat
}
```
部分xsd文件
```
......
      <LinearChain ID="3" NumChildren="239" Name="Polysingle" Type="Homo Polymer">
        <RepeatUnit ID="4" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="5" DisplayStyle="Ball and Stick" XYZ="-2.35863020903308,0.675381943611484,-0.0318846828407158" Connections="6" BallSize="90" StickRadius="50">
            <BeadType ID="7" Name="single1" Color="191,243,109,255" Radius="1.64818" Mass="64.034"/>
          </Bead>
        </RepeatUnit>
        <RepeatUnit ID="8" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="9" DisplayStyle="Ball and Stick" XYZ="-4.12676396790725,0.832789669512051,-1.81318078989391" Connections="6,10" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="11" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="12" DisplayStyle="Ball and Stick" XYZ="-5.89495245989443,0.990005093584606,-3.59443954978225" Connections="10,13" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="14" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="15" DisplayStyle="Ball and Stick" XYZ="-7.66319568752081,1.14702822166417,-5.37566093625769" Connections="13,16" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="17" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="18" DisplayStyle="Ball and Stick" XYZ="-9.43149365331179,1.30385905959077,-7.15684492307246" Connections="16,19" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="20" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="21" DisplayStyle="Ball and Stick" XYZ="-11.1998463597917,1.46049761320381,-8.93799148397996" Connections="19,22" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="23" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="24" DisplayStyle="Ball and Stick" XYZ="-12.9682538094838,1.61694388835072,-10.7191005927338" Connections="22,25" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="26" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="27" DisplayStyle="Ball and Stick" XYZ="-14.7367160049105,1.77319789088334,-12.5001722230883" Connections="25,28" BallSize="90" StickRadius="50" BeadType="7"/>
        </RepeatUnit>
        <RepeatUnit ID="29" NumChildren="1" FlipProbability="0" ChiralInversionProbability="0">
          <Bead ID="30" DisplayStyle="Ball and Stick" XYZ="-16.5052329485932,1.92925962665385,-14.2812063487986" Connections="28,31" BallSize="90" StickRadius="50" BeadType="7"/>
......
```
生成的dat文件(部分)
```
       1      -2.358630       0.675382      -0.031885
       2      -4.126764       0.832790      -1.813181
       3      -5.894952       0.990005      -3.594440
       4      -7.663196       1.147028      -5.375661
       5      -9.431494       1.303859      -7.156845
       6     -11.199846       1.460498      -8.937991
       7     -12.968254       1.616944     -10.719101
...
2-1
3-2
4-3
5-4
6-5
7-6
8-7
9-8
10-9
11-10
12-11
13-12
...
```
