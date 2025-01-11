+++
title = '初识singbox'
date = 2024-06-07
draft = false
slug = 'introduce-singbox-part1'
summary = "撑着油纸伞,独自彷徨在悠长,悠长又寂寥的墙内,我希望逢着一个丁香一样地水多活好singbox"
tags = ["singbox","科学上网"]
categories = ["singbox十点不通"]
series = ["singbox:从入门到clash"]
math = false
toc = true
comments = true
+++

{{< youtube "oQP44BdSsl8" >}}

## 前言

前段时间几乎"大地震",clash 归档的归档,删库的删库。只能在此给大佬祝好!

但是,失去了 clash,我们还能用什么连接到世界呢？~~当然是把你现在有的 clash 软件归档存好啦~~

好吧,其实 clash 删库影响没有那么大,各个平台都有非常好用的软件,比如 windows,mac 还可以用[v2ray](https://www.v2ray.com/),[nekoray](https://github.com/MatsuriDayo/nekoray)这些软件,但真正苦的其实是像我这种垃圾佬,我们这些人饱受换源之苦,代理之痛,可又经常换设备折腾,搞新系统蹂躏,所以我就~~妄图一次配置就能享受坐上来自己动的极致舒爽~~。也就是透明代理啦~

之前我出过在 debian 部署[v2raya](https://v2raya.org/)的教程,但是当时我正好出了我自用的 j1800,购入了~~性能极为强悍的 j1900~~(主要是为了多网口才换的),而 clash 删库正好发生在我卖出了 j1800,等待 j1900 的空挡期

哈哈笑死,不存档的后果。

拿到手之后我第一时间配置 v2raya,结果那时候他的软件源直接失效了

哈哈笑死,不存档的后果

虽然最后还是去 git 上直接下了源代码上传配置好了。

但为了不重蹈"哈哈笑死,不存档的后果",我决定养成存档的习惯,同时 clash 删库让我明白~~自古专一没结局,终是海王赢天下~~,所以我顺便研究了一下最近超强内核[sing-box](https://sing-box.sagernet.org/zh/)的使用方法。

结果发现这玩意直接把我之前的方案干碎了,~~废话,手搓玩家基本都是要啥自己建啥~~,居然说了这么多废话...现在开始教程吧

## 由我提供的一站式部署教程

### 开个 ip 转发先

```shell
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
```

### 配置文件指南  

[配置文件链接](https://wwxc.lanzouy.com/i2K8r1eenpwf)

下载后在里面的"singboxONE"的配置文件"config.json"添加你自己的代理配置,我在文件夹里面已经有 ss,vmess,trojan 的模板。

### 注意事项

有时代理节点是域名,结果域名在 geosite 里面属于国外域名,会被 dns 分流到代理出站,但是此时 singbox 并不知道代理节点的 IP,于是就会死循环,解决这个问题需要在 dns 配置下添加一条规则

```json
 "dns": {
    "servers": [
    ],
    "rules": [
      { "outbound": "any", "server": "local" }
    ],
    "strategy": "prefer_ipv4",
    "final": "google",
    "disable_cache": false,
    "disable_expire": false,
    "independent_cache": false,
    "reverse_mapping": false
  },
```

根据测试结果,dns 配置文件的规则是没有像 clash 那样的先后顺序的(可能不对,希望懂哥来解释一下这个 any 的机制)

### 常见代理配置模板

1. ss 模板

```json
    {
      "type": "shadowsocks",
      "tag": "proxy",
      "server": "自己的",
      "server_port": 45144, //自己的端口
      "method": "自己的",
      "password": "自己的"
    },
```

2. vmes 模板

```json
{
  "type": "vmess",
  "tag": "proxy",
  "server": "换你自己的",
  "server_port": 123, //自己的端口
  "uuid": "换你自己的",
  "security": "auto",
  "transport": {
    "type": "ws",
    "path": "/",
    "early_data_header_name": "Sec-WebSocket-Protocol"
  }
}
```

3. trojan 模板

```json
{
  "type": "trojan",
  "tag": "proxy",
  "server": "自己的",
  "server_port": 4203, //自己的端口
  "password": "自己的",
  "tls": {
    "enabled": true,
    "disable_sni": false,
    "server_name": "自己的",
    "insecure": true
  }
}
```

完成之后确保 singboxONE 有如下文件

1. config.json
2. geoip.db
3. geosite.db
4. sing-box
5. sing-box.service

```bash
# 创建日志和配置文件夹以及存放geo数据库
mkdir -p /var/singbox
mkdir -p /var/lib/sing-box
mkdir -p /usr/local/etc/sing-box
chmod -R +w /var/singbox
# 将软件以及配置还有geo数据库移动到对应文件夹
mv singboxONE/sing-box /usr/local/bin
mv singboxONE/sing-box.service /usr/lib/systemd/system
mv singboxONE/config.json /usr/local/etc/sing-box
mv singboxONE/geoip.db /var/lib/sing-box
mv singboxONE/geosite.db /var/lib/sing-box
# 赋予singbox二进制文件可执行权限
chmod +x /usr/local/bin/sing-box
```

重载系统服务并开启 sing-box

```bash
# 重载systemctl配置否则下面开启singbox的命令是无效的
systemctl daemon-reload
# 开启sing-box
systemctl start sing-box.service
systemctl enable sing-box.service
systemctl status sing-box.service
```

## singbox 劫持 host

### singbox 中设置 host 劫持

sing-box 劫持 host 需要在 route 配置中添加域名规则并结合出站配置使用

并且注意!!!

{{<enhence>}}route 模块的规则有先后顺序,先匹配到先出站{{</enhence>}}

具体操作很简单,在出站设置一个直连出站并覆写 IP 地址和端口,最后在路由的规则中添加一条域名规则,匹配到这条规则就走自定义的出站

```json
{
  "log": {
    "disabled": false,
    "level": "info",
    "output": "/var/singbox/box.log",
    "timestamp": true
  },
  "dns": {
    "servers": [],
    "rules": [{ "outbound": "any", "server": "local" }],
    "strategy": "prefer_ipv4",
    "final": "google",
    "disable_cache": false,
    "disable_expire": false,
    "independent_cache": false,
    "reverse_mapping": false
  },
  "inbounds": [
    {
      "type": "tun",
      "tag": "tun-in",
      "inet4_address": "172.19.0.1/30",
      "mtu": 1400,
      "auto_route": true,
      "strict_route": false,
      "stack": "system",
      "sniff": true,
      "sniff_override_destination": false
    }
  ],
  "outbounds": [
    {
      "type": "direct",
      "tag": "direct"
    },
    {
      "type": "direct",
      "tag": "hosthijack",
      "override_address": "192.168.234.3",
      "override_port": 9093
    },
    {
      "type": "block",
      "tag": "block"
    },
    {
      "type": "dns",
      "tag": "dns-out"
    }
  ],
  "route": {
    "geoip": {
      "download_url": "https://github.com/soffchen/sing-geoip/releases/latest/download/geoip.db",
      "download_detour": "proxy"
    },
    "geosite": {
      "download_url": "https://github.com/soffchen/sing-geosite/releases/latest/download/geosite.db",
      "download_detour": "proxy"
    },
    "rules": [
      {
        "protocol": "dns",
        "outbound": "dns-out"
      },
      {
        "protocol": ["quic"],
        "outbound": "block"
      },
      { "domain": "自定义域名", "outbound": "hosthijack" }
    ],
    "auto_detect_interface": true
  }
}
```
