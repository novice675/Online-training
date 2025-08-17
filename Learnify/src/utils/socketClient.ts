import { io, Socket } from 'socket.io-client';

interface SocketConfig {
  url: string;
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

type EventCallback = (...args: any[]) => void;

class SocketClient {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;

  constructor(config: SocketConfig) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...config
    };
  }

  // 连接Socket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(this.config.url, {
        autoConnect: this.config.autoConnect,
        reconnection: this.config.reconnection,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        console.log('Socket连接成功');
        this.isConnected = true;
        this.joinRoom('mobile'); // 加入移动端房间
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket连接断开:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket连接错误:', error);
        reject(error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Socket重连成功，尝试次数: ${attemptNumber}`);
        this.isConnected = true;
        this.joinRoom('mobile');
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('Socket重连失败:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket重连失败，已达到最大尝试次数');
      });
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // 加入房间
  joinRoom(room: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join_room', { room });
    }
  }

  // 监听事件
  on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // 移除事件监听
  off(event: string, callback?: EventCallback): void {
    if (callback) {
      this.eventListeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    } else {
      this.eventListeners.get(event)?.clear();
      this.socket?.off(event);
    }
  }

  // 发送事件
  emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket未连接，无法发送事件:', event);
    }
  }

  // 获取连接状态
  get connected(): boolean {
    return this.isConnected;
  }

  // 清理所有事件监听器
  cleanup(): void {
    if (this.socket) {
      this.eventListeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket!.off(event, callback);
        });
      });
      this.eventListeners.clear();
    }
  }
}

// 创建默认实例
const socketClient = new SocketClient({
  url: 'http://localhost:3009'
});

export default socketClient;
export { SocketClient }; 