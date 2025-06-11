+++
title = '从此ssl证书不烦恼, allinssl解放你的双手'
date = 2025-06-10
draft = false
slug = 'allinssl'
summary = '不要在手动部署证书啦, 直接用allinssl, 从此没烦恼'
tags = ["allinssl","ssl"]
categories = ["allinssl一点通"]
series = ["allinssl一点通"]
math = false
toc = true
comments = false
+++

## 前言

ssl 相信大家都不陌生, 但是要申请 ssl 证书却很麻烦, 诸如[acme.sh](https://github.com/acmesh-official/acme.sh),[certbot](https://certbot.eff.org/) 等都是命令行操作, 出错了的话不好调试, 而[certd](https://certd.docmirror.cn/)h 和[certimate](https://docs.certimate.me/)都依赖 nodejs 环境, 配置略带麻烦, 当然有人会问, 博主你不知道 docker 吗? 博主知道, 但是博主~~屁事一堆~~不喜欢, 不要问为什么, 就是感觉用 docker 不太原滋原味。还有人会问, 博主博主, 有没有一条龙方案, 有的兄弟有的,[lucky](https://lucky666.cn/)你值得拥有, 那博主为什么不用呢, 没什么, 就是因为博主看 lucky 功能太多很多又没用到不太爽~~真的屁事一堆~~, 还有就是博主的自建服务比较多, 用 lucky 进行反向代理反而不如直接使用 nginx 效率高了

## 介绍 allinssl

博主物色了很久,终于找到了梦中情软, [allinssl](https://allinssl.com/), 使用 go 语言编写, 支持多端平台, 抛弃 docker, 工作流部署 ssl 证书, 支持多种解析商, 支持多种部署方式, 完美地我想~~狠狠蹂躏她~~

### 部署方式

根据官方的文档有一键脚本部署, 也可以自己下载二进制文件部署

1. 一键脚本

```bash
curl -sSO http://download.allinssl.com/install_allinssl.sh && bash install_allinssl.sh allinssl
```

2. docker 部署

```bash
docker run -itd \
  --name allinssl \
  -p 7979:8888 \
  -v /www/allinssl/data:/www/allinssl/data \
  -e ALLINSSL_USER=allinssl \
  -e ALLINSSL_PWD=allinssldocker \
  -e ALLINSSL_URL=allinssl \
  allinssl/allinssl:latest
```

3. 手动配置

去[releases](https://github.com/allinssl/allinssl/releases)页面下载文件,解压至`/opt/allinssl`目录下

```bash
mkdir -p /opt/allinssl
tar -xvf allinssl_*.tar.gz -C /opt/allinssl
useradd -r -s /usr/sbin/nologin allinssl
chown -R allinssl:allinssl /opt/allinssl
chmod -R 755 /opt/allinssl
chmod u+x /opt/allinssl/allinssl
cat > /usr/lib/systemd/system/allinssl.service <<EOF
[Unit]
Description=ALLinSSL Service
After=network.target

[Service]
Type=forking
ExecStart=/opt/allinssl/allinssl 1
ExecRestart=/opt/allinssl/allinssl 3
User=allinssl
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now allinssl
/opt/allinssl/allinssl 15 # 获取入口链接和账号
/opt/allinssl/allinssl 6  # 设置密码
```

### 最后

由于 allinssl 部署使用了自定义用户,因此如果部署在本机上时需要保证权限足够, 下面是一个示例

```bash
apt install acl
setfacl -R -m d:u:allinssl:rw /opt/test
touch /opt/test/sifulin.top.pem
touch /opt/test/sifulin.top.pem
```

如果还有涉及到后置命令, 比如说重新加载 nginx, 则需要通过 sudo 配置一下免密权限

```bash
visudo
```

输入`allinssl ALL=(ALL:ALL) NOPASSWD: /usr/bin/systemctl reload nginx`之后, 在页面的后置命令输入`sudo systemctl reload nginx`就可以了
