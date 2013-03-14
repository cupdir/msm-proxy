var     manager = require('../core/manager.js');

describe('order', function(){
	it('测试命令行模式解析器',function(done){
		var json = manager.load('order --host 192.168.1.1'.replace(/(\s\s*)/g,' '));
		console.log(json)
		done();
	});
})