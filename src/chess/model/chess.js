import Chess from 'chess.js'
import ChessPiece from './chesspiece'
import Square from './square'
// when indexing, remember: [y][x]. 
/**
 * If the player color is black, make sure to invert the board.
 */




class Game {
    constructor(thisPlayersColorIsWhite) {
        this.thisPlayersColorIsWhite = thisPlayersColorIsWhite // once initialized, this value should never change.
        // console.log("this player's color is white: " + this.thisPlayersColorIsWhite) 
        this.chessBoard = this.makeStartingBoard() // the actual chessBoard
        this.chess = new Chess()

        this.toCoord = thisPlayersColorIsWhite ? {
            0:8, 1:7, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1
        } : {
            0:1, 1:2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8
        }
        
        this.toAlphabet = thisPlayersColorIsWhite ? {
            0:"a", 1:"b", 2: "c", 3: "d", 4: "e", 5: "f", 6: "g", 7: "h"
        } : {
            0:"h", 1:"g", 2: "f", 3: "e", 4: "d", 5: "c", 6: "b", 7: "a"
        }

        this.toCoord2 = thisPlayersColorIsWhite ? {
            8:0, 7:1, 6: 2, 5: 3, 4: 4, 3: 5, 2: 6, 1: 7
        } : {
            1:0, 2:1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7
        }
        
        this.toAlphabet2 = thisPlayersColorIsWhite ? {
            "a":0, "b":1, "c":2, "d":3, "e":4, "f":5, "g":6, "h":7
        } : {
            "h":0, "g":1, "f":2, "e":3, "d":4, "c":5, "b":6, "a":7
        }

        this.nQueens = 1
    }

    getBoard() {
        return this.chessBoard
    }

    // nextPlayersTurn() {
    //     this.isWhitesTurn = !this.isWhitesTurn
    // }

    setBoard(newBoard) {
        this.chessBoard = newBoard
    }

    movePiece(pieceId, to, isMyMove) {

        const to2D = isMyMove ? {
            105:0, 195:1, 285: 2, 375: 3, 465: 4, 555: 5, 645: 6, 735: 7
        } : {
            105:7, 195:6, 285: 5, 375: 4, 465: 3, 555: 2, 645: 1, 735: 0
        }


        var currentBoard = this.getBoard()
        const pieceCoordinates = this.findPiece(currentBoard, pieceId)
        
        
        // can't find piece coordinates (piece doesn't exist on the board)
        if (!pieceCoordinates) {
            return
        }

        const y = pieceCoordinates[1]
        const x = pieceCoordinates[0]

        // new coordinates
        const to_y = to2D[to[1]]
        const to_x = to2D[to[0]]

        const originalPiece = currentBoard[y][x].getPiece()
    
        if (y === to_y && x === to_x) {
            return "moved in the same position."
        }

        /**
         * In order for this method to do anything meaningful, 
         * the 'reassign const' line of code must run. Therefore, 
         * for it to run, we must check first that the given move is valid. 
         */

        const isPromotion = this.isPawnPromotion(to, pieceId[1])
        const moveAttempt = !isPromotion ? this.chess.move({
                from: this.toChessMove([x, y], to2D),
                to: this.toChessMove(to, to2D),
                piece: pieceId[1]}) 
            : 
            this.chess.move({
                from: this.toChessMove([x, y], to2D),
                to: this.toChessMove(to, to2D),
                piece: pieceId[1],
                promotion: 'q'
            })


         console.log(moveAttempt)
        // console.log(isPromotion)

        if (moveAttempt === null) {
            return "invalid move"
        }


        if (moveAttempt.flags === 'e') {
            const move = moveAttempt.to 
            const x = this.toAlphabet2[move[0]]
            let y
            if (moveAttempt.color === 'w') {
                y = parseInt(move[1], 10) - 1
            } else {
                y = parseInt(move[1], 10) + 1 
            }
            currentBoard[this.toCoord2[y]][x].setPiece(null)
        }



        // Check castling
        const castle = this.isCastle(moveAttempt)
        if (castle.didCastle) {
            /**
             *  The main thing we are doing here is moving the right rook
             *  to the right position. 
             * 
             * - Get original piece by calling getPiece() on the original [x, y]
             * - Set the new [to_x, to_y] to the original piece
             * - Set the original [x, y] to null
             */

            const originalRook = currentBoard[castle.y][castle.x].getPiece()
            currentBoard[castle.to_y][castle.to_x].setPiece(originalRook)
            currentBoard[castle.y][castle.x].setPiece(null)
        }


        // ___actually changing the board model___

        const reassign = isPromotion ? currentBoard[to_y][to_x].setPiece(
            new ChessPiece(
                'queen', 
                false, 
                pieceId[0] === 'w' ? 'white' : 'black', 
                pieceId[0] === 'w' ? 'wq' + this.nQueens : 'bq' + this.nQueens))
            : currentBoard[to_y][to_x].setPiece(originalPiece)

        if (reassign !== "user tried to capture their own piece") {
            currentBoard[y][x].setPiece(null)
        } else {
            return reassign
        }

        // ___actually changing the board model___


        const checkMate = this.chess.in_checkmate() ? " has been checkmated" : " has not been checkmated"
        console.log(this.chess.turn() + checkMate)
        if (checkMate === " has been checkmated") {
            return this.chess.turn() + checkMate
        }
        // changes the fill color of the opponent's king that is in check
        const check = this.chess.in_check() ? " is in check" : " is not in check"
        console.log(this.chess.turn() + check)
        if (check === " is in check") {
            return this.chess.turn() + check
        }

        console.log(currentBoard)
        // update board
        this.setBoard(currentBoard)
    }



