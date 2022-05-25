# font_compressed

#### 介绍
根据全量字体包，提取出常见字，从而达到压缩字体包的效果

#### 软件架构
软件架构说明
1. 使用fontmin提取字体资源
2. 服务由express搭建
3. 使用ttf2woff2把字体ttf格式转换为woff2格式

#### 安装教程

1.  下载依赖包 命令：`yarn`,使用npm下载会报错
2.  `nodemon app.js`,启动项目
3.  控制台输入地址，进入首页，`http://localhost:3000/`

#### 使用说明

1.  动态加载页面字体，可下载当前页面上所有字的ttf字体包（未实现）
2.  上传ttf字体包
3.  下载woff2字体包（体积是ttf字体包的一半）

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request

