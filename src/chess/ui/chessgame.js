import React from 'react'
import Game from '../model/chess'
import Square from '../model/square'
import { Stage, Layer, Image } from 'react-konva';
// import Konva from 'konva';
import Board from '../assets/chessBoard.png'
import useImage from 'use-image'
import useSound from 'use-sound'
import chessMove from '../assets/moveSoundEffect.mp3'

// TODO: update the game state after each move. 

const piecemap = {
    'pawn': ['https://upload.wikimedia.org/wikipedia/commons/0/04/Chess_plt60.png', 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Chess_pdt60.png'],
    'knight':['https://upload.wikimedia.org/wikipedia/commons/2/28/Chess_nlt60.png','https://upload.wikimedia.org/wikipedia/commons/f/f1/Chess_ndt60.png'],
    'bishop':['https://upload.wikimedia.org/wikipedia/commons/9/9b/Chess_blt60.png','https://upload.wikimedia.org/wikipedia/commons/8/81/Chess_bdt60.png'],
    'king':['https://upload.wikimedia.org/wikipedia/commons/3/3b/Chess_klt60.png','https://upload.wikimedia.org/wikipedia/commons/e/e3/Chess_kdt60.png'],
    'queen':['https://upload.wikimedia.org/wikipedia/commons/4/49/Chess_qlt60.png','https://upload.wikimedia.org/wikipedia/commons/a/af/Chess_qdt60.png'],
    'rook':['https://upload.wikimedia.org/wikipedia/commons/5/5c/Chess_rlt60.png','https://upload.wikimedia.org/wikipedia/commons/a/a0/Chess_rdt60.png']
}

const Piece = (props) => {
    const choiceOfColor = props.isWhite ? 0 : 1
    const [image] = useImage(props.imgurls[choiceOfColor]);
    const isDragged = props.id === props.draggedPieceTargetId
    // console.log("this piece ID:" + props.thisPieceTargetId)
    // console.log("dragged piece ID:" + props.draggedPieceTargetId)
    return <Image image={image}
         x = {props.x - 90}
         y = {props.y - 90}
         draggable 
         width = {isDragged ? 75 : 60}
         height = {isDragged ? 75 : 60}
         onDragStart = {props.onDragStart}
         onDragEnd = {props.onDragEnd}
         id = {props.id}
         />;
};



class ChessGame extends React.Component {

    state = {
        gameState: new Game(true),
        draggedPieceTargetId: "" // empty string means no piece is being dragged
    }

    /*
        Just stick to arrow functions in javascript classes...
    */

    startDragging = (e) => {
        this.setState({
            draggedPieceTargetId: e.target.attrs.id
        })
    }

    endDragging = (e) => {
        const currentGame = this.state.gameState
        const currentBoard = currentGame.getBoard()
        const finalPosition = this.inferCoord(e.target.x() + 90, e.target.y() + 90, currentBoard)
        const selectedId = this.state.draggedPieceTargetId

        /**
         * "update" is the connection between the model and the UI. 
         * This could also be an HTTP request and the "update" could be the server response.
         * (model is hosted on the server instead of the browser)
         */
        const update = currentGame.movePiece(selectedId, finalPosition)
        
        if (update === "moved in the same position.") {
            console.log(update)
            this.revertToPreviousState(selectedId) // pass in selected ID to identify the piece that messed up
            return
        } else if (update === "user tried to capture their own piece") {
            console.log(update)
            this.revertToPreviousState(selectedId) // pass in selected ID to identify the piece that messed up
            return
        } else if (update === "moved to illegal square") { // !!!
            this.revertToPreviousState(selectedId)
            return
        } else if (update === "player is in check") { // !!!
            this.revertToPreviousState(selectedId)
            return
        } else if (update === "checkmate") { // !!!
            // ...?
        }

        this.props.playAudio()   
        currentGame.nextPlayersTurn()
        
        this.setState({
            draggedPieceTargetId: "",
            gameState: currentGame,
        })
    }

    revertToPreviousState = (selectedId) => {
        /**
         * Should update the UI with what the board looked like before. 
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
    const [play] = useSound(chessMove);
    return <ChessGame playAudio = {play}/>;
};

export default ChessGameWrapper