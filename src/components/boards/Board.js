import React from 'react';
import { useStoreState } from 'easy-peasy';

import './board.css';

const AssembleBoard = ({ onSquareClicked }) => {

    const { gameRoute } = useStoreState(state => ({
        gameRoute: state.gameRoute,
        route: state.route
    }));

    const allSquares = [];
    for (let i = 1; i < 11; i++) {
        for (let j = 0; j < 10; j++) {
            allSquares.push({row: String.fromCharCode(97 + j), col: i, colStart: i, rowStart: j + 1})
        }
    }

    const handleSquareClick = (e) => {
        const parentBoard = e.target.parentElement.parentElement.parentElement;
        if (gameRoute === 'gameInProgress' && parentBoard.classList.contains('opponentBoard')) {
            onSquareClicked(e);
        }
    }

    return (
        allSquares.map(square => {
            return (
                <div
                    onClick={handleSquareClick}
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
