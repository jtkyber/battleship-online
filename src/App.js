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
import './logReg.css';
import './homePageLogged.css';
import './gamePage.css';
import './leaderboard.css';

function App() {
    const { getOnlineFriendsInterval, route, user, friendSocket, findMatchInterval, checkOppStatusInterval, search, updatLastOnlineInterval, inviteSent, inviteReceived } = useStoreState(state => ({
        getOnlineFriendsInterval: state.getOnlineFriendsInterval,
        route: state.route,
        user: state.user,
        friendSocket: state.friendSocket,
        findMatchInterval: state.findMatchInterval,
        checkOppStatusInterval: state.checkOppStatusInterval,
        search: state.search,
        updatLastOnlineInterval: state.updatLastOnlineInterval,
        inviteSent: state.inviteSent,
        inviteReceived: state.inviteReceived
    }));

    const { setRoute, setUser, setCurrentSocket, setSearch, setUpdatLastOnlineInterval, setInviteSent, setInviteReceived, setAllFriends, setUnsortedFriends, setFriendsOnline, setFriendSearch } = useStoreActions(actions => ({
        setRoute: actions.setRoute,
        setUser: actions.setUser,
        setCurrentSocket: actions.setCurrentSocket,
        setSearch: actions.setSearch,
        setUpdatLastOnlineInterval: actions.setUpdatLastOnlineInterval,
        setInviteSent: actions.setInviteSent,
        setInviteReceived: actions.setInviteReceived,
        setAllFriends: actions.setAllFriends,
        setUnsortedFriends: actions.setUnsortedFriends,
        setFriendsOnline: actions.setFriendsOnline,
        setFriendSearch: actions.setFriendSearch
    }));

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

    useEffect(() => {
        socket.on('connect', () => {
            setCurrentSocket(socket.id);
        })
        guestCleanup();

        return () => {
            socket.off('connect');
        }
    }, [])

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
            stopSearching();
        }
    }, [search])

    useEffect(() => {
        if (route === 'game') {
            setSearch(false);
            clearInterval(getOnlineFriendsInterval);
            stopSearching();
            updateInGameStatus(true);
        } else {
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
