module.exports.send  =  new Object(); //外部定义模块
(function(exports, global){
	global.send.init = function(){};
	global.send.max = 10000;

})('object' === typeof module ? module.exports : (this.send = {}), this) //是否存在自定义模块 module