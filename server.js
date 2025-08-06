'use strict'

const Fastify = require('fastify')
const appPlugin = require('./app')

const fastify = Fastify({ logger: true })
fastify.register(appPlugin)

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000
    await fastify.listen({ port: PORT, host: '0.0.0.0' })
    fastify.log.info(`Server listening on port ${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()