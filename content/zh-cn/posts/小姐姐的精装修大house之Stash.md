+++
title = '小姐姐的精装修大house之Stash'
date = 2024-10-08
draft = false
slug = 'stash'
summary = '在搜索ios翻墙软件中无意中发现了这个神奇的应用...真的是无意中发现的...'
tags = ['stash','影音服务器']
categories = ['stashApp']
series = []
math = false
toc = true
comments = true
+++

## 介绍

在搜索 ios 翻墙软件中无意中发现了这个神奇的应用...真的是无意中发现的...

[github 项目地址](https://github.com/stashapp/stash)

[wiki 地址](https://docs.stashapp.cc/)

## 一个小tips

该软件会自动识别当前所在的路径并在该路径生成配置文件,可以利用这点找到配置文件位置

需要注意如果作权限划分的,一定要确保设置的目录是有访问权限的,不过是媒体文件夹还是自动生成的缓存文件夹

## 安装

```bash
apt-get install -y ffmpeg
# 小姐姐数据库所在位置
mkdir /mnt/samsung/medias/stash
# 小姐姐缩略图所在位置

mkdir /mnt/samsung/medias/stash/generated
# 小姐姐缓存位置
mkdir /mnt/samsung/medias/stash/cache
# 插件位置
mkdir /opt/stash/plugins
# 刮削器位置
mkdir /opt/stash/scrapers
# 应用文件位置
mkdir /opt/stash/bin
# 配置文件位置
mkdir /opt/stash/config
# 运行之后记得把数据库设置一下权限
# R是递归,d是子文件夹自动继承相同的访问权限
setfacl -dR -m u:stash:rw /mnt/samsung/medias/stash
setfacl -m u:stash:rw stash.sqlite
cat > /etc/systemd/system/stash.service <<EOF
[Unit]
Description=StashApp Service
After=network.target

[Service]
Type=simple
User=stash
Group=stash
# 运行 StashApp 的命令
ExecStart=/opt/stash/bin/stash -c /opt/stash/config/config.yml  # 请确保这个路径是正确的

# 设置日志文件路径
StandardOutput=journal
StandardError=journal

# 自动重启服务
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now stash.service
```

之后进入自行设置一下就好了,软件支持中文,默认监听 9999 端口,因为这种媒体海报墙很多教程并且这个 stash 实在有违我正人君子~~老色批~~的形象,就不详细介绍配置过程了
