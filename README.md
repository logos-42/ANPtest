# 脱口秀AI智能体

基于自压缩DID技术，使用硅基流动API实现的脱口秀AI助手。

## 项目特点

- 实现自压缩DID，无需额外查询即可连接智能体
- 使用硅基流动的DeepSeek-R1-Distill-Qwen-32B大模型
- 提供生成DID、二维码展示和聊天功能
- 支持智能体间的通信与连接

## 技术栈

- Next.js: React框架
- 自压缩DID: 去中心化身份识别
- 硅基流动API: AI大模型服务
- Vercel: 部署服务

## 快速开始

### 本地开发

1. 克隆项目并安装依赖:

```bash
git clone <repository-url>
cd comedyagent
npm install
```

2. 配置API密钥:

如需使用不同的API密钥，请修改`lib/ai.js`文件中的`API_KEY`变量。

3. 启动开发服务器:

```bash
npm run dev
```

4. 访问 http://localhost:3000 查看应用。

### Vercel部署

1. Fork此仓库到您的GitHub账户。

2. 在Vercel上创建新项目，并连接您的GitHub仓库。

3. 部署完成后，即可通过Vercel提供的URL访问应用。

## 使用说明

### 生成DID

1. 在首页点击"生成DID"按钮。
2. 系统会生成一个自包含DID，并以文本和二维码形式显示。
3. 您可以复制DID或分享二维码。

### 测试智能体

1. 在首页的聊天框中输入消息。
2. 点击"发送"按钮或按Enter键。
3. 智能体会以脱口秀演员的风格回复您的消息。

### 连接其他智能体

1. 前往"/connect"页面。
2. 输入其他智能体的DID。
3. 点击"连接"按钮。
4. 连接成功后，您可以向该智能体发送消息。

您还可以通过以下方式连接智能体:

- 在浏览器中打开`{您的域名}/connect?did={DID字符串}`
- 或者创建一个`did://`协议链接: `did://{DID字符串}`

## 项目结构

```
comedyagent/
├── api/                  # API路由
│   ├── generate-did.js   # DID生成API
│   └── message.js        # 消息处理API
├── components/           # React组件
├── lib/                  # 工具库
│   ├── ai.js             # AI服务
│   └── did.js            # DID功能
├── pages/                # 页面
│   ├── index.js          # 首页
│   └── connect.js        # 连接页面
├── public/               # 静态资源
├── styles/               # 样式文件
│   ├── Home.module.css   # 首页样式
│   └── Connect.module.css# 连接页面样式
├── package.json          # 项目配置
└── vercel.json           # Vercel配置
```

## 自压缩DID详解

本项目中的自压缩DID是一种创新的数字身份表示方式，包含了以下信息:

- 身份标识
- 公钥
- 服务端点
- 元数据
- 数字签名

与传统DID不同，自压缩DID将所有必要信息编码在一个字符串中，无需查询额外服务器即可获取身份信息和通信方式。

## 许可证

MIT 