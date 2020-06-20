import io from 'socket.io-client'

const URL = 'http://localhost:8000' 

const socket = io(URL)

// register preliminary event listeners here:

socket.on("status", statusUpdate => {
    console.log(statusUpdate)
    alert(statusUpdate)
})

socket.on("playerJoinedRoom", statusUpdate => {
    console.log("A new player has joined the room! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
})

socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! Username: " + statusUpdate.userName + ", Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
})

export default socket