module.exports.order  =  new Object(); //定义模块名称
/**
  +------------------------------------------------------------------------------
 *  msm-client-mosule-order 
 * @description 订单生成模块，得到最大订单数，得到分配的平均数。 
 * 算法：[本机数量]  - （最大数量/机器台数= 当前机器数量） = 应该分配的数量
 * 订单生成算法: ymd + host_id + batch_index + 00000（顺序增长）
 * 批次*最大数 = 总数  
  +------------------------------------------------------------------------------
 * @package  client.module
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
var util 	= 	require('../lib/util').util,
	events	=	require('events'),
	redis 	= 	require('redis');

function order(config){
	this.order_hash_table 	= 	'order_hash_table'; //存放订单
	this.batch_hash_table 	= 	'batch_hash_table'; //存放批次计数
	this.batch_max_median 	= 	1;
	this.config 			= 	config;
	this.redis = this.createRedis();
	events.EventEmitter.call(this);
};
util.inherit(order, events.EventEmitter); //继承EventEmitter
//得到进程发送的消息
process.on('message',function(json_command){
	console.log(json_command); //
});
/**
 * 创建一个REDIS连接
 * @return Redis object
 */

order.prototype.createRedis = function(){
	var redis_instance = false;
	if(redis_instance == false){
		redis_instance = redis.createClient(this.config.redis.port,this.config.redis.host);
	}
	redis_instance.on('disconnected',function(){})
	redis_instance.on('error',function(){
			//发送一个错误
			process.exit(1);
	});
	return redis_instance;
}
exports.order  =  function(config) {
  return new order(config);
};