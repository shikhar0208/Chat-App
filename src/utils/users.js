const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room}) => {    	//destructuring
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user 
    const existingUser = users.find((user) => {
        return (user.room === room && user.username === username)
    })

    // Validate username
    if(existingUser) {
        return {
            error: 'Username is in use!'
        }
    } 

    // Store user
    const user = {id, username, room}
    users.push(user)
    return {user}

}

// Remove user
const removeUser = (id) => {
    const index = users.findIndex((user) => {   // index will be -1 if we didn't find a match, otherwise 0 or greater i.e index
        return user.id === id
    })
    if(index !== -1) {
        return users.splice(index, 1)[0]   // as this will return an array of item remove, we remove only 1 so element at 0th is required
    }
}    

const getUser = (id) => {
    return users.find((user) => {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => {
        return user.room === room
    })
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
