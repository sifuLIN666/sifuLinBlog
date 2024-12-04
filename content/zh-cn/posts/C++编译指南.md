+++
title = 'C++编译指南'
date = 2024-12-03
draft = false
slug = 'CPPcompileguide'
summary = '在快乐编程五年的生涯中,我越来越喜欢折磨自己,从 python 到 go,从 js 到 ts,彷佛一个语言写起来限制的越多我越喜欢,终于,在我抖 M 的编程生涯中,我觉得开始使用 C++编写项目了。'
tags = ["C++","Cmake"]
categories = ["C++破防记录"]
series = ["C++从入门到入土"]
math = false
toc = true
comments = true
+++

## 前言

在快乐编程五年的生涯中,我越来越喜欢折磨自己,从 python 到 go,从 js 到 ts,彷佛一个语言写起来限制的越多我越喜欢,终于,在我抖 M 的编程生涯中,我觉得开始使用 C++编写项目了。

## 编译器

在编译 C++代码时,我们通常需要使用各种编译器,比如 GCC、Clang 等。但是，在某些情况下, 我们需要使用特定的编译器。
|windows|mac|linux|
|-|-|-|
|gcc/msvc|clang|gcc|

windows 可以去[这里](https://github.com/niXman/mingw-builds-binaries/releases)下载。
ubuntu/debian 可以直接使用 apt 安装。
博主家境贫寒,用不起 mac,就不瞎指导了。

### 安装

- windows 下安装

到我提供的 git 仓库找到对应系统的 mingw64 安装包,下载后解压,之后设置环境变量{{< quote >}}minge64 所在路径/mingw64/bin{{</ quote >}}
之后可以去 cmd 测试一下

```cmd
gcc --version
```

有输出就对了

* ubuntu/debian下安装

```bash
apt-get update
apt-get gcc cmake gdb
```

## 宇宙IDE vscode配置

### 安装插件

安装插件C/C++插件,~~windows上配置vscode写C++项目就是一坨,强烈建议去ubuntu上编写~~,以{{< quote >}}cpp_code{{</ quote >}}目录为例,讲解如何使用vscode结合cmake调试C++项目,目录结构如下

```
.
|-- CMakeLists.txt
|-- build
|-- include
|   |-- httplib
|   |   `-- httplib.h
|   `-- student
|       `-- student.hpp
|--.vscode
|  |-- tasks.json
|  |-- launch.json 
|  `-- c_cpp_properties.json
`-- src
    |-- main.cpp
    `-- student
        `-- student.cpp
```

其中{{< quote >}}.vscode{{</ quote >}}目录为使用vscode调试C++代码的关键

### 关键文件

* tasks.json

这个文件里包含的内容主要是如何编译C++代码

1. ${workspaceFolder}为.vscode所在的目录
2. tasks列表包含会执行的操作

如果是windows要调用gcc编译器cmake标签的参数应该写为"args": ["-G", "MinGW Makefiles", ".."]

```json
{
    "options": { "cwd": "${workspaceFolder}/build" },
    "tasks": [
      {
        "type": "shell",
        "label": "cmake",
        "command": "cmake",
        "args": [".."]
      },
      {
        "label": "make",
        "group": {
          "kind": "build",
          "isDefault": true
        },
        "command": "make",
        "args": []
      },
      { "label": "Build", "dependsOn": ["cmake", "make"] }
    ],
  
    "version": "2.0.0"
  }
  
```

* launch.json

1. name是vscode运行代码时会提示的标签
2. program是编译后的文件
3. miDebuggerPath是gdb所在的路径,可以用which gdb查看路径

```json
{
    "configurations": [
    {
        "name": "(gdb) 启动调试",
        "type": "cppdbg",
        "request": "launch",
        "program": "${workspaceFolder}/build/main",
        "args": [],
        "stopAtEntry": false,
        "cwd": "${workspaceFolder}",
        "environment": [],
        "externalConsole": false,
        "MIMode": "gdb","miDebuggerPath": "/usr/bin/gdb",
        "setupCommands": [
            {
                "description": "为 gdb 启用整齐打印",
                "text": "-enable-pretty-printing",
                "ignoreFailures": true
            },
            {
                "description": "将反汇编风格设置为 Intel",
                "text": "-gdb-set disassembly-flavor intel",
                "ignoreFailures": true
            }
        ]
    }
    ]
}
```

* c_cpp_properties.json

1. includePath是头文件包含的列表,此处不仅有该项目自己的头文件,还链接了第三方库oatpp的头文件
2. compilerPath是编译器gcc的路径,可以用which gcc查看
3. cStandard是C++标准

```bash
{
    "configurations": [
      {
        "name": "Win32",
        "includePath": ["${workspaceFolder}/include/**","/usr/local/include/oatpp-1.4.0/oatpp/**"],
        "defines": ["_DEBUG", "UNICODE", "_UNICODE"],
        "windowsSdkVersion": "8.1",
        "compilerPath": "/usr/bin/gcc",
        "cStandard": "c17",
        "cppStandard": "c++17",
        "intelliSenseMode": "windows-gcc-x64"
      }
    ],
    "version": 4
  }
```

* CMakeLists.txt

**至关重要!!!**前面错了还能命令行编译,这里错了必死

```cmake
cmake_minimum_required(VERSION 3.10)
project(Stock)

# 设置本项目cpp源代码和头文件的目录
# ${PROJECT_SOURCE_DIR}为CMakeLists.txt所在的目录
set(SOURCE_DIR "${PROJECT_SOURCE_DIR}/src")
set(INCLUDE_DIR "${PROJECT_SOURCE_DIR}/include")
# 将本项目头文件包含进去
include_directories("${INCLUDE_DIR}")
# 使用通配符添加本项目所有.cpp文件
file(GLOB SOURCES "${SOURCE_DIR}/*.cpp")
file(GLOB STUDENT "${SOURCE_DIR}/student/*.cpp")

# 链接第三方库oatpp的库文件,一般是静态库所在的目录
link_directories("/usr/local/lib/oatpp-1.4.0")
# 查找spdlog库文件
link_directories("/opt/cpp/thirdpartyLib/spdlog/build")
# 查找libconfig库文件
link_directories("/usr/lib/x86_64-linux-gnu")

# 需要编译的文件
add_executable(main ${SOURCES} ${STUDENT})

# 链接oatpp库
# PRIVATE私有链接,即该链接不会传播,比如项目A依赖项目B,项目B私有链接项目C,项目A不会因为依赖项目B而依赖项目C
target_link_libraries(main PRIVATE oatpp)
# 链接spdlog库
target_link_libraries(main PRIVATE spdlog)
# 链接libconfig++库,这里可以指导库文件的名称
target_link_libraries(main PRIVATE libconfig++.a)

# 包含oatpp库的头文件目录
target_include_directories(main PRIVATE "/usr/local/include/oatpp-1.4.0/oatpp")
# 包含spdlog库的头文件目录
target_include_directories(main PRIVATE "/opt/cpp/thirdpartyLib/spdlog/include")
# 包含libconfig库的头文件目录
target_include_directories(main PRIVATE "/usr/include")
```

## 编写C++程序

* student.hpp

```C++
#ifndef STUDENT_H
#define STUDENT_H
#include <string>
class student
{
private:
    std::string name;
public:
    student(std::string name);
    std::string getName();
};


#endif
```

* student.cpp

```C++
// 在CMakeLists中设置的头文件目录是${PROJECT_SOURCE_DIR}/include
// 因此可以直接找到include下的student目录中的student.hpp文件
// 相当于缺省前面的路径,只需要补全后面的就行了
// 如果vscode爆红可以去看一下c_cpp_properties.json中的头文件包含路径有没错
#include "student/student.hpp"
student::student(std::string name) {
    this->name = name;
}
std::string student::getName(){
    return this->name;
}
```

* main.cpp

结合了oatpp这个库和测试的student类说明程序可以运行

```C++
#include "oatpp/web/server/HttpConnectionHandler.hpp"
#include "oatpp/network/Server.hpp"
#include "oatpp/network/tcp/server/ConnectionProvider.hpp"

#include "student/student.hpp"
#include <iostream>
void run() {

  /* Create Router for HTTP requests routing */
  auto router = oatpp::web::server::HttpRouter::createShared();

  /* Create HTTP connection handler with router */
  auto connectionHandler = oatpp::web::server::HttpConnectionHandler::createShared(router);

  /* Create TCP connection provider */
  auto connectionProvider = oatpp::network::tcp::server::ConnectionProvider::createShared({"192.168.213.128", 8000, oatpp::network::Address::IP_4});

  /* Create server which takes provided TCP connections and passes them to HTTP connection handler */
  oatpp::network::Server server(connectionProvider, connectionHandler);

//   /* Print info about server port */
  OATPP_LOGi("MyApp", "Server running on port %s", connectionProvider->getProperty("port").getData());
  /* Run server */
  server.run();
}

int main() {
  student s = student("Mike");
  std::cout << s.getName() << std::endl;
  /* Init oatpp Environment */
  oatpp::Environment::init();

  /* Run App */
  run();

  /* Destroy oatpp Environment */
  oatpp::Environment::destroy();

  return 0;

}

```

## 编译

进入build目录

```bash
cmake ..
make
```

在build目录会生成二进制可执行文件,输入路径运行,也可以通过vscode的调试去调试程序
