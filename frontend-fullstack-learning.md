# frontend-fullstack-learning

[TOC]

## 如何安装并运行成功？

- 第一步：
  - 安装 Node 版本 16.20.2（或者 nvm 切换到该版本），
    - node-sas 与 node 版本的关系：https://github.com/sass/node-sass/releases/tag/v6.0.1
  - 安装 Python3 并添加到 Path 路径下
    - 比如：C:\Users\limin\AppData\Local\Programs\Python\Python39
- 第二步：

```bash
$ npm i --ignore-scripts --legacy-peer-deps
```

说明：

--ignore-scripts 忽略脚本执行，避免`chromedriver`包中的脚本执行错误，导致安装失败！

--legacy-peer-deps 避免 node-sass 与 sass-loader 版本不匹配，最终引起 npm i 失败！

- 第三步：

```bash
$ npm rebuild node-sass
```

说明：重新编译 node-sass，解决其与 sass-loader 版本不匹配问题！！！

注意：该步骤，需要安装 python 环境

- 第四步

```bash
$ npm run dev
```

## renren-fast-vue

- renren-fast-vue 基于 vue、element-ui 构建开发，实现[renren-fast](https://gitee.com/renrenio/renren-fast)后台管理前端功能，提供一套更优的前端解决方案
- 前后端分离，通过 token 进行数据交互，可独立部署
- 主题定制，通过 scss 变量统一一站式定制
- 动态菜单，通过菜单管理统一管理访问路由
- 数据切换，通过 mock 配置对接口数据／mock 模拟数据进行切换
- 发布时，可动态配置 CDN 静态资源／切换新旧版本
- 演示环境：http://demo.open.renren.io/renren-security

![输入图片说明](https://images.gitee.com/uploads/images/2019/0305/133529_ff15f192_63154.png '01.png')
![输入图片说明](https://images.gitee.com/uploads/images/2019/0305/133537_7a1b2d85_63154.png '02.png')

## 说明文档

项目开发、部署等说明都在[wiki](https://github.com/renrenio/renren-fast-vue/wiki)中。

## 更新日志

每个版本的详细更改都记录在[release notes](https://github.com/renrenio/renren-fast-vue/releases)中。
