import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../styles/Connect.module.css';

export default function Connect() {
  const router = useRouter();
  const [did, setDid] = useState('');
  const [inputDid, setInputDid] = useState('');
  const [agentInfo, setAgentInfo] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [connecting, setConnecting] = useState(false);
  
  // 从URL获取DID
  useEffect(() => {
    // 检查query参数
    if (router.query.did) {
      const didFromQuery = router.query.did;
      setDid(didFromQuery);
      parseDID(didFromQuery);
    }
    
    // 检查URL路径 (如果是did://格式)
    if (router.asPath.startsWith('/connect#did://')) {
      const didFromHash = router.asPath.split('#')[1];
      const formattedDid = didFromHash.replace('did://', 'did:');
      setDid(formattedDid);
      parseDID(formattedDid);
    }
  }, [router.query, router.asPath]);
  
  // 解析DID
  const parseDID = async (didString) => {
    if (!didString) return;
    
    setConnecting(true);
    setError('');
    
    try {
      // 这里我们简单解析DID字符串
      const parts = didString.split(':');
      if (parts.length < 7 || parts[0] !== 'did' || parts[1] !== 'self') {
        throw new Error('无效的自包含DID格式');
      }
      
      // 解析公钥、端点和元数据
      const algorithm = parts[2];
      const endpointB64 = parts[4];
      const metadataB64 = parts[5];
      
      // 解码Base64URL
      const decodeBase64Url = (str) => {
        // 添加回可能缺失的填充
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
          str += '=';
        }
        return atob(str);
      };
      
      // 获取端点和元数据
      const endpoint = decodeBase64Url(endpointB64);
      const metadataStr = decodeBase64Url(metadataB64);
      const metadata = JSON.parse(metadataStr);
      
      console.log('解析DID成功：', {
        endpoint,
        metadata
      });
      
      // 检查端点有效性
      if (!endpoint.startsWith('http')) {
        console.warn('端点URL格式可能不正确:', endpoint);
      }
      
      setAgentInfo({
        name: metadata.name || '未知智能体',
        type: metadata.type || '通用智能体',
        created: metadata.created ? new Date(metadata.created).toLocaleString() : '未知时间',
        version: metadata.version || '1.0.0',
        endpoint,
        metadata
      });
    } catch (error) {
      console.error('解析DID错误:', error);
      setError(`无法解析提供的DID: ${error.message}`);
      setAgentInfo(null);
    } finally {
      setConnecting(false);
    }
  };
  
  // 手动连接
  const handleConnect = () => {
    if (!inputDid.trim()) return;
    
    setDid(inputDid);
    parseDID(inputDid);
  };
  
  // 发送消息到智能体
  const sendMessage = async () => {
    if (!message.trim() || !agentInfo || sending) return;
    
    setSending(true);
    
    // 添加用户消息到历史
    const newHistory = [
      ...chatHistory,
      { role: 'user', content: message }
    ];
    setChatHistory(newHistory);
    
    try {
      // 获取本地存储的DID
      const localDid = localStorage.getItem('agent_did');
      
      // 准备发送给智能体的数据
      const messageData = {
        message,
        sender_did: localDid || '',
        chat_history: newHistory.filter(msg => 
          msg.role === 'user' || msg.role === 'assistant'
        )
      };
      
      console.log('发送消息到端点:', agentInfo.endpoint);
      
      // 发送请求到智能体端点
      const response = await axios.post(agentInfo.endpoint, messageData);
      
      // 添加智能体回复到历史
      if (response.data && response.data.response) {
        setChatHistory([
          ...newHistory,
          { role: 'assistant', content: response.data.response }
        ]);
      } else {
        throw new Error('响应格式不正确');
      }
      
      // 清空输入框
      setMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
      setChatHistory([
        ...newHistory,
        { 
          role: 'system', 
          content: `连接错误: ${error.message || '无法连接到智能体服务'}`
        }
      ]);
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>连接智能体</h1>
        
        {!did ? (
          <div className={styles.connectForm}>
            <p className={styles.description}>
              输入智能体的自包含DID字符串进行连接
            </p>
            <input
              type="text"
              value={inputDid}
              onChange={(e) => setInputDid(e.target.value)}
              placeholder="输入DID..."
              className={styles.input}
            />
            <button 
              className={styles.button}
              onClick={handleConnect}
            >
              连接
            </button>
          </div>
        ) : connecting ? (
          <div className={styles.loading}>
            <p>正在解析DID，请稍候...</p>
          </div>
        ) : agentInfo ? (
          <div className={styles.agentInfo}>
            <h2>{agentInfo.name}</h2>
            <div className={styles.agentMetadata}>
              <p><strong>类型:</strong> {agentInfo.type}</p>
              <p><strong>创建时间:</strong> {agentInfo.created}</p>
              <p><strong>版本:</strong> {agentInfo.version}</p>
              <p><strong>服务端点:</strong> {agentInfo.endpoint}</p>
            </div>
            
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
                <p className={styles.emptyChat}>开始与智能体对话</p>
              )}
            </div>
            
            <div className={styles.inputContainer}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入消息..."
                className={styles.input}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button 
                className={styles.sendButton}
                onClick={sendMessage}
                disabled={sending || !message.trim()}
              >
                {sending ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.error}>
            <p>{error || '无法解析DID'}</p>
            <button 
              className={styles.button}
              onClick={() => {
                setDid('');
                setError('');
              }}
            >
              重试
            </button>
          </div>
        )}
      </main>
      
      <footer className={styles.footer}>
        <p>
          脱口秀AI智能体 &copy; {new Date().getFullYear()} | <a href="/" className={styles.link}>返回首页</a>
        </p>
      </footer>
    </div>
  );
} 