    isCastle(moveAttempt) {
        /**
         * Assume moveAttempt is legal. 
         * 
         * {moveAttempt} -> {boolean x, y to_x, to_y} 
         * 
         * returns if a player has castled, the final position of 
         * the rook (to_x, to_y), and the original position of the rook (x, y)
         * 
         */


        const piece = moveAttempt.piece
        const move = {from: moveAttempt.from, to: moveAttempt.to}

        const isBlackCastle = ((move.from === 'e1' && move.to === 'g1') || (move.from === 'e1' && move.to === 'c1')) 
        const isWhiteCastle = (move.from === 'e8' && move.to === 'g8') || (move.from === 'e8' && move.to === 'c8')
        

        if (!(isWhiteCastle || isBlackCastle) || piece !== 'k') {
            return {
                didCastle: false
            }
        }

        let originalPositionOfRook
        let newPositionOfRook

        if ((move.from === 'e1' && move.to === 'g1')) {
            originalPositionOfRook = 'h1'
            newPositionOfRook = 'f1'
        } else if ((move.from === 'e1' && move.to === 'c1')) {
            originalPositionOfRook = 'a1'
            newPositionOfRook = 'd1'
        } else if ((move.from === 'e8' && move.to === 'g8')) {
            originalPositionOfRook = 'h8'
            newPositionOfRook = 'f8'
        } else { // e8 to c8
            originalPositionOfRook = 'a8'
            newPositionOfRook = 'd8'
        }   

    
        return {
            didCastle: true, 
            x: this.toAlphabet2[originalPositionOfRook[0]], 
            y: this.toCoord2[originalPositionOfRook[1]], 
            to_x: this.toAlphabet2[newPositionOfRook[0]], 
            to_y: this.toCoord2[newPositionOfRook[1]]
        }
    }


    isPawnPromotion(to, piece) {
        const res = piece === 'p' && (to[1] === 105 || to[1] === 735)
        if (res) {
            this.nQueens += 1
        }
        return res
    }


    toChessMove(finalPosition, to2D) {
      
        let move 

        if (finalPosition[0] > 100) {
            move = this.toAlphabet[to2D[finalPosition[0]]] + this.toCoord[to2D[finalPosition[1]]]
        } else {
            move = this.toAlphabet[finalPosition[0]] + this.toCoord[finalPosition[1]]
        }
       
       //  console.log("proposed move: " + move)
        return move
    }

    findPiece(board, pieceId) {
        // ChessBoard, String -> [Int, Int]
      //  console.log("piecetofind: " + pieceId)
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (board[i][j].getPieceIdOnThisSquare() === pieceId) {
                    return [j, i]
                }
            }
        }
    }

    makeStartingBoard() {
        const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
        var startingChessBoard = []
        for (var i = 0; i < 8; i++) {
            startingChessBoard.push([])
            for (var j = 0; j < 8; j++) {
                // j is horizontal
                // i is vertical
                const coordinatesOnCanvas = [((j + 1) * 90 + 15), ((i + 1) * 90 + 15)]
                const emptySquare = new Square(j, i, null, coordinatesOnCanvas)
                
                startingChessBoard[i].push(emptySquare)
            }
        }
        const whiteBackRankId = ["wr1", "wn1", "wb1", "wq1", "wk1", "wb2", "wn2", "wr2"]
        const blackBackRankId = ["br1", "bn1", "bb1", "bq1", "bk1", "bb2", "bn2", "br2"]
        for (var j = 0; j < 8; j += 7) {
            for (var i = 0; i < 8; i++) {
                if (j == 0) {
                    // top
                    // console.log(backRank[i])
                    startingChessBoard[j][this.thisPlayersColorIsWhite ? i : 7 - i].setPiece(new ChessPiece(backRank[i], false, this.thisPlayersColorIsWhite ? "black" : "white", this.thisPlayersColorIsWhite ? blackBackRankId[i] : whiteBackRankId[i]))
                    startingChessBoard[j + 1][this.thisPlayersColorIsWhite ? i : 7 - i].setPiece(new ChessPiece("pawn", false, this.thisPlayersColorIsWhite ? "black" : "white", this.thisPlayersColorIsWhite ? "bp" + i : "wp" + i))
                } else {
                    // bottom
                    startingChessBoard[j - 1][this.thisPlayersColorIsWhite ? i : 7 - i].setPiece(new ChessPiece("pawn", false, this.thisPlayersColorIsWhite ? "white" : "black", this.thisPlayersColorIsWhite ? "wp" + i : "bp" + i))
                    startingChessBoard[j][this.thisPlayersColorIsWhite ? i : 7 - i].setPiece(new ChessPiece(backRank[i], false, this.thisPlayersColorIsWhite ? "white" : "black", this.thisPlayersColorIsWhite ? whiteBackRankId[i] : blackBackRankId[i]))
                }
            }
        }
        return startingChessBoard
    }
}

export default Game