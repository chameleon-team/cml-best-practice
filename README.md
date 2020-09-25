本文档集成了路由动态化构建以及cml中mock的最佳实践

### 背景

各种跨端开发框架在开发小程序的时候，随着业务越来越复杂，都会遇到一个同样的痛点问题：
* 框架编译构建慢，业务复杂的情况下会编译5分钟甚至更多
* 框架编译完之后，小程序开发者工具还要在编译一遍，又会耗时5~10分钟

对于CML开发来说，只有router.config.json中配置的路由才会参与到构建，所以为了尽可能提高开发效率，可以通过变更router.config.json中的路由形式，只引入要开发的路由进行构建即可
理论上来说，这种形式视项目大小情况而定，项目复杂的情况下，从CML编译构建，再到微信小程序开发者工具编译构建，这个过程基本上可以提速 80%；

不过前提条件是
* 本地mock的数据要齐全，要有齐全的数据才能显示正确的页面
* 单个路由之间的依赖和代码要注意


### 路由动态化构建

- 首先， 配置需要单独构建的页面  修改 optimize/keepRoute.js
- 执行 npm run optimize
- 执行构建脚本 例如：cml wx dev

以上修改会修改route.config.js   恢复执行 npm run optimize:recover

### mock最佳实践

- white-list文件下配置path和mock数据文件的映射，统一管理
- cml的mock功能参考[数据mock](https://cmljs.org/tutorial/build-config.html)
