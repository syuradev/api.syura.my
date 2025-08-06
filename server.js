'use strict'

require('dotenv').config()

const Fastify = require('fastify')
const appPlugin = require('./app')

const fastify = Fastify({ logger: true })

fastify.register(require('fastify-socket.io'), {
  cors: {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  },
  transports: ['polling', 'websocket']
})

fastify.register(appPlugin)

fastify.ready().then(() => {
  fastify.io.on('connection', (socket) => {
    fastify.log.info(`Socket connected: ${socket.id}`)

    socket.on('message', (data) => {
      fastify.log.info(`Message from ${socket.id}:`, data)
      socket.broadcast.emit('message', data)
    })

    socket.on('disconnect', (reason) => {
      fastify.log.info(`Socket disconnected: ${socket.id}, reason: ${reason}`)
    })
  })
})

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${PORT}`)
    fastify.log.info('Socket.io is ready for connections')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
