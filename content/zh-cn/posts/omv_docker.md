+++
title = 'omv入土教程2'
date = 2026-02-20
draft = false
slug = 'omv_docker'
summary = 'Article Description'
tags = ["omv"]
categories = ["omv从入门到入土"]
series = ["omv从入门到入土"]
math = false
toc = true
comments = true
+++

## 前言

由于种种原因为何转到OMV就不赘述了, 详情移步[这篇文章](https://vercel-blog.sifulin.top/zh-cn/2026/02/19/omv_storage/)

## 安装docker

其实omv安装docker不是很难, 只是需要安装一下omv-extra的插件, 当然如果你要更改docker路径也会复杂一点

### 安装omv-extra

其实这步很简单, 你只需要先将~~你的家庭网络划分5个网段, 然后...~~好的, 你只需要有个科学上网的环境, 这步就是复制个命令的事情, 如果没有的话就只能手动下载了

[官方镜像](https://github.com/OpenMediaVault-Plugin-Developers/packages)

[清华镜像](https://mirrors.tuna.tsinghua.edu.cn/OpenMediaVault/openmediavault-plugin-developers/pool/main/o/openmediavault-omvextrasorg/)
```bash
# 用于环境没有问题
wget -O - https://github.com/OpenMediaVault-Plugin-Developers/installScript/raw/master/install | bash

# 如果手动上传, 就上传到root文件夹下
dpkg -i openmediavault-omvextrasorg_latest_all*.deb
```

之后在网页就可以出现omv-extra的插件了, 记得打开docker-repo, 那个是docker网页控制台, 一定要打开, 之后去omv的插件列表下载composed插件, 其实这每一步都是科学上网极致考验, 只有我这种~~在家里划分了五个网段做隔离的强者~~才能适应

## 迁移docker

1. 第一步 
首先创建docker共享文件夹, 用于存储docker的应用程序

2. 第二步
创建dockerdata文件夹, 用于存放docker-composed的配置文件

3. 第三步
创建dockerbackup文件夹, 用于docker备份

最后ssh登录omv, 把docker的文件迁移到另一个文件夹

```bash
mv /var/lib/docker/* /docker
```

然后进入网页, **服务->Compose->设置**路径下, 根据图片所示更改目录, 然后点击保存
{{<images "https://p.sda1.dev/30/c03fc084ae4e3da61e8d7c99c71ec748/PixPin_2026-02-20_11-19-04.png" "docker更改路径">}}

## 测试

**服务->Compose->文件**路径下新建一个配置文件
```yaml
services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    environment:
      DOMAIN: "https://v.s.top" # 你自己的域名
      SMTP_HOST: "smtp.qq.com"  # smtp服务器
      SMTP_FROM: "1996@qq.com"  # 发送邮箱
      SMTP_PORT: 465    # smtp端口
      SMTP_SECURITY: "force_tls"    # 强制tls
      SMTP_USERNAME: "1986@qq.com"  # smtp邮箱
      SMTP_PASSWORD: "orfmniibb"    # smtp邮箱密钥
    volumes:
      - ./vw-data/:/data/   # ./vw-data会在compose文件所在目录创建vw-data, 即/opt/dockerdata/vaultwarden/vw-data
    ports:
      - 8507:80
```

这样之后应该就全部ok了
