import React, { useState, useEffect } from 'react';
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
    const [route, setRoute] = useState('loggedIn');
    const [user, setUser] = useState({username: '', wins: 0});
    const [currentSocket, setCurrentSocket] = useState(null);
    const [friendSocket, setFriendSocket] = useState(null);
    const [opponentName, setOpponentName] = useState('');
    const [unsortedFriends, setUnsortedFriends] = useState([]);
    const [findMatchInterval, setFindMatchInterval] = useState(0);
    const [checkOppStatusInterval, setCheckOppStatusInterval] = useState(0);
    const [search, setSearch] = useState(false);

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
        let myInterval;
        if (user.username.length) {
            myInterval = setInterval(updateLastOnline, 1000);
        } else {
            clearInterval(myInterval);
        }

        return () => {
            clearInterval(myInterval);
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
            <Navigation setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} onRouteChange={onRouteChange} route={route} />
            <FriendsHome onRouteChange={onRouteChange}/>
            <div className='homeText'>
                <h1>Battleship</h1>
            </div>
            <div className='logReg'>
                {
                    route === 'login'
                    ? <Login currentSocket={currentSocket} loadUser={loadUser} onRouteChange={onRouteChange}/>
                    : <Register currentSocket={currentSocket} loadUser={loadUser} onRouteChange={onRouteChange}/>
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
                <Navigation setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} onRouteChange={onRouteChange} route={route} />
                <Friends friendSocket={friendSocket} opponentName={opponentName} setOpponentName={setOpponentName} unsortedFriends={unsortedFriends} setUnsortedFriends={setUnsortedFriends} socket={socket} route={route} setFriendSocket={setFriendSocket} currentSocket={currentSocket} showOnlineStatusToFriends={showOnlineStatusToFriends} username={user.username} setRoute={setRoute} />
                <div className='matchAndBoard'>
                    <FindMatch currentSocket={currentSocket} setSearch={setSearch} search={search} findMatchInterval={findMatchInterval} setFindMatchInterval={setFindMatchInterval} socket={socket} setOpponentName={setOpponentName} username={user.username} setFriendSocket={setFriendSocket} setRoute={setRoute} />
                    <HomeBoard route={route}/>
                </div>
                <Footer />
            </div>
            :
            <>
                {
                route === 'leaderboard'
                ?
                <div className='leaderboard'>
                    <Leaderboard route={route} onRouteChange={onRouteChange} setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} />
                    <Footer />
                </div>
                :
                <Game setSearch={setSearch} checkOppStatusInterval={checkOppStatusInterval} setCheckOppStatusInterval={setCheckOppStatusInterval} opponentName={opponentName} setRoute={setRoute} setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} onRouteChange={onRouteChange} route={route} friendSocket={friendSocket} />
                }
            </>
            }
        </>
    );
}

export default App;
