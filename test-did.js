// DID生成功能测试脚本
import { generateKeyPair, createSelfContainedDID } from './lib/did.js';

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