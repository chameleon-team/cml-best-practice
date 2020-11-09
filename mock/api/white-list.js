const order = require('./order/index')
const home = require('./home/index')
const bank = require('./bank/index')
const user = require('./user/index')
module.exports = {
  ...order,
  ...home,
  ...bank,
  ...user
}