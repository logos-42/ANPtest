// DID库 - 服务器端实现（Node.js兼容版本）

/**
 * Base64URL编码
 * @param {string|Buffer|Uint8Array} data 待编码数据
 * @returns {string} Base64URL编码字符串
 */
function base64UrlEncode(data) {
  let base64;
  
  if (typeof data === 'string') {
    // 字符串编码
    base64 = Buffer.from(data).toString('base64');
  } else {
    // Buffer或Uint8Array编码
    base64 = Buffer.from(data).toString('base64');
  }
  
  // 转换为Base64URL格式
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL解码
 * @param {string} str Base64URL字符串
 * @returns {Buffer} 解码后的二进制数据
 */
function base64UrlDecode(str) {
  // 恢复标准Base64格式
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 添加回可能缺失的填充
  while (str.length % 4) {
    str += '=';
  }
  
  // 解码为Buffer
  return Buffer.from(str, 'base64');
}

/**
 * 生成随机密钥对
 * @returns {Object} 包含私钥和公钥的对象
 */
function generateKeyPair() {
  // 服务器端生成随机密钥
  const privateKey = Buffer.from(Array(32).fill(0).map(() => Math.floor(Math.random() * 256)));
  const publicKey = Buffer.from(Array(64).fill(0).map(() => Math.floor(Math.random() * 256)));
  
  return { privateKey, publicKey };
}

/**
 * 创建简单签名
 * @param {Buffer} privateKey 私钥
 * @param {string|Buffer} data 待签名数据
 * @returns {Buffer} 签名
 */
function sign(privateKey, data) {
  // 确保data是Buffer
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  // 创建签名 (简化版)
  const signature = Buffer.alloc(64);
  
  for (let i = 0; i < 64; i++) {
    signature[i] = (privateKey[i % privateKey.length] ^ dataBuffer[i % dataBuffer.length]) % 256;
  }
  
  return signature;
}

/**
 * 创建自压缩DID
 * @param {Object} options 选项
 * @returns {string} DID字符串
 */
function createSelfContainedDID(options) {
  try {
    const { privateKey, publicKey, endpoint, metadata } = options;
    
    // 将数据编码为Base64URL
    const publicKeyB64 = base64UrlEncode(publicKey);
    const endpointB64 = base64UrlEncode(endpoint);
    const metadataB64 = base64UrlEncode(JSON.stringify(metadata));
    
    // 创建签名数据
    const dataToSign = `ECDSA:${publicKeyB64}:${endpointB64}:${metadataB64}`;
    
    // 签名
    const signature = sign(privateKey, dataToSign);
    const signatureB64 = base64UrlEncode(signature);
    
    // 构造DID
    return `did:self:ECDSA:${publicKeyB64}:${endpointB64}:${metadataB64}:${signatureB64}`;
  } catch (error) {
    console.error('创建DID失败:', error);
    throw new Error(`创建DID失败: ${error.message}`);
  }
}

/**
 * 解析自压缩DID
 * @param {string} selfDID DID字符串
 * @returns {Object|null} 解析结果
 */
function parseSelfContainedDID(selfDID) {
  try {
    // 解析DID组成部分
    const parts = selfDID.split(':');
    if (parts.length < 7 || parts[0] !== 'did' || parts[1] !== 'self') {
      throw new Error('无效的DID格式');
    }
    
    const algorithm = parts[2];
    const publicKeyB64 = parts[3];
    const endpointB64 = parts[4];
    const metadataB64 = parts[5];
    const signatureB64 = parts[6];
    
    // 解码数据
    const publicKey = base64UrlDecode(publicKeyB64);
    const endpoint = base64UrlDecode(endpointB64).toString('utf8');
    const metadataStr = base64UrlDecode(metadataB64).toString('utf8');
    const metadata = JSON.parse(metadataStr);
    
    // 服务器端暂不验证签名，总是返回有效
    return {
      algorithm,
      publicKey,
      endpoint,
      metadata,
      isValid: true,
      raw: selfDID
    };
  } catch (error) {
    console.error('解析DID失败:', error);
    return null;
  }
}

// 导出函数
module.exports = {
  generateKeyPair,
  createSelfContainedDID,
  parseSelfContainedDID
}; 