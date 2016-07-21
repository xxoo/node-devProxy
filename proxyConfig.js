// proxyConfig.js template
// put this file into the project root directory
// requires devProxy 0.2 or higher which can be installed via npm
// npm -g install devProxy

'use strict';
module.exports = {

	// 所有POST请求和匹配这个表达式的URL将被转发到远程服务器, 否则将使用本地服务器或文件系统

	// all POST requests and any URL that matches this expression will be forward to remote server, other requests will be responded by local serve or filesystem.

	//rule: /\?/,


	// 远程服务器地址, 必须以/结束

	// remote server address, always ends with /

	remote: 'http://yourserver.com/prefix/',


	// 以下配置为本地静态文件模式
	// 本地找不到对应文件时仍会将请求转发至远程服务器
	// prefix: root对应的url前缀, 须为以/结束的字符串, 如果请求中不包含此前缀则会被转发至远程服务器(根路径除外)
	// 利用这个配置可以实现将 http://yourserver.com/prefix/ 映射到 root 中配置的目录
	// root: 本地根路径对应的目录
	// index: 默认文档文件名

	// this is for using local filesystem
	// however if specified file does not exist, the request will still be forward to remote server
	// prefix: local url prefix, always ends with /. any request except root that doesn't contain this prefix will be forward to remote server.
	// by using this config you can map http://yourserver.com/prefix/ to the directory configured in 'root'
	// root: local root directory
	// index: default document

	local: {
		prefix: '/prefix/',
		root: './',
		index: 'index.html'
	},


	// local也可以配置为代理模式, 以便于使用某些服务器特定功能
	// 'local' can be another web server if you need some server features

	//local:'http://somelocalhost:8080/prefix/',

	// 本地监听端口
	// the port this devProxy listens

	port: 1990
};