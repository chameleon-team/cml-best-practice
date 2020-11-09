const _ = {}
const ip = require('ip')
const API_HOST_MOCK = 'http://' + ip.address() + ':8088'
const API_HOST_ONLINE = 'https://api.example.com' ;//你们服务器的线上地址
import cml from 'chameleon-api';

_.baseRequest = function(options){
  //这里可以个性化处理你们业务中的需求，比如处理url加公参，梳理header等等
  //CML默认会去mock/api/index.js 中导出的 controller 文件夹中找对应的请求路径，如果配置了则请求本地的数据，以此来建立本地的数据中心，
  return cml.get({
    url:options.url
  });
}

module.exports = _;
