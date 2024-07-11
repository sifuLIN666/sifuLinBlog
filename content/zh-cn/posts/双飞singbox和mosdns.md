+++
title = '双飞singbox和mosdns'
date = 2024-07-11
draft = false
slug = 'two-sexy-bitches-singbox-and-mosdns'
summary = '在上期介绍的singbox配置中,singbox的host是重定向,而不是返回目的域名的ip,这就像你想找mikami,但是他返回给你fukada,中间的过程都不知道,虽然最后都爽了但是蒙在鼓里的感觉并不好,所以需要一个中间人,本方案使用mosdns作host劫持的服务器'
tags = ["singbox","科学上网","mosdns","host劫持"]
categories = ["singbox十点不通"]
series = ["singbox:从入门到clash"]
math = false
toc = true
comments = true
+++

## 首先要先把房间布置的暧昧一点,这样 yua 和 eimi 才能~~接客~~

```bash
apt-get update
# 安装必要的软件
apt-get install -y sudo vim tar unzip resolvconf
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
# *.*.*.*为你的本机ip
echo "nameserver *.*.*.*" >> /etc/resolvconf/resolv.conf.d/head
# 让配置文件生效
sysctl -p
resolvconf -u
# 创建文件夹
mkdir /opt/mosdns
mkdir -p /opt/singbox/lib
```

## ~~爱巢~~筑好了,接下来要去邀请 yua 和 emi 了

首先去网站下载对应的软件
[sing-box 链接](https://github.com/SagerNet/sing-box/releases)
[mosdns 链接](https://github.com/IrineSistiana/mosdns/releases)

```bash
# 上传压缩包到 root 目录下,非 root 用户改为绝对路径
unzip mosdns-*.zip "mosdns" -d /opt/mosdns/
tar -zxvf sing-box-*.tar.gz --strip-components=1 -C /opt/singbox/
chmod +x /opt/singbox/sing-box
chmod +x /opt/mosdns/mosdns
# singbox的默认运行配置
cat > /opt/singbox/config.json << EOF
{
  "log": {
    "level": "info"
  },
  "dns": {
    "servers": [
      {
        "address": "tls://8.8.8.8"
      }
    ]
  },
  "inbounds": [
    {
      "type": "shadowsocks",
      "listen": "::",
      "listen_port": 8080,
      "sniff": true,
      "network": "tcp",
      "method": "2022-blake3-aes-128-gcm",
      "password": "8JCsPssfgS8tiRwiMlhARg=="
    }
  ],
  "outbounds": [
    {
      "type": "direct"
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "rules": [
      {
        "protocol": "dns",
        "outbound": "dns-out"
      }
    ]
  }
}
EOF
cat > /opt/mosdns/config.yaml << EOF
log:
  level: info
  file: "/opt/mosdns/mosdns.log"

api:
  http: "0.0.0.0:9091"

include: []

plugins:
  - tag: hosts
    type: hosts
    args:
      entries:
        - "woshiwo.com 192.168.234.4"
        - "shibuyiyangdeyanhuo.com 192.168.234.2"

  - tag: forward_dns
    type: forward
    args:
      concurrent: 1
      upstreams:
        - addr: 1.1.1.1
          bootstrap: 119.29.29.29
          enable_pipeline: false
          max_conns: 2
          insecure_skip_verify: false
          idle_timeout: 30
          enable_http3: false

  - tag: dns_sequence
    type: sequence
    args:
      - exec: prefer_ipv4
      - exec: \$forward_dns

  - tag: dns_query
    type: sequence
    args:
      - exec: \$dns_sequence

  - tag: fallback
    type: fallback
    args:
      primary: dns_query
      secondary: dns_query
      threshold: 500
      always_standby: true

  - tag: main_sequence
    type: sequence
    args:
      - exec: \$hosts
      - matches:
        - has_resp
        exec: accept
      - exec: \$fallback

  - tag: udp_server
    type: udp_server
    args:
      entry: main_sequence
      listen: "0.0.0.0:53"

  - tag: tcp_server
    type: tcp_server
    args:
      entry: main_sequence
      listen: "0.0.0.0:53"
EOF
```

### 配置辣种服务,方便开机坐上来自己动

```bash
cat > /etc/systemd/system/sing-box.service << EOF
[Unit]
Description=sing-box service
Documentation=https://sing-box.sagernet.org
After=network.target nss-lookup.target network-online.target

[Service]
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
ExecStart=/opt/singbox/sing-box -D /opt/singbox/lib -c /opt/singbox/config.json run
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=10s
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target

EOF
cat > /etc/systemd/system/mosdns.service << EOF
[Unit]
Description=A DNS forwarder
ConditionFileIsExecutable=/opt/mosdns/mosdns

[Service]
StartLimitInterval=5
StartLimitBurst=10
ExecStart=/opt/mosdns/mosdns "start" "--as-service" "-d" "/opt/mosdns" "-c" "/opt/mosdns/config.yaml"

Restart=always
RestartSec=120
EnvironmentFile=-/etc/sysconfig/mosdns

[Install]
WantedBy=multi-user.target

EOF
systemctl daemon-reload
systemctl enable sing-box.service
systemctl enable mosdns.service
systemctl start sing-box.service
systemctl start mosdns.service
```

这样就可以愉快的让 yua 和 eimi 坐上来自己动了
