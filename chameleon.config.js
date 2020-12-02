
// 设置静态资源的线上路径
const publicPath = '//www.static.chameleon.com/cml';
// 设置api请求前缀
const apiPrefix = 'https://api.chameleon.com';

cml.config.merge({
  templateLang: "cml",
  templateType: "html",
  platforms: ["wx"],
  buildInfo: {
    wxAppId: '123456'
  },
  wx: {
    dev: {
    },
    build: {
      apiPrefix
    }
  },
  web: {
    dev: {
      analysis: false,
      console: false
    },
    build: {
      analysis: false,
      publicPath: `${publicPath}/web/`,
      apiPrefix
    }
  },
  weex: {
    dev: {
    },
    build: {
      publicPath: `${publicPath}/weex/`,
      apiPrefix
    },
    custom: {
      publicPath: `${publicPath}/wx/`,
      apiPrefix
    }
  },
  optimize: {
    showWarning: true,// 设置为true可以在构建过程中看到警告信息，比如编译过程中引入了同一个npm包的不同版本会在终端输出信息
    circularDependency:true,//
  }
})
cml.utils.plugin('webpackConfig', function({ type, media, webpackConfig }, cb) {
  // cb函数用于设置修改后的配置
  debugger;
  //1.0.6 之前的版本可以在这里通过回调删除调试信息
  //http://cml.didi.cn/faq/#%E5%8D%87%E7%BA%A7chameleon-tool-1-0-6%EF%BC%8C%E9%BB%98%E8%AE%A4%E5%88%A0%E9%99%A4%E4%BA%86%E8%B0%83%E8%AF%95%E4%BF%A1%E6%81%AF
  if(media === 'build'){
    webpackConfig.plugins.forEach((plugin) => {
      if(plugin.constructor.name === 'UglifyJsPlugin'){
        plugin.options =  {
          compress: {
            drop_console: true
          }
        }
      }
    })
  }
  cb({
    type,
    media,
    webpackConfig
  });
});

