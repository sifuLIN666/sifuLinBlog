+++
title = '小姐姐的精装修大house-Stash'
date = 2024-10-08
draft = false
slug = 'stash'
summary = '在搜索ios翻墙软件中无意中发现了这个神奇的应用...真的是无意中发现的'
tags = ['stash','影音服务器']
categories = ['stashApp']
series = []
math = false
toc = true
comments = true
+++

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

cat > /etc/systemd/system/stash.service <<EOF
[Unit]
Description=StashApp Service
After=network.target

[Service]
Type=simple


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

之后进入自行设置一下就好了,软件支持中文,默认监听 9999 端口
