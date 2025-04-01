// DID库 - 实现自压缩DID的生成与解析（浏览器兼容版）
// 使用简化方案实现DID，避免Node.js专有API

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
  const dataArray = new Uint8Array(data);
  
  // 简单组合私钥和数据来创建签名（仅用于演示）
  for (let i = 0; i < 64; i++) {
    signature[i] = (privateKey[i % privateKey.length] ^ dataArray[i % dataArray.length]) % 256;
  }
  
  return signature;
}

// 简化的签名验证（模拟，与签名函数配套）
function verify(publicKey, data, signature) {
  // 在实际应用中应使用真正的签名验证
  // 简化版本始终返回有效，仅用于演示
  return true;
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

// 解析自压缩DID
function parseSelfContainedDID(selfDID) {
  // 检查DID格式
  const parts = selfDID.split(':');
  if (parts.length < 7 || parts[0] !== 'did' || parts[1] !== 'self') {
    return null;
  }
  
  try {
    const algorithm = parts[2];
    const publicKeyB64 = parts[3];
    const endpointB64 = parts[4];
    const metadataB64 = parts[5];
    const signatureB64 = parts[6];
    
    // 解码数据
    const publicKey = base64UrlDecode(publicKeyB64);
    const endpoint = new TextDecoder().decode(base64UrlDecode(endpointB64));
    const metadataStr = new TextDecoder().decode(base64UrlDecode(metadataB64));
    const metadata = JSON.parse(metadataStr);
    const signature = base64UrlDecode(signatureB64);
    
    // 验证签名
    const dataToVerify = `${algorithm}:${publicKeyB64}:${endpointB64}:${metadataB64}`;
    const isValid = verify(publicKey, dataToVerify, signature);
    
    return {
      algorithm,
      publicKey,
      endpoint,
      metadata,
      isValid,
      raw: selfDID
    };
  } catch (error) {
    console.error('DID解析错误:', error);
    return null;
  }
}

// 导出函数
export {
  generateKeyPair,
  createSelfContainedDID,
  parseSelfContainedDID
}; 