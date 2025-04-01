// DID生成功能测试脚本 (Node.js版本)

// 模拟浏览器环境的base64函数
global.btoa = (str) => Buffer.from(str).toString('base64');
global.atob = (b64) => Buffer.from(b64, 'base64').toString();
global.TextDecoder = require('util').TextDecoder;
global.TextEncoder = require('util').TextEncoder;

// 简化的Base64URL编码/解码函数
function base64UrlEncode(str) {
  let base64;
  
  // 检查是否为字符串
  if (typeof str === 'string') {
    base64 = btoa(str); // 浏览器内置的base64编码
  } else {
    // 处理 Buffer 或 Uint8Array
    const bytes = new Uint8Array(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    base64 = btoa(binary);
  }
  
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  
  const binaryStr = atob(str);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

// 简化的密钥对生成（模拟）
function generateKeyPair() {
  // 生成伪随机密钥（在实际应用中应使用更安全的方法）
  const generateRandomBytes = (length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  };
  
  return {
    privateKey: generateRandomBytes(32), // 256位私钥
    publicKey: generateRandomBytes(64)   // 对应的公钥
  };
}

// 简化的签名函数（模拟）
function sign(privateKey, data) {
  // 实际应用中应使用真正的签名算法
  // 此处仅用于演示，生成一个伪签名
  const signature = new Uint8Array(64);
  const dataArray = typeof data === 'string' ? 
    new TextEncoder().encode(data) : new Uint8Array(data);
  
  // 简单组合私钥和数据来创建签名（仅用于演示）
  for (let i = 0; i < 64; i++) {
    signature[i] = (privateKey[i % privateKey.length] ^ dataArray[i % dataArray.length]) % 256;
  }
  
  return signature;
}

// 创建自压缩DID
function createSelfContainedDID(options) {
  try {
    const { privateKey, publicKey, endpoint, metadata } = options;
    
    // 将数据转换为Base64URL格式
    const publicKeyB64 = base64UrlEncode(publicKey);
    const endpointB64 = base64UrlEncode(endpoint);
    const metadataB64 = base64UrlEncode(JSON.stringify(metadata));
    
    // 创建待签名数据
    const dataToSign = `ECDSA:${publicKeyB64}:${endpointB64}:${metadataB64}`;
    
    // 使用私钥签名
    const signature = sign(privateKey, dataToSign);
    const signatureB64 = base64UrlEncode(signature);
    
    // 构造自包含DID
    return `did:self:ECDSA:${publicKeyB64}:${endpointB64}:${metadataB64}:${signatureB64}`;
  } catch (error) {
    console.error('创建DID时出错:', error);
    throw new Error('创建DID失败: ' + error.message);
  }
}

// 测试DID生成
function testDIDGeneration() {
  console.log('开始测试DID生成...');
  
  try {
    // 生成密钥对
    const keyPair = generateKeyPair();
    console.log('密钥对生成成功：');
    console.log('- 私钥长度:', keyPair.privateKey.length, '字节');
    console.log('- 公钥长度:', keyPair.publicKey.length, '字节');
    
    // 创建元数据
    const metadata = {
      name: '测试智能体',
      type: 'TestAgent',
      created: new Date().toISOString(),
      version: '1.0.0'
    };
    
    // 创建DID
    const did = createSelfContainedDID({
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      endpoint: 'http://localhost:3000/api/message',
      metadata
    });
    
    console.log('DID生成成功:');
    console.log(did);
    console.log('\nDID长度:', did.length, '字符');
    
    // 验证DID格式
    const parts = did.split(':');
    console.log('\nDID组成部分:');
    console.log('- 方法:', parts[0] + ':' + parts[1]);
    console.log('- 算法:', parts[2]);
    console.log('- 公钥片段:', parts[3].substring(0, 10) + '...');
    console.log('- 端点片段:', parts[4].substring(0, 10) + '...');
    console.log('- 元数据片段:', parts[5].substring(0, 10) + '...');
    console.log('- 签名片段:', parts[6].substring(0, 10) + '...');
    
    return {
      success: true,
      did
    };
  } catch (error) {
    console.error('DID生成测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行测试
const result = testDIDGeneration();
console.log('\n测试结果:', result.success ? '成功' : '失败');
if (!result.success) {
  console.error('错误信息:', result.error);
} 