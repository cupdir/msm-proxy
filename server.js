/**
  +------------------------------------------------------------------------------
 * msm-server 服务端
  +------------------------------------------------------------------------------
 * @author   cupdir <cupdir@gmail.com>
 * @version  $Id$
  +------------------------------------------------------------------------------
 */
var ENV = process.argv[2]; //得到一个启动配置选项
if (ENV != 'development' && ENV != 'production' && ENV != 'staging') {
    console.error("\n./cluster [environment]");
    console.error("environments: [development,production, staging]");
    process.exit(1);
}

var M = require('./core/system.js').system;
M.init({config:ENV,log:true}).start(function(){
    console.log('服务端已经启动');
});
process.on('uncaughtException', function (err) { //捕获进程错误信息         
    //M.logger.error(err);
    if(err.code == 'EADDRINUSE'){}
});