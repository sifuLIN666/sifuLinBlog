+++
title = 'Zerotier异地组网'
date = 2024-08-18
draft = false
slug = 'zerotier'
summary = '使用zerotier实现异地组网,天涯海角回家路'
tags = ["zerotier","异地组网"]
categories = ["zerotier一点通"]
series = ["zerotier教"]
math = false
toc = true
comments = true
+++

## B 站视频链接

{{< bilibili "BV1K34y1u79n" >}}

## 在云服务器上安装 zerotier

### 前言,先开个 IP 转发先

```bash
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
```

### 第一步 配置 zerotier

```bash
curl -s https://install.zerotier.com | sudo bash
```

### 第二步 将云服务器添加进网络

```bash
# 加入网络 xxxxx为网络ID
sudo zerotier-cli join xxxxxxxx
```

### 第三步 生成 moon 文件并修改配置

```bash
# 生成moon文件
cd /var/lib/zerotier-one
sudo zerotier-idtool initmoon identity.public >> moon.json
sudo nano moon.json
```

将配置文件中的“stableEndpoints”: []的[]填上[“公网 IP:9993”]
修改完毕后生成

```shell
# 生成moon文件
sudo zerotier-idtool genmoon moon.json
```

### 第四步 把 moon 文件移动到 moons.d 目录

```shell
sudo mkdir moons.d
sudo mv 000000xxxxxxxxxx.moon moons.d
#重启服务
sudo systemctl restart zerotier-one
```

## 客户端

### linux

```shell
zerotier-cli join 网络id
# 查看状态
zerotier-cli listpeers
# 设置moon服务器
zerotier-cli orbit xxxxxxxxxx xxxxxxxxxx
# 查看网卡名称
ip addr
# 开启转发
iptables -I FORWARD -i ens192 -j ACCEPT
iptables -I FORWARD -o ens192 -j ACCEPT
iptables -t nat -I POSTROUTING -o ens192 -j MASQUERADE
iptables -I FORWARD -i ztk4jk7xov -j ACCEPT
iptables -I FORWARD -o ztk4jk7xov -j ACCEPT
iptables -t nat -I POSTROUTING -o ztk4jk7xov -j MASQUERADE
```

### windows

```shell
zerotier-cli.bat join 网络id
# 查看状态
zerotier-cli.bat listpeers
# 设置moon服务器
zerotier-cli.bat orbit xxxxxxxxxx xxxxxxxxxx
```
