+++
title = '用VHDX安装双系统'
date = 2025-11-15
draft = false
slug = 'vhdx双系统'
summary = '用虚拟磁盘安装双系统'
tags = ["双系统", "VHDX"]
categories = []
series = []
math = false
toc = true
comments = false
+++
 ## vhdx双系统的好处
 我们安装系统的时候，一般都是安装到本地磁盘，这样做的好处是方便快捷，但后期想要备份、还原、管理系统的时候就会比较麻烦。而如果是双系统, 还很难做到隔离。这时候，虚拟磁盘系统就体现出它的优势了。这篇教程就是关于创建虚拟磁盘系统及后续使用方法的。
 
 ## 创建虚拟磁盘系统

 开始菜单图标上右键以打开磁盘管理, 在"操作" -> "创建VHD", 根据实际选择好之后, 再右键新创建的磁盘并选择"初始化磁盘" -> "选择GPT分区", 完成之后再对这个磁盘创建新加卷, 虚拟磁盘就创建好了。

## 利用虚拟磁盘创建系统镜像

需要准备一份Windows的安装镜像, 然后挂载镜像, 进入镜像目录后在"sources"文件夹下找到"install.wim"文件, 以管理员身份运行cmd, 输入以下命令

1. 获取版本信息

{{< quote >}}Dism /Get-ImageInfo /ImageFile:<install.wim所在路径>{{< /quote >}}

记下想要安装版本的{{< quote >}}索引{{< /quote >}}号, 把对应映像部署到虚拟磁盘

{{< quote >}}Dism /Apply-Image /ImageFile:<同上install.wim路径> /index:要安装的卷的索引号 /ApplyDir:<虚拟磁盘盘符>:\
{{< /quote >}}

示例: {{< quote >}}Dism /Apply-Image /ImageFile:G:\sources\install.wim /index:4 /ApplyDir:V:\ {{< /quote >}}

## 安装vhdx系统

### 船新安装版本

利用wepe进入系统, 格式化要装载系统的磁盘, 之后转换GPT分区类型, 接下来在创建一个ESP分区。 该分区作为引导硬盘都会有的, 如果是双系统就不需要创建了。

将安装好系统的虚拟磁盘复制进要装载系统的磁盘中, 并且挂载上去, 之后就可以创建启动引导了

### 创建启动引导项

挂载虚拟磁盘后, 管理员运行cmd
```bash
diskpart
lis vol
```

找到"信息"列为系统或者"FS"为FAT32文件类型的盘符索引, 为其分配盘符, 该盘为引导分区盘符, 需要用其创建启动引导项

```bash
# sel vol <索引>
# 示例, 选择索引为2的ESP分区, 并为其指定盘符为S
sel vol 2
ass letter=s
# 退出diskpart
exit
# 设置启动项
# bcdboot <虚拟磁盘挂载路径下的windows文件夹> /s <引导分区盘符>: /f UEFI
# 示例
bcdboot V:\windows /s S: /f UEFI
```

{{<enhence>}}虚拟磁盘启动后会占满所设置的容量, 务必确保磁盘空间足够{{</enhence>}}

此时重启后已经已经可以选择双系统了, 但是如果不做标识的话, 都是Windows 11看不出来谁是谁, 因此还需要设置一下

```bash
bcdedit /enum

# Windows 启动管理器
# --------------------
# 标识符                  {bootmgr}
# device                  partition=\Device\HarddiskVolume2
# path                    \EFI\Microsoft\Boot\bootmgfw.efi
# description             Windows Boot Manager
# locale                  en-us
# inherit                 {globalsettings}
# default                 {current}
# resumeobject            {b6fb1fbf-c1ee-11f0-9d89-bc6ee29e5ed4}
# displayorder            {b6fb1fc0-c1ee-11f0-9d89-bc6ee29e5ed4}
#                         {current}
# toolsdisplayorder       {memdiag}
# timeout                 30

# Windows 启动加载器
# -------------------
# 标识符                  {b6fb1fc0-c1ee-11f0-9d89-bc6ee29e5ed4}
# device                  vhd=[D:]\virtualdisk\Windows 11.vhdx
# path                    \windows\system32\winload.efi
# description             Windows11 Test
# locale                  zh-CN
# inherit                 {bootloadersettings}
# recoverysequence        {b6fb1fc1-c1ee-11f0-9d89-bc6ee29e5ed4}
# displaymessageoverride  Recovery
# recoveryenabled         Yes
# isolatedcontext         Yes
# allowedinmemorysettings 0x15000075
# osdevice                vhd=[D:]\virtualdisk\Windows 11.vhdx
# systemroot              \windows
# resumeobject            {b6fb1fbf-c1ee-11f0-9d89-bc6ee29e5ed4}
# nx                      OptIn
# bootmenupolicy          Standard

# Windows 启动加载器
# -------------------
# 标识符                  {current}
# device                  partition=C:
# path                    \WINDOWS\system32\winload.efi
# description             Windows 11
# locale                  zh-CN
# inherit                 {bootloadersettings}
# recoverysequence        {1ce2e785-b58d-11f0-910b-8dea646bd10a}
# displaymessageoverride  Recovery
# recoveryenabled         Yes
# isolatedcontext         Yes
# allowedinmemorysettings 0x15000075
# osdevice                partition=C:
# systemroot              \WINDOWS
# resumeobject            {1ce2e783-b58d-11f0-910b-8dea646bd10a}
# nx                      OptIn
# bootmenupolicy          Standard


# {b6fb1fc0-c1ee-11f0-9d89-bc6ee29e5ed4}为标识符项/identifier项
bcdedit /set {current} description "Windows 11 Test" # 设置当前启动项的描述
bcdedit /set {b6fb1fc0-c1ee-11f0-9d89-bc6ee29e5ed4} description "Windows 11 sifulin"
# 删除启动项
bcdedit /delete {标识符项}
```

## 隔离系统

新的系统还是会自动挂载其他硬盘, 因此需要将这些硬盘都卸载, {{< quote >}}Win + X{{< /quote >}}后选择磁盘管理, 选择目标卷右键-> "修改驱动器号和路径" -> "删除"

如果删除失败, 查看对应目标卷是否有页面文件字样, 这个其实就是windows的swap缓存, 把他取消掉就可以, {{< quote >}}Win + R{{< /quote >}}后输入sysdm.cpl, 找到"高级" -> "性能" -> "设置" -> "高级" -> "虚拟内存/更改" -> 取消勾选"自动管理所有驱动器的分页大小文件" -> 勾选"无分页文件" -> "设置"

完成后重启生效, 之后再删除卷就可以了

## 扩容磁盘

管理员打开cmd

```bash
diskpart

sel vdi file="虚拟磁盘vhdx文件的路径"

expand vdisk maximum=30720  # 扩容后的总容量, 单位Mb
```

## 差分磁盘

```bash
diskpart
create vdisk file="新磁盘路径" parent="父磁盘路径"  # 之后对系统的更改都会写进新的磁盘, 而不会在父磁盘了

# 但是父盘更改差分磁盘会失效, 建议改只读
# 备份的话直接复制文件即可
# 还原的话直接把差分磁盘删除然后在原来父盘基础上在创建一个差分磁盘就好
# 将差分磁盘所做的更改合并到父盘
sel vdisk file="差分磁盘的路径"
merge vdisk depth=1 # 允许多重差分, 这里只是从父磁盘差分了一次, 所以深度选1
```

## 最后丢个参考文献
[参考文献](https://alexliu07.github.io/2024/07/10/3/)

