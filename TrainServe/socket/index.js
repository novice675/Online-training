const { Server } = require('socket.io')

class SocketManager {
  constructor() {
    this.io = null
  }

  init(server) {
    this.io = new Server(server, {
      cors: { origin: "*", methods: ["GET", "POST"] }
    })

    this.io.on('connection', (socket) => {
      console.log('客户端连接:', socket.id)
      
      socket.on('join_room', (data) => {
        socket.join(data.room)
        console.log(`${socket.id} 加入房间: ${data.room}`)
      })

      socket.on('disconnect', () => {
        console.log('客户端断开:', socket.id)
      })
    })
  }

  // 通知移动端
  notifyMobile(event, data) {
    this.io.to('mobile').emit(event, data)
  }

  // 文章事件
  notifyArticleCreated(data) {
    this.notifyMobile('article_created', data)
  }

  notifyArticleDeleted(id, title) {
    this.notifyMobile('article_deleted', { id, title })
  }

  // 评论事件
  notifyCommentCreated(data) {
    this.notifyMobile('comment_created', data)
  }

  notifyCommentDeleted(id) {
    this.notifyMobile('comment_deleted', { id })
  }

  // 租户事件
  notifyTenantCreated(data) {
    this.notifyMobile('tenant_created', data)
  }

  notifyTenantUpdated(data) {
    this.notifyMobile('tenant_updated', data)
  }

  notifyTenantDeleted(id, name) {
    this.notifyMobile('tenant_deleted', { id, name })
  }

  // 人员事件
  notifyPersonCreated(data) {
    this.notifyMobile('person_created', data)
  }

  notifyPersonDeleted(id, name) {
    this.notifyMobile('person_deleted', { id, name })
  }
}

module.exports = new SocketManager() 