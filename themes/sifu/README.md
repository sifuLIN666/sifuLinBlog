# hugo-theme-sifu
支持多种功能的hugo主题

## 安装使用

### 初始化项目

首先安装[hugo](https://github.com/gohugoio/hugo/releases),之后在命令行输入:

```powershell
hugo new site ProjectName
cd ProjectName
```

### 安装sifu主题

~~~powershell
git init
git submodule add --depth 1 https://github.com/ProjechAnonym/hugo-theme-sifu.git themes/sifu
~~~

## 配置项目

### 复制配置文件

进入目录下的themes/sifu文件夹

~~~
ProjectName:
└─themes
    └─sifu
        └─example
           ├─archetypes
           └─content
               ├─en
               │  └─posts
               └─zh-cn
                   └─posts
~~~

将example中的所有文件复制到根目录文件夹下,完成输入

~~~powershell
hugo server
~~~

### 多语言配置

多语言中的languageName是icon的类名,来源[flagicons](https://flagicons.lipis.dev/)

~~~toml
[language]
	[languages.zh-cn]
		# fi是大类,fi-cn表示中国
		languageName = "fi fi-cn"
~~~

## 编写文章

在项目根目录输入

~~~powershell
hugo new posts/test.md
~~~

会在content/zh-cn/posts下生成test.md

### 元数据

| slug                              | summary                             | tags     | categories | series                                  | math                          | toc          | comments     |
| --------------------------------- | ----------------------------------- | -------- | ---------- | --------------------------------------- | ----------------------------- | ------------ | ------------ |
| 文章的路由参数,使用英文会方便检索 | 文章介绍,尽量不要太长,100字以内为好 | 文章标签 | 文章分类   | 系列专栏,比如《母猪产后护理》上中下三集 | 是否开启数学公式,支持行内公式 | 是否显示目录 | 是否开启评论 |

## 结语

该主题纯javascript编写,对于gh-pages或者vercel都是极友好的,是作者找不到合适的主题又不会魔改别人主题部署还一直报错不得已从头开发的~~自立自强之举~~重复造轮子行为,欢迎大家赞助一下~~

<p align = "center">    
<img src="https://gitee.com/Linsifu/pic-embed/raw/master/images/alipay.jpg" width=300 align="left">
<img src="https://gitee.com/Linsifu/pic-embed/raw/master/images/wechatpay.jpg" width=300 align="right">
</p>


