+++
title = 'Frp映射web服务到公网'
date = 2025-04-30
draft = false
slug = 'MappingWebServiceToInternetByFrp'
summary = '通过中继服务器将内网服务暴露到公网上'
tags = ["frp","内网穿透"]
categories = ["frp也穿不透Ta的心"]
series = ["frp也穿不透Ta的心"]
math = false
toc = true
comments = false
+++

## 前言

由于博主本人在家里部署了 sunpanel 和 vaultwarden 两个服务, 虽然设置了 IPV6 的 DDNS, 但是在一些场合 IPV6 并不能访问, 所以想通过中继服务器将内网服务暴露到公网上, 而之所以不使用 tailscale 这种虚拟局域网的方法, 最主要的原因是 ios 只能开启一个 VPN, 如果开了 tailscale, 那就不能访问谷歌, 油管了, 虽然 tailscale 可以设置节点出站, 但是这样的代理我很怕运营商把这种不对劲的上传流量视为 PCDN 直接把我宽带封了, 那样我差不多就~~不用在家里睡觉了~~, 所以只能使用 frp 了

## 准备

首先下载一下 frp, 这是[frp 链接](https://github.com/fatedier/frp/releases), 下载后解压, 其中分为两个二进制文件, 一个是 frpc, 一个是 frps, 分别用于服务端和客户端
下载好 frp 之后,我们还需要买一个域名和云主机, 这里我激推[雨云](https://www.rainyun.com/MTI2OTkw_), 因为 实在是太便宜了, 我买了江苏宿迁的上行 15Mbps, 下行 50Mbps 的服务器一个月只要 22 元, 配合优惠券, 我买了半年只花了 108 元, 虽然是共享 IP, 但是反正 frp 可以自定义端口, 所以这个足够使用了

## 服务端配置

首先我们将压缩包中的 frps 上传到云主机上, 我这里的上传到**/opt/frp/bin**, 然后赋予可执行权限

```bash
mkdir -p /opt/frp/bin
chmod a+x /opt/frp/bin/frps
```

### 修改配置文件

```toml
bindPort = 7000 # 监听端口
auth.token = "@W508sr56" # 认证密钥, 客户端也要填入一样的密钥才能连接成功

webServer.addr = "0.0.0.0" # web面板的监听地址, 默认127.0.0.1, 这样是没法从其他设备访问的
webServer.port = 7500 # web面板的监听端口
webServer.user = "admin" # web面板的用户名
webServer.password = "admin" # web面板的密码

vhostHTTPPort = 8081 # 转发http流量的监听端口
vhostHTTPSPort = 8443 # 转发https流量的监听端口
```

修改完成后将其上传到**/opt/frp**目录下, 设置 systemd 服务

```bash
cat >> /usr/lib/systemd/system/frps.service << EOF
[Unit]
# 服务名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frps的命令，需修改为您的frps的安装路径
ExecStart = /opt/frp/bin/frps -c /opt/frp/frps.toml

[Install]
WantedBy = multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now frps
```

## 客户端配置

同样将压缩包内的 frpc 二进制文件上传到我们的客户端主机上, 然后赋予可执行权限

```bash
mkdir -p /opt/frp/bin
chmod a+x /opt/frp/bin/frpc
```

### 修改配置文件

客户端文件需要配置 customDomains, 这些域名对应的 IP 是云主机的 IP, 因此访问对应域名:端口后根据 DNS 的查询结果, 请求会发往运行 frps 服务端的云主机上, 而云主机绑定了 vhostHTTPPort, 域名:端口可以正确被 frp 服务端监听, 此时 frps 会获取请求的 host, 并将请求转发到客户端上, 客户端将 host 与 customDomains 匹配, 匹配正确到再转发到对应端口, 对应端口可以设置 nginx 监听并设置重定向和反向代理

博主这里的方案就是服务端在 8081 端口监听 http 请求, 监听到后将请求转发到客户端, 客户端再转发到本地 IP 的 8081 端口, 客户端本地 IP 的 8081 端口被 nginx 监听, 会将请求重定向成 https 请求, https 的请求转发流程与前面一致

```toml
serverAddr = "xxx.xxx.xxx.xxx" # 服务端地址
serverPort = 7000 # 服务端端口
auth.token = "@W5028sr5026" # 认证密钥, 与服务端一样的密钥才能连接成功

webServer.addr = "0.0.0.0" # web面板的监听地址, 默认127.0.0.1, 这样是没法从其他设备访问的
webServer.port = 7500 # web面板的监听端口
webServer.user = "admin" # web面板的用户名
webServer.password = "admin" # web面板的密码

[[proxies]]
name = "http"
type = "http" # 代理类型
localPort = 8081 # 从服务端监听到之后会转发的本地端口
localIP = "0.0.0.0" # 从服务端监听到之后会转发的本地IP
customDomains = ["panel.example.com","vault.example.com"] # 这些域名对应的IP是云主机的IP, 云主机绑定了vhostHTTPPort, 因此输入域名:端口, 匹配到自定义域名frp就会转发到客户端上,客户端再转发到对应端口上

[[proxies]]
name = "https"
type = "https"
localPort = 8443
localIP = "0.0.0.0"
customDomains = ["panel.example.com","vault.example.com"]
```

修改完成后将其上传到**/opt/frp**目录下, 设置 systemd 服务

```bash
cat >> /usr/lib/systemd/system/frpc.service << EOF
[Unit]
# 服务名称，可自定义
Description = frp server
After = network.target syslog.target
Wants = network.target

[Service]
Type = simple
# 启动frps的命令，需修改为您的frps的安装路径
ExecStart = /opt/frp/bin/frpc -c /opt/frp/frpc.toml

[Install]
WantedBy = multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now frpc
```

## 收尾工作

去 DNS 解析商把 customDomains 对应的域名解析到云主机的 IP 上, 然后就可以访问了, 如果云主机有防火墙, 需要放行一下, frp 的详细文档可以查看[frp 文档](https://gofrp.org/zh-cn/docs/)
