+++
title = 'Maridb配置指南'
date = 2025-01-11
draft = false
slug = 'maridb-configuration'
summary = 'mariadb远程连接操作指南'
tags = ["mysql","mariadb","debian"]
categories = ["从mysql到csv"]
series = ["mariadb配置指北"]
math = false
toc = true
comments = true

+++

## 缘起

前些天因为一些原因需要在 debian 上配置 mariadb,~~精通纯手动安装的我~~(只会 apt install 的废物)认为可以轻轻松松,结果搞半天发现没有办法远程连接,查了一堆资料后终于搞清了,这里记录一下

## 安装 mariadb

```bash
apt update
apt install -y mariadb-server
# 安全安装,
# 设置root密码;
# 是否允许root远程登陆;
# 是否启用匿名用户;
# 是否删除测试数据库;
sudo mysql_secure_installation
```

### 究极关键的配置

此时如果查看端口会发现 mariadb 仅监听了 localhost 的 3306 端口,这意味着只有本地能访问数据库

```bash
lsof -i:3306 # 查看监听端口的情况
```

此时需要编辑{{<quote>}}/etc/mysql/mariadb.conf.d/50-server.cnf{{</quote>}}的 bind-address 项

```bash
vim /etc/mysql/mariadb.conf.d/50-server.cnf
# 修改 bind-address = 127.0.0.1 为 bind-address = 0.0.0.0
# 保存退出后重启 mariadb
systemctl restart mariadb
lsof -i:3306 # 查看监听端口的情况, 如果此时修改生效应该可以看到你修改的ip@3306
```

### 还没完,用户的远程访问还要设置

```bash
mysql -u root -p # 登录数据库
```

登录数据库后创建数据库新建远程访问的用户

```sql
-- 创建mydb数据库,字符编码为utf8mb4,排序为utf8mb4_general_ci
CREATE DATABASE mydb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 创建用户,用户名为newuser,密码为123456,仅允许本地访问
-- 允许远程访问可将localhost改为指定的IP,通配则是"%"
CREATE USER 'newuser'@'localhost' IDENTIFIED BY '12456';

-- 授予本地登录的newuser对mydb的所有权限
GRANT ALL PRIVILEGES ON mydb.* TO 'newuser'@'localhost';
-- 使权限生效
FLUSH PRIVILEG
```

## 迁移数据库

mariadb 默认的数据库存储位置位于{{<quote>}}/etc/mysql/mariadb.conf.d/50-server.cnf{{</quote>}}的 datadir 字段,如果要迁移到其他位置,需要修改这个字段,将该目录下所有文件复制到目标文件夹, 然后重启 mariadb
