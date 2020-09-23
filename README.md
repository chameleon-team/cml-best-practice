本文档集成了路由动态化构建以及cml中mock的最佳实践

### 路由动态化构建

- 首先， 配置需要单独构建的页面  修改 optimize/keepRoute.js
- 执行 npm run optimize
- 执行构建脚本 例如：cml wx dev

以上修改会修改route.config.js   恢复执行 npm run optimize:recover

### mock最佳实践

- white-list文件下配置path和mock数据文件的映射，统一管理
- cml的mock功能参考[数据mock](https://cmljs.org/tutorial/build-config.html)