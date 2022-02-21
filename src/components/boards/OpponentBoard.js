import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Board from './Board';
import { audio } from '../../audio';
import './board.css';

const OpponentBoard = ({ socket }) => {
    const { friendSocket, yourTurn, playingWithAI } = useStoreState(state => ({
        friendSocket: state.friendSocket,
        yourTurn: state.yourTurn,
        playingWithAI: state.playingWithAI
    }));

    const { setYourTurn, setSkippedTurns } = useStoreActions(actions => ({
        setYourTurn: actions.setYourTurn,
        setSkippedTurns: actions.setSkippedTurns
    }));

    let aiShipLocations = {
        destroyer: [],
        submarine: [],
        cruiser: [],
        battleship: [],
        carrier: []
    };
    
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

    useEffect(() => {
        if (playingWithAI) setAIships();

        socket.on('show result on opponent board', data => {
            const clickedSquare = document.querySelector(`.opponentBoard [id='${data.shotSquare}']`);
            document.querySelector('.preResultDiv').remove();
            if (data.result === 'hit' && clickedSquare.classList !== undefined) {
                clickedSquare.classList.add('hitMarker');
                hitSquares.push(data.shipHit);
                clickedSquare.classList.add(`_${data.shipHit}`)
                if (countHitsOnShip(data.shipHit) === parseInt(document.querySelector(`.${data.shipHit}`).id)) {
                    const squares = document.querySelectorAll('.singleSquare');
                    audio.shipSunkSound.play();
                    for (let square of squares) {
                        if (square.classList.contains(`_${data.shipHit}`)) {
                            square.classList.add('shipSunk');
                        }
                    }
                } else {
                    audio.hitSound.play();
                }
            } else if (data.result === 'miss' && clickedSquare.classList !== undefined) {
                clickedSquare.classList.add('missMarker');
                audio.missSound.play();
            }
        })

        return () => {
            socket.off('show result on opponent board');
        }
    },[])

    const aiSpotClear = (newSpot) => {
        for (let spot of Object.values(aiShipLocations).flat()) {
            if (spot != newSpot) {
                return true;
            }
        }
        return false;
    }

    const pickRandomBoardLocation = () => {
        let newSpot;
        let counter = 0;
        while (counter < 100) {
            counter++;
            newSpot = `${Math.round(Math.random() * (10 - 1) + 1)}-${Math.round(Math.random() * (10 - 1) + 1)}`
            if (aiSpotClear(newSpot)) {
                return newSpot;
            }
        }
    }

    const shuffleArray = (arr) => {
        let currentIndex = arr.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        
        return arr;
    }

    const lowestAndHighest = (i, colRowIndex, shipName) => {
        const firstSpot = aiShipLocations[shipName][0];
        const secondSpot = aiShipLocations[shipName][i-1];
        
        if (Math.min(parseInt(firstSpot?.charAt(colRowIndex)), parseInt(secondSpot?.charAt(colRowIndex))) === parseInt(firstSpot?.charAt(colRowIndex))) {
            return {
                lowest: firstSpot,
                highest: secondSpot
            }
        } else {
            return {
                lowest: secondSpot,
                highest: firstSpot
            }
        }
    }

    const setSingleAIship = (shipLength, shipName) => {
        while (aiShipLocations[shipName].length !== shipLength) {
            // aiShipLocations[shipName] = [];

            for (let i = 0; i < shipLength; i++) {
                if (i === 0) {
                    aiShipLocations[shipName][0] = pickRandomBoardLocation();
                } else if (i === 1) {
                    const possibleChoices = [
                        `${parseInt(aiShipLocations[shipName][0]?.charAt(0)) - 1}-${parseInt(aiShipLocations[shipName][0]?.charAt(2))}`,
                        `${parseInt(aiShipLocations[shipName][0]?.charAt(0)) + 1}-${parseInt(aiShipLocations[shipName][0]?.charAt(2))}`,
                        `${parseInt(aiShipLocations[shipName][0]?.charAt(0))}-${parseInt(aiShipLocations[shipName][0]?.charAt(2)) - 1}`,
                        `${parseInt(aiShipLocations[shipName][0]?.charAt(0))}-${parseInt(aiShipLocations[shipName][0]?.charAt(2)) + 1}`
                    ]
                    shuffleArray(possibleChoices);
                    possibleChoices.forEach(choice => {
                        if (choice.charAt(0) > 0 && choice.charAt(0) < 11 && choice.charAt(2) > 0 && choice.charAt(2) < 11 && aiSpotClear(choice)) {
                            aiShipLocations[shipName][1] = choice;
                        }
                    })
                } else {
                    if (aiShipLocations[shipName][0]?.charAt(0) !== aiShipLocations[shipName][1]?.charAt(0)) {
                        const lowest = lowestAndHighest(i, 0, shipName).lowest;
                        const highest = lowestAndHighest(i, 0, shipName).highest;
                        const possibleChoices = [
                            `${parseInt(lowest?.charAt(0)) - 1}-${lowest?.charAt(2)}`,
                            `${parseInt(highest?.charAt(0)) + 1}-${highest?.charAt(2)}`
                        ]
                        shuffleArray(possibleChoices);
                        possibleChoices.every(choice => {
                            if (choice.charAt(0) > 0 && choice.charAt(0) < 11 && choice.charAt(2) > 0 && choice.charAt(2) < 11 && aiSpotClear(choice)) {
                                aiShipLocations[shipName][i] = choice;
                                return false;
                            }
                            return true;
                        })
                    } else {
                        const lowest = lowestAndHighest(i, 2, shipName).lowest;
                        const highest = lowestAndHighest(i, 2, shipName).highest;
                        const possibleChoices = [
                            `${lowest.charAt(0)}-${parseInt(lowest.charAt(2)) - 1}`,
                            `${highest.charAt(0)}-${parseInt(highest.charAt(2)) + 1}`
                        ]
                        shuffleArray(possibleChoices);
                        possibleChoices.every(choice => {
                            if (choice.charAt(0) > 0 && choice.charAt(0) < 11 && choice.charAt(2) > 0 && choice.charAt(2) < 11 && aiSpotClear(choice)) {
                                aiShipLocations[shipName][i] = choice;
                                return false;
                            }
                            return true;
                        })
                    }
                }
            }
        }
    }

    const setAIships = () => {
        //Destroyer
        setSingleAIship(2, 'destroyer');
        //submarine
        setSingleAIship(3, 'submarine');
        //cruiser
        setSingleAIship(3, 'cruiser');
        //battleship
        setSingleAIship(4, 'battleship');
        //carrier
        setSingleAIship(5, 'carrier');
        console.log(Object.values(aiShipLocations));
    }

    const onSquareClicked = (e) => {
        if (yourTurn && !e.target.classList.contains('hitMarker') && !e.target.classList.contains('missMarker')) {
            // setSquareClicked(e.target);
            setSkippedTurns(0);
            setYourTurn(false);
            const preResultDiv = document.createElement('div');
            preResultDiv.classList.add('preResultDiv');
            e.target.appendChild(preResultDiv);

            audio.missileLaunch.play();
            socket.emit('send shot to opponent', {target: e.target.id, socketid: friendSocket});
        }
    }

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
                    <Board onSquareClicked={onSquareClicked} />
                </div>
            </div>
        </div>
    )
}

export default OpponentBoard;

