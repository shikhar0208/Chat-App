const path = require("path")
const http = require('http')
const express = require("express")
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)   // by this we are changing the behaviour but we're just doing some refactoring. 
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// connection and disconnect are built in events

io.on('connection', (socket) => {
    console.log('New WebSocket connection')



    socket.on('join', (options, callback) => {
        // we potentially have an error or user , only one 
        const { error, user } = addUser({id: socket.id, ...options})  // spread operator       
        
        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', "Welcome!"))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    
    socket.on('sendLocation', (coordinates, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coordinates.lat},${coordinates.long}`))
        callback()
    })

    // when a given socket get disconnected
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

})


app.get('/', (req, res) => {
    res.sendFile(publicDirectoryPath + "/index.html")
})
server.listen(port, ()=>{
    console.log("server is up on " + port)
})