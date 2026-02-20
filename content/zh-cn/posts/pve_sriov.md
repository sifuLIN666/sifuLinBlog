+++
title = 'pve开启sriov给omv做解码'
date = 2026-02-20
draft = false
slug = 'pve_sriov'
summary = '想不到有天还能薅上英特尔的羊毛'
tags = ["pve","sriov"]
categories = ["pve从入门到入土"]
series = ["pve从入门到入土"]
math = false
toc = true
comments = true
+++

## 前言
核显直通一直是nas玩家的痛点之一, 而且就算直通了, 一台电脑也就一个核显, 撑死在来个独显, 实在是捉襟见肘啊。有没有办法让核显先cpu一样可以虚拟化咧? 诶,有的兄弟有的, 把pve开启sriov, 虚拟出7个~~小矮人~~核显, 分给不同的虚拟机使用, 不过这样会不会损失性能, 我没试过, b站上应该有测试视频, 可以搜一下, 我记得是不会有损失的, 是抢占式的逻辑调用核显。

## 开始

### 查看pve版本和内核版本

这步至关重要, 直接决定你的i915能不能成功编译。ssh连接pve输入

```bash
pveversion
```

如果想更换内核版本, 跟着下面的操作

```bash
apt update
apt-cache search pve-kernel
```

找到你想安装的内核版本, 狠狠地安装!

```bash
apt install pve-kernel-6.5.13-1-pve # 版本选你看上的

update-grub # 更新一下引导配置

proxmox-boot-tool kernel pin 6.5.13-1-pve   # 固化这个版本的内核

proxmox-boot-tool kernel list   # 检查是否固化成功

## 检查Pinned kernel输出是不是你的目标内核版本

apt install pve-headers-6.5.13-1-pve # 安装此内核版本头文件

apt install proxmox-headers-$(uname -r) # 或者输入这个命令, 这个是完整的文件名称, 有时候pve-header搜不到, $(uname -r)则是当前内核版本
```

### 开启iommu

进入{{<quote>}}/etc/default/grub{{</quote>}}目录, 将{{<quote>}}GRUB_CMDLINE_LINUX_DEFAULT="quiet i915.enable_guc=3 i915.max_vfs=7 module_blacklist=xe"{{</quote>}}编写进去。之后加载驱动

```bash
echo -e "vfio\nvfio_iommu_type1\nvfio_pci\nvfio_virqfd" | tee -a /etc/modules
```

最后最重要的是pve不要屏蔽核显, 把{{<quote>}}/etc/modprobe.d/blacklist.conf{{</quote>}}的屏蔽配置全部删掉

最后在更新一下配置

```bash
update-grub
update-initramfs -u -k all
reboot  # 重启尝试一下
uname -r    # 查看固化内核是否真的生效
apt-get install --no-install-recommends git mokutil sysfsutils -y   # 安装编译环境依赖
apt install --reinstall dkms -y # 安装编译环境依赖
```

到[这个网址](https://github.com/strongtz/i915-sriov-dkms.git)打开release找到支持你驱动的版本, 你可以选择下载deb包或者下载源码上传到pve上进行编译

1. 源码编译

进入下载的源码文件夹, 查看dkms.conf文件, 确认{{<enhence>}}PACKAGE_NAME="i915-sriov-dkms"和PACKAGE_VERSION="6.17.2-1"{{</enhence>}}

```bash
dkms add .  # 创建目录的符号链接到/usr/src/目录下
cd /usr/src/i915-sriov-dkms-$KERNEL # 进入到链接到的目录
dkms status # 查看已安装的 DKMS 模块及其状态
dkms install -m i915-sriov-dkms -v $KERNEL -k $(uname -r) --force -j 1  # 狠狠的编译
dkms status # 再次检查编译是否成功
lspci | grep VGA    # 查询当前核显ID

# 0000:00:02.0 这个修改为你的ID
# sriov_numvfs = 7里面的7修改为其他值，不要超过7
echo "devices/pci0000:00/0000:00:02.0/sriov_numvfs = 7" > /etc/sysfs.conf
reboot
lspci | grep VGA    # 此时应有七个小矮人了
```

2. deb包安装

deb包安装要简单很多

```bash
dpkg -i deb包路径
```

{{<enhence>}}注意!!!千万不要直通代码为0的核显, 那个是主核显, 直通整个pve会崩的{{</enhence>}}

## 直通给OMV

该方法应该适用所有debian系的系统, 首先编辑{{<quote>}}/etc/default/grub{{</quote>}},将{{<quote>}}GRUB_CMDLINE_LINUX_DEFAULT="quiet i915.enable_guc=3"{{</quote>}}编写进去

```bash
update-grub # 更新配置

apt install -y dkms vainfo intel-media-va-driver wget firmware-linux linux-headers-$(uname -r)  # 下载依赖

# 到这个网站找对应内核版本的i915的驱动包:https://github.com/strongtz/i915-sriov-dkms

dpkg -i i915-sriov-dkms_*_amd64.deb

# 安装好之后重启
reboot
# 输入vainfo查看是否成功
vainfo
```
