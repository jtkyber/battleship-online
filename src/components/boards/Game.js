import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import ChatBox from './ChatBox';
import Footer from '../footer/Footer';

const Game = ({ socket, onRouteChange }) => {
    const { friendSocket, opponentName, user, checkOppStatusInterval, gameRoute, playerIsReady, yourTurn, playerTurnText, isMobile, showGameInstructions, opponentIsReady, firstGameInstructionLoad, gameTimer, gameCountdownInterval, skippedTurns, playingWithAI } = useStoreState(state => ({
        friendSocket: state.friendSocket,
        opponentName: state.opponentName,
        user: state.user,
        checkOppStatusInterval: state.checkOppStatusInterval,
        gameRoute: state.gameRoute,
        playerIsReady: state.playerIsReady,
        yourTurn: state.yourTurn,
        playerTurnText: state.playerTurnText,
        isMobile: state.stored.isMobile,
        showGameInstructions: state.showGameInstructions,
        opponentIsReady: state.opponentIsReady,
        firstGameInstructionLoad: state.firstGameInstructionLoad,
        gameTimer: state.gameTimer,
        gameCountdownInterval: state.gameCountdownInterval,
        skippedTurns: state.skippedTurns,
        playingWithAI: state.playingWithAI
    }));

    const { setCheckOppStatusInterval, setRoute, setGameRoute, setPlayerIsReady, setYourTurn, setPlayerTurnText, setOpponentIsReady, setShowGameInstructions, setFirstGameInstructionLoad, setGameTimer, setGameCountdownInterval, setSkippedTurns, setPlayigWithAI, setAIturn } = useStoreActions(actions => ({
        setCheckOppStatusInterval: actions.setCheckOppStatusInterval,
        setRoute: actions.setRoute,
        setGameRoute: actions.setGameRoute,
        setPlayerIsReady: actions.setPlayerIsReady,
        setYourTurn: actions.setYourTurn,
        setPlayerTurnText: actions.setPlayerTurnText,
        setOpponentIsReady: actions.setOpponentIsReady,
        setShowGameInstructions: actions.setShowGameInstructions,
        setFirstGameInstructionLoad: actions.setFirstGameInstructionLoad,
        setGameTimer: actions.setGameTimer,
        setGameCountdownInterval: actions.setGameCountdownInterval,
        setSkippedTurns: actions.setSkippedTurns,
        setPlayigWithAI: actions.setPlayigWithAI,
        setAIturn: actions.setAIturn
    }));
    
    const pickUpShipInstructions = 
    !isMobile 
    ? "Click once on the ship you want to move"
    : "Tap once on the ship you want to move"

    const rotateShipInstructions = 
    !isMobile
    ? 'Right click or press "Spacebar" while a ship is selected'
    : "When selected, tap the ship again"

    const dropShipInstructions = 
    !isMobile
    ? "Move the ship into position and left click again when ready to release"
    : "Drag the selected ship and let go when the ship is in position"

    useEffect(() => {
        let shipPlacementTimer = 60;
        clearInterval(gameCountdownInterval);
        setShowGameInstructions(false);
        setFirstGameInstructionLoad(true);
        setPlayerIsReady(false);
        setOpponentIsReady(playingWithAI ? true : false);
        setGameRoute('placeShips');

        setGameCountdownInterval(setInterval(() => {
            setGameTimer(shipPlacementTimer - 1);
            shipPlacementTimer -= 1;
        }, 1000))

        // const gamePage = document.querySelector('.gamePage');
        socket.on('receive game over', () => {
            // gamePage.style.setProperty('--player-turn-text', '"You Won!"');
            // setTimeout(gameOver, 2000);
            handlePlayerWon();
        })

        socket.on('receive exit game', () => {
            window.alert('Opponent has left the game');
            user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
        })

        if (!playingWithAI) setCheckOppStatusInterval(setInterval(checkIfOpponentIsOnlineAndInGame, 2000));

        return () => {
            clearInterval(checkOppStatusInterval);
            clearInterval(gameCountdownInterval);
            socket.off('receive game over');
            socket.off('receive exit game');
            setFirstGameInstructionLoad(true);
            setGameTimer(60);
            setYourTurn(false);
            setSkippedTurns(0);
            setPlayigWithAI(false);
        }
    },[])

    useEffect(() => {
        socket.on('receive ready status', () => {
            if (playerIsReady) {
                setGameRoute('gameInProgress');
            }
            setOpponentIsReady(true);
        })

        return () => {
            socket.off('receive ready status');
        }
    }, [playerIsReady])

    useEffect(() => {
        let playerTurnTimer = 10;
        clearInterval(gameCountdownInterval);
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
                handlePlayerLost("You Lost ):");
            } else {
                if (gameRoute === 'gameInProgress') {
                    setGameCountdownInterval(setInterval(() => {
                        setGameTimer(playerTurnTimer - 1);
                        playerTurnTimer -= 1;
                    }, 1000))
                }
            }
        } else {
            setPlayerTurnText(playingWithAI ? "AI's turn" : `${opponentName}'s Turn!`)
            if (gameRoute === 'gameInProgress') setGameTimer(10);
        }
    },[yourTurn])

    useEffect(() => {
        if (gameTimer <= 0) {
            clearInterval(gameCountdownInterval);
            if (gameRoute === 'gameInProgress') {
                setYourTurn(false);
                if (playingWithAI) setAIturn(true);
                if (!playingWithAI) socket.emit('send shot to opponent', {target: 'oppOutOfTime', socketid: friendSocket});
                setSkippedTurns(skippedTurns + 1);
            } else {
                handlePlayerLost("You were kicked from the game because you took too long to ready up");
            }
        }
    }, [gameTimer])

    useEffect(() => {
        if (skippedTurns >= 3) {
            handlePlayerLost("You've been kicked due to innactivity");
        }
    }, [skippedTurns])

    const handlePlayerWon = () => {
        clearInterval(checkOppStatusInterval);
        if (user?.hash !== 'guest') {
            addWin();
        }
        setTimeout(() => {
            window.alert('You Won!!!');
            user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
        }, 300);
    }

    const handlePlayerLost = (msg) => {
        if (!playingWithAI) socket.emit('game over', friendSocket);
        setTimeout(() => {
            window.alert(msg);
            user?.hash === 'guest' || !user?.hash ? setRoute('login') : setRoute('loggedIn');
        }, 300);
    }

    const checkIfOpponentIsOnlineAndInGame = async () => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/checkIfOppInGame?username=${opponentName}`)
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

    const handleReadyButton = () => {
        const ships = document.querySelectorAll('.ship');
        const readyBtn = document.querySelector('.readyBtn');
        const instructionsBtn = document.querySelector('.instructionsBtn');
        const timerElement = document.querySelector('.shipPlacementTimer');
        let allShipsPlaced = true;

        for (let ship of ships) {
            if (parseInt(ship.style.zIndex) < 0) {
                ship.style.border = '3px solid rgba(255, 0, 0, 0.8)';
                allShipsPlaced = false;
                return;
            }
        }

        if (allShipsPlaced) {
            clearInterval(gameCountdownInterval);
            timerElement.style.display = 'none';
            setGameTimer(10);
            setPlayerIsReady(true);
            instructionsBtn?.classList.add('hide');
            readyBtn.querySelector('button').innerText = `${!isMobile ? 'Waiting...' : '•••'}`;
            for (let ship of ships) {
                ship.style.cursor = 'default';
                ship.style.border = null;
                ship.style.zIndex = '3';
            }
            if (opponentIsReady) {
                setGameRoute('gameInProgress');
                setYourTurn(true);
            } else {
                readyBtn.style.opacity = '0.3';
                setGameRoute('waiting');
            }
            if (!playingWithAI) socket.emit('send ready status', friendSocket);
        }
    }

    const handleInstructionsBtnClick = () => {
        setShowGameInstructions(true);
        if (firstGameInstructionLoad) {
            setFirstGameInstructionLoad(false);
        }
    }

    return (
        <>
            <Navigation socket={socket} onRouteChange={onRouteChange} />
            <UserBoard socket={socket} />
            {
            showGameInstructions
            ?
            <div className={`instructions`}>
                <div>
                    <h3>Picking up a ship</h3>
                    <h5>{pickUpShipInstructions}</h5>
                </div>

                <div>
                    <h3>Rotation</h3>
                    <h5>{rotateShipInstructions}</h5>
                </div>

                <div>
                    <h3>Dropping a ship</h3>
                    <h5>{dropShipInstructions}</h5>
                </div>
            </div>
            :
            <button className={`instructionsBtn ${firstGameInstructionLoad ? 'firstGameInstructionLoad' : null}`} onClick={handleInstructionsBtnClick}><h2>i</h2></button>
            }
            {
            gameRoute === 'gameInProgress'
            ?
            <div className='playerTurnTextContainer'>
                <h3 className='playerTurnText'>{playerTurnText}</h3>
                { yourTurn ? <h3 className='playerTurnTimer'>{gameTimer}</h3> : null }
            </div>
            : null
            }            
            {
            gameRoute !== 'gameInProgress'
            ? 
            <div className='readyBtn'>
                <h3 className='shipPlacementTimer'>{gameTimer}</h3>
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
