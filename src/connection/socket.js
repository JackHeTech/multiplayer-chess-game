import io from 'socket.io-client'

const URL = 'http://localhost:4000' 

const socket = io(URL)

// register preliminary event listeners here:

socket.on("status", statusUpdate => {
    console.log(statusUpdate)
})

socket.on("playerJoinedRoom", statusUpdate => {
    console.log("A new player has joined the room! Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
})

socket.on("createNewGame", statusUpdate => {
    console.log("A new game has been created! Game id: " + statusUpdate.gameId + " Socket id: " + statusUpdate.mySocketId)
})

export default socket