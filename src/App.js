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
import { socket } from './socket/socketImport';
import { Howl } from 'howler';
import ambientWaves from './audioclips/ambient-waves.mp3';
import lobbyTheme from './audioclips/lobby-theme.mp3';
import gameTheme from './audioclips/game-theme.mp3';
import buttonClick from './audioclips/button-click.mp3';
import hoverSound from './audioclips/hover-sound.mp3';
import './logReg.css';
import './homePageLogged.css';
import './gamePage.css';
import './leaderboard.css';

function App() {
    const { getOnlineFriendsInterval, route, user, friendSocket, findMatchInterval, checkOppStatusInterval, search, updatLastOnlineInterval, playGameAudio, playLobbyMusic, waveSound, lobbyMusic, gameMusic } = useStoreState(state => ({
        getOnlineFriendsInterval: state.getOnlineFriendsInterval,
        route: state.route,
        user: state.user,
        friendSocket: state.friendSocket,
        findMatchInterval: state.findMatchInterval,
        checkOppStatusInterval: state.checkOppStatusInterval,
        search: state.search,
        updatLastOnlineInterval: state.updatLastOnlineInterval,
        playGameAudio: state.playGameAudio,
        playLobbyMusic: state.playLobbyMusic,
        waveSound: state.waveSound,
        lobbyMusic: state.lobbyMusic,
        gameMusic: state.gameMusic
    }));

    const { setRoute, setUser, setCurrentSocket, setSearch, setUpdatLastOnlineInterval, setAllFriends, setUnsortedFriends, setFriendsOnline, setFriendSearch, setPlayerIsReady, setPlayGameAudio, setPlayLobbyMusic, setWaveSound, setLobbyMusic, setGameMusic } = useStoreActions(actions => ({
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
        setPlayGameAudio: actions.setPlayGameAudio,
        setPlayLobbyMusic: actions.setPlayLobbyMusic,
        setWaveSound: actions.setWaveSound,
        setLobbyMusic: actions.setLobbyMusic,
        setGameMusic: actions.setGameMusic
    }));

    const audioClips = [
        {sound: buttonClick, label: 'btn', volume: 1},
        {sound: hoverSound, label: 'hover', volume: 1}
    ]

    const soundPlay = (src) => {
        console.log(src)
        const sound = new Howl({
            src: src.sound,
            volume: src.volume,
            html5: true
        })
        sound.play();
    }

    const playSound = (soundEffect) => {
        audioClips.forEach(clip => {
            if (clip.label === soundEffect ) {
                soundPlay(clip);
            }
        })
    }

    const onRouteChange = async (e) => {
        switch(e.target.value) {
            case 'logOut':
                if (user?.username) {
                    setSearch(false);
                    // removeUserSocket(true);
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
                    // removeUserSocket(true);
                }
                setRoute('login');
        }
    }

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
        if (!lobbyMusic && !playLobbyMusic && route !== 'game') {
            setPlayLobbyMusic(true);
        }
    }

    const handleBtnPress = (e) => {
        if (e.target.tagName === 'BUTTON') {
            playSound('btn');
        }
    }

    const handleMouseOver = (e) => {
        if (
            e.target.parentElement.classList.contains('findMatchContainer') || e.target.parentElement.classList.contains('playAsGuest') 
            || 
            e.target.classList.contains('friendRequestBtn') 
            || 
            e.target.classList.contains('friendOnlineBtn')
            || 
            e.target.parentElement.classList.contains('readyBtn')
        ) {
            console.log(e.target.classList);
            playSound('hover');
        }
    }

    useEffect(() => {
        const page = document.querySelector('.logRegPage');
        page.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousedown', handleBtnPress);
        document.addEventListener('mouseover', handleMouseOver);

        socket.on('connect', () => {
            setCurrentSocket(socket.id);
        })
        guestCleanup();

        return () => {
            socket.off('connect');
            page.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousedown', handleBtnPress);
            document.removeEventListener('mouseover', handleMouseOver);
        }
    }, [])

    useEffect(() => {
        if (waveSound) {
            waveSound.play();
            waveSound.fade(0, 0.2, 1000);
        }

    }, [waveSound])

    useEffect(() => {
        if (lobbyMusic) {
            lobbyMusic.play();
        }

    }, [lobbyMusic])

    useEffect(() => {
        if (gameMusic) {
            gameMusic.play();
        }

    }, [gameMusic])
    
    useEffect(() => {
        if (playGameAudio) {
            if (!waveSound) {
                setWaveSound(new Howl({
                    src: ambientWaves,
                    loop: true,
                    volume: 0.3
                }))
            }
            if (!gameMusic) {
                setGameMusic(new Howl({
                    src: gameTheme,
                    loop: true,
                    volume: 0.3,
                    html5: true
                }))
            }
        } else {
            if (waveSound) {
                waveSound.fade(0.3, 0, 1000);
                setWaveSound(null);
            }
            if (gameMusic) {
                gameMusic.fade(0.3, 0, 2000);
                setGameMusic(null);
            }
        }

    }, [playGameAudio])

    useEffect(() => {
        if (playLobbyMusic) {
            if (!lobbyMusic) {
                setLobbyMusic(new Howl({
                    src: lobbyTheme,
                    loop: true,
                    volume: 0.3,
                    html5: true
                }))
            } 
        } else {
            if (lobbyMusic) {
                lobbyMusic.fade(0.3, 0, 2000);
                setLobbyMusic(null);
            }
        }

    }, [playLobbyMusic])

    useEffect(() => {
        if (user?.username?.length) {
            if (route !== 'login' && route !== 'register') {
                stopSearching();
                updateInGameStatus(false);
            }
            setUpdatLastOnlineInterval(setInterval(updateLastOnline, 1000));
        } else {
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
            setPlayLobbyMusic(false);
            if (!playGameAudio) {
                setPlayGameAudio(true);
            }
            setSearch(false);
            clearInterval(getOnlineFriendsInterval);
            stopSearching();
            updateInGameStatus(true);
        } else {
            setPlayGameAudio(false);
            if (!playLobbyMusic) {
                setPlayLobbyMusic(true);
            }
            setPlayerIsReady(false);
            if (user?.username?.length) {
                updateInGameStatus(false);
            }
            clearInterval(checkOppStatusInterval);
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
    }, [route])


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

    // const showOnlineStatusToFriends = async () => {
    //     try {
    //         const response1 = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriends?username=${user.username}`)
    //         if (!response1.ok) {
    //             throw new Error('Error')
    //         }
    //         const friends = await response1.json();
    //         if (friends?.length) {
    //             for (let f of friends) {
    //                 if (f.socketid) {
    //                     socket.emit('update user status', f.socketid);
    //                 }
    //             }
    //         }
    //     } catch(err) {
    //         console.log(err);
    //     }
    // }

    // const loadUser = (user) => {
    //     setUser({ username: user.username, wins: user.wins })
    // }

    // const removeUserSocket = async (show) => {
    //     const res = await fetch('https://calm-ridge-60009.herokuapp.com/removeUserSocket', {
    //       method: 'put',
    //       headers: {'Content-Type': 'application/json'},
    //       body: JSON.stringify({
    //         username: user.username
    //       })
    //     })
    //     const socketRemoved = await res.json();
    //     if (socketRemoved && show) {
    //         showOnlineStatusToFriends();
    //     }
    // }

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        if (user?.username) {
            stopSearching();
            updateInGameStatus(false);
        }
        if (route === 'game') {
            socket.emit('send exit game', friendSocket);
        }
        // removeUserSocket(false);
        e.returnValue = '';
    })

    document.onkeydown = (e) => {
        const loginBtn = document.querySelector('.loginBtn');
        const registerBtn = document.querySelector('.registerBtn');
        const logUsername = document.querySelector('.login > .username > input');
        const registerUsername = document.querySelector('.register > .username > input');
        const logPassword = document.querySelector('.login > .password > input');
        const registerPassword = document.querySelector('.register > .password > input');
        const friendRequestBtn = document.querySelector('.friendRequestBtn');

        if ((e.code === 'Enter') && (route === 'login' || route === 'register')) {
            e.preventDefault();
            if ((logUsername?.value?.length && logPassword?.value?.length) || (registerUsername?.value?.length && registerPassword?.value?.length)) {
                route === 'login'
                ? loginBtn.click()
                : registerBtn.click()
            }
        } else if ((e.code === 'Enter') && (route === 'loggedIn')) {
            e.preventDefault();
            friendRequestBtn.click();
        }
    };

    return (
        route === 'login' || route === 'register'
        ?
        <div className='logRegPage'>
            <Navigation socket={socket} onRouteChange={onRouteChange} />
            <FriendsHome onRouteChange={onRouteChange}/>
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
                    <div className={`homePageLogged ${route === 'leaderboard' ? 'hide' : null}`}>
                        <Navigation socket={socket} onRouteChange={onRouteChange} />
                        <Friends socket={socket} />
                        <div className='matchAndBoard'>
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
                <div className={`leaderboard`}>
                    <Leaderboard onRouteChange={onRouteChange} socket={socket} />
                    <Footer />
                </div>
            : <Game socket={socket} onRouteChange={onRouteChange} />
            // <>
            //     {
            //     route === 'leaderboard'
            //     ?
            //     <div className='leaderboard'>
            //         <Leaderboard onRouteChange={onRouteChange} socket={socket} />
            //         <Footer />
            //     </div>
            //     :
            //     <Game socket={socket} onRouteChange={onRouteChange} />
            //     }
            // </>
            }
        </>
    );
}

export default App;
