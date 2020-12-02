const apiWhiteList = require('./white-list')
const { sendRequest } = require('./util')
const domain = 'https://www.chameleon.com'
const controllers = [];//所有的请求会先经过这里路径的遍历和检查
//如果请求路径(path) 和 请求方法(method) 能在这里匹配上，则请求这里的数据 
for (const key in apiWhiteList) {
  const element = apiWhiteList[key]
  controllers.push({
    method: ['get', 'post'],
    path: key,
    controller (req, res, next) {
      const data = require(element) //这里是各个mock模块的引用路径
      // 如果有映射 请求本地  没有则请求线上
      if (data && element) {
        res.json(data)
      } else {
        sendRequest(req, res, domain + req.url)
      }
    }
  })
}

module.exports = controllers