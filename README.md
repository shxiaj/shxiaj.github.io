# ShXiaJ Blog

技术博客，记录所学所思。

内容涉及 Java、Gromacs、Shell、Python 及工具软件。

## 技术栈

- [VitePress v2](https://vitepress.dev) — 静态站点生成器
- GitHub Actions — 自动构建部署到 GitHub Pages
- Giscus — 基于 GitHub Discussions 的评论系统
- MathJax — 数学公式渲染

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

构建产物输出到 `docs/.vitepress/dist`。

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.mts        # VitePress 配置
│   ├── sidebar.ts        # 自动侧边栏生成
│   └── theme/            # 自定义主题
├── gromacs/              # Gromacs 笔记
├── java/                 # Java 笔记
├── linux/                # Linux / Shell 笔记
└── index.md              # 首页
```

## 新增文章

1. 在对应分类目录创建 `.md` 文件
2. 写入 frontmatter（`title`、`date`、`tags`）
3. 编写 Markdown 内容
4. `git push` 到 `main`，GitHub Actions 自动部署

侧边栏由 `sidebar.ts` 自动扫描生成，无需手动维护。

## 部署

- 仓库：[shxiaj/shxiaj.github.io](https://github.com/shxiaj/shxiaj.github.io)
- 站点：[https://shxiaj.github.io](https://shxiaj.github.io)
- 触发：推送 `main` 分支自动构建部署

## 许可

Copyright © 2021-2025 ShXiaJ
