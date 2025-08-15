import { io, Socket } from 'socket.io-client'
import { ElMessage, ElNotification } from 'element-plus'

class SocketClient {
  private socket: Socket | null = null
  private url = 'http://localhost:3008'

  connect() {
    if (this.socket?.connected) return

    this.socket = io(this.url)
    
    this.socket.on('connect', () => {
      console.log('Socket连接成功')
      // 加入管理员房间
      this.socket?.emit('join_room', { room: 'admin' })
    })

    this.socket.on('disconnect', () => {
      console.log('Socket连接断开')
    })

    // 监听业务事件
    this.setupEventListeners()
  }

  private setupEventListeners() {
    if (!this.socket) return

    // 文章事件
    this.socket.on('article_created', (data) => {
      ElNotification({
        title: '新文章发布',
        message: `${data.title || '新动态'} 已发布`,
        type: 'info'
      })
    })

    this.socket.on('article_deleted', (data) => {
      ElNotification({
        title: '文章已删除',
        message: `${data.title || '文章'} 已被删除`,
        type: 'warning'
      })
    })

    // 租户事件
    this.socket.on('tenant_created', (data) => {
      ElNotification({
        title: '新租户入驻',
        message: `${data.company?.name || '新企业'} 已入驻`,
        type: 'success'
      })
    })

    this.socket.on('tenant_deleted', (data) => {
      ElNotification({
        title: '租户退租',
        message: `${data.name || '租户'} 已退租`,
        type: 'warning'
      })
    })

    // 人员事件
    this.socket.on('person_created', (data) => {
      ElNotification({
        title: '新人员入驻',
        message: `${data.name || '新人员'} 已加入`,
        type: 'info'
      })
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data)
  }

  on(event: string, callback: Function) {
    this.socket?.on(event, callback as any)
  }

  off(event: string) {
    this.socket?.off(event)
  }
}

export const socketClient = new SocketClient()
export default SocketClient 