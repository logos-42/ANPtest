import { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [did, setDid] = useState('');
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const [didError, setDidError] = useState('');
  const [didMetadata, setDidMetadata] = useState(null);
  
  // 生成DID
  const generateDID = async () => {
    if (generating) return;
    
    setGenerating(true);
    setDidError('');
    
    try {
      const response = await axios.post('/api/generate-did', {
        agentName: '脱口秀AI助手'
      });
      
      // 如果成功，设置DID和元数据
      if (response.data && response.data.did) {
        setDid(response.data.did);
        setDidMetadata(response.data.metadata || null);
        
        // 保存到本地存储
        localStorage.setItem('agent_did', response.data.did);
        if (response.data.metadata) {
          localStorage.setItem('agent_metadata', JSON.stringify(response.data.metadata));
        }
        
        console.log('DID生成成功:', response.data.did);
      } else {
        throw new Error('服务器返回的DID数据不完整');
      }
    } catch (error) {
      console.error('生成DID失败:', error);
      setDidError(error.response?.data?.details || error.message || '生成DID时出现未知错误');
    } finally {
      setGenerating(false);
    }
  };
  
  // 发送消息测试
  const sendTestMessage = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    
    // 添加用户消息到历史
    const newHistory = [
      ...chatHistory,
      { role: 'user', content: message }
    ];
    setChatHistory(newHistory);
    
    try {
      const response = await axios.post('/api/message', {
        message,
        sender_did: did, // 添加发送者DID
        chat_history: newHistory.filter(msg => 
          msg.role === 'user' || msg.role === 'assistant'
        )
      });
      
      // 添加AI回复到历史
      setChatHistory([
        ...newHistory,
        { role: 'assistant', content: response.data.response }
      ]);
      
      // 清空输入框
      setMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 添加错误消息到聊天历史
      setChatHistory([
        ...newHistory,
        { 
          role: 'system', 
          content: `发送消息失败: ${error.response?.data?.error || error.message || '未知错误'}` 
        }
      ]);
    } finally {
      setSending(false);
    }
  };
  
  // 从本地存储加载DID和元数据
  useEffect(() => {
    try {
      const storedDid = localStorage.getItem('agent_did');
      const storedMetadata = localStorage.getItem('agent_metadata');
      
      if (storedDid) {
        setDid(storedDid);
        console.log('从本地存储加载的DID:', storedDid);
      }
      
      if (storedMetadata) {
        setDidMetadata(JSON.parse(storedMetadata));
      }
    } catch (err) {
      console.error('加载本地存储的DID出错:', err);
    }
  }, []);
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>脱口秀AI智能体</h1>
        
        <p className={styles.description}>
          基于自压缩DID的智能体，使用硅基流动API实现
        </p>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>智能体DID</h2>
            {did ? (
              <>
                <div className={styles.didContainer}>
                  <p className={styles.didText}>{did}</p>
                  <button 
                    className={styles.copyButton}
                    onClick={() => {
                      navigator.clipboard.writeText(did);
                      alert('DID已复制到剪贴板');
                    }}
                  >
                    复制
                  </button>
                </div>
                
                {didMetadata && (
                  <div className={styles.metadataContainer}>
                    <h3>DID元数据</h3>
                    <ul>
                      <li><strong>名称:</strong> {didMetadata.name}</li>
                      <li><strong>类型:</strong> {didMetadata.type}</li>
                      <li><strong>创建时间:</strong> {new Date(didMetadata.created).toLocaleString()}</li>
                      <li><strong>版本:</strong> {didMetadata.version}</li>
                    </ul>
                  </div>
                )}
                
                <div className={styles.qrcodeContainer}>
                  <h3>扫描二维码获取DID</h3>
                  <QRCode value={did} size={200} />
                </div>
              </>
            ) : (
              <>
                <button 
                  className={styles.button} 
                  onClick={generateDID}
                  disabled={generating}
                >
                  {generating ? '生成中...' : '生成DID'}
                </button>
                
                {didError && (
                  <div className={styles.errorMessage}>
                    <p>错误: {didError}</p>
                    <p>请刷新页面后重试。如果问题持续存在，请检查控制台日志。</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className={styles.card}>
            <h2>测试智能体</h2>
            
            <div className={styles.chatContainer}>
              {chatHistory.length > 0 ? (
                chatHistory.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`${styles.message} ${
                      msg.role === 'user' 
                        ? styles.userMessage 
                        : msg.role === 'assistant' 
                          ? styles.aiMessage 
                          : styles.systemMessage
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyChat}>发送消息，测试AI脱口秀演员的回复</p>
              )}
            </div>
            
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                className={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
              />
              <button 
                className={styles.sendButton}
                onClick={sendTestMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <footer className={styles.footer}>
        <p>
          脱口秀AI智能体 &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
} 