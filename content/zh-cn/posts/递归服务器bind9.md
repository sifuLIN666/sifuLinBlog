+++
title = '递归DNS服务器bind9'
date = 2024-10-08
draft = false
slug = '递归服务器bind9'
summary = '一种在自己家里搭建223.5.5.5的脱裤子放屁行为'
tags = ["DNS","递归DNS","bind9"]
categories = ["bind9教程"]
series = ["DNS从入门到223.5.5.5"]
math = false
toc = true
comments = true
+++

## 前言

DNS 想必大家并不陌生,但是在主机上设置好 DNS 服务器后,比如 223.5.5.5,那么 223.5.5.5 是怎么找到目标域名的 ip 的呢?全世界那么多网站,要是全依赖 223.5.5.5 的话,那岂不是要炸了?所以肯定是分布式的存储,那么问题来了,DNS 的分布式存储结构是什么样的呢?我们先来看一幅图:

![dns访问流程图](https://s1.locimg.com/2024/10/09/ff50765d9dcdd.png)

注意到这张图要访问的{{< enhence >}}www.baidu.com.{{< /enhence >}}注意这个{{< enhence >}}"."{{< /enhence >}}很重要,其实在所有的网站后面都会有这个{{< enhence >}}"."{{< /enhence >}},这个其实就是根域名,根域名指向的服务器其实就是根服务器,他是 13 个固定的 ip 地址,在 DNS 请求的时候 223.5.5.5 首先会询问根服务器,根服务器会告知.com. 服务器的 ip,之后 223.5.5.5 会问.com. 服务器,.com. 服务器存储着诸如 baidu.com. 的 DNS 服务器的 ip,之后 223.5.5.5 会问存有 baidu.com. 的 DNS 服务器,这些服务器最终返回存储有 {{< enhence >}}www.baidu.com.{{< /enhence >}} 的 ip 的 DNS 服务器,最终 223.5.5.5 去问这个服务器得到 {{< enhence >}}www.baidu.com.{{< /enhence >}} 的 ip,这就可以完成域名解析了.

在这个过程中,PC 发给 223.5.5.5 的请求叫做转发,而 223.5.5.5 的查询过程叫做递归,其中最终查到的{{< enhence >}}www.baidu.com.{{< /enhence >}}的 DNS 服务器就叫做权威 DNS 服务器.

### 递归服务器的优势

其实从上面的结果中不难看出,递归查询需要查询多轮,时间上肯定会比转发要长,那我们搭建递归 DNS 服务器有什么意义呢?我们不妨退一步,换个问题,都用公共 DNS 的话,选择哪个 DNS 有什么区别吗?首先我们不考虑延迟这个问题,就返回的解析结果来考虑,不同的 DNS 服务器可能返回不一样的结果。一个常见的场景是,很多域名使用了 CDN,解析结果根据所在地 IP 来返回,比如你是广东电信,返回在广东电信的服务器地址,而在北京联通就返回北京联通的地址,就结果而言,在东南沿海的你显然不希望查询到了一个新疆 CDN 的 ip。虽然有 ECS 这种协议存在(DNS ECS 是 DNS 协议的一个扩展,它允许递归 DNS 解析器在发送给权威 DNS 服务器的请求中包含终端用户 IP 地址数据的部分),但首先它是用在递归 DNS 上的,也就是部署在 114 这种公共服务器上的,其次你请求的域名所在的权威 DNS 要支持 ECS 协议才可以,说白了这个协议对局域网用户来说没什么用,因为你什么都做不了,甚至还可能有隐私泄露的问题。那如果使用自己的递归 DNS 服务器,即把 114 这样的 DNS 服务器装你家里。这样你的每个请求都非常的原生地到达了权威 DNS 服务器,权威 DNS 根据你自建的递归 DNS 的 ip 返回离你最近的 CDN 的 ip,其结果可谓是准确中的准确。你再也不需要对 DNS 服务器进行收集和测速，也不需要对解析结果进行测速,本来就是权威 DNS 根据你家里递归 DNS 发起递归请求的 ip 返回的最优结果,测了也没意义。

还有一个不太常见的问题就是,公共 DNS 服务器值得信任吗?虽然有 DNSSEC 这种东西存在,但它并不能解决 DNS 劫持和污染,你除了知道它结果可能是错的之外什么都做不了。即使 DNS 结果值得信任,但你的查询记录可能会被公共 DNS 服务器记录日志,也就是可能会造成一定的隐私问题。一个更加离谱的可能是,如果公共 DNS 服务器被攻击,那你的查询结果可能被引导到恶意网站,就算这种可能性比较低,公共 DNS 服务器也有故障的时候,你可能又开始考虑:我能保证谁的公共 DNS 服务器 100%稳定性?是的,不能保证。但当你拥有一台属于自己的递归 DNS 服务器的时候,稳定性和隐私问题将由你自己掌控。

## 搭建内网递归 DNS 服务器

这里选用 bind9 作为递归服务器,因为 apt 软件源中就有 bind9,而且他还可以配置为权威 DNS 服务器,所以非常方便。

```bash
apt-get install -y bind9*
# 安装好之后配置文件在 /etc/bind,目录结构如下
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

主文件为{{< quote >}}name.conf{{< /quote >}},其配置文件格式为 C 风格

```bind
// This is the primary configuration file for the BIND DNS server named.
//
// Please read /usr/share/doc/bind9/README.Debian for information on the
// structure of BIND configuration files in Debian, *BEFORE* you customize
// this configuration file.
//
// If you are just adding zones, please do that in /etc/bind/named.conf.local

include "/etc/bind/named.conf.options"; // 监听配置文件
include "/etc/bind/named.conf.local"; // 自定义域名文件
include "/etc/bind/named.conf.default-zones"; // 存储根服务器IP以及回环地址内网网段的信息
```

### 配置监听文件

```bind
options {
    // 缓存文件夹
	directory "/var/cache/bind";

	// If there is a firewall between you and nameservers you want
	// to talk to, you may need to fix the firewall to allow multiple
	// ports to talk.  See http://www.kb.cert.org/vuls/id/800113

	// If your ISP provided one or more IP addresses for stable
	// nameservers, you probably want to use them as forwarders.
	// Uncomment the following block, and insert the addresses replacing
	// the all-0's placeholder.

	// forwarders {
	//  	223.5.5.5;
	// };

	//========================================================================
	// If BIND logs error messages about the root key being expired,
	// you will need to update your keys.  See https://www.isc.org/bind-keys
	//========================================================================

    // 开启DNSSEC验证,讲道理在内网里面自己用的话这个没啥意义
	dnssec-validation auto;
	listen-on { localhost; }; // 监听本地所有IP
	allow-query { any; }; // 允许所有IP的DNS请求
	recursion yes; // 开启递归查询
	allow-recursion { any; }; // 允许所有IP都使用递归查询
	recursive-clients 1024; // 最大递归查询客户端数量
};
```

### 配置自定义域名文件

如果有一些特殊需求,比如内网很多服务,其实是可以直接用内网 DNS 服务器避免回环问题的,而且诸如谷歌 TV 激活的 ntp 服务器也可以很方便用内网 DNS 服务器进行 host 劫持,我在这里举一个例子
在{{< quote >}}name.conf.local{{< /quote >}}添加如下

```bind
// rfc1918主要包含是内网的ip地址段,也就是如果需要由IP解析域名的时候,通过配置这个文件可以马上得到IP所对应的域名而不需要到公网上去反向解析域名,本来就是内网部署,到公网去反向解析简直抽象,这个根据情况可以放开注释
// include "/etc/bind/zones.rfc1918";

zone "lzhlovelcl.top" {
	type master;
	file "/etc/bind/db.example.com";
};
```

添加好之后,创建配置文件{{< quote >}}db.example.com{{< /quote >}}

```bash
touch /etc/bind/db.example.com
```

添加如下内容,各参数意义如下

1. SOA: 起始记录
2. NS: 名称服务器记录
3. A: ipv4 记录
4. IN: 网络记录
5. TTL: 存活时间

```bind
$TTL	604800 # 设置变量
# 注意邮箱的@的符用.代替,@在这里表示所有域名起始记录的解析.
@	IN	SOA	lzhlovelcl.top. 1982209396.qq.com. (
			      2		; Serial
			 604800		; Refresh
			  86400		; Retry
			2419200		; Expire
			 604800 )	; Negative Cache TTL
;
@	        IN	NS	dns.example.com. # 指定example.com由dns.example.com解析
dns         IN  A   192.168.50.6 # 指定dns.example.com的IP
@	        IN	A	192.168.50.4 # 指定example.com的IP
plex	    IN	A	192.168.50.4 # 指定plex.example.com的IP
lucky	    IN	A	192.168.50.4
portainer	IN	A	192.168.50.4
jellyfin	IN	A	192.168.50.4
alist	    IN	A	192.168.50.4
aria2	    IN	A	192.168.50.4
```

这里只是简单示范,更具体的欢迎看这个大佬的[文章](https://blog.51cto.com/weiyigeek/5666940)

```bash
# 检测配置文件是否正确
named-checkconf
# 默认监听53端口,确保没有被占用
systemctl enable --now named
nslookup whoami.03k.org 223.5.5.5 # 测试223.5.5.5换成你装了bind9的主机的IP
# Server:         223.5.5.5
# Address:        223.5.5.5#53

# Non-authoritative answer:
# Name:   whoami.03k.org
# Address: 47.103.54.202 这个就是递归服务器连接到权威DNS的ip,可以复制进浏览器看看ip属地
# ;; Got SERVFAIL reply from 223.5.5.5
```

至此部署完毕,这个项目其实也可以和 singbox 联动形成一个国内国外通吃的超级 dns 服务器,有空再说吧
