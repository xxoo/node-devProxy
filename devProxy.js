#!/usr/bin/env node

/*	devProxy.js 0.2.1
 *	通过将数据请求转发到远程服务器, 来在本地开发环境中模拟服务器环境, 以实现完整的网站功能
 *	脚本执行时会从当前目录载入proxyConfig.js
 */

'use strict';
var http = require('http');
var https = require('https');
var util = require('util');
var path = require('path');
var fs = require('fs');
var dir = process.argv.length > 2 ? process.argv[2] : process.cwd();
var config = require(path.join(dir, 'proxyConfig.js'));

var mimes = {
	'': 'application/octet-stream',
	'html': 'text/html',
	'js': 'text/javascript',
	'css': 'text/css',
	'jpg': 'image/jpeg',
	'png': 'image/png',
	'gif': 'image/gif',
	'svg': 'image/svg+xml',
	'json': 'text/json'
};

if (config instanceof Array) {
	for (var i = 0; i < config.length; i++) {
		run(config[i]);
	}
} else {
	run(config);
}

function run(config) {
	var s;
	console.log(config);
	s = parseServer(config.remote);
	if (s) {
		config.remote = s;
		if (typeof config.local === 'string') {
			s = parseServer(config.local);
			if (s) {
				config.local = s;
			}
		} else {
			if (!config.local.prefix) {
				config.local.prefix = '/';
			}
		}
		if (config.local instanceof Object) {
			http.createServer(function(req, res) {
				if (req.method === 'POST' || (config.rule && config.rule.test(req.url))) {
					httpproxy(config.remote, req, res);
				} else {
					if (config.local instanceof Array) {
						httpproxy(config.local, req, res);
					} else {
						staticfile(config, req, res);
					}
				}
			}).listen(config.port, '0.0.0.0');
		} else {
			console.log('bad local server address: ' + config.local);
		}
	} else {
		console.log('bad remote server address: ' + config.remote);
	}
}

function staticfile(config, req, res) {
	var u = req.url.replace(/\?.*$/, '');
	if (u === '/') {
		u = config.local.prefix + config.local.index;
	} else if (u[u.length - 1] === '/') {
		u += config.local.index;
	}
	var p, v = config.local.prefix.length;
	if (u.substr(0, v) === config.local.prefix) {
		p = path.join(dir, config.local.root, u.substr(v));
		fs.stat(p, function(err, stat) {
			if (err) {
				httpproxy(config.remote, req, res);
			} else {
				if (stat.isDirectory()) {
					res.writeHeader(302, 'Found', {
						'Location': u + '/'
					});
					res.end();
				} else {
					var m = mimes[path.extname(p).substr(1)];
					if (!m) {
						m = mimes[''];
					}
					var f = fs.createReadStream(p);
					res.writeHeader(200, 'OK', {
						'Content-Type': m,
						'Content-Length': stat.size,
						'Last-Modified': new Date(stat.mtime).toUTCString()
					});
					f.pipe(res);
					console.log('static: ' + req.url);
				}
			}
		});
	} else {
		httpproxy(config.remote, req, res);
	}
}

function httpproxy(server, req, res) {
	var n;
	var info = {
		host: server[1],
		port: server[2],
		path: server[3] + req.url,
		method: req.method
	};
	var proxy = server[0].request(info, function(res2) {
		var cookie = res2.headers['set-cookie'];
		if (cookie instanceof Array) {
			for (var i = 0; i < cookie.length; i++) {
				cookie[i] = cookie[i].replace(/; domain=[^;]+/, '');
			}
		}
		delete res2.headers['access-control-allow-origin'];
		res.writeHeader(res2.statusCode, res2.headers);
		res2.pipe(res);
		console.log(buildServerStr(server) + req.url);
	});
	proxy.on('error', function(err) {
		console.log(err);
		if (!res.headersSent) {
			res.writeHeader(502, 'Bad Gateway');
		}
		res.end();
	});
	for (n in req.headers) {
		if (['host', 'origin', 'referer'].indexOf(n) < 0) {
			//console.log(n + ': ' + req.headers[n]);
			proxy.setHeader(n, req.headers[n]);
		}
		//console.log(n);
	}
	req.pipe(proxy);
}

function parseServer(str) {
	var r = str.match(/^http(s?):\/\/([^\/:]+)(?::(\d+))?(\/.*[^\/])?\/$/);
	if (r) {
		delete r.index;
		delete r.source;
		r.shift();
		r[2] = r[2] ? parseInt(r[2]) : r[0] ? 443 : 80;
		r[0] = r[0] ? https : http;
		!r[3] && (r[3] = '');
	}
	return r;
}

function buildServerStr(server) {
	var s = 'http';
	if (server[0] === https) {
		s += 's';
	}
	s += '://' + server[1];
	if ((server[0] === https && server[2] !== 443) || (server[0] === http && server[2] !== 80)) {
		s += ':' + server[2];
	}
	s += server[3];
	return s;
}