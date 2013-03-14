/**
  +------------------------------------------------------------------------------
 * msm-server 订单指令模块 
 * 主要任务： 向指定部分服务器发送订单生成指令。
  +------------------------------------------------------------------------------
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
module.exports.order  =  new Object(); //定义模块名称
(function(exports, global){ //模块定义开始

	
	/*
	*@param function init 模块初始化，发送命令的时候会执行这个
	*/
	global.order.init = function(){}; 
	
	/*
	*@param int ttl
	*/
	global.order.ttl = 36; //指令超时时间
	/*
	*@param array host 
	*/
	global.order.hash = '%Y-%d-%m'
	/**
	*@param int max  生成订单个数
	*/
	global.order.max = 10000; //定义固定参数
	/**
	*@param string md5  算法方式
	*/	
	global.order.sign = 'md5';
	/**
	*@param int setTimeout  超时阀值
	*/		
	global.order.auto = 1000;
	/**
	*@param function callback 客户端回调信息
	*/
	//客户端反馈信息回到这里
	global.order.callback = function(socket){

	};

})('object' === typeof module ? module.exports : (this.order = {}), this) //模块定义结束