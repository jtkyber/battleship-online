import React from 'react';
import Board from './Board';
import Ships from '../ships/Ships';
import { socket } from '../../socket/socketImport';
import $ from 'jquery';
import './board.css';

const UserBoard = ({friendSocket, route}) => {
    const hit = (item1, item2) => {
        let d1Offset = $(item1).offset();
        let d1Height = $(item1).outerHeight(true);
        let d1Width = $(item1).outerWidth(true);
        let d1Top = d1Offset.top + d1Height;
        let d1Left = d1Offset.left + d1Width;
        let d2Offset = $(item2).offset();
        let d2Height = $(item2).outerHeight(true);
        let d2Width = $(item2).outerWidth(true);
        let d2Top = d2Offset.top + d2Height;
        let d2Left = d2Offset.left + d2Width;

        const colliding = !(d1Top <= d2Offset.top || d1Offset.top >= d2Top || d1Left <= d2Offset.left || d1Offset.left >= d2Left);

        return colliding;
    }

    const applyHitOrMiss = (oppShot) => {
        if (matchOppShotToBoard(oppShot)) {
            oppShot.classList.add('hit');
            socket.emit('send result to opponent board', {shot: 'hit', socketid: friendSocket});
        } else {
            oppShot.classList.add('miss');
            socket.emit('send result to opponent board', {shot: 'miss', socketid: friendSocket});
        }
    }

    const matchOppShotToBoard = (shot) => {
        const ships = document.querySelectorAll('.ship');
        for (let ship of ships) {
            if (hit(shot, ship)) {
                return true;
            }
        }
        return false;
    }

    socket.on('receive shot', shot => {
        const oppShot = document.getElementById(shot);
        applyHitOrMiss(oppShot);
    })

    return (
        <div className='board userBoard'>
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
                    <Board />
                    <Ships route={route}/>
                </div>
            </div>
        </div>
    )
}

export default UserBoard;

