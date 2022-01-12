import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import ChatBox from './ChatBox';
import Footer from '../footer/Footer';

const Game = ({ socket, onRouteChange }) => {
    const pickUpShipInstructions = "To pick up a ship, left click on it";
    const rotateShipInstructions = "To rotate a ship, right click or press 'enter'";
    const dropShipInstructions = "To drop the ship, left click";
    
    const { friendSocket, opponentName, user, checkOppStatusInterval, gameRoute, playerIsReady, opponentIsReady, yourTurn, playerTurnText, isMobile } = useStoreState(state => ({
        friendSocket: state.friendSocket,
        opponentName: state.opponentName,
        user: state.user,
        checkOppStatusInterval: state.checkOppStatusInterval,
        gameRoute: state.gameRoute,
        playerIsReady: state.playerIsReady,
        opponentIsReady: state.opponentIsReady,
        yourTurn: state.yourTurn,
        playerTurnText: state.playerTurnText,
        isMobile: state.stored.isMobile
    }));

    const { setCheckOppStatusInterval, setRoute, setGameRoute, setPlayerIsReady, setOpponentIsReady, setYourTurn, setPlayerTurnText } = useStoreActions(actions => ({
        setCheckOppStatusInterval: actions.setCheckOppStatusInterval,
        setRoute: actions.setRoute,
        setGameRoute: actions.setGameRoute,
        setPlayerIsReady: actions.setPlayerIsReady,
        setOpponentIsReady: actions.setOpponentIsReady,
        setYourTurn: actions.setYourTurn,
        setPlayerTurnText: actions.setPlayerTurnText
    }));

    useEffect(() => {
        setPlayerIsReady(false);
        setOpponentIsReady(false);
        setGameRoute('placeShips');
        // const gamePage = document.querySelector('.gamePage');
        socket.on('receive game over', () => {
            // gamePage.style.setProperty('--player-turn-text', '"You Won!"');
            // setTimeout(gameOver, 2000);
            clearInterval(checkOppStatusInterval);
            if (user?.hash !== 'guest') {
                addWin();
            }
            setTimeout(() => {
                window.alert('You Won!!!');
                user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
            }, 300);
        })

        socket.on('receive exit game', () => {
            window.alert('Opponent has left the game');
            user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
        })

        setCheckOppStatusInterval(setInterval(checkIfOpponentIsOnline, 3000));

        return () => {
            clearInterval(checkOppStatusInterval);
            socket.off('receive ready status');
            socket.off('receive game over');
            socket.off('receive exit game');
        }
    },[])

    // useEffect(() => {
    //     const gameInstructions = document.querySelector('.gamePage');
    //     if (gameRoute === 'placeShips') {
    //         gameInstructions.style.setProperty('--player-turn-text', `"${instructions}"`);
    //     } else if (yourTurn) {
    //         gameInstructions.style.setProperty('--player-turn-text', '"Your Turn!"');
    //     } else {
    //         gameInstructions.style.setProperty('--player-turn-text', `"${opponentName}'s Turn!"`);
    //     }
    // },[yourTurn, gameRoute])

    useEffect(() => {
        const shipContainers = document.querySelectorAll('.userBoard .ship');
        let score = 0;
        if (yourTurn) {
            setPlayerTurnText('Your Turn')
            shipContainers.forEach(shipContainer => {
                if (shipContainer.childNodes[0].classList.contains('shipSunkUser')) {
                    score += 1;
                }
            })
            if (score >= 5) {
                socket.emit('game over', friendSocket);
                setTimeout(() => {
                    window.alert('You Lose');
                    user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
                }, 300);
            }
        } else {
            setPlayerTurnText(`${opponentName}'s Turn!`)
        }
    },[yourTurn])

    const checkIfOpponentIsOnline = async () => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/checkIfOppOnline?username=${opponentName}`)
            if (!response.ok) {
                throw new Error('Error')
            }
            const isOnline = await response.json();
            if (!isOnline) {
                window.alert('Opponent has left the game');
                user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
            }
        } catch(err) {
            console.log(err);
        }
   }

    const addWin = async () => {
        try {
            const res = await fetch('https://calm-ridge-60009.herokuapp.com/updateWins', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user.username
                })
            })
            const winsUpdated = await res.json();
            if (!winsUpdated) {
                throw new Error('Could not increment wins')
            }
        } catch(err) {
            console.log(err);
        }
    }

    socket.on('receive ready status', () => {
        if (playerIsReady) {
            setGameRoute('gameInProgress');
        }
        setOpponentIsReady(true);
    })

    const handleReadyButton = () => {
        const ships = document.querySelectorAll('.ship');
        const readyBtn = document.querySelector('.readyBtn');
        const instructionsList = document.querySelector('.instructions');
        instructionsList.classList.add('hide');
        readyBtn.childNodes[0].innerText = `${!isMobile ? 'Waiting...' : '•••'}`;
        for (let ship of ships) {
            ship.style.cursor = 'default';
        }
        if (opponentIsReady) {
            setGameRoute('gameInProgress');
            setYourTurn(true);
        } else {
            readyBtn.style.opacity = '0.3';
        }
        setPlayerIsReady(true);
        socket.emit('send ready status', friendSocket);
    }

    return (
        <>
            <Navigation socket={socket} onRouteChange={onRouteChange} />
            <UserBoard socket={socket} />
            <div className={`instructions ${isMobile ? 'hide' : null}`}>
                <h5>○ {pickUpShipInstructions}</h5>
                <h5>○ {rotateShipInstructions}</h5>
                <h5>○ {dropShipInstructions}</h5>
            </div>
            <h3 className={`playerTurnText ${gameRoute === 'gameInProgress' ? null : 'hide'}`}>{`${gameRoute === 'gameInProgress' ? playerTurnText : ''}`}</h3>
            {
            gameRoute === 'placeShips'
            ? 
            <div className='readyBtn'>
                <button onClick={handleReadyButton} className='btn'>{isMobile ? '✔️' : 'Ready'}</button>
            </div>
            : (null)
            }
            <OpponentBoard socket={socket} />
            <ChatBox socket={socket} />
            <Footer />
        </>
    )
}

export default Game;
