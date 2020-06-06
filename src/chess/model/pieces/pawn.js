function pawn(x, y, color, chessBoard) {
    /*
        Assume pawn is not on queening square.
        Generate all possible squares this pawn can go to. 
    */
    var possibleSquares = []
        // advance forward
        if (color === "white" && !chessBoard[y - 1][x].isOccupied()) {
            possibleSquares.push(chessBoard[y - 1][x])
            if (y === 6 && !chessBoard[y - 2][x].isOccupied()) {
                possibleSquares.push(chessBoard[y - 2][x])
            }
        } else if (color === "black" && !chessBoard[y + 1][x].isOccupied()) {
            possibleSquares.push(chessBoard[y + 1][x])
            if (y === 1 && !chessBoard[y + 2][x].isOccupied()) {
                possibleSquares.push(chessBoard[y + 2][x])
            }
        }
        // take enemy piece on the left
        if (color === "white" && x > 0 && chessBoard[y - 1][x - 1].isOccupied() && chessBoard[y - 1][x - 1].getPiece().color === "black") {
            possibleSquares.push(chessBoard[y - 1][x - 1])
        } else if (color === "black" && x > 0 && chessBoard[y + 1][x - 1].isOccupied() && chessBoard[y + 1][x - 1].getPiece().color === "white") {
            possibleSquares.push(chessBoard[y + 1][x - 1])
        }
        // take enemy piece on the right
        if (color === "white" && x < 7 && chessBoard[y - 1][x + 1].isOccupied() && chessBoard[y - 1][x + 1].getPiece().color === "black") {
            possibleSquares.push(chessBoard[y - 1][x + 1])
        } else if (color === "black" && x < 7 && chessBoard[y + 1][x + 1].isOccupied() && chessBoard[y + 1][x + 1].getPiece().color === "white") {
            possibleSquares.push(chessBoard[y + 1][x + 1])
        }
    
    return possibleSquares
}

module.exports = pawn