const order = require('./order/index')
const home = require('./home/index')
module.exports = {
  ...order,
  ...home
}