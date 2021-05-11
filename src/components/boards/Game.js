import React, { useState, useEffect } from 'react';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import Footer from '../footer/Footer';
import ReadyButton from '../readyButton/ReadyButton';

const Game = ({ setRoute, setUnsortedFriends, socket, username, onRouteChange, route, friendSocket }) => {
    const [gameRoute, setGameRoute] = useState('placeShips');
    const [playerIsReady, setPlayerIsReady] = useState(false);
    const [opponentIsReady, setOpponentIsReady] = useState(false);
    const [yourTurn, setYourTurn] = useState(false);

    useEffect(() => {
        // const gamePage = document.querySelector('.gamePage');
        socket.on('receive game over', () => {
            // gamePage.style.setProperty('--player-turn-text', '"You Won!"');
            // setTimeout(gameOver, 2000);
            window.alert('You Won!!!');
            setRoute('loggedIn');
        })

        socket.on('receive exit game', () => {
            window.alert('Opponent has left the game');
            setRoute('loggedIn');
        })

        return () => {
            socket.off('receive ready status');
            socket.off('receive game over');
            socket.off('receive exit game');
        }
    },[])

    useEffect(() => {
        const gameInstructions = document.querySelector('.gamePage');
        if (gameRoute === 'placeShips') {
            gameInstructions.style.setProperty('--player-turn-text', '"Place your ships!"');
        } else if (yourTurn) {
            gameInstructions.style.setProperty('--player-turn-text', '"Your Turn!"');
        } else {
            gameInstructions.style.setProperty('--player-turn-text', `"Opponent's Turn!"`);
        }
    },[yourTurn, gameRoute])

    useEffect(() => {
        // const gamePage = document.querySelector('.gamePage');
        const squares = document.querySelectorAll('.userBoard .singleSquare');
        let score = 0;
        if (yourTurn) {
            for (let square of squares) {
                if (square.classList.contains('hit')) {
                    score += 1;
                }
            }
            if (score >= 17) {
                // gamePage.style.setProperty('--player-turn-text', '"You Lose"');
                socket.emit('game over', friendSocket);
                // setTimeout(gameOver, 2000);
                window.alert('You Lose');
                setRoute('loggedIn');
            }
        }
    },[yourTurn])

    // const gameOver = () => {
    //     setRoute('loggedIn');
    // }

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
            <Navigation friendSocket={friendSocket} setUnsortedFriends={setUnsortedFriends} socket={socket} username={username} onRouteChange={onRouteChange} route={route} />
            <UserBoard yourTurn={yourTurn} setYourTurn={setYourTurn} gameRoute={gameRoute} socket={socket} friendSocket={friendSocket} route={route}/>
            {
            gameRoute === 'placeShips'
            ? <ReadyButton handleReadyButton={handleReadyButton} />
            : (null)
            }
            <OpponentBoard yourTurn={yourTurn} setYourTurn={setYourTurn} gameRoute={gameRoute} socket={socket} friendSocket={friendSocket} route={route}/>
            <Footer />
        </div>
    )
}

export default Game;
