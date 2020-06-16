import React from 'react'
import Game from '../model/chess'
import Square from '../model/square'
import { Stage, Layer } from 'react-konva';
import Board from '../assets/chessBoard.png'
import useSound from 'use-sound'
import chessMove from '../assets/moveSoundEffect.mp3'
import socket from '../../connection/socket'
import Piece from './piece'
import piecemap from './piecemap'
import { useParams } from 'react-router-dom'
import { ColorContext } from '../../context/colorcontext' 

class ChessGame extends React.Component {

    state = {
        gameState: new Game(this.props.color),
        draggedPieceTargetId: "", // empty string means no piece is being dragged
        playerTurnToMoveIsWhite: true
    }


    componentDidMount() {
        // register event listeners
        socket.on('opponent move', move => {
            // move == [pieceId, finalPosition]
            console.log("opponenet's move: " + move.selectedId + ", " + move.finalPosition)
            if (move.playerColorThatJustMovedIsWhite !== this.props.color) {
                this.movePiece(move.selectedId, move.finalPosition, this.state.gameState, false)
                this.setState({
                    playerTurnToMoveIsWhite: !move.playerColorThatJustMovedIsWhite
                })
            }
        })
    }

    startDragging = (e) => {
        this.setState({
            draggedPieceTargetId: e.target.attrs.id
        })
    }


    movePiece = (selectedId, finalPosition, currentGame, isMyMove) => {
        /**
         * "update" is the connection between the model and the UI. 
         * This could also be an HTTP request and the "update" could be the server response.
         * (model is hosted on the server instead of the browser)
         */
        const update = currentGame.movePiece(selectedId, finalPosition, isMyMove)
        
        if (update === "moved in the same position.") {
            this.revertToPreviousState(selectedId) // pass in selected ID to identify the piece that messed up
            return
        } else if (update === "user tried to capture their own piece") {
            this.revertToPreviousState(selectedId) 
            return
        } else if (update === "invalid move") {
            this.revertToPreviousState(selectedId) 
            return
        } else if (update === "player is in check") { 
            this.revertToPreviousState(selectedId) 
            return
        } else if (update === "checkmate") { // !!!
            // ...?
        }

        // let the server and the other client know your move
        if (isMyMove) {
            socket.emit('new move', {
                nextPlayerColorToMove: !this.state.gameState.thisPlayersColorIsWhite,
                playerColorThatJustMovedIsWhite: this.state.gameState.thisPlayersColorIsWhite,
                selectedId: selectedId, 
                finalPosition: finalPosition,
                gameId: this.props.gameId
            })
        }
        

        this.props.playAudio()   
        
        // sets the new game state. 
        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
            playerTurnToMoveIsWhite: !this.props.color
        })
    }


    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
        const selectedId = this.state.draggedPieceTargetId
        this.movePiece(selectedId, finalPosition, currentGame, true)
    }

    revertToPreviousState = (selectedId) => {
        /**
         * Should update the UI to what the board looked like before. 
         */
        const oldGS = this.state.gameState
        const oldBoard = oldGS.getBoard()
        const tmpGS = new Game(true)
        const tmpBoard = []

        for (var i = 0; i < 8; i++) {
            tmpBoard.push([])
            for (var j = 0; j < 8; j++) {
                if (oldBoard[i][j].getPieceIdOnThisSquare() === selectedId) {
                    tmpBoard[i].push(new Square(j, i, null, oldBoard[i][j].canvasCoord))
                } else {
                    tmpBoard[i].push(oldBoard[i][j])
                }
            }
        }

        // temporarily remove the piece that was just moved
        tmpGS.setBoard(tmpBoard)

        this.setState({
            gameState: tmpGS,
            draggedPieceTargetId: "",
        })

        this.setState({
            gameState: oldGS,
        })
    }

 
    inferCoord = (x, y, chessBoard) => {
        // console.log("actual mouse coordinates: " + x + ", " + y)
        /*
            Should give the closest estimate for new position. 
        */
        var hashmap = {}
        var shortestDistance = Infinity
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                const canvasCoord = chessBoard[i][j].getCanvasCoord()
                // calculate distance
                const delta_x = canvasCoord[0] - x 
                const delta_y = canvasCoord[1] - y
                const newDistance = Math.sqrt(delta_x**2 + delta_y**2)
                hashmap[newDistance] = canvasCoord
                if (newDistance < shortestDistance) {
                    shortestDistance = newDistance
                }
            }
        }

        // console.log(hashmap)
        return hashmap[shortestDistance]
    }
   
    render() {
        // console.log(this.state.gameState.getBoard())
        console.log("it's white's move this time: " + this.state.playerTurnToMoveIsWhite)
        /*
            Look at the current game state in the model and populate the UI accordingly
        */
        // console.log(this.state.gameState.getBoard())
        
        return (
        <React.Fragment>
        <div style = {{
            backgroundImage: `url(${Board})`,
            width: "720px",
            height: "720px"}}
        >
            <Stage width = {1000} height = {1000}>
                <Layer>
                {this.state.gameState.getBoard().map((row) => {
                        return (<React.Fragment>
                                {row.map((square) => {
                                    if (square.isOccupied()) {                                    
                                        return (
                                            <Piece 
                                                x = {square.getCanvasCoord()[0]}
                                                y = {square.getCanvasCoord()[1]} 
                                                imgurls = {piecemap[square.getPiece().name]}
                                                isWhite = {square.getPiece().color === "white"}
                                                thisPieceTargetId = {square.getPiece().targetId}
                                                draggedPieceTargetId = {this.state.draggedPieceTargetId}
                                                onDragStart = {this.startDragging}
                                                onDragEnd = {this.endDragging}
                                                id = {square.getPieceIdOnThisSquare()}
                                                thisPlayersColorIsWhite = {this.props.color}
                                                playerTurnToMoveIsWhite = {this.state.playerTurnToMoveIsWhite}
                                                />
                                        )
                                    }
                                    return
                                })}
                            </React.Fragment>)
                    })}
                </Layer>
            </Stage>
        </div>
        </React.Fragment>
        )
    }
}



const ChessGameWrapper = () => {
    // get the gameId from the URL here and pass it to the chessGame component as a prop. 
    const color = React.useContext(ColorContext)
    const { gameid } = useParams()
    const [play] = useSound(chessMove);


    return <ChessGame playAudio = {play} gameId = {gameid} color = {color.didRedirect}/>;
};

export default ChessGameWrapper