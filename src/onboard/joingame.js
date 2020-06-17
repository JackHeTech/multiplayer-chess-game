import React from 'react'
import { useParams } from 'react-router-dom'
import socket from '../connection/socket'

/**
 * 'Join game' is where we actually join the game room. 
 */


const JoinGameRoom = (gameid) => {
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
        userName : ""
    }
    socket.emit("playerJoinGame", idData)
}
  
  
const JoinGame = () => {
    /**
     * Extract the 'gameId' from the URL. 
     * the 'gameId' is the gameRoom ID. 
     */
    const { gameid } = useParams()
    JoinGameRoom(gameid)
    return <h3 style = {{textAlign: "center"}}>Welcome to Online Multiplayer Chess!</h3>
}

export default JoinGame
  