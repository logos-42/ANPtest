// API端点 - 生成自压缩DID
// 使用服务器端专用DID库
const { generateKeyPair, createSelfContainedDID } = require('../../lib/server-did');

export default async function handler(req, res) {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    console.log('开始处理DID生成请求...');
    // 获取请求数据
    const { agentName = '脱口秀AI助手', endpoint = '' } = req.body;
    
    // 确保有端点URL
    let serviceEndpoint = endpoint;
    if (!serviceEndpoint) {
      // 使用当前请求的URL构建默认端点
      const host = req.headers.host || 'localhost:3000';
      const protocol = host.startsWith('localhost') ? 'http' : 'https';
      serviceEndpoint = `${protocol}://${host}/api/message`;
    }
    
    console.log('使用端点:', serviceEndpoint);
    
    // 生成密钥对
    const keyPair = generateKeyPair();
    console.log('密钥对生成成功');
    
    // 创建元数据
    const metadata = {
      name: agentName,
      type: 'ComedyAgent',
      created: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // 创建自包含DID
    const did = createSelfContainedDID({
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      endpoint: serviceEndpoint,
      metadata
    });
    
    console.log('DID生成成功:', did.substring(0, 30) + '...');
    
    // 返回DID
    return res.status(200).json({
      did,
      metadata
    });
  } catch (error) {
    console.error('生成DID时出错:', error);
    return res.status(500).json({ 
      error: '生成DID失败', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 