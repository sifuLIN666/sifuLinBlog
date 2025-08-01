+++
title = 'Nginx开启反向代理和重定向配置'
date = 2025-08-01
draft = false
slug = 'nginx-1'
summary = 'lucky用腻了,最终开始返璞归真'
tags = ["nginx"]
categories = ["nginx从入门到放弃"]
series = ["nginx从入门到放弃"]
math = false
toc = true
comments = true
+++

## 引言

反向代理想必大家并不陌生, 博主之前使用的是[lucky](https://www.lucky666.cn/docs/intro/), 确实是非常好用, 申请证书、反向代理、重定向、webdav、stun 内网穿透全都有, 但是博主嫌 lucky 的 ui 不好看, 而且功能太多有点太重了, ~~真的屁事一堆~~

## 配置开始

1. 安装 nginx

博主用的是"debian"系统, 于是就很直接 apt 安装就好了, 安装好之后 nginx 的配置文件在/etc/nginx/nginx.conf, 配置文件内容如下:

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	# multi_accept on;
}

http {
	##
	# Basic Settings
	##

	sendfile on;
	tcp_nopush on;
	types_hash_max_size 2048;
	# server_tokens off;

	# server_names_hash_bucket_size 64;
	# server_name_in_redirect off;

	include /etc/nginx/mime.types;
	default_type application/octet-stream;

	##
	# SSL Settings
	##

	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
	ssl_prefer_server_ciphers on;

	##
	# Logging Settings
	##

	access_log /var/log/nginx/access.log;

	##
	# Gzip Settings
	##

	gzip on;

	# gzip_vary on;
	# gzip_proxied any;
	# gzip_comp_level 6;
	# gzip_buffers 16 8k;
	# gzip_http_version 1.1;
	# gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

	##
	# Virtual Host Configs
	##

	include /etc/nginx/conf.d/*.conf;
	include /etc/nginx/sites-enabled/*;
}


#mail {
#	# See sample authentication script at:
#	# http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#	# auth_http localhost/auth.php;
#	# pop3_capabilities "TOP" "USER";
#	# imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#	server {
#		listen     localhost:110;
#		protocol   pop3;
#		proxy      on;
#	}
#
#	server {
#		listen     localhost:143;
#		protocol   imap;
#		proxy      on;
#	}
#}

```

在"nginx.conf"文件中可以通过 include 引入其他配置文件

2. 配置重定向

创建"redirect.conf"文件, 内容如下

```nginx
server {
    listen 10081;
    listen [::]:10081;
    server_name *.example.com; # "*"匹配所有子域名, 多个域名用空格隔开比如 "1.example.com 2.example.com"
    return 301 https://$host:10443$request_uri;  # HTTP → HTTPS
}
```

3. 开启 ssl 配置反向代理

创建"域名.conf"文件, 内容如下

```nginx
server {
    listen 10443 ssl;
    listen [::]:10443 ssl;
    server_name test.example.com;

    ssl_certificate /opt/allinssl/example-com/example-com.pem; # 填写证书文件路径
    ssl_certificate_key /opt/allinssl/example-com/example-com.key; # 填写密钥文件路径

    location / {
        proxy_pass http://192.168.50.5:5244;  # 反向代理
        proxy_set_header Host $host; # 设置代理的 Host 头
        proxy_set_header X-Real-IP $remote_addr; # 设置代理的 X-Real-IP 头
    }
}
```

## 一点点孤儿应用

1. 孤儿飞牛

飞牛系统的 webUI 依赖 websocket, 所以要把 websocket 打开,不然会一直在 UI 界面转圈圈

```nginx
server {
    listen 10443 ssl;
    listen [::]:10443 ssl;
    server_name test.example.com;

    ssl_certificate /opt/allinssl/example-com/example-com.pem;
    ssl_certificate_key /opt/allinssl/example-com/example-com.key;

    location / {
        proxy_pass http://192.168.50.5:8000;  # 代理到本地的3000端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # 以下两行是开启websocket的配置
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

2. 一些需要安全路径才能访问应用

比如 allinssl 就是需要安全路径才能访问的,这种也需要一些配置, 不然没办法访问

```nginx
server {
    listen 10443 ssl;
    listen [::]:10443 ssl;
    server_name test.example.com;

    ssl_certificate /opt/allinssl/example-com/example-com.pem;
    ssl_certificate_key /opt/allinssl/example-com/example-com.key;

    location / {
        proxy_pass http://192.168.50.4:43105;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    # 安全路径也设置好一个代理就可以了
    location /allinssl {
        proxy_pass http://192.168.50.4:43105;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
