import React from 'react';
import Board from './Board';
import { socket } from '../../socket/socketImport';
import './board.css';

const OpponentBoard = ({friendSocket, route}) => {
    const root = document.querySelector(':root');
    let clickedSquare = '';
    let score = 0;

    const onSquareClicked = (e) => {
        if (!e.target.classList.contains('hit') && !e.target.classList.contains('miss')) {
            clickedSquare = e.target;
            socket.emit('send shot to opponent', {target: e.target.id, socketid: friendSocket});
            root.style.setProperty("--sqaure-already-selected", '""');
        } else {
            root.style.setProperty("--sqaure-already-selected", '"That spot has already been selected"');
        }
    }

    const displayWinner = () => {
        root.style.setProperty("--winner-text", '"You Win!"');
        console.log(score);
        score = 0;
    }

    socket.on('show result on opponent board', result => {
        if (result === 'hit' && clickedSquare.classList !== undefined) {
            clickedSquare.classList.add('hit');
            score += 1;
            if (score === 17) {
                displayWinner();
            }
        } else if (result === 'miss' && clickedSquare.classList !== undefined) {
            clickedSquare.classList.add('miss');
        }
    })

    return (
        <div className='board opponentBoard'>
            <div className='rows'>
                <h3>A</h3>
                <h3>B</h3>
                <h3>C</h3>
                <h3>D</h3>
                <h3>E</h3>
                <h3>F</h3>
                <h3>G</h3>
                <h3>H</h3>
                <h3>I</h3>
                <h3>J</h3>
            </div>

            <div className='cols'>
                <h3>1</h3>
                <h3>2</h3>
                <h3>3</h3>
                <h3>4</h3>
                <h3>5</h3>
                <h3>6</h3>
                <h3>7</h3>
                <h3>8</h3>
                <h3>9</h3>
                <h3>10</h3>
            </div>

            <div className='grid'>
                <div className='allSqaures'>
                    <Board route={route} onSquareClicked={onSquareClicked} />
                </div>
            </div>
        </div>
    )
}

export default OpponentBoard;

