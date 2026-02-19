+++
title = 'kms激活windows'
date = 2026-02-20
draft = false
slug = 'windows_kms'
summary = '想不到有一天我能嫖上巨硬的羊毛啊'
tags = ["kms激活"]
categories = ["薅巨硬羊毛"]
series = ["薅巨硬羊毛"]
math = false
toc = true
comments = true
+++
## 前言

巨硬的尿性想必大家都知道, 典型的好用就给你删了, 但是这次还真的发现巨硬的一点良心, kms激活windows, 虽然部署异常复杂, 但好歹能用, 而且有大佬给了[开源方案](https://github.com/Wind4/vlmcsd/releases), 我一般在linux上部署vlmcsd-x64-musl-static这个版本, 下载后根据系统什么的找一下就有了, 这里再附上脚本, {{<enhence>}}注意这个脚本要首先创建vlmcsd文件夹, 并且创建bin子目录并将程序上传至bin目录下{{</enhence>}}

```bash
#!/bin/bash
set -e  # 遇到错误立即退出

# ======================== 颜色定义 ========================
RED='\033[31m'          # 红色（错误/警告）
GREEN='\033[32m'        # 绿色（成功）
YELLOW='\033[33m'       # 黄色（提示/警告）
BLUE='\033[34m'         # 蓝色（标题/步骤）
PURPLE='\033[35m'       # 紫色（强调）
NC='\033[0m'            # 重置颜色（恢复默认）

echo_red() { echo -e "${RED}$1${NC}"; }
echo_green() { echo -e "${GREEN}$1${NC}"; }
echo_yellow() { echo -e "${YELLOW}$1${NC}"; }
echo_blue() { echo -e "${BLUE}$1${NC}"; }
echo_purple() { echo -e "${PURPLE}$1${NC}"; }

# ======================== 脚本标题 ========================
echo_blue "============================================="
echo_purple "           vlmcsd 服务一键部署脚本           "
echo_blue "============================================="

# 定义核心路径变量（仅指向已存在的目录/文件）
VLMCSD_DIR="/opt/vlmcsd"
BIN_DIR="${VLMCSD_DIR}/bin"
VLMCSD_BIN="${BIN_DIR}/vlmcs-x64-musl-static"

# 检查是否为root用户执行
if [ $EUID -ne 0 ]; then
    echo_red "错误: 此脚本需要以root权限运行, 请使用 sudo 或切换到root用户"
    exit 1
fi

# 1. 创建系统用户（最小权限运行）
echo -e "\n$(echo_blue "[1/3] 创建vlmcsd系统用户...")"
if id "vlmcsd" &>/dev/null; then
    echo_yellow "提示: vlmcsd用户已存在, 跳过创建步骤"
else
    useradd -r -s /usr/sbin/nologin -d "${VLMCSD_DIR}" vlmcsd
    echo_green "✅ vlmcsd系统用户创建成功"
fi

# 2. 检查vlmcsd文件并设置权限
echo -e "\n$(echo_blue "[2/3] 检查并配置vlmcsd程序权限...")"
# 先检查文件是否存在
if [ ! -f "${VLMCSD_BIN}" ]; then
    echo_red "⚠️  错误: 未找到vlmcsd程序文件 ${VLMCSD_BIN}！"
    echo_yellow "  请确认文件路径正确且文件已存在"
    exit 1
fi

# 设置文件和目录权限（仅修改权限，不创建目录）
chown -R vlmcsd:vlmcsd "${VLMCSD_DIR}"
chmod u+x "${VLMCSD_BIN}"
chmod -R 755 "${VLMCSD_DIR}"
echo_green "✅ vlmcsd程序权限配置完成"
echo_yellow "  - 程序路径: ${VLMCSD_BIN}"
echo_yellow "  - 所属用户: vlmcsd"

# 3. 创建systemd服务文件并启动服务
echo -e "\n$(echo_blue "[3/3] 创建systemd服务文件并启动...")"
cat > /usr/lib/systemd/system/vlmcsd.service <<EOF
[Unit]
Description= kms emulator
After=network.target

[Service]
Type=forking
User=vlmcsd
Group=vlmcsd
PIDFile=/opt/vlmcsd/vlmcsd.pid
ExecStart=/opt/vlmcsd/bin/vlmcsd-x64-musl-static -p /opt/vlmcsd/vlmcsd.pid
ExecStop=/bin/kill -HUP $MAINPID
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 重新加载systemd并启动服务
systemctl daemon-reload
systemctl enable --now vlmcsd

# 检查服务状态
if systemctl is-active --quiet vlmcsd; then
    echo_green "✅ vlmcsd服务已成功启动并设置开机自启"
    echo_yellow "  - 服务端口: 1688 (默认KMS端口)"
else
    echo_red "⚠️  vlmcsd服务启动失败, 请执行 systemctl status vlmcsd 查看详细错误"
fi

# 输出使用提示
echo -e "\n$(echo_purple "=============================================")"
echo_green "              部署完成！                     "
echo_yellow "  程序路径: ${VLMCSD_BIN}"
echo_yellow "  查看服务状态: systemctl status vlmcsd     "
echo_yellow "  重启服务: systemctl restart vlmcsd        "
echo_yellow "  查看运行日志: journalctl -u vlmcsd -f     "
echo_yellow "  开放端口(可选): firewall-cmd --add-port=1688/tcp --permanent && firewall-cmd --reload"
echo_purple "============================================="
```

## windows真正激活

我一般都是装windows的专业版, {{<enhence>}}用管理员权限打开cmd{{</enhence>}}

[密钥列表](https://learn.microsoft.com/zh-cn/windows-server/get-started/kms-client-activation-keys?tabs=windows1110ltsc%2Cwindows81%2Cserver2025%2Cversion1803)
```bash
slmgr /ipk <密钥>
slmgr /skms <kms服务器地址>
slmgr /ato
```
ok,这就完事了

## office激活

先去下载office部署工具, 这个是[网址](https://www.microsoft.com/en-us/download/details.aspx?id=49117), 下载后在桌面创建个文件夹office, 把这个部署工具安装到这个文件夹里面就行, 之后还是{{<enhence>}}用管理员权限打开cmd{{</enhence>}}并进入这个文件夹

在来个配置文件, 到[这个网址](https://config.office.com/deploymentsettings)设置一个所需office软件的xml文件, 按需选择好后导出xml文件, 放到桌面的office文件夹下

之后就是漫长的下载安装了

```bash
setup /download config.xml
setup /configure config.xml
```
都搞好后进入office的目录, **"C:\Program Files\Microsoft Office\Office16"**

```bash
cd "C:\Program Files\Microsoft Office\Office16"
cscript ospp.vbs /sethst:kms.example.com
cscript ospp.vbs /act
```