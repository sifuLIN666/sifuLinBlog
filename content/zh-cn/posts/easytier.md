+++
title = '初探easytier'
date = 2025-05-04
draft = false
slug = 'easytier'
summary = '还不错的国产内网穿透工具'
tags = ["easytier","内网穿透"]
categories = ["内网穿透","easytier玩法"]
series = ["easytier玩法"]
math = false
toc = true
comments = false
+++

## 介绍

之前介绍了 tailscale, zerotier 等等内网穿透工具, 但是这些都需要收费, 即便自建了也只是帮助打洞而已, 并不是真正的无限制, 虽然一般免费的也够用, 但我就是不爽, 特别是他们都是国外的项目, 服务器也都是国外, 打洞速度我感觉有点慢, 虽然自建 derp 服务器或者 moon 服务器可以解决这个问题, 但是感觉有点麻烦, 于是我发现了一个未来可期的国产项目, [easytier](https://easytier.cn/), 而且他还有[社区文档](https://doc.oee.icu:60009/web/#/625560517/103293282), [QQ 群](https://qm.qq.com/cgi-bin/qm/qr?authKey=uKFKHV5iThwYa6spoqKBw8L%2FfHl3f%2FMjgV4k96wo9H2GCo78ezuF9yQBsbKStwug&k=DS4Z5Gf6ZW_RbODkQ1LstVcQ-V0XdXcB&noverify=0)等, 我感觉挺不错的

## 安装

首先[下载](https://easytier.cn/guide/download.html), 选择自己对应的机型下载, 或者直接前往 github 的 release 页面下载, 我是下载的 zip 压缩包, 解压后里面有三个文件, `easytier-core`, `easytier-cli`, `easytier-web`, 其中核心是`easytier-core`, `easytier-cli` 是命令行工具, 用于查看`easytier-core`的运行配置的, `easytier-web` 是 web 端, 通过 web 控制核心的行为

```bash
mkdir -p /opt/easytier/bin
```

我们首先将其上传到我们的内网网关机器上, 这里我将`easytier-core`, `easytier-cli`上传到`/opt/easytier/bin`目录下, 然后赋予可执行权限

```bash
chmod +x /opt/easytier/bin/easytier-core
chmod +x /opt/easytier/bin/easytier-cli
cat >> /opt/easytier/config.toml << EOF
instance_name = "easytier"
instance_id = "f4e293fc-c3b1-4c0c-a1f8-91a4367ee177"
dhcp = true
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
]
rpc_portal = "0.0.0.0:0"
routes = ["192.168.50.0/24"]

[network_identity]
network_name = "easytier"
network_secret = "@W5028sr5026"

[[peer]]
uri = "tcp://103.40.14.90:11010"

[[peer]]
uri = "udp://103.40.14.90:11010"

[[proxy_network]]
cidr = "192.168.50.0/24"

[flags]
dev_name = "et_0"
relay_all_peer_rpc = true
EOF

cat >> /usr/lib/systemd/system/easytier.service << EOF
[Unit]
Description=EasyTier Service
After=network.target syslog.target
Wants=network.target

[Service]
Type=simple
ExecStart=/opt/easytier/bin/easytier-core -c /opt/easytier/config.toml

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now easytier
# 如果要代理内网机器的话还要开启ipv4转发
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
```

### 配置文件

```toml
instance_name = "easytier"
instance_id = "f4e293fc-c3b1-4c0c-a1f8-91a4367ee177"
dhcp = true # 虚拟网的IP

# 监听的端口和地址
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
]

# rpc的管理端口
rpc_portal = "0.0.0.0:0"

# 代理的局域网网段需要设置的路由,即告诉easytier这个网络中有关此网段的请求路由到这个节点
routes = ["192.168.50.0/24"]

[network_identity]
network_name = "easytier" # 网络的名称, 可以自定义
network_secret = "@W5028sr5026"

[[peer]]
uri = "tcp://public.easytier.cn:11010" # 节点的uri

[[peer]]
uri = "udp://public.easytier.cn:11010"

[[proxy_network]]
# 代理的局域网网段
cidr = "192.168.50.0/24"

[flags]
# 设置tun网卡名称
dev_name = "et_0"
# 此项是允许转发RPC, 有助于其他网络的节点打洞成功
relay_all_peer_rpc = true
```

到这里就算部署好了, 其他设备的只需要设置相同 peer 节点和网络名称密钥就可以组网了

## 自建节点

easytier 支持自建节点, 自建节点同样需要先下载好`easytier-core`和`easytier-cli`, 不过与 tailscale 和 zerotier 不同的是, easytier 中每个节点都是对等的, 即不需要特别的配置都会帮助网络中的其他机器进行组网, 所以自建 easytier 节点只需要改变配置文件即可

```toml
instance_name = "easytier"
instance_id = "fc5b0c98-f580-49d7-b0ba-6028895d8022"
dhcp = true
listeners = [
    "tcp://0.0.0.0:11010",
    "udp://0.0.0.0:11010",
]
rpc_portal = "0.0.0.0:15888"
# wg为wireguard监听,目前easytier没有ios客户端,只能通过wireguard直接接入
# xxx.xxx.xxx.xxx为此机器的公网ip, 端口则为Nat的端口而非实际监听的端口
mapped_listeners = ["tcp://xxx.xxx.xxx.xxx:11010","udp://xxx.xxx.xxx.xxx:11010","wg://xxx.xxx.xxx.xxx:22023"]
[network_identity]
network_name = "easytier"
network_secret = "@W5028sr5026"

# 由于该节点自己就具有公网IP, 因此不需要加入公共节点组成的发现网络中
# [[peer]]
# uri = "tcp://public.easytier.top:11010"

[vpn_portal_config]
client_cidr = "10.10.10.0/24"
wireguard_listen = "0.0.0.0:22023"

[flags]
relay_all_peer_rpc = true
```

之后启动,同样在客户端输入相同的网络名称密钥,并且 peer 节点输入该机器的公网 IP 和映射端口即可
