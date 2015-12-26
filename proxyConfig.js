//proxyConfig.js template
//put this file into the project root directory

'use strict';
module.exports = {

	// 所有POST请求和匹配这个表达式的URL将被转发到远程代理, 否则将使用本地服务器或文件
	rule: /?/,

	// 远程服务器地址
	remote: 'https://www.yiqihao.com/prefix',

	// 以下配置为本地静态文件模式
	// 若配置为静态文件模式, 本地找不到对应文件时仍会将请求转发至远程服务器
	// prefix: root对应的url前缀, 如果请求中不包含此前缀则会被转发至远程服务器(根路径除外)
	//         利用这个配置可以实现将 http://www.yiqihao.com/mweb 映射到 root 中指定的 ./
	local: {
		prefix: '/mweb',
		root: './',
		index: '/index.html'
	},

	// local也可以配置为代理模式, 以便于启用php模版或其他功能
	//local:'http://somelocalhost:8080/prefix',

	// 本地监听端口
	port: 1990
};