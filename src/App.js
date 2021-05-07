import React, { useState } from 'react';
import UserBoard from './components/boards/UserBoard';
import OpponentBoard from './components/boards/OpponentBoard';
import HomeBoard from './components/homeBoard/HomeBoard';
import Friends from './components/friends/Friends';
import FriendsHome from './components/friends/FriendsHome';
import HomeText from './components/homeText/HomeText';
import Login from './components/logReg/Login';
import Register from './components/logReg/Register';
import ReadyButton from './components/readyButton/ReadyButton';
import Navigation from './components/navigation/Navigation';
import Footer from './components/footer/Footer';
import { socket } from './socket/socketImport';
import './homePage.css';
import './homePageLogged.css';
import './gamePage.css';

function App() {
    const [route, setRoute] = useState('login');
    const [user, setUser] = useState({username: '', wins: 0});
    const [currentSocket, setCurrentSocket] = useState(null);
    const [friendSocket, setFriendSocket] = useState(null);

    const onRouteChange = (e) => {
        switch(e.target.value) {
            case 'goToRegister':
                setRoute('register');
                removeUserSocket();
                break;
            case 'goToLogin':
                setRoute('login');
                removeUserSocket();
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
                removeUserSocket();
        }
    }

    const showOnlineStatusToFriends = async () => {
        let allFriendNames = [];
        try {
            const response1 = await fetch(`http://localhost:8000/getFriends?username=${user.username}`)
            if (!response1.ok) {
                throw new Error('Error')
            }
            const friends = await response1.json();
            if (friends !== null && friends !== '') {
                allFriendNames = friends.split(',');
            }

            for (let friend of allFriendNames) {
                const response2 = await fetch(`http://localhost:8000/findFriend?username=${friend}`)
                if (!response2.ok) {
                    throw new Error('Error')
                }
                const user = await response2.json();
                if (user.socketid) {
                    console.log('sending update');
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

    const removeUserSocket = async () => {
        const res = await fetch('http://localhost:8000/removeUserSocket', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            username: user.username
          })
        })
        const socketRemoved = await res.json();
        if (socketRemoved) {
            showOnlineStatusToFriends();
        }
    }

    // window.unload = window.onbeforeunload = () => {
    //     removeUserSocket();
    //     return "Your game progress may be lost. Are you sure you want to reload the page?";
    // }

    window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        removeUserSocket();
        // e.returnValue = '';
    })

    //  const addUserSocket = () => {
    //     fetch('http://localhost:8000/removeUserSocket', {
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

    socket.on('disconnect', () => {
        // console.log('disconnected');
    })

    socket.on('connect', () => {
        setCurrentSocket(socket.id);
        // console.log('connected');
    })

    document.onkeydown = (e) => {
        const loginBtn = document.querySelector('.loginBtn');
        const registerBtn = document.querySelector('.registerBtn');

        if ((e.keyCode === 13) && (route === 'login')) {
            e.preventDefault();
            loginBtn.click();
        } else if ((e.keyCode === 13) && (route === 'register')) {
            e.preventDefault();
            registerBtn.click();
        }
    };

    return (
        route === 'login' || route === 'register'
        ?
        <div className='homePage'>
            <FriendsHome />
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
                <Navigation username={user.username} onRouteChange={onRouteChange} route={route} />
                <Friends route={route} setFriendSocket={setFriendSocket} currentSocket={currentSocket} showOnlineStatusToFriends={showOnlineStatusToFriends} username={user.username} setRoute={setRoute} />
                <HomeBoard route={route}/>
                <Footer />
            </div>
            :
            <div className='gamePage'>
                <Navigation username={user.username} onRouteChange={onRouteChange} route={route} />
                <UserBoard friendSocket={friendSocket} route={route}/>
                <ReadyButton />
                <OpponentBoard friendSocket={friendSocket} route={route}/>
                <Footer />
            </div>
            }
        </>
    );
}

export default App;
