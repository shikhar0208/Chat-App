const socket = io()

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')


// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})   // destructuring of objects coming from Qs.parse() 

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)    // take a string and parse it to integer
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight   // this gives us the total height we are able to scroll through.

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight    // this gives us a number, the amount of distance we've scrolled from the top. 

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,                   
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username, 
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')

    })
    messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    
    // below cmd will disable the button after clicking once so that a single donot sent twice by mistake 
    messageFormButton.setAttribute('disabled','disabled')    //.setAttribute DOM manipulation on html elements (attr,value)
    const message = e.target.elements.message.value    // .message is name of input tag 

    socket.emit('sendMessage', message, (error) =>{
        // enable the button after we get acknowledgement callback
        
        messageFormButton.removeAttribute('disabled') // this will remove the attribute who's value is disabled
        
        messageFormInput.value = ''  // this will clear the input after message has been sent
        messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    sendLocationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })

})

socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'   //this will redirect to the root page
    }
})