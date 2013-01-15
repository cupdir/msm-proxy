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
    manager.sys_util  = require(process.binding('natives').util ? 'util' : 'sys'),
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
        var command_module  = command_line.split(' ');
        var argv,command_object_parse;
            this.module = command_module[0];
            command_module.shift();
            command_object_parse = require(module.parent.exports.system.home+'command/'+this.module+'.js');//调用命令模块   
            argv = this.parseArguments(command_module);
            this.command_object = this.util.merge(argv,command_object_parse[this.module]);
            if(!argv.h.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3},?)+$/)){
                        throw new Error('提示:-h参数必须为广播IP，如 192.168.1.1,192.168.1.2或单个IP');
            }
            this.host = argv.h.split(',');
            if('function' === typeof this.command_object['init'] ){
                    this.command_object.init();
            }
            this.command_object['command'] = this.module;
            return JSON.stringify(this.command_object);

    };
    /**
    * @desc 组合一个命令包
    * @return string
    **/    
    manager.package = function(){
        this.command_object['command'] = this.module; //指令包名称
        return JSON.stringify(this.command_object);
    };
    /**
    * @desc 根据- 开头拆分参数
    * @return array
    **/ 
    manager.parseArguments = function(args, cmd){
        var arg,argv = {};
        function requireArg(prefix) {
            if (args.length) {
                return args.shift();
            } else {
                throw new Error(prefix + ' 参数不正确');
            }
        }
        while (args.length) {
            arg = args.shift();
            if(!arg.match(/\-[a-z]+/)){
                throw new Error('参数有误!');
            }
            argv[arg.substr(1)] = requireArg(arg);       
        }
        return argv;
    };
    manager.abort = function(msg, code) {
        this.sys_util.error(this.colorize(msg));
        process.exit(code || 1);
    };
    manager.colorize = function(str) {
        var colors = this.use_colors
            ? { bold: 1 }
            : {};
        return str.replace(/\[(\w+)\]\{([^}]+)\}/g, function(_, color, str){
            return '\x1B[' + colors[color] + 'm' + str +'\x1B[0m';
        });
    };
    manager.destruct = function(){
        manager.command_object = {};
    };
})('object' === typeof module ? module.exports : (this.manager = {}), this);