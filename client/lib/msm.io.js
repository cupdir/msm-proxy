/**
  +------------------------------------------------------------------------------
 *  msm-server-client-sdk
  +------------------------------------------------------------------------------
 * @package  lib.sdk
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
var util    = require('./util').util;
var net     = require('net'),
    path    = require('path'),
    fs      = require('fs'),
    express    = require('express'),
    events  = require('events'),
    cp      = require('child_process'),
    syslog  = require('log4js');
exports.debug_mode = true;
exports.name = "msm";
function msm(entity, options){
  var options = options || {};
  this.options = options;
  this.location = entity;
  this.scripts = [];
  this.home = __dirname.substr(0,__dirname.length-4);
  this.config = require(this.home+'/config/'+process.argv[4]);
  this.logger();
  this.version = 'MSM build 1.0';
  this.child = [];
  this.process().start();
  this.connect();
  events.EventEmitter.call(this);
  this.send = function(){

  }
}
util.inherit(msm, events.EventEmitter); //继承EventEmitter
//创建tcp连接
msm.prototype.connect = function(){
    var self = this;
    var client = net.createConnection({port:'9006',host:'10.237.39.154'});
    client.setEncoding('utf8');
    client.setMaxListeners(1000);
    client.on('connect',function(){self.emit('is_connect');});
    client.on('close',function(){client=null;self.connect();self.emit('disconnection');});
    client.on('error',function(e){console.log('timeout retrying');self.emit('error_connect',e);});
    client.on('data',function(buffer){self.emit('buffer',buffer.trim(),client);}).resume();
}
msm.prototype.process = function(){
  var process = new Array(),pid_tmp;
  var entity = this.__getEntity(this.home+'/module');
  if(entity){
    if(fs.statSync(entity).isDirectory()){
      var dir = fs.readdirSync(entity);
      for (var file in dir) {
        script = path.join(entity, dir[file]);
        if (dir[file].charAt(0) === '.') {
          this.syslog.warn('忽略隐藏文件: ' + dir[file]);
        }
        var location = path.dirname(this.location),name = getName(script);
        this.scripts.push({
          fullpath: script,
          location: location + path.sep + name,
          name: name
        });
      }
    }
  }
  return this;
}
//启动模块进程 
msm.prototype.start = function(){ 
  var child_object;
  for (var file in this.scripts) {
      child_object = cp.fork(this.scripts[file].fullpath);
      child_object.domain = this.scripts[file].name;
      child_object.setMaxListeners(1000); 
      this.child.push(child_object); 
  }
    this.createWebUI();
}
msm.prototype.createWebUI = function(){
  var web = express(),monitor = {},self =this;
  web.get('/status',function(req,res){
    res.writeHead(200,{
      'Content-Type': 'text/html;charset=utf-8',
      'Server':'MSMWEBOS',
      'X-Powered-By':'xiaomi'
    });
    monitor.pid = process.pid;
    monitor.memoryUsage = process.memoryUsage().rss;
    res.end(JSON.stringify(monitor));
  })
  web.listen(9008, '127.0.0.1', function() {

  })
}
msm.prototype.getProcess = function(child_hash){
  for(var child_item in this.child){
    if(this.child[child_item].domain.indexOf(child_hash) != -1){
      return this.child[child_item]; 
    }
  } 
}

msm.prototype.__getEntity = function(location) {
  if (typeof location !== 'string') {
    this.logger.error('文件或目录不是一个字符串类型: ' + location);
    return false;
  }
  var entity = path.resolve(
    path.normalize(location)
  );
  if (!fs.existsSync(entity)) {
    this.logger.error('目录或者文件不存在: ' + entity);
    return false;
  }
  return entity;  
}
msm.prototype.reset = function(){}
//日志配置
msm.prototype.logger = function(){
  this.syslog  = syslog.getLogger('system');
  this.comlog = syslog.getLogger('command');
  syslog.configure({
        appenders: [
            {
                type: 'console'
            },
            {   
                type: 'dateFile', 
                absolute:true,
                "maxLogSize": 20480,
                "backups": 10,
                "pattern": "-from-MM-dd", 
                filename: this.home+'/logs/system.log', 
                category: 'system'
            },
             {   
                type: 'dateFile', 
                absolute:true,
                "maxLogSize": 20480,
                "backups": 10,
                "pattern": "-from-MM-dd", 
                filename: this.home+'/logs/command.log', 
                category: 'command'
            } 
        ]
    });
}
function createNamespace(parent, parts) {
  var part = getName(parts.shift());
  if (!parent[part]) {
    parent[part] = {};
  }
  if (parts.length) {
    parent = createNamespace(parent[part], parts);
  }
  return parent;
}
function getName(script) {
  var script = path.basename(script, path.extname(script)).replace(/[^a-zA-Z0-9]/g, '.')
    , parts = script.split('.')
    , name = parts.shift();

  if (parts.length) {
    for (var p in parts) {
      name += parts[p].charAt(0).toUpperCase() + parts[p].substr(1, parts[p].length);
    }
  }

  return name;
}
module.exports = function(entity, options) {
  return new msm(entity, options);
};