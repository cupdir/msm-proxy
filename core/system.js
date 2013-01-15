/**
  +------------------------------------------------------------------------------
 * msm-server 系统依赖包
  +------------------------------------------------------------------------------
 * @package  core.system
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
var net = require('net'),
    util=require('util'),
    crypto = require('crypto'),
    readline = require('readline'),
    command_line = readline.createInterface({input: process.stdin,output: process.stdout});
    manager = require('./manager.js'),
    events = require("events");
function System(){
    this.version = '0.1.0';
    this.home = __dirname.substr(0,__dirname.length-4);
    this.client=new Array();
    this.server=new Array();
    this.factory ={};
    events.EventEmitter.call(this);
    this.setSession = function(type,socket){
        socket.setMaxListeners(1000);
        var session_tmp = new Object();
        if( typeof this.getSession(type,this.hash(socket.remoteAddress)) =='undefined'){
            session_tmp[this.hash(socket.remoteAddress)] = socket;
            this[type].push(session_tmp);
        }        
    };
    this.getSession = function(type,session_id){
        for(var i=0;i<this[type].length;i++){
            if(typeof this[type][i][session_id] == 'object'){
                return this[type][i][session_id];
                break;
            }
        }
    };
    this.load = function(command){
        return manager.load(command);
    };
    this.hash = function(ip){
        return crypto.createHash('md5').update(ip,'utf8').digest("hex"); //创建会话
    };
    this.flush = function(type){
        var self = this;
        this[type].forEach(function(session){
            for(key in session){
                if(session[key].destroyed ==true){
                    self.logger.info(session[key]._peername.address+'失去连接');
                    self.destroySession(type,key);
                }
            }
        })
    };
    this.destroySession = function(type,session_id){
        var self = this;
         for(var i=0;i<self[type].length;i++){
            if(typeof self[type][i][session_id] == 'object'){
                self[type][i][session_id].destroy();
                self[type].splice(i);
                return true;
                break;
            }
        }       
    }
}
System.prototype.init = function(options){
    this.config = require('../config/'+options.config+'.js'); 
    logger = require('log4js'),this.logger = logger.getLogger('system');
    logger.configure({
        appenders: [
            {
                type: 'console'
            },
            {   
                type: 'file', 
                absolute:true,
                "maxLogSize": 20480,
                "backups": 10,
                filename: this.home+'/logs/system.log', 
                category: 'system'
            }
  
        ]
    });     
    this.factory['server'] = net.createServer();
    this.factory['client'] = net.createServer();
    return this;
}
System.prototype.timeout = function(){
    var self = this;
    setInterval(function(){
        self.flush('client');
        self.flush('server');
    },5000);
}
System.prototype.start = function(callback){
    var self = this,manager = module.children[0].exports;
    this.factory.server.listen(this.config.tcp.SERVER_LISTEN_PORT);
    this.factory.server.setMaxListeners(this.config.setMaxListeners);//设置服务端最大连接数
    this.factory.server.on('connection',function(socket){
        socket.setEncoding('utf8');//发送字节编码
        self.flush('server');
        self.setSession('server',socket);      
        socket.write(new Buffer('欢迎登陆msm系统\r\n'));
        socket.write(new Buffer('>'));
        self.logger.info('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
        self.logger.info(socket.server._connections+'个server端已经连接。');
        socket.on('data',function(buffer){
            var command_line = buffer.trim();
            try{
                var command = self.load(command_line);
                if(manager.host.length){
                    for(var i=0;i<manager.host.length;i++){
                        var session = self.getSession('client',self.hash(manager.host[i]));
                        if(typeof session == 'undefined'){
                            throw new Error(manager.host[i]+'不存在的客户端');
                            break;                            
                        }
                        if(session.writable == false){
                            self.destroySession(self.hash('client',manager.host[i])); //注销一个关闭客户端                
                            throw new Error(session._peername.address+'客户端已经关闭');
                            break;                           
                        }
                        session.write(command);
                        if(typeof manager.command_object.callback == 'function'){
                            session.on('data',function(buffer_call){
                                manager.command_object.callback(buffer_call);
                                socket.write(new Buffer(buffer_call));
                                socket.write(new Buffer('>'));
                                session.removeAllListeners();
                            });                                
                        }
                    }
                }
            }catch(e){
                if(e.code == 'MODULE_NOT_FOUND'){
                    self.logger.info('MODULE_NOT_FOUND');
                    socket.write(new Buffer(e.code+'\r\n'));
                }else{
                    socket.write(new Buffer(e+'\r\n')); 
                }   
            }
            if(command_line == 'exit')socket.destroy();
            if(command_line == 'help')socket.write(new Buffer('帮助系统\r\n'));
            if(socket.destroyed == false){
                self.logger.info(socket.remoteAddress +':'+ socket.remotePort+'发送了一条关于`'+command_line+'的命令请求`');
                socket.write(new Buffer('>'));
            };
        });
        socket.on('close',function(){
            self.logger.info('CLOSE: ' + socket._peername.address +':'+ socket._peername.port);
        });
        socket.on('error',function(e){
            self.logger.error(e)
        });
    });
    this.factory.client.on('connection',function(socket){
        socket.setEncoding('utf8');//发送字节编码
        self.flush('client');
        self.setSession('client',socket);
        socket.write(new Buffer('hello,xiaomi\r\n'));
        self.logger.info('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
        self.logger.info(socket.server._connections+'个client端已经连接。'); 
        socket.on('data',function(buffer){});//做触发器使用

    });
    this.factory.client.listen(this.config.tcp.WORKER_LISTEN_PORT);
    callback();
}
system = module.exports.system = new System();
system.timeout();