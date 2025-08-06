# Socket.io Setup Documentation

## Overview
Socket.io has been successfully integrated into your Fastify backend to enable real-time bidirectional communication between the server and clients.

## Installation
Socket.io and fastify-socket.io are already installed in your package.json:
- `socket.io`: ^4.8.1
- `fastify-socket.io`: ^5.1.0

## Server Configuration

### Basic Setup (server.js)
The Socket.io plugin is registered with Fastify with the following configuration:

```javascript
fastify.register(require('fastify-socket.io'), {
  cors: {
    origin: true, // In production, specify your frontend URLs
    credentials: true
  },
  transports: ['polling', 'websocket']
})
```

### Available Socket Events

1. **connection**: Fired when a client connects
2. **disconnect**: Fired when a client disconnects
3. **message**: Custom event for general messages
4. **join-room**: Join a specific room
5. **leave-room**: Leave a specific room
6. **room-message**: Send message to a specific room

## Usage Examples

### Server-Side Examples

#### Emit to specific client
```javascript
socket.emit('event-name', data)
```

#### Broadcast to all except sender
```javascript
socket.broadcast.emit('event-name', data)
```

#### Emit to all connected clients
```javascript
fastify.io.emit('event-name', data)
```

#### Emit to specific room
```javascript
fastify.io.to('room-name').emit('event-name', data)
```

#### Access Socket.io from routes
```javascript
fastify.get('/notify', async (request, reply) => {
  // Send notification to all connected clients
  fastify.io.emit('notification', {
    message: 'New notification',
    timestamp: new Date()
  })
  return { success: true }
})
```

### Client-Side Examples

#### Basic Connection (JavaScript)
```javascript
const socket = io('http://localhost:3000', {
  transports: ['polling', 'websocket'],
  reconnection: true
})

socket.on('connect', () => {
  console.log('Connected:', socket.id)
})

socket.on('disconnect', () => {
  console.log('Disconnected')
})
```

#### Send and Receive Messages
```javascript
// Send message
socket.emit('message', 'Hello Server!')

// Receive message
socket.on('new-message', (data) => {
  console.log('Received:', data)
})
```

#### Room Management
```javascript
// Join room
socket.emit('join-room', 'chat-room-1')

// Send message to room
socket.emit('room-message', {
  room: 'chat-room-1',
  message: 'Hello room!'
})

// Listen for room events
socket.on('room-broadcast', (data) => {
  console.log('Room message:', data)
})
```

## Testing

### Using the Test Client
1. Start your server: `npm run dev` or `npm start`
2. Open `test-socketio.html` in a browser
3. Click "Connect" to establish connection
4. Test various features:
   - Send messages to all connected clients
   - Join/leave rooms
   - Send messages to specific rooms

### Testing with Multiple Clients
Open the test client in multiple browser tabs to simulate multiple users and test:
- Broadcasting messages
- Room-based communication
- User join/leave notifications

## Production Considerations

### 1. CORS Configuration
Update the CORS settings for production:
```javascript
cors: {
  origin: ['https://your-frontend.com', 'https://app.your-domain.com'],
  credentials: true
}
```

### 2. Authentication
Add authentication middleware:
```javascript
fastify.io.use((socket, next) => {
  const token = socket.handshake.auth.token
  // Verify token
  if (isValidToken(token)) {
    socket.userId = getUserIdFromToken(token)
    next()
  } else {
    next(new Error('Authentication failed'))
  }
})
```

### 3. Error Handling
```javascript
socket.on('error', (error) => {
  fastify.log.error('Socket error:', error)
})
```

### 4. Connection Limits
```javascript
fastify.register(require('fastify-socket.io'), {
  maxHttpBufferSize: 1e6, // 1MB
  pingTimeout: 60000,
  pingInterval: 25000,
  // ... other options
})
```

## Common Use Cases

### 1. Real-time Notifications
```javascript
// Server
fastify.io.emit('notification', {
  type: 'info',
  message: 'New update available',
  timestamp: Date.now()
})
```

### 2. Live Chat
```javascript
// Server
socket.on('chat-message', (msg) => {
  // Save to database
  const savedMsg = await saveMessage(msg)
  // Broadcast to room
  socket.to(msg.roomId).emit('new-chat-message', savedMsg)
})
```

### 3. Live Updates
```javascript
// Server - Send updates when data changes
fastify.post('/api/data', async (request, reply) => {
  const data = await updateData(request.body)
  // Notify all connected clients
  fastify.io.emit('data-updated', data)
  return data
})
```

### 4. Presence System
```javascript
// Track online users
const onlineUsers = new Map()

socket.on('user-online', (userId) => {
  onlineUsers.set(socket.id, userId)
  fastify.io.emit('users-online', Array.from(onlineUsers.values()))
})

socket.on('disconnect', () => {
  onlineUsers.delete(socket.id)
  fastify.io.emit('users-online', Array.from(onlineUsers.values()))
})
```

## Troubleshooting

### Connection Issues
- Check that the server is running on the correct port
- Verify CORS settings match your client origin
- Check firewall/proxy settings

### Performance Issues
- Use rooms to limit broadcast scope
- Implement message throttling
- Consider using Redis adapter for scaling

### Debugging
Enable debug mode:
```javascript
const fastify = Fastify({ 
  logger: {
    level: 'debug'
  }
})
```

## Next Steps

1. Implement authentication for secure connections
2. Add rate limiting to prevent spam
3. Set up Redis adapter for horizontal scaling
4. Implement reconnection logic on client
5. Add error recovery mechanisms
6. Create typed events with TypeScript (if using TS)

## Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [fastify-socket.io NPM](https://www.npmjs.com/package/fastify-socket.io)
- [Fastify Documentation](https://www.fastify.io/) 