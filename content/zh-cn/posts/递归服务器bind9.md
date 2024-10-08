+++
title = '递归DNS服务器bind9'
date = 2024-10-08
draft = false
slug = '递归服务器bind9'
summary = 'Article Description'
tags = ["DNS","递归DNS","bind9"]
categories = ["bind9教程"]
series = ["DNS从入门到223.5.5.5"]
math = false
toc = true
comments = true
+++

## 前言

DNS 想必大家并不陌生,但是在主机上设置好 DNS 服务器后,比如 223.5.5.5,那么 223.5.5.5 是怎么找到目标域名的 ip 的呢?全世界那么多网站,要是全依赖 223.5.5.5 的话,那岂不是要炸了?所以肯定是分布式的存储,那么问题来了,DNS 的分布式存储结构是什么样的呢?我们先来看一幅图:

![dns访问流程图]()

注意到这张图要访问的`www.baidu.com.`注意这个`.`很重要,其实在所有的网站后面都会有这个`.`,这个其实就是根域名,根域名指向的服务器其实就是根服务器,他是 13 个固定的 ip 地址,在 DNS 请求的时候 223.5.5.5 首先会询问根服务器,根服务器会告知.com 服务器的 ip,之后 223.5.5.5 会问.com 服务器,.com 服务器存储着诸如 baidu.com 的 DNS 服务器的 ip,之后 223.5.5.5 会问存有 baidu.com 的 DNS 服务器,这些服务器最终返回存储有 www.baidu.com 的 ip 的 DNS 服务器,最终 223.5.5.5 去问这个服务器得到 www.baidu.com 的 ip,这就可以完成域名解析了.

在这个过程中,PC 发给 223.5.5.5 的请求叫做转发,而 223.5.5.5 的查询过程叫做递归,其中最终查到的www.baidu.com的DNS服务器就叫做权威DNS服务器.

### 递归服务器的优势
