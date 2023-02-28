import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import UserBoard from './UserBoard';
import OpponentBoard from './OpponentBoard';
import Navigation from '../navigation/Navigation';
import ChatBox from './ChatBox';
import Footer from '../footer/Footer';

const Game = ({ onRouteChange }) => {
    const { opponentName, user, checkOppStatusInterval, gameRoute, playerIsReady, yourTurn, playerTurnText, isMobile, showGameInstructions, opponentIsReady, firstGameInstructionLoad, gameTimer, gameCountdownInterval, skippedTurns, playingWithAI, channel } = useStoreState(state => ({
        opponentName: state.opponentName,
        user: state.user,
        checkOppStatusInterval: state.checkOppStatusInterval,
        gameRoute: state.gameRoute,
        playerIsReady: state.playerIsReady,
        yourTurn: state.yourTurn,
        playerTurnText: state.playerTurnText,
        isMobile: state.stored.isMobile,
        showGameInstructions: state.stored.showGameInstructions,
        opponentIsReady: state.opponentIsReady,
        firstGameInstructionLoad: state.firstGameInstructionLoad,
        gameTimer: state.gameTimer,
        gameCountdownInterval: state.gameCountdownInterval,
        skippedTurns: state.skippedTurns,
        playingWithAI: state.playingWithAI,
        channel: state.channel
    }));

    const { setCheckOppStatusInterval, setRoute, setGameRoute, setPlayerIsReady, setYourTurn, setPlayerTurnText, setOpponentIsReady, setShowGameInstructions, setFirstGameInstructionLoad, setGameTimer, setGameCountdownInterval, setSkippedTurns, setPlayigWithAI, setUser } = useStoreActions(actions => ({
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
        setUser: actions.setUser
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
        let shipPlacementTimer = 90;
        clearInterval(gameCountdownInterval);
        setGameTimer(90);
        setFirstGameInstructionLoad(true);
        setPlayerIsReady(false);
        setOpponentIsReady(playingWithAI ? true : false);
        setGameRoute('placeShips');

        if (!playingWithAI) {
            setGameCountdownInterval(setInterval(() => {
                setGameTimer(shipPlacementTimer - 1);
                shipPlacementTimer -= 1;
            }, 1000))
        }

        // const gamePage = document.querySelector('.gamePage');

        channel.bind('receive-game-over', data => {
            handlePlayerWon(20);
            return data
        })

        channel.bind('receive-exit-game', data => {
            window.alert('Opponent has left the game');
            user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
            return data
        })

        if (!playingWithAI) setCheckOppStatusInterval(setInterval(checkIfOpponentIsOnlineAndInGame, 2000));

        return () => {
            channel.unbind('receive-game-over')
            channel.unbind('receive-exit-game')
            clearInterval(checkOppStatusInterval);
            clearInterval(gameCountdownInterval);
            setFirstGameInstructionLoad(true);
            setGameTimer(90);
            setYourTurn(false);
            setSkippedTurns(0);
            setPlayigWithAI(false);
        }
    },[])

    useEffect(() => {
        channel.bind('receive-ready-status', data => {
            if (playerIsReady) {
                setGameRoute('gameInProgress');
            }
            setOpponentIsReady(true);
            return data
        })

        return () => {
            channel.unbind('receive-ready-status')
        }
    }, [playerIsReady])

    useEffect(() => {
        let playerTurnTimer = 15;
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
            if (score >= shipContainers.length) {
                handlePlayerLost("You Lost ):");
            } else {
                if (gameRoute === 'gameInProgress' && !playingWithAI) {
                    setGameCountdownInterval(setInterval(() => {
                        setGameTimer(playerTurnTimer - 1);
                        playerTurnTimer -= 1;
                    }, 1000))
                }
            }
        } else {
            if (gameRoute === 'gameInProgress') {
                setTimeout(() => setPlayerTurnText(playingWithAI ? "Computer's turn" : `${opponentName}'s Turn!`), 900)
                setGameTimer(15);
            } else setPlayerTurnText(playingWithAI ? "Computer's turn" : `${opponentName}'s Turn!`);
        }
    },[yourTurn])

    useEffect(() => {
        const readyBtn = document.querySelector('.readyBtn');
        const instructionsBtn = document.querySelector('.instructionsBtn');
        const timerElement = document.querySelector('.shipPlacementTimer');

        if (gameTimer <= 0 && !playingWithAI) {
            clearInterval(gameCountdownInterval);
            if (gameRoute === 'gameInProgress') {
                setYourTurn(false);
                // if (playingWithAI) setAIturn(true);
                (async () => {await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendShotToOpponent?channelName=${opponentName}&target=oppOutOfTime`)})()
                setSkippedTurns(skippedTurns + 1);
            } else {
                // handlePlayerLost("You were kicked from the game because you took too long to ready up");
                clearInterval(gameCountdownInterval);
                if (!playingWithAI) timerElement.style.display = 'none';
                setGameTimer(15);
                setPlayerIsReady(true);
                instructionsBtn?.classList.add('hide');
                if (opponentIsReady) {
                    setGameRoute('gameInProgress');
                    setYourTurn(true);
                } else {
                    readyBtn.style.opacity = '0.3';
                    setGameRoute('waiting');
                }
                if (!playingWithAI) (async () => {await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendReadyStatus?channelName=${opponentName}`)})()
            }
        }
    }, [gameTimer])

    useEffect(() => {
        if (skippedTurns >= 3 && !playingWithAI) {
            handlePlayerLost("You've been kicked due to innactivity");
        }
    }, [skippedTurns])

    const handlePlayerWon = (scoreIncrement) => {
        clearInterval(checkOppStatusInterval);
        if (user?.hash !== 'guest') {
            updateScore(scoreIncrement);
        }
        setTimeout(() => {
            window.alert('You Won!!!');
            user.hash === 'guest' ? setRoute('login') : setRoute('loggedIn');
        }, 300);
    }

    const handlePlayerLost = async (msg) => {
        if (!playingWithAI) await fetch(`${process.env.REACT_APP_PUSHER_URL}/gameOver?channelName=${opponentName}`)
        setTimeout(() => {
            window.alert(msg);
            user?.hash === 'guest' || !user?.hash ? setRoute('login') : setRoute('loggedIn');
        }, 300);
    }

    const checkIfOpponentIsOnlineAndInGame = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/checkIfOppInGame?username=${opponentName}`)
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

    const updateScore = async (scoreIncrement) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/updateScore`, {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user.username,
                    scoreIncrement: scoreIncrement
                })
            })
            const scoreUpdated = await res.json();
            if (!scoreUpdated) {
                throw new Error('Could not increment score')
            } else {
                setUser({...user, score: scoreUpdated});
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
            if (ship.style.pointerEvents === 'none') {
                ship.style.border = '3px solid rgba(255, 0, 0, 0.8)';
                allShipsPlaced = false;
                return;
            }
        }

        if (allShipsPlaced) {
            clearInterval(gameCountdownInterval);
            if (!playingWithAI) timerElement.style.display = 'none';
            setGameTimer(15);
            setPlayerIsReady(true);
            instructionsBtn?.classList.add('hide');
            readyBtn.querySelector('button').innerText = `${!isMobile ? 'Waiting...' : '•••'}`;
            for (let ship of ships) {
                ship.style.cursor = 'default';
                ship.style.border = null;
                ship.style.pointerEvents = 'auto';
            }
            if (opponentIsReady) {
                setGameRoute('gameInProgress');
                setYourTurn(true);
            } else {
                readyBtn.style.opacity = '0.3';
                setGameRoute('waiting');
            }
            if (!playingWithAI) (async () => {await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendReadyStatus?channelName=${opponentName}`)})()
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
            <Navigation onRouteChange={onRouteChange} />
            <UserBoard />
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
                { yourTurn && !playingWithAI ? <h3 className='playerTurnTimer'>{gameTimer}</h3> : null }
            </div>
            : null
            }            
            {
            gameRoute !== 'gameInProgress'
            ? 
            <div className='readyBtn'>
                { !playingWithAI ? <h3 className='shipPlacementTimer'>{gameTimer}</h3> : null }
                <button onClick={handleReadyButton} className='btn'>{isMobile ? '✔️' : 'Ready'}</button>
            </div>
            : (null)
            }
            <OpponentBoard />
            <ChatBox />
            <Footer />
        </>
    )
}

export default Game;
