const b = require('./b.js');



//循环依赖的核心，以下代码还没有执行,就跳到 B 模块了，
module.exports = {
  methoda:function(){
    console.log('methoda');
    b.methodb();
  }
}