// API端点 - 处理接收到的消息
const { parseSelfContainedDID } = require('../../lib/server-did');
const { getComedianResponse } = require('../../lib/ai');

export default async function handler(req, res) {
  // 只接受POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    // 获取请求数据
    const { message, sender_did, chat_history = [] } = req.body;
    
    // 验证必要参数
    if (!message) {
      return res.status(400).json({ error: '缺少必要参数: message' });
    }
    
    // 验证发送者DID（如果提供）
    if (sender_did) {
      try {
        const didInfo = parseSelfContainedDID(sender_did);
        if (!didInfo || !didInfo.isValid) {
          return res.status(400).json({ error: '无效的DID' });
        }
        
        console.log('收到来自以下DID的消息:', didInfo.metadata.name || 'Unknown');
      } catch (didError) {
        console.warn('DID解析错误:', didError.message);
        // 继续处理消息，即使DID无效
      }
    }
    
    // 获取AI回复
    const aiResponse = await getComedianResponse(message, chat_history);
    
    // 返回回复
    return res.status(200).json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('处理消息时出错:', error);
    return res.status(500).json({ 
      error: '处理消息失败', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 