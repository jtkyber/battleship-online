import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Board from './Board';
import Ships from '../ships/Ships';
import $ from 'jquery';
import { audio } from '../../audio';
import hitGif from './hit.gif';
import './board.css';

const UserBoard = ({ socket }) => {
    const { friendSocket } = useStoreState(state => ({
        friendSocket: state.friendSocket
    }));

    const { setYourTurn } = useStoreActions(actions => ({
        setYourTurn: actions.setYourTurn
    }));

    let shipHit = '';
    useEffect(() => {
        socket.on('receive shot', shot => {
            const oppShot = document.getElementById(shot);

            const incomingMissileDuration = audio.incomingMissile.duration() * 1000 - 100;
            audio.incomingMissile.play();
            setTimeout(() => {
                applyHitOrMiss(oppShot);
                setYourTurn(true);
            }, incomingMissileDuration)
        })

        return () => {
            socket.off('receive shot');
        }
    },[])

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

        const colliding = !(d1Top <= d2Offset.top + 2 || d1Offset.top >= d2Top - 2 || d1Left <= d2Offset.left + 2 || d1Offset.left >= d2Left - 2);

        return colliding;
    }

    const hitSquares = [];
    const countHitsOnShip = (ship) => {
        let count = 0;
        for (let hit of hitSquares) {
            if (hit === ship) {
                count += 1;
            }
        }
        return count;
    }

    const applyHitOrMiss = (oppShot) => {
        if (matchOppShotToBoard(oppShot)) {
            // oppShot.classList.add('hit');
            // oppShot.classList.add('hitMarker');
            const hitElem = document.createElement('img');
            hitElem.src = hitGif;
            hitElem.classList.add('hitMarkerGif');
            oppShot.appendChild(hitElem);

            hitSquares.push(shipHit);
            oppShot.classList.add(`_${shipHit}_userboard`)
            if (countHitsOnShip(shipHit) === parseInt(document.querySelector(`.${shipHit}`).id)) {
                const sunkShipIcon = document.querySelector(`.${shipHit}Icon`);
                const squares = document.querySelectorAll('.singleSquare');
                audio.shipSunkSound.play();
                for (let square of squares) {
                    if (square.classList.contains(`_${shipHit}_userboard`)) {
                        // square.classList.remove('hitMarker');
                        square.querySelector('.hitMarkerGif').remove();
                    }
                }
                sunkShipIcon.classList.add('shipSunkUser');
            } else {
                audio.hitSound.play();
            }
            socket.emit('send result to opponent board', {shotSquare: oppShot.id, shot: 'hit', socketid: friendSocket, shipHit: shipHit});
        } else {
            oppShot.classList.add('missMarker');
            audio.missSound.play();
            socket.emit('send result to opponent board', {shotSquare: oppShot.id, shot: 'miss', socketid: friendSocket, shipHit: shipHit});
        }
    }

    const matchOppShotToBoard = (shot) => {
        const ships = document.querySelectorAll('.ship');
        for (let ship of ships) {
            if (hit(shot, ship)) {
                shipHit = ship.classList[1];
                return true;
            }
        }
        return false;
    }

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
                    <Ships />
                </div>
            </div>
        </div>
    )
}

export default UserBoard;

