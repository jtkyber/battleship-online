import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import Game from './components/boards/Game';
import HomeBoard from './components/homeBoard/HomeBoard';
import FindMatch from './components/findMatch/FindMatch';
import Friends from './components/friends/Friends';
import FriendsHome from './components/friends/FriendsHome';
import Login from './components/logReg/Login';
import Register from './components/logReg/Register';
import Leaderboard from './components/leaderboard/Leaderboard';
import Navigation from './components/navigation/Navigation';
import Footer from './components/footer/Footer';
import { socket } from './socketImport';
import { audio } from './audio';
import './logReg.css';
import './homePageLogged.css';
import './gamePage.css';
import './leaderboard.css';

// let showInstructions = true;
function App() {
    const { getOnlineFriendsInterval, route, user, friendSocket, findMatchInterval, checkOppStatusInterval, search, updatLastOnlineInterval, soundOn, musicOn, isMobile, showFriendsMobile, audioStarted, isIOS, deviceInPortrait, gameRoute, showGameInstructions } = useStoreState(state => ({
        getOnlineFriendsInterval: state.getOnlineFriendsInterval,
        route: state.route,
        user: state.user,
        friendSocket: state.friendSocket,
        findMatchInterval: state.findMatchInterval,
        checkOppStatusInterval: state.checkOppStatusInterval,
        search: state.search,
        updatLastOnlineInterval: state.updatLastOnlineInterval,
        soundOn: state.stored.soundOn,
        musicOn: state.stored.musicOn,
        isMobile: state.stored.isMobile,
        showFriendsMobile: state.showFriendsMobile,
        audioStarted: state.audioStarted,
        isIOS: state.stored.isIOS,
        deviceInPortrait: state.deviceInPortrait,
        gameRoute: state.gameRoute,
        showGameInstructions: state.showGameInstructions
    }));

    const { setRoute, setUser, setCurrentSocket, setSearch, setUpdatLastOnlineInterval, setAllFriends, setUnsortedFriends, setFriendsOnline, setFriendSearch, setPlayerIsReady, setUserName, setPassword, setAudioStarted, setShowFriendsMobile, setShowChatMobile, setShowGameInstructions, setDeviceInPortrait, setGameRoute, setIsMobile } = useStoreActions(actions => ({
        setRoute: actions.setRoute,
        setUser: actions.setUser,
        setCurrentSocket: actions.setCurrentSocket,
        setSearch: actions.setSearch,
        setUpdatLastOnlineInterval: actions.setUpdatLastOnlineInterval,
        setAllFriends: actions.setAllFriends,
        setUnsortedFriends: actions.setUnsortedFriends,
        setFriendsOnline: actions.setFriendsOnline,
        setFriendSearch: actions.setFriendSearch,
        setPlayerIsReady: actions.setPlayerIsReady,
        setUserName: actions.setUserName,
        setPassword: actions.setPassword,
        setAudioStarted: actions.setAudioStarted,
        setShowFriendsMobile: actions.setShowFriendsMobile,
        setShowChatMobile: actions.setShowChatMobile,
        setShowGameInstructions: actions.setShowGameInstructions,
        setDeviceInPortrait: actions.setDeviceInPortrait,
        setGameRoute: actions.setGameRoute,
        setIsMobile: actions.setIsMobile
    }));

    const onRouteChange = async (e) => {
        const value = e.target.getAttribute('value');
        switch(value) {
            case 'logOut':
                if (user?.username) {
                    setSearch(false);
                }
                setRoute('login');
                break;
            case 'goToRegister':
                setRoute('register');
                break;
            case 'goToLogin':
                setRoute('login');
                break;
            case 'goHome':
                setRoute('loggedIn');
                break;
            case 'goToLeaderboard':
                setRoute('leaderboard');
                break;
            case 'login':
                setRoute('loggedIn');
                break;
            case 'register':
                setRoute('loggedIn');
                break;
            case 'game':
                if (user?.username) {
                    setSearch(false);
                }
                setRoute('game');
                break;
            default:
                if (user?.username) {
                    setSearch(false);
                }
                setRoute('login');
        }
    }

    const isDevicePortrait = () => {
        setDeviceInPortrait(window.screen.width < window.screen.height);
    }

    useEffect(() => {
        setTimeout(() => {
            isDevicePortrait();
            guestCleanup();
        }, 10);

        window.addEventListener('resize', isDevicePortrait);
        document.addEventListener('mouseover', handleMouseOver);

        socket.on('connect', () => {
            setCurrentSocket(socket.id);
        })

        return () => {
            socket.off('connect');
            window.removeEventListener('resize', isDevicePortrait);
            document.removeEventListener('mouseover', handleMouseOver);
        }
    }, [])

    useEffect(() => {
        if (soundOn) {
            if (!isMobile) {
                audio.hoverSound.mute(false);
            }
            audio.ambientWaves.mute(false);
            audio.buttonClick.mute(false);
            audio.hitSound.mute(false);
            audio.missSound.mute(false);
            audio.shipSunkSound.mute(false);
            audio.notificationSound.mute(false);
            audio.pickUpShip.mute(false);
            audio.dropShip.mute(false);
            audio.rotateShip.mute(false);
            audio.missileLock.mute(false);
            audio.missileLaunch.mute(false);
            audio.incomingMissile.mute(false);
            
        } else {
            if (!isMobile) {
                audio.hoverSound.mute(true);
            }
            audio.ambientWaves.mute(true);
            audio.buttonClick.mute(true);
            audio.hitSound.mute(true);
            audio.missSound.mute(true);
            audio.shipSunkSound.mute(true);
            audio.notificationSound.mute(true);
            audio.pickUpShip.mute(true);
            audio.dropShip.mute(true);
            audio.rotateShip.mute(true);
            audio.missileLock.mute(true);
            audio.missileLaunch.mute(true);
            audio.incomingMissile.mute(true);
        }
    }, [soundOn])

    useEffect(() => {
        if (musicOn) {
            audio.lobbyTheme.mute(false);
            audio.gameTheme.mute(false);
            audio.shipPlacementTheme.mute(false);
        } else {
            audio.lobbyTheme.mute(true);
            audio.gameTheme.mute(true);
            audio.shipPlacementTheme.mute(true);
        }
    }, [musicOn])

    useEffect(() => {
        if (user?.username?.length) {
            if (route !== 'login' && route !== 'register') {
                stopSearching();
                updateInGameStatus(false);
            }
            setUpdatLastOnlineInterval(setInterval(updateLastOnline, 1000));
        } else {
            setUserName(null);
            setPassword(null);
            clearInterval(updatLastOnlineInterval);
            clearInterval(findMatchInterval);
        }

        return () => {
            clearInterval(updatLastOnlineInterval);
        }
    }, [user?.username])

    useEffect(() => {
        if (!search) {
            clearInterval(findMatchInterval);
            if (user?.username) {
                stopSearching();
            }
        }
    }, [search])
    
    useEffect(() => {
        if (route === 'game') {
            setSearch(false);
            updateInGameStatus(true);
            clearInterval(getOnlineFriendsInterval);
            stopSearching();
            setShowChatMobile(false);
            if (gameRoute !== 'gameInProgress') {
                if (audio.lobbyTheme.playing()) {
                    // audio.lobbyTheme.fade(0.5, 0, 2000);
                    audio.lobbyTheme.stop();
                } 
                if (!audio.shipPlacementTheme.playing()) {
                    // audio.lobbyTheme.fade(0.5, 0, 2000);
                    audio.shipPlacementTheme.play();
                } 
                if (!audio.ambientWaves.playing()) {
                    // audio.ambientWaves.fade(0, 0.2, 1000);
                    audio.ambientWaves.play();
                }
            } else {
                if (!audio.gameTheme.playing()) {
                    // audio.gameTheme.fade(0, 0.3, 500);
                    audio.gameTheme.play();
                }
                if (audio.shipPlacementTheme.playing()) {
                    // audio.lobbyTheme.fade(0.5, 0, 2000);
                    audio.shipPlacementTheme.stop();
                } 
            }
        } else {
            setGameRoute('placeShips');
            setPlayerIsReady(false);
            if (user?.username?.length) {
                updateInGameStatus(false);
            }
            clearInterval(checkOppStatusInterval);
            if (audioStarted && !audio.lobbyTheme.playing()) {
                // audio.lobbyTheme.fade(0, 0.5, 10);
                audio.lobbyTheme.play();
            } 
            if (audio.gameTheme.playing()) {
                // audio.gameTheme.fade(0.3, 0, 2000);
                audio.gameTheme.stop();
            }
            if (audio.shipPlacementTheme.playing()) {
                // audio.gameTheme.fade(0.3, 0, 2000);
                audio.shipPlacementTheme.stop();
            }
            if (audio.ambientWaves.playing()) {
                // audio.ambientWaves.fade(0.2, 0, 2000);
                audio.ambientWaves.stop();
            }
        }

        if ((route === 'login') || (route === 'register')) {
            if (user?.hash !== 'guest') {
                setUser(null);
            }
            clearInterval(getOnlineFriendsInterval);
            setAllFriends([]);
            setUnsortedFriends([]);
            setFriendsOnline([]);
            setFriendSearch('');
        }

        if (route === 'loggedIn') {
            setShowFriendsMobile(false);
        }

        if (isMobile) {
            document.addEventListener('touchend', handleMouseDown);
        } else {
            document.addEventListener('mouseup', handleMouseDown);
        }

        return () => {
            if (isMobile) {
                document.removeEventListener('touchend', handleMouseDown);
            } else {
                document.removeEventListener('mouseup', handleMouseDown);
            }
        }
    }, [route, gameRoute, showGameInstructions, audioStarted])

    const stopSearching = async () => {
        try {
           const response = await fetch('https://calm-ridge-60009.herokuapp.com/updateSearching', {
               method: 'put',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify({
                   username: user?.username,
                   search: false
               })
           })
           if (!response.ok) {throw new Error('Problem updating searching status')}
       } catch(err) {
           console.log(err);
       }
   }

    const updateLastOnline = async () => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/updateOnlineStatus`, {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user?.username
                })
            })
            if (!response.ok) {
                throw new Error('Error');
            }
        } catch(err) {
            console.log(err);
        }
    }

    const guestCleanup = async () => {
        try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/guestCleanup', {
                method: 'delete',
                headers: {'Content-Type': 'application/json'}
            })
            if (!response.ok) {throw new Error('Problem adding guest')}
        } catch(err) {
            console.log(err);
        }
    }

    const handleMouseDown = (e) => {
        if (!audioStarted && !audio.lobbyTheme.playing() && route !== 'game') {
            audio.lobbyTheme.play();
            setAudioStarted();
        }

        if (
            ((e.target.tagName === 'BUTTON') && (!e.target.classList.contains('messageToggle')))
            ||
            (e.target.classList.contains('hasSound'))
        ) {
            audio.buttonClick.play();
        }

        const instructionsDiv = document.querySelector('.instructions');
        if (instructionsDiv !== e.target && !instructionsDiv?.contains(e.target) && (route === 'game')) {
            setShowGameInstructions(false);
        }
    }

    let playHoverSound = true;
    const handleMouseOver = (e) => {
        if (
            (((e.target.tagName === 'BUTTON') && (!e.target.classList.contains('messageToggle')))
            ||
            (e.target.classList.contains('hasSound')))
        ) {
            if (playHoverSound) {
                audio.hoverSound.play();
                playHoverSound = false;
            }
        } else {
            playHoverSound = true;
        }
    }

    const updateInGameStatus = async (inGame) => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/setInGame`, {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user?.username,
                    isInGame: inGame
                })
            })
            if (!response.ok) {
                throw new Error('Error');
            }
        } catch(err) {
            console.log(err);
        }
    }

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        if (user?.username) {
            stopSearching();
            updateInGameStatus(false);
        }
        if (route === 'game') {
            socket.emit('send exit game', friendSocket);
        }
        // e.returnValue = '';
    })

    document.onkeydown = (e) => {
        const loginBtn = document.querySelector('.loginBtn');
        const registerBtn = document.querySelector('.registerBtn');
        const logUsername = document.querySelector('.login > .username > input');
        const registerUsername = document.querySelector('.register > .username > input');
        const logPassword = document.querySelector('.login > .password > input');
        const registerPassword = document.querySelector('.register > .password > input');
        const friendRequestBtn = document.querySelector('.friendRequestBtn');

        if ((e.key === 'Enter') && (route === 'login' || route === 'register')) {
            e.preventDefault();
            if ((logUsername?.value?.length && logPassword?.value?.length) || (registerUsername?.value?.length && registerPassword?.value?.length)) {
                audio.buttonClick.play();
                route === 'login'
                ? loginBtn.click()
                : registerBtn.click()
            }
        } else if ((e.key === 'Enter') && (route === 'loggedIn')) {
            e.preventDefault();
            audio.buttonClick.play();
            friendRequestBtn.click();
        }
    };

    return (
    <>
        {
        !deviceInPortrait && isMobile
        ? <div className='pleaseRotate'><h1>Please rotate your device</h1></div>
        : null
        }
        {
        route === 'login' || route === 'register'
        ?
        <div className={`logRegPage ${isMobile ? 'mobile' : null}`}>
            <Navigation socket={socket} onRouteChange={onRouteChange} />
            {
                !isMobile 
                ? <FriendsHome onRouteChange={onRouteChange}/>
                : null
            }
            <div className='homeText'>
                <h1>Battleship</h1>
            </div>
            <FindMatch socket={socket} />
            <div className='logReg'>
                {
                    route === 'login'
                    ? <Login onRouteChange={onRouteChange}/>
                    : <Register onRouteChange={onRouteChange}/>
                }
            </div>
            <Footer />
        </div>
        :
        <>
            {
            route === 'loggedIn' || route === 'leaderboard'
            ?
                user?.username?.length
                ?
                <>
                    <div className={`homePageLogged ${route === 'leaderboard' ? 'hide' : null} ${isMobile ? 'mobile' : null}`}>
                        <Navigation socket={socket} onRouteChange={onRouteChange} />
                        <Friends socket={socket} />
                        <div className={`matchAndBoard ${showFriendsMobile ? 'hide' : null}`}>
                            <FindMatch socket={socket} />
                            <HomeBoard />
                        </div>
                        <Footer />
                    </div>
                    <div className={`leaderboard ${route === 'loggedIn' ? 'hide' : null}`}>
                        <Leaderboard onRouteChange={onRouteChange} socket={socket} />
                        <Footer />
                    </div>
                </>
                :
                <div className={`leaderboard ${isMobile ? 'mobile' : null}`}>
                    <Leaderboard onRouteChange={onRouteChange} socket={socket} />
                    <Footer />
                </div>
            : 
            <div className={`gamePage ${isMobile ? 'mobile' : 'desktop'}`}>
                <Game socket={socket} onRouteChange={onRouteChange} />
            </div>
            }
        </>
        }       
    </>
    );
}

export default App;
