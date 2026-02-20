+++
title = '自建windows云电脑'
date = 2026-02-15
draft = false
slug = 'windows_rdp'
summary = '教你如何利用pve自建云电脑，从此刷课作弊手拿把掐'
tags = ["rdp"]
categories = ["自建云电脑"]
series = ["自建云电脑"]
math = false
toc = true
comments = true
+++

## 前言
其实自建云电脑非常简单, 微软自带的RDP功能就能实现了, 但是要实现云电脑的功能需要一些特别的设置, 可以参考这个[这个视频](https://www.bilibili.com/video/BV1sHn9z8EoF/?spm_id_from=333.337.search-card.all.click)

## 操作

### 步骤1

安装好windows专业版之后, 打开设置, 允许远程桌面连接。
### 步骤2
{{<enhence>}}win+R{{</enhence>}}后输入{{<enhence>}}gpedit.msc{{</enhence>}}, 找到路径

1. 路径1
计算机配置->管理模板->Windows组件->远程桌面服务->远程桌面会话主机->设备和资源重定向, 设置视频重定向策略
2. 路径2
计算机配置->管理模板->Windows组件->远程桌面服务->远程桌面连接客户端->RemoteFx USB 设备重定向, 设置RDP的显示优化设置

### 步骤3

进入设置后添加用户, 在添加用户后再选择**选择可远程访问这台电脑的用户**添加进新的用户

### 步骤4

windows客户端远程连接设置可以使用的资源
{{<images "https://youke.xn--y7xa690gmna.cn/s1/2026/02/15/6991a4dc704c0.webp" "可使用资源路径1">}}
{{<images "https://youke.xn--y7xa690gmna.cn/s1/2026/02/15/6991a4dc704c0.webp" "可使用资源路径1">}}

连接上后进入设置进行{{<enhence>}}摄像头隐私设置{{</enhence>}}和{{<enhence>}}麦克风隐私{{</enhence>}}设置即可