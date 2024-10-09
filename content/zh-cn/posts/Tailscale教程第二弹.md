+++
title = 'Tailscale教程第二弹'
date = 2024-10-08
draft = false
slug = 'tailscale-tutorial-2'
summary = '欲火焚身身在外,2T资源隔天涯,打洞穿透又失败,不如全都自己搞'
tags = ["内网穿透","tailscale","derper中继服务器"]
categories = ["内网穿透","tailscale"]
series = ["tailscale一点通"]
math = false
toc = true
comments = true
+++

## 前言

上回介绍了如何使用 tailscale 进行内网穿透，但是官方的中继服务器都在国外,直接导致打洞时间很长,而且万一没打成,官方的 2Mbps 的小水管真的会让人想死,于是就有了本期的自建 derp 服务器教程

[上期链接](https://vercel-blog.sifulin.top/zh-cn/2024/10/07/tailscale-tutorial-1/)

## 准备工作

首先准备一个域名,比如 derp.example.com,还有一个 VPS,然后把域名解析到 VPS 的公网 IP 上,这里我 VPS 的系统选择 Debian12

### 编译 derper 服务器

```bash
# 更新软件源并安装必要软件
apt-get update
apt-get curl wget vim sudo tar
# 创建目录
mkdir /opt/derp/bin
mkdir /opt/derp/config
mkdir /opt/derp/cert
mkdir /opt/go
```

因为 derper 服务器是需要由 go 语言编译的,所以需要安装[go](https://go.dev/dl/)

```bash
# 根据情况换新版本的go
wget https://go.dev/dl/go1.23.2.linux-amd64.tar.gz
# 还需要配置ssl证书,安装acme
curl https://get.acme.sh | sh -s email=1982209396@qq.com
# 解压go的压缩包
tar -zxvf go*.tar.gz -C /opt
# 临时环境变量
export PATH=$PATH:/opt/go/bin
# 永久环境变量添加
echo "PATH=$PATH:/opt/go/bin" >> /root/.bashrc
# 加载环境变量
source /root/.bashrc

go version
# 出现go version go1.23.2 linux/amd64说明成功了

# 确认编译目录
go env
# 找到GOPATH='/root/go',说明编译后的二进制文件会放在这个目录下

# 编译
go install tailscale.com/cmd/derper@latest
mv go/bin/derper /opt/derp/bin
chmod +x /opt/derp/bin/derper
```

### 申请 ssl 证书

```bash
# 设置acme自动更新证书
acme.sh --upgrade --auto-upgrade
# 导入cloudflare的token,不建议使用全局API Token,这里根据情况自己设置
echo "CF_Token="****************"" >> /root/.bashrc
# 设置默认的证书签发机构,根据情况选择
acme.sh --set-default-ca --server letsencrypt
# 申请证书,这里我的是泛域名证书,可以根据情况换成比如derp.example.com
acme.sh --issue --dns dns_cf -d example.com -d *.example.com --keylength ec-256
# acme申请好的证书不要直接动,应该使用install-cert命令安装到指定位置
acme.sh --install-cert -d sifulin.top --ecc \
--key-file       /opt/derp/cert/derp.example.com.key  \
--fullchain-file /opt/derp/cert/derp.example.com.crt
```

## 配置 derper 服务器

```bash
/opt/derp/bin/derper -h #查看命令
# -a是tls监听端口,stun-port端口主要用于测延迟,http-port为-1表示不监听http,证书存放在/opt/derp/cert目录下,且是手动更新证书,hostname则是准备好的域名

cat > /etc/systemd/system/derper.service << EOF
[Unit]

Description=Tailscale Derper RelayServer
BindsTo=tailscaled.service
After=tailscaled.service network.target

[Service]

User=root
Restart=always
ExecStart=/opt/derp/bin/derper -a=:4443 -stun-port=3478 -http-port=-1 -certmode=manual -hostname=derp.example.com -certdir=/opt/derp/cert -verify-clients
RestartSec=5
StartLimitInterval=0

[Install]

WantedBy=multi-user.target

EOF

systemctl daemon-reload
systemctl enable derper.service
```

### 广播 derper 服务器

进入 tailscale 的控制台,找到 derpMap 后按照如下配置编辑

```json
{
  "derpMap": {
    "OmitDefaultRegions": false,
    // 是否忽略官方服务器
    "Regions": {
      "900": {
        "RegionID": 900,
        "RegionCode": "<这里是Derp服务器所在城市缩写（城市代号）>",
        "RegionName": "<这里是Derp服务器所在城市全称>",
        "Nodes": [
          {
            "Name": "<Derp服务器的名称>",
            "RegionID": 900,
            "HostName": "derp.example.com",
            "STUNPort": 3478,
            "IPv4": "0.0.0.0/0", // 可忽略这条
            "IPv6": "[::]", // 可忽略这条
            "DERPPort": 8443
          }
        ]
      }
    }
  }
}
```

### 添加安全裤

由于这个服务器没有任何鉴权配置,如果端口域名泄露之后会被白嫖,这样是个人就可以榨干她的流~量~了,所以我们用-verify-clients 这条命令限制访问,这条命令生效的话需要使用 tailscale 服务,所以安装一下

```bash
# 添加tailscale源
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list
# 更新软件源并安装tailscale
sudo apt-get update
sudo apt-get install tailscale
# 设置自动更新
tailscale set --auto-update
# 因为没有子网路由需要配置,所以直接启动
tailscale up
# 启动一下ip转发不然只能打洞没法中继
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p
# 启动derper服务器
systemctl start derper.service
```

## 测试

随便找一个别的设备,进入终端输入

```bash
tailscale netcheck

Report:
	* UDP: true
	* IPv4: yes, <你当前这个测试主机的公网ip>
	* IPv6: yes, [<你当前这个测试主机的公网ipv6>]
	* MappingVariesByDestIP: true
	* PortMapping:
	* CaptivePortal: false
	* Nearest DERP: <这里是Derp服务器所在城市全称>
	* DERP latency:
		- <这里是Derp服务器所在城市缩写（城市代号）>: 34.2ms  (<这里是Derp服务器所在城市全称>)
		- tok: 120.8ms (Tokyo)
		- sfo: 129.3ms (San Francisco)
		- lax: 134.4ms (Los Angeles)
		- sea: 146.8ms (Seattle)
		- sin: 153.9ms (Singapore)
		- den: 155.8ms (Denver)
		- hkg: 160.3ms (Hong Kong)
		- ord: 173.9ms (Chicago)
		- tor: 188.2ms (Toronto)
		- mia: 189.6ms (Miami)
		- nyc: 189.7ms (New York City)
		- dfw: 190.4ms (Dallas)
		- hnl: 192.5ms (Honolulu)
		- fra: 211.2ms (Frankfurt)
		- ams: 212.7ms (Amsterdam)
		- par: 215.5ms (Paris)
		- lhr: 222.4ms (London)
		- waw: 234.7ms (Warsaw)
		- mad: 263.6ms (Madrid)
		- syd: 306.6ms (Sydney)
		- blr: 308.2ms (Bangalore)
		- sao: 316.2ms (São Paulo)
		- dbi: 318.4ms (Dubai)
		- jnb: 377.7ms (Johannesburg)
		- nai: 381.8ms (Nairobi)
```

出现你的服务器就 ok 了
