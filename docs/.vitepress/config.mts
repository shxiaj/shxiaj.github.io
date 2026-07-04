import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vitepress'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  lang: 'zh-CN',
  title: 'ShXiaJ Blog',
  description: 'Java, Gromacs, Shell, Python, 工具软件等技术博客',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Gromacs', link: '/gromacs/' },
      { text: 'Java', link: '/java/' },
      { text: 'Linux', link: '/linux/' },
    ],
    sidebar: {
      '/gromacs/': [
        {
          text: 'Gromacs',
          items: [
            { text: 'Gromacs程序安装&使用', link: '/gromacs/gmx-install' },
            { text: '线性权值递减的粒子群优化算法寻找蛋白质最优吸附取向-java', link: '/gromacs/java-pso' },
            { text: '计算蛋白疏水偶极 java', link: '/gromacs/java-hydropdipole' },
            { text: '二维散点数据线性插值计算对应自变量的值-java', link: '/gromacs/java-dist-top-mf' },
            { text: '按比率随机替换大文件行中指定字符 Java-ReplaceMol', link: '/gromacs/java-replacemol' },
            { text: 'ChOx分析1-Rerun', link: '/gromacs/chox1' },
            { text: 'ChOx分析2-VMD', link: '/gromacs/chox2' },
            { text: 'ChOx分析3-Python', link: '/gromacs/chox3' },
            { text: '氧化石墨烯表面力场构建 opls', link: '/gromacs/gmx-surface-go' },
            { text: '氨基酸粗粒化的Lennard-Jones势函数拟合-shell-python', link: '/gromacs/gmx-lj-potential-function' },
            { text: 'gromacs绘制蛋白质残基接触图', link: '/gromacs/gmx-res-dist' },
            { text: 'PatchDock 使用', link: '/gromacs/gmx-patchdock' },
            { text: 'SAM.sh', link: '/gromacs/gmx-sam' },
            { text: 'gmx do_dssp & xpm2ps 蛋白二级结构图绘制', link: '/gromacs/gmx-do-dssp' },
            { text: '根据距离绘制接触残基梯度-gmx-shell', link: '/gromacs/gmx-betaplot' },
            { text: '自定义非线性函数拟合-python,originpro', link: '/gromacs/python-fitfunction' },
            { text: 'Pymol 计算蛋白质静电势，渲染导出动画', link: '/gromacs/python-pymol-plot' },
            { text: 'ProtPos Learning Process', link: '/gromacs/python-protpos-learn' },
            { text: '综合性学习的粒子群优化算法(CLPSO)文章+源码解析-matlab', link: '/gromacs/matlab-clpso' },
            { text: 'Ps中索引色、RGB色 | Origin中导出RGB256色', link: '/gromacs/origin-ps-256-rgb24' },
            { text: 'Tcl绘制Vmd里面的静电偶级', link: '/gromacs/vmd-tcl-dipoles' },
            { text: 'shell中实现并行控制执行-ptmc的运行', link: '/gromacs/shell-mpirun' },
            { text: '分子动力学模拟 Function', link: '/gromacs/shell-mdfunction' },
          ],
        },
      ],
      '/java/': [
        {
          text: 'Java',
          items: [
            { text: '运行linux, shell命令和脚本-java', link: '/java/java-processbuild' },
          ],
        },
      ],
      '/linux/': [
        {
          text: 'Linux',
          items: [
            { text: 'Awk，Python与各种小工具', link: '/linux/shell-awk-sed' },
            { text: 'xsd文件提取坐标与成键信息,格式化处理', link: '/linux/shell-xsd2bond' },
            { text: 'Windows下的Linux基础环境 & 程序', link: '/linux/soft-win-linux-gmx' },
            { text: 'Clash-paperRule', link: '/linux/soft-clash-paperrule' },
            { text: 'Sublime Text 右键打开当前文件夹', link: '/linux/soft-sublime-text' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { placeholder: '搜索文章...' },
        },
      },
    },
    outline: { level: [2, 3], label: '目录' },
    lastUpdated: true,
    footer: {
      message: 'Copyright © 2021-2025 ShXiaJ',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ShXiaJ' },
    ],
  },
  markdown: {
    lineNumbers: true,
  },
  ignoreDeadLinks: [/dssp\.7z/],
})
