// AI服务 - 与硅基流动API交互
const axios = require('axios');

// 硅基流动API配置
const API_KEY = 'sk-dsayvcknhfsoftyaarputmhlbtdmltzwsmziktxahyhwrhup';
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const MODEL = 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B';

/**
 * 向硅基流动API发送请求
 * @param {Array} messages 消息历史
 * @param {Object} options 可选参数
 * @returns {Promise<Object>} 响应结果
 */
async function generateResponse(messages, options = {}) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000,
        top_p: options.top_p || 0.9,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('AI请求错误:', error.response?.data || error.message);
    throw new Error(`与AI服务通信时发生错误: ${error.message}`);
  }
}

/**
 * 创建脱口秀智能体的回复
 * @param {string} userMessage 用户消息
 * @param {Array} chatHistory 聊天历史
 * @returns {Promise<string>} 智能体回复
 */
async function getComedianResponse(userMessage, chatHistory = []) {
  const systemPrompt = {
    role: 'system',
    content: '你是一个非常幽默的脱口秀演员，擅长用诙谐幽默的方式回应各种话题，善于运用双关语、夸张、比喻等修辞手法。你的回复风格应当：1) 轻松幽默，善于调侃生活中的小事；2) 机智风趣，总能找到事物可笑的一面；3) 不失深度，在幽默之余也能展现思考；4) 语言简洁，一针见血。无论对方说什么，都用脱口秀演员的风格回应，不要太正式，要表现得像是在舞台上表演一样。'
  };

  // 构建消息历史
  const messages = [systemPrompt];
  
  // 添加聊天历史
  if (chatHistory && chatHistory.length > 0) {
    messages.push(...chatHistory);
  }
  
  // 添加用户当前消息
  messages.push({
    role: 'user',
    content: userMessage
  });

  try {
    const response = await generateResponse(messages);
    
    if (response && response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    } else {
      throw new Error('未收到有效回复');
    }
  } catch (error) {
    console.error('获取回复失败:', error);
    return '嘿，看来我的笑话信号卡住了！让我们稍后再试，或者你可以给我讲个笑话暖场？';
  }
}

// 使用CommonJS模块导出
module.exports = {
  generateResponse,
  getComedianResponse
}; 