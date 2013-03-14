/**
  +------------------------------------------------------------------------------
 * msm-server 命令管理
  +------------------------------------------------------------------------------
 * @package  core.manager
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
(function(exports, global){
   /**
    * manager  namespace.
    *
    * @namespace
   */    
    var manager = exports;

    manager.util = require('./util').util;
    manager.sys_util  = require(process.binding('natives').util ? 'util' : 'sys');
    manager.commander = require('commander');
    /**
    * @desc 要广播的客户端
    * @param array host 指令模块
    * @api public
    **/  
    manager.host=[];
    /**
    * @desc 命令模块
    * @param string module 指令模块
    * @api public
    **/  
    manager.module=null;
    manager.use_colors = true;
    manager.command_object = {};
    /**
    * @desc 加载命令模块
    * @param $command 指令模块
    * @return object
    **/
    manager.load = function(command_line){
        if(!command_line.match(/^[a-z]/))throw new Error('提示:命令行错误');
        var command_argvs  = command_line.split(' ');
        this.module = command_argvs[0];
        this.commander
          .version('0.0.1')
          .option('-h, --host', '发送客户端IP，多个用,分隔')
          .parse(command_argvs);
        var command_object_parse = require('../command/'+this.module+'.js');//调用命令模块 
        if(!this.commander.host || !this.commander.args[1] || !this.commander.args[1].match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3},?)+$/)){
            throw new Error('提示:-host or --host 参数必须为广播IP，如 192.168.1.1,192.168.1.2或单个IP');
        }
        this.host = this.commander.args[1].split(',');
        var command_object_parse_send = {
                'args':this.commander.args
        };
        command_object_parse_send.args.shift();
        command_object_parse_send.args.shift();
        var command_object = this.util.merge(command_object_parse_send,command_object_parse[this.module]);

        if('function' === typeof command_object['init'] ){
                    command_object.init();
        }
        command_object['command'] = this.module;
        return JSON.stringify(command_object);
    };
    /**
    * @desc 组合一个命令包
    * @return string
    **/    
    manager.package = function(){
        this.command_object['command'] = this.module; //指令包名称
        return JSON.stringify(this.command_object);
    };
    manager.destruct = function(){
        manager.command_object = {};
    };
})('object' === typeof module ? module.exports : (this.manager = {}), this);