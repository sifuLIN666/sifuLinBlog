+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date | dateFormat "2006-01-02" }}
draft = false
slug = '{{ .File.ContentBaseName }}'
summary = 'Article Description'
tags = []
categories = []
series = []
math = false
toc = true
comments = false
+++
