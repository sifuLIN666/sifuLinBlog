+++
title = 'Kavita识别漫画epub'
date = 2025-02-28
draft = false
slug = 'kavita-epub'
summary = '创建自己的漫画epub资源'
tags = ["kavita","epub"]
categories = ["kavita漫画服务器","epub文件制作"]
series = ["kavita漫画服务器","epub文件制作"]
math = false
toc = true
comments = true
+++

## 前言

上期我们在飞牛系统上部署了 kavita 漫画服务器, [这是链接](https://vercel-blog.sifulin.top/zh-cn/2025/02/27/custom_fnos/),但是作为漫画服务器, 总要有资源啊, 平时我们接触到的漫画很多都是图片形式的, 这种不能定义目录,(或许可以?来个懂哥教一下~),那今天我们就来自己部署创建 epub 格式的漫画资源

## 准备工作

首先我们要有一个创建 epub 格式的软件,我这里使用的是 sigil,[这是下载链接](https://sigil-ebook.com/sigil/download/),下载完成后我们直接通过 sigil 创建 epub3 文件

### 简单处理一下

首先删掉图中没用的文件, 并创建自己需要的文件
{{< images "https://s3.bmp.ovh/imgs/2025/02/28/7452a56afaf57f9f.png" "sigil操作步骤" >}}
在` Styles`文件夹下新建一个`style.css `样式文件,并添加样式

```css
.single-page {
  height: 100%;
  width: 100%;
}
ol {
  list-style-type: none;
}
```

然后修改`content.opf`文件的`<spine>`标签,把`<itemref idref="nav.xhtml" linear="no"/>`删掉,并修改`metadata`标签为如下形式

```xml
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:language>zh</dc:language> <!-- 语言 -->
    <dc:creator>九井凉子</dc:creator> <!-- 作者 -->
    <dc:title>迷宫饭-卷01</dc:title> <!-- 书名 -->
    <meta property="belongs-to-collection" id="id-1">迷宫饭</meta> <!-- 丛书系列的名称 -->
    <meta refines="#id-1" property="group-position">1</meta> <!-- 在该系列丛书的出版顺序 -->
    <dc:publisher>555</dc:publisher> <!-- 出版社 -->
    <dc:description>6666</dc:description> <!-- 内容简介 -->
    <dc:date>1995-01-02</dc:date> <!-- 出版日期 -->
    <dc:subject>奇幻</dc:subject> <!-- 分类 -->
    <dc:subject>冒险</dc:subject> <!-- 分类 -->
    <meta name="cover" content="cover.jpg" /> <!-- 封面图片, 此处的content是与下面的item的id对应, 此项设置对苹果的图书封面显示很重要 -->
    <meta name="Sigil version" content="2.4.2"/>
    <meta property="dcterms:modified">2025-03-01T00:07:01Z</meta>
</metadata>
<manifest>
    <!-- 该书的目录文件 -->
    <item id="nav.xhtml" href="Text/nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>

    <item id="Style0001.css" href="Styles/style.css" media-type="text/css"/> <!-- 该书的css文件 -->

    <!-- 该书的封面文件链接, 与<meta name="cover" content="cover.jpg" />对应 -->
    <item id="cover.jpg" href="image/cover.jpg" media-type="image/jpeg"/>

    <!-- 该书的各种元文件, jpg与html文件都应包含进来, 并且需要注意, 一个文件只能对应一个id, 如果Images/1.jpg对应id 1.jpg和cover.jpg, kavita会解析失败 -->
    <item id="x1.jpg" href="Images/1.jpg" media-type="image/jpeg"/>
    <item id="x2.jpg" href="Images/2.jpg" media-type="image/jpeg"/>
    <item id="page-1.html" href="Text/page-1.html" media-type="application/xhtml+xml"/>
</manifest>
```

## 创建内容

首先准备好漫画图片,并按照阅读顺序按照`1.jpg, 2.jpg`的格式命名, 由于 epub 实际上是 html 文件的合集, 因此需要生成对应的 html 文件, 这里我使用 python 生成, 代码如下

```python
import os

# 设置图片所在的目录
image_dir = r'E:/BaiduNetdiskDownload/迷宫饭epub/迷宫饭 vol01/image'  # 替换为你的图片文件夹路径
output_dir = r'E:/BaiduNetdiskDownload/迷宫饭epub/迷宫饭 vol01/html' # 替换为你想要保存HTML文件的路径

# 确保输出目录存在
if not os.path.exists(output_dir):
    os.makedirs(output_dir)
# 遍历目录中的所有文件
for filename in os.listdir(image_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):  # 检查文件扩展名
        # 构建完整的文件路径
        image_path = os.path.join(image_dir, filename)
        # 创建HTML文件的内容
        html_content = f'''<!DOCTYPE html SYSTEM "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>第 {filename.split(".")[0]} 页</title>
        <link rel="stylesheet" type="text/css" href="../Styles/style.css"/>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    </head>
    <body>
        <img src="../image/{filename}" alt="Comic Book Images" class="single-page" />
    </body>
</html>
        '''

        # 构建HTML文件的输出路径
        output_html_path = os.path.join(output_dir, f'page-{os.path.splitext(filename)[0]}.html')

        # 写入HTML文件
        with open(output_html_path, 'w', encoding='utf-8') as html_file:
            html_file.write(html_content)


print('HTML files have been created successfully.')

```

运行完成后就会出现对应的 html 文件了, 然后我们在 sigil 中添加这些文件, 添加完成后之后到`content.opf`文件查看`<spine>`标签, 确保是按照阅读顺序排列的, 如果按照我说的按数字命名图片一般这步没有问题
{{< images "https://s3.bmp.ovh/imgs/2025/03/01/d0867b467c5bdbb5.png" "sigil添加文件" >}}

## 创建目录

找到一开始的`nav.xhtml`文件,按如下格式添加目录

```html
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>

<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:epub="http://www.idpf.org/2007/ops"
  lang="en"
  xml:lang="en"
>
  <head>
    <title>ePub NAV</title>
    <meta charset="utf-8" />
    <link href="../Styles/style.css" rel="stylesheet" type="text/css" />
  </head>
  <body epub:type="frontmatter">
    <nav epub:type="toc" id="toc" role="doc-toc">
      <!-- 此处的ol标签是一级目录 -->
      <ol>
        <li>
          <!-- 此处的a标签则是一级目录链接 -->
          <a href="page-1.html">1</a>
          <!-- 这里嵌套的ol标签则是二级目录 -->
          <ol>
            <li>
              <a href="page-2.html">2</a>
            </li>
          </ol>
        </li>
        <!-- 此处新的li标签则代表是一个新的一级目录 -->
        <li>
          <a href="page-0003.html">3</a>
        </li>
      </ol>
    </nav>
  </body>
</html>
```

其实这里用 sigil 的目录功能打开看就很清晰明了了

## 结尾

这里我放一下[示例文件](https://wwxc.lanzouo.com/iJVOi2uz7jdc), 需要注意的是迷宫饭是 epub3 格式, 目录不再需要 ncx 文件而是使用 nav.xhtml 文件进行导航, 而凡人修仙传则是 epub2 格式文件, 目录需要使用 ncx 文件进行导航 1
