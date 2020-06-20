import React from 'react'
import { useParams } from 'react-router-dom'
import socket from '../connection/socket'

/**
 * 'Join game' is where we actually join the game room. 
 */


const JoinGameRoom = (gameid, userName) => {
    /**
     * For this browser instance, we want 
     * to join it to a gameRoom. For now
     * assume that the game room exists 
     * on the backend. 
     *  
     * 
     * TODO: handle the case when the game room doesn't exist. 
     */
    const idData = {
        gameId : gameid,
        userName : userName
    }
    socket.emit("playerJoinGame", idData)
}
  
  
const JoinGame = (props) => {
    /**
     * Extract the 'gameId' from the URL. 
     * the 'gameId' is the gameRoom ID. 
     */
    const { gameid } = useParams()
    JoinGameRoom(gameid, props.userName)
    return <h3 style = {{textAlign: "center"}}>Welcome to Chess with Friend!</h3>
}

export default JoinGame
  