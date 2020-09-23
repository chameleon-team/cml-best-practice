const apiWhiteList = require('./white-list/index')
const { sendRequest } = require('./util')
const domain = 'https://www.chameleon.com'
const controllers = []
for (const key in apiWhiteList) {
  const element = apiWhiteList[key]
  controllers.push({
    method: ['get', 'post'],
    path: key,
    controller (req, res, next) {
      const data = require(element)
      // 如果有映射 请求本地  没用则请求线上
      if (data && element) {
        res.json(data)
      } else {
        sendRequest(req, res, domain + req.url)
      }
    }
  })
}

module.exports = controllers