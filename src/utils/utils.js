const _ = {}
const ip = require('ip')
const API_HOST_MOCK = 'http://' + ip.address() + ':8088'
const API_HOST_ONLINE = 'https://api.example.com' ;//你们服务器的线上地址
const cml = require('chameleon-api');

_.baseRequest = function(options){
  //这里可以个性化处理你们业务中的需求，比如处理url加公参，梳理header等等
  return cml.get({
    url:options.url
  });
}

module.exports = _;
