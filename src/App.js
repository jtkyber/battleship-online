import React, { useState, useEffect } from 'react';
import Game from './components/boards/Game';
import HomeBoard from './components/homeBoard/HomeBoard';
import FindMatch from './components/findMatch/FindMatch';
import Friends from './components/friends/Friends';
import FriendsHome from './components/friends/FriendsHome';
import HomeText from './components/homeText/HomeText';
import Login from './components/logReg/Login';
import Register from './components/logReg/Register';
import Leaderboard from './components/leaderboard/Leaderboard';
import Navigation from './components/navigation/Navigation';
import Footer from './components/footer/Footer';
import { socket } from './socket/socketImport';
import './homePage.css';
import './homePageLogged.css';
import './gamePage.css';
import './leaderboard.css';

function App() {
    const [route, setRoute] = useState('login');
    const [user, setUser] = useState({username: '', wins: 0});
    const [currentSocket, setCurrentSocket] = useState(null);
    const [friendSocket, setFriendSocket] = useState(null);
    const [unsortedFriends, setUnsortedFriends] = useState([]);

    useEffect(() => {
        socket.on('connect', () => {
            setCurrentSocket(socket.id);
        })

        return () => {
            socket.off('connect');
        }
    },[])
    const onRouteChange = (e) => {
        switch(e.target.value) {
            case 'goToRegister':
                setUser({username: '', wins: 0});
                setRoute('register');
                removeUserSocket(true);
                break;
            case 'goToLogin':
                setUser({username: '', wins: 0});
                setRoute('login');
                removeUserSocket(true);
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
                setRoute('game');
                break;
            default:
                setRoute('login');
                removeUserSocket(true);
        }
    }

    const showOnlineStatusToFriends = async () => {
        let allFriendNames = [];
        try {
            const response1 = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriends?username=${user.username}`)
            if (!response1.ok) {
                throw new Error('Error')
            }
            const friends = await response1.json();
            if (friends !== null && friends !== '') {
                allFriendNames = friends.split(',');
            }

            for (let friend of allFriendNames) {
                const response2 = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${friend}`)
                if (!response2.ok) {
                    throw new Error('Error')
                }
                const user = await response2.json();
                if (user.socketid) {
                    socket.emit('update user status', user.socketid);
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

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        removeUserSocket(false);
        stopSearching();
        e.returnValue = '';
    })

    //  const addUserSocket = () => {
    //     fetch('https://calm-ridge-60009.herokuapp.com/removeUserSocket', {
    //       method: 'put',
    //       headers: {'Content-Type': 'application/json'},
    //       body: JSON.stringify({
    //         username: user.username,
    //         socketid: currentSocket
    //       })
    //     })
    //     .then(response => response.json())
    //     .then(res => console.log(res))
    // }

    document.onkeydown = (e) => {
        const loginBtn = document.querySelector('.loginBtn');
        const registerBtn = document.querySelector('.registerBtn');
        const friendRequestBtn = document.querySelector('.friendRequestBtn');

        if ((e.keyCode === 13) && (route === 'login')) {
            e.preventDefault();
            loginBtn.click();
        } else if ((e.keyCode === 13) && (route === 'register')) {
            e.preventDefault();
            registerBtn.click();
        } else if ((e.keyCode === 13) && (route === 'loggedIn')) {
            e.preventDefault();
            friendRequestBtn.click();
        }
    };

    return (
        route === 'login' || route === 'register'
        ?
        <div className='homePage'>
            <FriendsHome onRouteChange={onRouteChange}/>
            <HomeBoard route={route}/>
            <HomeText />
            {
            route === 'login'
            ? <Login currentSocket={currentSocket} loadUser={loadUser} onRouteChange={onRouteChange}/>
            : <Register currentSocket={currentSocket} loadUser={loadUser} onRouteChange={onRouteChange}/>
            }
            <Footer />
        </div>
        :
        <>
            {
            route === 'loggedIn'
            ?
            <div className='homePageLogged'>
                <Navigation setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} onRouteChange={onRouteChange} route={route} />
                <Friends unsortedFriends={unsortedFriends} setUnsortedFriends={setUnsortedFriends} socket={socket} route={route} setFriendSocket={setFriendSocket} currentSocket={currentSocket} showOnlineStatusToFriends={showOnlineStatusToFriends} username={user.username} setRoute={setRoute} />
                <div className='matchAndBoard'>
                    <FindMatch username={user.username} setFriendSocket={setFriendSocket} setRoute={setRoute} />
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
                <Game setRoute={setRoute} setUnsortedFriends={setUnsortedFriends} socket={socket} username={user.username} onRouteChange={onRouteChange} route={route} friendSocket={friendSocket} />
                }
            </>
            }
        </>
    );
}

export default App;
