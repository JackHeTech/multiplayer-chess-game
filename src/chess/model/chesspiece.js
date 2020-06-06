const pawn = require('./pieces/pawn')

class ChessPiece {
    constructor(name, isAttacked, color, id) {
        this.name = name // string
        this.isAttacked = isAttacked // boolean
        this.color = color // string
        this.id = id // string
    }

    setSquare(newSquare) {
        // set the square this piece is sitting top of. 
        // on any given piece (on the board), there will always be a piece on top of it. 
        // console.log(newSquare)
        if (newSquare === undefined) {
            this.squareThisPieceIsOn = newSquare
            return 
        }

        if (this.squareThisPieceIsOn === undefined) {
            this.squareThisPieceIsOn = newSquare
            newSquare.setPiece(this)
        }

        const isNewSquareDifferent = this.squareThisPieceIsOn.x != newSquare.x || this.squareThisPieceIsOn.y != newSquare.y

        if (isNewSquareDifferent) {
            // console.log("set")
            this.squareThisPieceIsOn = newSquare
            newSquare.setPiece(this)
        }
    }

    getSquare() {
        return this.squareThisPieceIsOn
    }


    generatePossibleSquares(chessBoard) {
        switch(this.name) {
            case "pawn":
                return this.pawn(chessBoard)
            case "knight":
                return this.knight(chessBoard)
            case "bishop":
                return this.bishop(chessBoard)
            case "queen":
                return this.queen(chessBoard)
            case "king":
                return this.king(chessBoard)
            default:
                return this.rook(chessBoard)
        }
    }

    // REQUIRED: call getSquare before calling this method
    pawn(chessBoard) {
        const y = this.squareThisPieceIsOn.y
        const x = this.squareThisPieceIsOn.x
        this.possibleSquares = pawn(x, y, this.color, chessBoard)
    }

    knight(chessBoard) {
        this.possibleSquares = [] // stub
    }

    king(chessBoard) {
        this.possibleSquares = [] // stub
    }

    queen(chessBoard) {
        this.possibleSquares = [] // stub
    }

    rook(chessBoard) {
        this.possibleSquares = [] // stub
    }

    bishop(chessBoard) {
        this.possibleSquares = [] // stub
    }
}


module.exports = ChessPiece