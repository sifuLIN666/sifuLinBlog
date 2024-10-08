+++
title = '全能下载器Aria2'
date = 2024-10-08
draft = false
slug = 'aria'
summary = '云端数据飘渺间,千兆宽带瞬息连。BT姐姐任你看,下载神速如闪电。'
tags = ["aria2","bt下载"]
categories = ["aria2"]
series = []
math = false
toc = true
comments = false
+++

## Aria2 下载器介绍

[Aria2](https://aria2.github.io/) 是一款非常强大的开源多协议命令行下载工具，它支持 HTTP、HTTPS、FTP 以及 BitTorrent 等协议，适用于多种操作系统，包括 Windows、Linux 和 macOS。Aria2 的设计目标是为了提高下载速度和灵活性，具备以下主要特点：

- 多线程下载：
  Aria2 支持多线程下载，可以从多个源同时下载同一个文件，显著提高了下载速度。这对于大文件下载尤其有用，因为它可以利用带宽的全部潜力。

- 断点续传：
  支持断点续传功能，这意味着即使下载过程中断，也可以从上次中断的地方继续下载，而不必重新开始整个下载过程。

- 多协议支持：
  Aria2 支持多种网络协议，包括 HTTP、HTTPS、FTP、SFTP、BitTorrent (BT) 和 Metalink。这使得它成为一个非常通用的下载工具，几乎可以处理任何类型的下载任务。

- 轻量级和灵活：
  Aria2 本身是一个很小的应用程序，但它提供了丰富的命令行选项，允许用户进行详细的配置。此外，Aria2 可以通过 Web 界面、图形用户界面(GUI)或其他工具来管理，增加了使用的灵活性。

- 后台下载和静默模式：
  Aria2 支持后台下载，用户可以在启动下载任务后关闭控制台窗口，而下载任务仍将继续执行。此外，它还支持静默模式，可以在没有用户交互的情况下工作。

## 安装 aria2

```bash
# debian的 apt 包管理器已经包含aria2,但是没有systemctl服务
apt-get install -y aria2
mkdir -p /opt/aria2
# 设置systemctl服务
cat > /etc/systemd/system/aria2.service << EOF
[Unit]
Description=aria2 Daemon
After=network.target

[Service]
Type=forking
ExecStart=/opt/aria2/aria2.sh start
ExecStop=/opt/aria2/aria2.sh stop
ExecRestart=/opt/aria2/aria2.sh restart
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF
# 这个systemctl服务是通过脚本来控制的,现在把脚本补上
cat > /opt/aria2/aria2.sh << EOF
#!/bin/bash
stop(){
    pid=$(pidof 'aria2c')
    if [ -n "$pid" ]; then
        kill $pid
    else
        echo "没有找到 aria2c 的进程"
    fi
}

case "$1" in
start)
    aria2c --conf-path=/opt/aria2/aria2.conf -D
;;
stop)
    stop
;;
restart)
    stop
    sleep 2
    aria2c --conf-path=/opt/aria2/aria2.conf -D
;;
esac
exit
EOF

chmod +x /opt/aria2/aria2.sh

# 这个脚本中设置了配置文件路径,可以自行修改
cat > /opt/aria2/aria2.conf << EOF
# 下载路径
dir=/mnt/samsung/aria2
# 启用磁盘缓存, 0为禁用缓存, 需1.16以上版本, 默认:16M
#disk-cache=32M
#disk-cache=32M
# 文件预分配方式, 能有效降低磁盘碎片, 默认:prealloc
# 预分配所需时间: none < falloc ? trunc < prealloc
# falloc和trunc则需要文件系统和内核支持
# NTFS建议使用falloc, EXT3/4建议trunc, MAC 下需要注释此项
file-allocation=trunc
# 断点续传
continue=true

## 下载连接相关 ##

# 最大同时下载任务数, 运行时可修改, 默认:5
max-concurrent-downloads=5
# 同一服务器连接数, 添加时可指定, 默认:1
max-connection-per-server=5
# 最小文件分片大小, 添加时可指定, 取值范围1M -1024M, 默认:20M
# 假定size=10M, 文件为20MiB 则使用两个来源下载; 文件为15MiB 则使用一个来源下载
min-split-size=10M
# 单个任务最大线程数, 添加时可指定, 默认:5
split=5
# 整体下载速度限制, 运行时可修改, 默认:0
#max-overall-download-limit=0
# 单个任务下载速度限制, 默认:0
#max-download-limit=0
# 整体上传速度限制, 运行时可修改, 默认:0
#max-overall-upload-limit=0
# 单个任务上传速度限制, 默认:0
#max-upload-limit=0
# 禁用IPv6, 默认:false
disable-ipv6=true

## 进度保存相关 ##

# 从会话文件中读取下载任务
input-file=/opt/aria2/aria2.session
# 在Aria2退出时保存`错误/未完成`的下载任务到会话文件
save-session=/opt/aria2/aria2.session
# 定时保存会话, 0为退出时才保存, 需1.16.1以上版本, 默认:0
save-session-interval=60

## RPC相关设置,可以搭配webUI使用 ##

# 启用RPC, 默认:false
enable-rpc=true
# 允许所有来源, 默认:false
rpc-allow-origin-all=true
# 允许非外部访问, 默认:false
rpc-listen-all=true
# 事件轮询方式, 取值:[epoll, kqueue, port, poll, select], 不同系统默认值不同
#event-poll=select
# RPC监听端口, 端口被占用时可以修改, 默认:6800
rpc-listen-port=6800
# 设置的RPC授权令牌, v1.18.4新增功能, 取代 --rpc-user 和 --rpc-passwd 选项
rpc-secure=false
rpc-secret=wsr19990902

## BT/PT下载相关 ##

# 当下载的是一个种子(以.torrent结尾)时, 自动开始BT任务, 默认:true
#follow-torrent=true
# BT监听端口, 当端口被屏蔽时使用, 默认:6881-6999
listen-port=51413
# 单个种子最大连接数, 默认:55
#bt-max-peers=55
# 打开DHT功能, PT需要禁用, 默认:true
enable-dht=true
# 打开IPv6 DHT功能, PT需要禁用
#enable-dht6=false
# DHT网络监听端口, 默认:6881-6999
#dht-listen-port=6881-6999
# 本地节点查找, PT需要禁用, 默认:false
bt-enable-lpd=true
# 种子交换, PT需要禁用, 默认:true
enable-peer-exchange=false
# 每个种子限速, 对少种的PT很有用, 默认:50K
#bt-request-peer-speed-limit=50K
# 客户端伪装, PT需要
#peer-id-prefix=-TR2770-
user-agent=Transmission/2.92
#user-agent=netdisk;4.4.0.6;PC;PC-Windows;6.2.9200;WindowsBaiduYunGuanJia
# 当种子的分享率达到这个数时, 自动停止做种, 0为一直做种, 默认:1.0

seed-ratio=1.0
#作种时间大于30分钟，则停止作种
seed-time=30
# 强制保存会话, 话即使任务已经完成, 默认:false
# 较新的版本开启后会在任务完成后依然保留.aria2文件
#force-save=false
# BT校验相关, 默认:true
bt-hash-check-seed=true
# 继续之前的BT任务时, 无需再次校验, 默认:false
bt-seed-unverified=false
# 保存磁力链接元数据为种子文件(.torrent文件), 默认:false
bt-save-metadata=true
#下载完成后删除.ara2的同名文件
EOF
# 启动aria2服务,此处为后台启动
systemctl daemon-reload
systemctl enable --now aria2.service
```

## 命令行未免太抽象,来个 GUI 吧

aira2 开启 rpc 之后支持很多种 GUI,我这里推荐一个[ariaNG](https://ariang.mayswind.net/zh_Hans/),由于这是一个纯前端的 GUI 框架,目前我没有配置 nginx 这些 web 服务器,所以这个部署过程不作演示,部署好之后访问 `http://ip:port/jsonrpc` 即可
