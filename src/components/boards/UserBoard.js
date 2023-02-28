import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Board from './Board';
import Ships from '../ships/Ships';
import $ from 'jquery';
import { audio } from '../../audio';
import hitGif from './hit.gif';
import './board.css';

let hitSquares = [];
let firstHit = '';
let lastHit = '';
let aiShipOrientationGuess = null;

const UserBoard = () => {
    const {  playingWithAI, allSquareIDs, aiTurn, channel, opponentName } = useStoreState(state => ({
        playingWithAI: state.playingWithAI,
        allSquareIDs: state.allSquareIDs,
        aiTurn: state.aiTurn,
        channel: state.channel,
        opponentName: state.opponentName
    }));

    const { setYourTurn, setAllSquareIDs, setAIturn } = useStoreActions(actions => ({
        setYourTurn: actions.setYourTurn,
        setAllSquareIDs: actions.setAllSquareIDs,
        setAIturn: actions.setAIturn
    }));

    let shipHit = '';
    useEffect(() => {
        const allSqaures = document.querySelectorAll('.opponentBoard .singleSquare');
        const allSquareIDsTemp = [];
        for (let square of allSqaures) {
            allSquareIDsTemp.push(square.id);
        }
        setAllSquareIDs(allSquareIDsTemp);

        channel.bind('receive-shot', data => {
            if (data.shot === 'oppOutOfTime') {
                setYourTurn(true);
            } else {
                const oppShot = document.getElementById(data.shot);
    
                const incomingMissileDuration = audio.incomingMissile.duration() * 1000 - 100;
                audio.incomingMissile.play();
                setTimeout(() => {
                    applyHitOrMiss(oppShot);
                    setYourTurn(true);
                }, incomingMissileDuration)
            }
            return data
        })

        return () => {
            channel.unbind('receive-shot')
            setAIturn(false);
            setAllSquareIDs([]);
            hitSquares = [];
            firstHit = '';
            lastHit = '';
            aiShipOrientationGuess = null;
        }
    },[])

    const shuffleArray = (arr) => {
        let currentIndex = arr.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        
        return arr;
    }

    const colString = (str) => {
        return str.split('-')[0];
    }

    const rowString = (str) => {
        return str.split('-')[1];
    }

    const pickRandomSquare = () => {
        const randIndex = Math.round(Math.random() * ((allSquareIDs.length - 1) - 0) + 0);
        const randSquare = allSquareIDs[randIndex];
        allSquareIDs.splice(randIndex, 1);

        setTimeout(() => {
            console.log("AI: Choosing random available square --> ", randSquare)
            console.log("__________________________________________________________________________________")
        }, 1000);

        return randSquare;
    }

    const getChoicesForNearby = (hit) => {
        const possibleChoices = [
            !aiShipOrientationGuess || aiShipOrientationGuess === 'hor' ? `${parseInt(colString(hit)) - 1}-${parseInt(rowString(hit))}` : null,
            !aiShipOrientationGuess || aiShipOrientationGuess === 'hor' ? `${parseInt(colString(hit)) + 1}-${parseInt(rowString(hit))}` : null,
            !aiShipOrientationGuess || aiShipOrientationGuess === 'vert' ? `${parseInt(colString(hit))}-${parseInt(rowString(hit)) - 1}` : null,
            !aiShipOrientationGuess || aiShipOrientationGuess === 'vert' ? `${parseInt(colString(hit))}-${parseInt(rowString(hit)) + 1}` : null
        ]

        return possibleChoices;
    }

    const pickNearbySquare = () => {
        let aiMoveText = '';
        if (lastHit !== firstHit) {
            if (colString(lastHit) !== colString(firstHit)) {
                aiShipOrientationGuess = 'hor';
            } else {
                aiShipOrientationGuess = 'vert';
            }
        } else {
            aiShipOrientationGuess = null;
        }

        let numOfValidSquares = 0;
        let possibleChoices = getChoicesForNearby(lastHit);
        shuffleArray(possibleChoices);

        for (let choice of possibleChoices) {
            for (let square of allSquareIDs) {
                if (square === choice) {
                    numOfValidSquares += 1;
                    aiShipOrientationGuess 
                    ? aiMoveText = `AI: Choosing ${aiShipOrientationGuess === 'hor' ? 'horizontal' : 'vertical'} neighbor to last hit --> `
                    : aiMoveText = "AI: Choosing random available neighbor to last hit --> "
                }
            }
        }

        if (numOfValidSquares <= 0) {
            lastHit = firstHit;
            possibleChoices = getChoicesForNearby(firstHit);
            let foundOption = false;

            for (let choice of possibleChoices) {
                for (let square of allSquareIDs) {
                    if (square === choice) {
                        foundOption = true;
                        aiMoveText = `AI: Going back to first hit with another ${aiShipOrientationGuess === 'hor' ? 'horizontal' : 'vertical'} guess --> `;
                    }
                }
            }

            if (!foundOption) {
                aiShipOrientationGuess = null;
                aiMoveText = `AI: Going back to first hit and choosing random available neighbor --> `;
                possibleChoices = getChoicesForNearby(firstHit);
            }

            shuffleArray(possibleChoices);
        }


        if (possibleChoices) {
            for (let choice of possibleChoices) {
                for (let square of allSquareIDs) {
                    if (square === choice) {
                        const selected = choice;
                        allSquareIDs.splice(allSquareIDs.indexOf(selected), 1);
                        setTimeout(() => {
                            console.log(aiMoveText, selected)
                            console.log("__________________________________________________________________________________")
                        }, 1000);
                        return selected;
                    }
                }
            }
        } else {
            console.log(Error, 'Could not find possible square');
        }
    }

    const unfinishedShipSpot = () => {
        const allSqaures = document.querySelectorAll('.userBoard .singleSquare');
        for (let square of allSqaures) {
            if (square?.childNodes[0]?.classList.contains('hitMarkerGif')) {
                setTimeout(() => {
                    console.log("AI: Going back to unfinished ship -- > ", square.id)
                }, 500);
                return square.id;
            }
        }
        return false;
    }

    useEffect(() => {
        if (aiTurn) {
            let shotOnUserBoard;
            if (lastHit) {
                shotOnUserBoard = document.getElementById(pickNearbySquare());
            } else if (unfinishedShipSpot()) {
                firstHit = unfinishedShipSpot();
                lastHit = unfinishedShipSpot();
                shotOnUserBoard = document.getElementById(pickNearbySquare());
            } else {
                shotOnUserBoard = document.getElementById(pickRandomSquare());
            }

            setTimeout(() => {
                const incomingMissileDuration = audio.incomingMissile.duration() * 1000;
                audio.incomingMissile.play();
                setTimeout(() => {
                    applyHitOrMiss(shotOnUserBoard);
                    setYourTurn(true);
                }, incomingMissileDuration)
            }, 1300);
            setAIturn(false);
        }
    },[aiTurn])

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

    const countHitsOnShip = (ship) => {
        let count = 0;
        for (let hit of hitSquares) {
            if (hit === ship) {
                count += 1;
            }
        }
        return count;
    }

    const applyHitOrMiss = async (oppShot) => {
        if (matchOppShotToBoard(oppShot)) {
            const hitMarkerBackgroundFlash = document.createElement('div');
            hitMarkerBackgroundFlash.classList.add('hitMarkerBackgroundFlash');

            const hitElem = document.createElement('img');
            hitElem.src = hitGif;
            hitElem.classList.add('hitMarkerGif');

            const shrapN = document.createElement('div');
            shrapN.classList.add('shrapN');

            const shrapNE = document.createElement('div');
            shrapNE.classList.add('shrapNE');

            const shrapE = document.createElement('div');
            shrapE.classList.add('shrapE');

            const shrapSE = document.createElement('div');
            shrapSE.classList.add('shrapSE');

            const shrapS = document.createElement('div');
            shrapS.classList.add('shrapS');

            const shrapSW = document.createElement('div');
            shrapSW.classList.add('shrapSW');

            const shrapW = document.createElement('div');
            shrapW.classList.add('shrapW');

            const shrapNW = document.createElement('div');
            shrapNW.classList.add('shrapNW');

            oppShot.append(hitElem, hitMarkerBackgroundFlash, shrapN, shrapNE, shrapE, shrapSE, shrapS, shrapSW, shrapW, shrapNW);

            setTimeout(() => {
                hitMarkerBackgroundFlash.remove();
                shrapN.remove();
                shrapNE.remove();
                shrapE.remove();
                shrapSE.remove();
                shrapS.remove();
                shrapSW.remove();
                shrapW.remove();
                shrapNW.remove();
            }, 1100);

            hitSquares.push(shipHit);
            lastHit = oppShot.id;
            if (!firstHit) {
                firstHit = oppShot.id;
            }

            oppShot.classList.add(`_${shipHit}_userboard`)
            if (countHitsOnShip(shipHit) === parseInt(document.querySelector(`.${shipHit}`).id)) {
                const sunkShipIcon = document.querySelector(`.${shipHit}Icon`);
                const squares = document.querySelectorAll('.singleSquare');
                audio.shipSunkSound.play();
                firstHit = '';
                lastHit = '';
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
            if (!playingWithAI) await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendResultToOpponentBoard?channelName=${opponentName}&shotSquare=${oppShot.id}&shot=hit&shipHit=${shipHit}`)
        } else {
            oppShot.classList.add('missMarker');
            audio.missSound.play();
            if (!playingWithAI) await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendResultToOpponentBoard?channelName=${opponentName}&shotSquare=${oppShot.id}&shot=miss&shipHit=${shipHit}`)
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

