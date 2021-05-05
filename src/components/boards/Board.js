import React from 'react';
import './board.css';

const AssembleBoard = ({route, onSquareClicked}) => {
    const allSquares = [];
    for (let i = 1; i < 11; i++) {
        for (let j = 0; j < 10; j++) {
            allSquares.push({row: String.fromCharCode(97 + j), col: i, colStart: i, rowStart: j + 1})
        }
    }

    return (
        allSquares.map(square => {
            return (
                <div
                    onClick={onSquareClicked}
                    style={{gridArea: square.row + square.col}}
                    className={'singleSquare ' + square.row + ' ' + square.row + square.col}
                    key={square.row + square.col}
                    id={square.colStart + '-' + square.rowStart}
                >
                </div>
            )
        })
    )
}

export default AssembleBoard;
