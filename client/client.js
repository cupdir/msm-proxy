/**
  +------------------------------------------------------------------------------
 *  msm-server-client-sdk
  +------------------------------------------------------------------------------
 * @package  client
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
var options = {
    TCP_HOST:(process.argv[2] === undefined)?'127.0.0.1':process.argv[2],
    TCP_PORT:(process.argv[3] === undefined)?'9006':process.argv[3],
    CONFIG:process.argv[4],
    debug:false
    
}
var entity = ['module']; //命令模块目录
if (options.CONFIG != 'development' && options.CONFIG != 'production' && options.CONFIG != 'staging') {
    console.error("\n./cluster [environment]");
    console.error("environments: [development,production, staging]");
    process.exit(1);
}
var msm   = require('./lib/msm.io');
var msmct = msm(entity,options);
msmct.addListener('is_connect',function(){
  msmct.syslog.info('启动成功'); 
}).addListener('buffer',function(buffer){
  msmct.comlog.info('接收数据'+buffer);
  if(buffer.match('^{(.*)}$')){
    var command_exec = JSON.parse(buffer);
    var process_msmct = msmct.getProcess(command_exec.command);
    if (process_msmct && process_msmct.send) process_msmct.send(command_exec);
  }
});

