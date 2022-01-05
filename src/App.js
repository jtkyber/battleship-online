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
    const { route, user, friendSocket, findMatchInterval, checkOppStatusInterval, search, updatLastOnlineInterval, inviteSent, inviteReceived } = useStoreState(state => ({
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

    const { setRoute, setUser, setCurrentSocket, setSearch, setUpdatLastOnlineInterval, setInviteSent, setInviteReceived } = useStoreActions(actions => ({
        setRoute: actions.setRoute,
        setUser: actions.setUser,
        setCurrentSocket: actions.setCurrentSocket,
        setSearch: actions.setSearch,
        setUpdatLastOnlineInterval: actions.setUpdatLastOnlineInterval,
        setInviteSent: actions.setInviteSent,
        setInviteReceived: actions.setInviteReceived
    }));

    const onRouteChange = async (e) => {
        switch(e.target.value) {
            case 'logOut':
                if (user.username) {
                    await setSearch(false);
                    await removeUserSocket(true);
                }
                setUser({username: '', wins: 0});
                setRoute('login');
                break;
            case 'goToRegister':
                if (user.username) {
                    await removeUserSocket(true);
                }
                setUser({username: '', wins: 0});
                setRoute('register');
                break;
            case 'goToLogin':
                if (user.username) {
                    await removeUserSocket(true);
                }
                setUser({username: '', wins: 0});
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
                if (user.username) {
                    setSearch(false);
                }
                setRoute('game');
                break;
            default:
                if (user.username) {
                    setSearch(false);
                    removeUserSocket(true);
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
                   username: user.username,
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
            console.log('test')
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/updateOnlineStatus`, {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user.username
                })
            })
            if (!response.ok) {
                throw new Error('Error');
            }
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        socket.on('connect', () => {
            setCurrentSocket(socket.id);
        })

        return () => {
            socket.off('connect');
        }
    }, [])

    useEffect(() => {
        if (user.username.length) {
            stopSearching();
            setUpdatLastOnlineInterval(setInterval(updateLastOnline, 1000));
        } else {
            clearInterval(updatLastOnlineInterval);
        }

        return () => {
            clearInterval(updatLastOnlineInterval);
        }
    }, [user])

    useEffect(() => {
        if (!search && findMatchInterval > 0) {
            clearInterval(findMatchInterval);
            stopSearching();
        }
    }, [search])

    useEffect(() => {
        if (route !== 'game') {
            clearInterval(checkOppStatusInterval);
        } else {
            clearInterval(findMatchInterval);
        }
    }, [route])


    const showOnlineStatusToFriends = async () => {
        try {
            const response1 = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriends?username=${user.username}`)
            if (!response1.ok) {
                throw new Error('Error')
            }
            const friends = await response1.json();
            if (friends.length) {
                for (let f of friends) {
                    if (f.socketid) {
                        socket.emit('update user status', f.socketid);
                    }
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    const loadUser = (user) => {
        setUser({ username: user.username, wins: user.wins })
    }

    const removeUserSocket = async (show) => {
        const res = await fetch('https://calm-ridge-60009.herokuapp.com/removeUserSocket', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            username: user.username
          })
        })
        const socketRemoved = await res.json();
        if (socketRemoved && show) {
            showOnlineStatusToFriends();
        }
    }

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        stopSearching();
        if (route === 'game') {
            socket.emit('send exit game', friendSocket);
        }
        removeUserSocket(false);
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
            <div className='logReg'>
                {
                    route === 'login'
                    ? <Login loadUser={loadUser} onRouteChange={onRouteChange}/>
                    : <Register loadUser={loadUser} onRouteChange={onRouteChange}/>
                }
            </div>
            <Footer />
        </div>
        :
        <>
            {
            route === 'loggedIn'
            ?
            <div className='homePageLogged'>
                <Navigation socket={socket} onRouteChange={onRouteChange} />
                <Friends socket={socket} showOnlineStatusToFriends={showOnlineStatusToFriends} />
                <div className='matchAndBoard'>
                    <FindMatch socket={socket} />
                    <HomeBoard />
                </div>
                <Footer />
            </div>
            :
            <>
                {
                route === 'leaderboard'
                ?
                <div className='leaderboard'>
                    <Leaderboard onRouteChange={onRouteChange} socket={socket} />
                    <Footer />
                </div>
                :
                <Game socket={socket} onRouteChange={onRouteChange} />
                }
            </>
            }
        </>
    );
}

export default App;
