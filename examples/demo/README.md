# tiger-ts-demo

tiger-ts 编写的模版项目

## 本地开发

```
npm install
npm run server
```

## 部署正式环境

首先安装全局 pm2 

```
npm i -g pm2
```

构建项目，使用 pm2 启动服务

```
npm run build
pm2 start pm2.json
```
