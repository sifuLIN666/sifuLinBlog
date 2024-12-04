+++
title = 'C++解析配置文件库'
date = 2024-12-04
draft = false
slug = 'CPPlibconfigguide'
summary = 'Article Description'
tags = ["C++","libconfig","apt"]
categories = ["C++破防记录"]
series = ["C++从入门到入土"]
math = false
toc = true
comments = true

+++

## 前言

对于项目开发而言,配置文件至关重要,那就需要一个工具可以解析多种配置文件,于是我看上了C++的libconfig,但是这玩意默认不是cmake,在破防一下午之后,发现它可以直接从apt管理包中下载...

## 安装libconfig

```bash
apt-get install -y libconfig++-dev
# 通过dpkg -L查找他的安装路径方便集成进自己的项目中
dpkg -L libconfig++-dev
```

