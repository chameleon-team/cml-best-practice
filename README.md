本文档集成了路由动态化构建以及cml中mock的最佳实践

## 0.背景

各种跨端开发框架在开发小程序的时候，随着业务越来越复杂，都会遇到以下同样的痛点问题：
* 【小程序分包优化】小程序包体积的限制：小程序主包体积不能超过2M,超过则无法继续开发
* 【开发体验优化】框架编译构建慢，业务复杂的情况下会编译5分钟甚至更多


另外会提供一些构建时自定义工程化配置

* 构建时自定义循环检测引用,[参考](https://github.com/chameleon-team/cml-circular-dependency)-大家注意自己使用的CLI版本，如果不支持需要在本地配置
* 构建时重复npm包自动检测机制，[参考](https://github.com/chameleon-team/cml-show-warninfo)-大家注意自己使用的CLI版本，如果不支持需要在本地配置
* 自定义分包体积优化方案，[参考](https://github.com/chameleon-team/cml-subpage)
* 支付宝不同分包之间的实例共享，[参考](https://github.com/chameleon-team/cml-store-demo)

对于CML开发来说，只有router.config.json中配置的路由才会参与到构建，所以为了尽可能提高开发效率，可以通过变更router.config.json中的路由形式，只引入要开发的路由进行构建即可
理论上来说，这种形式视项目大小情况而定，项目复杂的情况下，从CML编译构建，再到微信小程序开发者工具编译构建，这个过程基本上可以提速 80%；

不过前提条件是
* 本地mock的数据要齐全，要有齐全的数据才能显示正确的页面
* 单个路由之间的依赖和代码要注意

## 1.小程序包体积最佳实践

### 1.1.目录结构最佳实践

由于小程序要求主包体积不大于 2M ,所以我们根据chameleon现有的能力，为大家提供了最优的目录结构,核心点是 
* 如果是主包和分包都是用的组件或者模块，那么放到 `src/components` 和 `src/common` 目录中
* 如果是仅仅主包使用的组件或者模块，那么放到`src/pages/` 目录下，比如此目录下的 `src/pages/components`
* 如果是仅仅分包使用的组件或者模块，那么放到该分包的目录下，比如`src/subpage-order` 和 `src/subpage-user`

务必理解微信小程序分包体积的计算方式是按照文件夹的形式计算的

```
.
├── app
│   └── app.cml
├── assets
│   └── images
│       └── chameleon.png
├── components   //主包和分包都使用的组件放到这里
│   ├── module
│   │   └── module-a.js
│   └── utils
│       └── utils.js
├── common   //主包和分包都使用的模块放到这里
│   ├── module
│   │   └── module-a.js
│   └── utils
│       └── utils.js
├── pages    //这里放主包相关的页面和组件
│   ├── bank.cml
│   ├── components   //这里放仅仅在主包引用的组件
│   │   └── main-header.cml
│   └── home.cml
├── router.config.json
├── store
│   ├── actions.js
│   ├── getters.js
│   ├── index.js
│   ├── mutations.js
│   └── state.js
├── subpage-order
│   ├── common    //这里放仅仅在 order 分包使用的模块
│   │   └── order-common.js
│   ├── components   //这里放仅仅在 order 分包使用的组件
│   │   └── header.cml
│   └── order.cml
└── subpage-user
    ├── common    //这里放仅仅在 user 分包使用的模块
    │   └── user-common.js
    ├── components //这里放 仅仅在user 分包使用的组件
    │   └── info.cml
    └── user.cml

```

### 1.2.工程化自定义配置最佳实践
由于打包构建后的代码 `dist/wx/static/js/common.js`中存放了所有入口路由模块引用次数大于等于 2 次的模块，

打包后的文件，我们可以发现 dist/static/js/common.js 这个文件是比较大的，这是因为所有公用的模块都会被打包进 common.js 中，所以分包文件夹下模块如果有公用的，也会被打到 common.js 中；

比如 src/utils/utils.js 这个模块，在 src/subpage2/page2/page2.cml 和 src/pages/subpage/page1/page1.cml 中都都有引入这个模块；

那么在 构建之后，在 dist/wx/static/js/common.js中搜索 /utils/utils.js 可以发现这个模块是被打包到这里了，也就是说仅仅分包的资源被打包到主包里了；

那么如何精确的控制模块的是否被打包进 common.js 中呢？

在项目中安装 npm i webpack@3.12.0
更改chameleon中关于小程序端的webpack配置
```javascript
cml.utils.plugin('webpackConfig', function(params) {
  let { type, media, webpackConfig } = params
  if (type === 'wx' || type === 'alipay' || type === 'baidu') {
    let index  = webpackConfig.plugins.findIndex(item => item.constructor.name === 'CommonsChunkPlugin')
    webpackConfig.plugins.splice(index, 1)
    webpackConfig.plugins.push(
      new webpack.optimize.CommonsChunkPlugin({
        name: ['common','manifest'],
        filename: 'static/js/[name].js',
        minChunks: function(module, count){
          //这里写控制 模块的逻辑；根据模块的路径判断这个模块是否要打到 dist/wx/static/js/common.js
          if(module.resource && /subpage2/.test(module.resource)){
            return false;
          }
          return count >=2;
        }
      })
    )
  }
  return { type, media, webpackConfig }
})
```
## 2.开发体验优化

使用跨端框架开发小程序应用，随着业务越来越复杂，代码量越来越大，从源码编译成小程序代码，在到小程序开发者工具编译层，这一系列的编译过程在未来会严重的影响开发效率，严重情况下，光编译耗时就会浪费50%的时间，开发体验让广大开发者难以忍受，此项目重在提供一种方案，可以以单路由构建的方式，尽可能的减少构建的路由，提效增速

### 路由动态化构建

- 首先， 配置需要单独构建的页面  修改 optimize/keepRoute.js
- 执行 npm run optimize
- 执行构建脚本 例如：cml wx dev

以上修改会修改route.config.js   恢复执行 npm run optimize:recover

### mock最佳实践

chameleon 的请求方法默认会去 `mock/api/index.js` 中导出的` controller` 对象中中找对应的请求路径，如果【请求的方法】和【请求的路径】和controller中配置的能匹配上，则会请求本地的数据，以此来建立本地的数据中心

- white-list文件下配置path和mock数据文件的映射，统一管理
- cml的mock功能参考[数据mock](https://cmljs.org/tutorial/build-config.html)

比如 `src/mock/api/home/index.js` 中配置  

```javascript
module.exports = {
  '/api/home/config': './home/config',
  '/api/home/info': './home/info',
}
```

那么当我们请求 `/api/home/config` 这个路径的时候，则会返回 `src/mock/api/home/config.js` 这个路径配置的值；

这样当我们健全了【本地数据中心】和【自动化配置单页面构建】之后，我们就可以进行单页面应用的构建，以此来大幅度提高构建速度，提升开发效率。



