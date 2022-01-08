import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import ChatBox from './ChatBox';
import Footer from '../footer/Footer';

const Game = ({ socket, onRouteChange }) => {
    
    const { friendSocket, opponentName, user, checkOppStatusInterval, gameRoute, playerIsReady, opponentIsReady, yourTurn } = useStoreState(state => ({
        friendSocket: state.friendSocket,
        opponentName: state.opponentName,
        user: state.user,
        checkOppStatusInterval: state.checkOppStatusInterval,
        gameRoute: state.gameRoute,
        playerIsReady: state.playerIsReady,
        opponentIsReady: state.opponentIsReady,
        yourTurn: state.yourTurn
    }));

    const { setCheckOppStatusInterval, setRoute, setGameRoute, setPlayerIsReady, setOpponentIsReady, setYourTurn } = useStoreActions(actions => ({
        setCheckOppStatusInterval: actions.setCheckOppStatusInterval,
        setRoute: actions.setRoute,
        setGameRoute: actions.setGameRoute,
        setPlayerIsReady: actions.setPlayerIsReady,
        setOpponentIsReady: actions.setOpponentIsReady,
        setYourTurn: actions.setYourTurn
    }));
    
    const instructions = 'Place your ships!';

    useEffect(() => {
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

    useEffect(() => {
        const gameInstructions = document.querySelector('.gamePage');
        if (gameRoute === 'placeShips') {
            gameInstructions.style.setProperty('--player-turn-text', `"${instructions}"`);
        } else if (yourTurn) {
            gameInstructions.style.setProperty('--player-turn-text', '"Your Turn!"');
        } else {
            gameInstructions.style.setProperty('--player-turn-text', `"${opponentName}'s Turn!"`);
        }
    },[yourTurn, gameRoute])

    useEffect(() => {
        // const gamePage = document.querySelector('.gamePage');
        // const squares = document.querySelectorAll('.userBoard .singleSquare');
        const shipContainers = document.querySelectorAll('.userBoard .ship');
        let score = 0;
        if (yourTurn) {
            // for (let square of squares) {
            //     if (square.classList.contains('hit')) {
            //         score += 1;
            //     }
            // }

            shipContainers.forEach(shipContainer => {
                if (shipContainer.childNodes[0].classList.contains('shipSunkUser')) {
                    score += 1;
                }
            })

            if (score >= 5) {
                // gamePage.style.setProperty('--player-turn-text', '"You Lose"');
                socket.emit('game over', friendSocket);
                setTimeout(() => {
                    window.alert('You Lose');
                    user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
                }, 300);
            }
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
        for (let ship of ships) {
            ship.style.cursor = 'default';
        }
        if (opponentIsReady) {
            setGameRoute('gameInProgress');
            setYourTurn(true);
        } else {
            readyBtn.style.opacity = '0.4';
        }
        setPlayerIsReady(true);
        socket.emit('send ready status', friendSocket);
    }

    return (
        <div className='gamePage'>
            <Navigation socket={socket} onRouteChange={onRouteChange} />
            <UserBoard socket={socket} />
            {
            gameRoute === 'placeShips'
            ? 
            <div className='readyBtn'>
                <button onClick={handleReadyButton} className='btn'>Ready</button>
            </div>
            : (null)
            }
            <OpponentBoard socket={socket} />
            <ChatBox socket={socket} />
            <Footer />
        </div>
    )
}

export default Game;
