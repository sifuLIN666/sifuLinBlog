+++
title = 'Tailscale教程第一弹'
date = 2024-10-07
draft = false
slug = 'tailscale-tutorial-1'
summary = '欲火焚身身在外,2T资源隔天涯,域名绑定终不便,唯有穿透合我意'
tags = ["内网穿透","tailscale"]
categories = ["内网穿透","tailscale"]
series = ["tailscale一点通"]
math = false
toc = true
comments = true
+++

## 介绍

之前给大家介绍过 zerotier 内网穿透的方案,虽然 zerotier 很方便,但是他在 windows 下卸载不干净会出现残留,如果此时下载新版本的 zerotier 会导致无法使用,~~那你不卸载不就没事了~~,所以今天给大家介绍一个新的内网穿透工具,同样非常强大的 tailscale

## 安装

[tailscale 官方安装教程](https://tailscale.com/download/linux)

```bash
# debian12 安装
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.noarmor.gpg | sudo tee /usr/share/keyrings/tailscale-archive-keyring.gpg >/dev/null
curl -fsSL https://pkgs.tailscale.com/stable/debian/bookworm.tailscale-keyring.list | sudo tee /etc/apt/sources.list.d/tailscale.list

sudo apt-get update
sudo apt-get install tailscale
```

当然,他们也有一键安装脚本

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

## 启动

```bash
# --advertise-routes: 公布子网路由
# --accept-routes: 允许发现其他子网路由
# --accept-dns: 启用魔法DNS,会覆写/etc/resolv.conf文件,配置不好容易查不到dns断网
# --netfilter-mode: 这个选项效果类似iptables的功能,不熟这个可以关掉然后用iptables或者nftables配置四表五链
tailscale up --netfilter-mode=off --advertise-routes=192.168.50.0/24 --accept-routes --accept-dns=false
# 设置自动更新
tailscale set --auto-update
```

启动之后会出现一个网址,把那个网址在浏览器中打开按照提示操作即可,之后进入 tailscale 的控制界面,把 key expire 关掉,不然这个节点会被自动踢出网络,然后在开启子网路由

<img src="https://gitee.com/Linsifu/pic-embed/raw/master/images/tailscale-steps.png" />

这样之后就可以访问到内网了

## 万全之策

经过上面的一顿操作,你会发现内网设备还是不能通过它访问外网,而且外网也不能通过他访问内网其他设备,为什么咧?因为防火墙
没配置放行规则,所以需要配置一下

```bash
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
sysctl -p #查看配置是否生效

# 设置nftables的配置文件
cat > /etc/nftables.rules <<EOF

table ip filter {
}
table ip nat {
}
table ip6 filter {
}
table ip6 nat {
}
table inet filter {
	chain forward {
		type filter hook forward priority filter; policy accept;
		iif "ens18" accept
		oif "ens18" accept
		iif "tailscale0" accept
		oif "tailscale0" accept
	}
}
table inet nat {
	chain postrouting {
		type nat hook postrouting priority srcnat; policy accept;
		oif "ens18" masquerade
		oif "tailscale0" masquerade
	}
}

EOF

```

由于每次重启之后 nftables 的规则会失效,我们使用 systemctl 服务控制 nftables 的加载规则行为

```bash
cat > /etc/systemd/system/tailscale-gateway.service <<EOF
[Unit]
Description=Run script after tailscale0 appears
BindsTo=tailscaled.service
After=tailscaled.service network.target

[Service]
Type=oneshot
ExecStart=nft -f /etc/nftables.rules
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target

EOF
systemctl daemon-reload
systemctl enable tailscale-gateway
```

如此一来这台主机就可以成为建立内外网沟通的桥梁了,如果要由 A 地的 192.168.50.0/24 网段访问 B 地的 192.168.51.0/24 网段,那么只需要在 A 地要访问 B 地的设备添加一条路由将 192.168.51.0/24 网段路由到 A 地的 tailscale 节点主机即可
