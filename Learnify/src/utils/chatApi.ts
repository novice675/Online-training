import axios from './axios';

// 聊天相关API接口
export interface ChatMessage {
  id?: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sessionId: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  sessionId: string;
  userId: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
  data?: {
    userMessage: ChatMessage;
    aiMessage: ChatMessage;
  };
}

export interface ChatHistoryResponse {
  success: boolean;
  data: {
    sessionId: string;
    messages: ChatMessage[];
  };
}

export interface CreateSessionRequest {
  userId: string;
}

export interface CreateSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
  };
}

// 聊天API类
class ChatAPI {
  private baseURL = `${import.meta.env.VITE_API_URL}/LCYchat`;

  // 创建新的聊天会话
  async createSession(userId: string): Promise<CreateSessionResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/session`, {
        userId
      });
      return response;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw new Error('创建会话失败');
    }
  }

  // 获取聊天历史记录
  async getChatHistory(sessionId: string, userId: string): Promise<ChatHistoryResponse> {
    console.log(userId);
    
    try {
      const response = await axios.get(`${this.baseURL}/history/${sessionId}`, {
       userId
      });
      return response;
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      throw new Error('获取聊天历史失败');
    }
  }

  // 发送消息
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/send`, request);
      return response;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw new Error('发送消息失败');
    }
  }

  // 获取用户的所有会话
  async getUserSessions(userId: string): Promise<{ success: boolean; data: ChatSession[] }> {
    try {
      const response = await axios.get(`${this.baseURL}/sessions/${userId}`);
      return response;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw new Error('获取会话列表失败');
    }
  }

  // 删除会话
  async deleteSession(sessionId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${this.baseURL}/session/${sessionId}`, {
        params: { userId }
      });
      return response;
    } catch (error) {
      console.error('删除会话失败:', error);
      throw new Error('删除会话失败');
    }
  }
}

// 导出API实例
export const chatAPI = new ChatAPI(); 