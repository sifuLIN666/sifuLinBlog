+++
title = 'Bind9和singbox究极服务器'
date = 2025-01-13
draft = false
slug = 'bind-singbox'
summary = '抛弃mosdns直接搭个代理递归一体化究极服务器'
tags = ["DNS","bind9","递归DNS","singbox","科学上网"]
categories = ["bind9教程","singbox十点不通"]
series = ["DNS从入门到223.5.5.5","singbox:从入门到clash"]
math = false
toc = true
comments = true
+++

## 引言

在上期的[bind9 教程](https://vercel-blog.sifulin.top/zh-cn/2024/10/08/%E9%80%92%E5%BD%92%E6%9C%8D%E5%8A%A1%E5%99%A8bind9/)中, 我写了一个 bind9 的配置, 提到可以和 sing-box 联动出一个究极代理服务器, 今天算是来补这个坑

## 准备工作

准备一个 debian 系统,然后配置好 ssh 并修改网卡配置,设置好固定 IP 以及网关还有 DNS

```bash
apt-get update

# 安装必要的软件

apt install -y sudo vim tar unzip curl resolvconf acl

# 223.5.5.5就行,能让sing-box劫持都可以
echo "nameserver 223.5.5.5" >> /etc/resolvconf/resolv.conf.d/head
# 让配置文件生效
resolvconf -u

# 开启ipv4转发
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.d/99-sysctl.conf

sysctl -p
```

## 部署流程

### 安装 sing-box

1. 设置 sing-box 二进制文件

去[sing-box](https://github.com/SagerNet/sing-box/releases)页面下载对应的软件包, 这里我下载的是 amd64 的版本或者通过 curl 命令下载也可以

```bash
# 创建必要文件夹
mkdir -p /opt/singbox/bin
mkdir -p /opt/singbox/lib
# 下载的singbox压缩包上传到root文件夹下
tar -zxvf sing-box-*.tar.gz -C /opt/singbox/bin --strip-components=1

# 删除压缩包
rm -rf sing-box-*.tar.gz

```

2. 设置 sing-box 配置文件

```bash
cat > /opt/singbox/config.json << EOF
{
  "log": {
    "level": "info",
    "disabled": false,
    "timestamp": true,
    "output": "singbox.log"
  },
  "experimental": {
    "cache_file": {
      "enabled": true
    },
    "clash_api": {
      "external_controller": "0.0.0.0:9090",
      "external_ui": "ui",
      "external_ui_download_detour": "select",
      "external_ui_download_url": "https://github.com/MetaCubeX/Yacd-meta/archive/gh-pages.zip",
      "secret": "123456"
    }
  },
  "inbounds": [
    {
      "address": ["172.18.0.1/30", "fdfe:dcba:9876::1/126"],
      "auto_route": true,
      "interface_name": "tun0",
      "mtu": 9000,
      "stack": "mixed",
      "strict_route": true,
      "tag": "tun-in",
      "type": "tun"
    }
  ],
  "dns": {
    "final": "internal",
    "strategy": "prefer_ipv4",
    "reverse_mapping": true,
    "servers": [
      {
        "tag": "external",
        "type": "tls",
        "server": "8.8.8.8",
        "server_port": 853,
        "detour": "direct"
      },
      {
        "tag": "internal",
        "type": "udp",
        "server": "192.168.50.3",
        "server_port": 5353,
        "detour": "direct"
      }
    ],
    "rules": [
      {
        "domain_keyword": ["lzhlovelcl.top"],
        "action": "route",
        "server": "internal"
      }
    ]
  },
  "route": {
    "rules": [
      {
        "user": ["bind"],
        "action": "route",
        "outbound": "direct"
      },
      {
        "port": 53,
        "action": "hijack-dns"
      },
      {
        "action": "hijack-dns",
        "protocol": "dns"
      },
      {
        "ip_is_private": true,
        "action": "route",
        "outbound": "direct"
      },
      {
        "action": "reject",
        "protocol": ["quic"]
      }
    ],
    "final": "direct",
    "auto_detect_interface": true,
    "default_domain_resolver": "internal"
  },
  "outbounds": [
    {
      "tag": "direct",
      "type": "direct"
    }
  ]
}
EOF
# 以root用户运行sing-box则不需要以下命令
useradd -r -s /usr/sbin/nologin singbox
chown -R singbox /opt/singbox
chgrp -R singbox /opt/singbox
chmod -R 755 /opt/singbox
# 给sing-box可执行权限
chmod u+x /opt/singbox/bin/sing-box
# root用户使用
chmod a+x /opt/singbox/bin/sing-box
```

- 配置文件模板:

```json
{
  "log": {
    "level": "info",
    "disabled": false,
    "timestamp": true,
    "output": "singbox.log"
  },
  "experimental": {
    "cache_file": {
      "enabled": true
    },
    "clash_api": {
      "external_controller": "0.0.0.0:9090",
      "external_ui": "ui",
      "external_ui_download_detour": "select",
      "external_ui_download_url": "https://github.com/MetaCubeX/Yacd-meta/archive/gh-pages.zip",
      "secret": "123456"
    }
  },
  "inbounds": [
    {
      "address": ["172.18.0.1/30", "fdfe:dcba:9876::1/126"],
      "auto_route": true,
      "interface_name": "tun0",
      "mtu": 9000,
      "stack": "mixed",
      "strict_route": true,
      "tag": "tun-in",
      "type": "tun"
    }
  ],
  "dns": {
    "final": "external",
    "strategy": "prefer_ipv4",
    "reverse_mapping": true,
    "servers": [
      {
        "tag": "external",
        "type": "tls",
        "server": "8.8.8.8",
        "server_port": 853,
        "detour": "select"
      },
      {
        "tag": "internal",
        "type": "udp",
        "server": "192.168.50.3",
        "server_port": 5353,
        "detour": "direct"
      }
    ],
    "rules": [
      {
        "domain_keyword": ["lzhlovelcl.top"],
        "action": "route",
        "server": "internal"
      }
    ]
  },
  "route": {
    "rules": [
      {
        "user": ["bind"],
        "action": "route",
        "outbound": "direct"
      },
      {
        "port": 53,
        "action": "hijack-dns"
      },
      {
        "action": "hijack-dns",
        "protocol": "dns"
      },
      {
        "ip_is_private": true,
        "action": "route",
        "outbound": "direct"
      },
      {
        "action": "reject",
        "protocol": ["quic"]
      }
    ],
    "final": "select",
    "auto_detect_interface": true,
    "default_domain_resolver": "internal"
  },
  "outbounds": [
    {
      "tag": "direct",
      "type": "direct"
    }
  ]
}
```

- 重点讲解

* dns.servers.address 应该设置为 bind9 监听的地址和端口

```json
"dns": {
    "servers": [
        {
          "tag": "internal",
          "type": "udp",
          "server": "192.168.50.3",
          "server_port": 5353,
          "detour": "direct"
        },
    ]
}
```

- route.rules 应该按顺序设置用户为 bind 的直接出站,目标端口或协议为 dns 应该设置为 dns 劫持

```json
"route": {
    "rules": [
            {
                "user": ["bind"],
                "action": "route",
                "outbound": "direct"
            },
            {
                "port": 53,
                "action": "hijack-dns"
            },
            {
                "action": "hijack-dns",
                "protocol": "dns"
            },
    ]
}
```

3. 配置 sing-box 守护进程

sing-box 守护进程有一个模板, 可以允许多个 singbox 实例运行

```bash
# "@"后面跟参数,会传入%i格式化字符
# CapabilityBoundingSet是网络设置权限,是systemctl自带的
cat > /usr/lib/systemd/system/sing-box@.service << EOF
[Unit]
Description=sing-box service
Documentation=https://sing-box.sagernet.org
After=network.target nss-lookup.target network-online.target

[Service]

CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH

ExecStart=/opt/singbox/bin/sing-box -D /opt/singbox/lib/%i -c /opt/singbox/%i.json run
ExecReload=/bin/kill -HUP \$MAINPID
Restart=on-failure
RestartSec=10s
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
EOF

# 设置一般的守护进程
# 如果要以root用户运行sing-box,则将User和Group字段去除即可
cat > /usr/lib/systemd/system/sing-box.service << EOF
[Unit]
Description=sing-box service
Documentation=https://sing-box.sagernet.org
After=network.target nss-lookup.target network-online.target

[Service]

CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_SYS_PTRACE CAP_DAC_READ_SEARCH

User=singbox
Group=singbox
ExecStart=/opt/singbox/bin/sing-box -D /opt/singbox/lib -c /opt/singbox/config.json run
ExecReload=/bin/kill -HUP \$MAINPID
Restart=on-failure
RestartSec=10s
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now sing-box.service
```

### 安装 bind9

1. 获取软件

```bash
apt install -y bind9 bind9-utils
```

**安装好之后配置文件在 /etc/bind,目录结构如下**

```
/etc/bind
|-- bind.keys
|-- db.0
|-- db.127
|-- db.255
|-- db.empty
|-- db.local
|-- named.conf
|-- named.conf.default-zones
|-- named.conf.local
|-- named.conf.options
|-- rndc.key
`-- zones.rfc1918
```

2. 设置配置文件

```bash
vim /etc/bind/named.conf.options
# 用该命令检查错误
named-checkconf

# 重载配置
systemctl reload named

# 查看端口是否监听
# 该命令也会显示什么用户在运行bind9,以此可以作为singbox放行的依据
lsof -i:5335
```

- 配置模板:

```C
options {
	directory "/var/cache/bind";

	// If there is a firewall between you and nameservers you want
	// to talk to, you may need to fix the firewall to allow multiple
	// ports to talk.  See http://www.kb.cert.org/vuls/id/800113

	// If your ISP provided one or more IP addresses for stable
	// nameservers, you probably want to use them as forwarders.
	// Uncomment the following block, and insert the addresses replacing
	// the all-0's placeholder.

	// forwarders {
	// 	0.0.0.0;
	// };

	//========================================================================
	// If BIND logs error messages about the root key being expired,
	// you will need to update your keys.  See https://www.isc.org/bind-keys
	//========================================================================
	dnssec-validation auto;

  // 监听端口和IP
	listen-on port 5335 {192.168.50.3;};
	allow-query {any;};
	recursion yes;
	allow-recursion {any;};
	recursive-clients 1024;
};

```

## 检验一下

```bash
systemctl enable --now sing-box.service
curl -i https://www.google.com
curl -i https://www.baidu.com
nslookup whoami.03k.org
# Server:         223.5.5.5
# Address:        223.5.5.5#53

# Non-authoritative answer:
# Name:   whoami.03k.org
# Address: 121.207.203.12
```

此处的 Address 就是递归服务器连接到权威 DNS 的 IP,理论上应该是你目前的宽带 IP, 这个项目我感觉用来讲解 singbox 的代理流程挺合适的,我真是~~循循善诱~~(挖坑大侠)

## 如果需要配置自动更新 sing-box 配置文件的功能,可以
