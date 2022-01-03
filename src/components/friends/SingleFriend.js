import React, { useEffect } from 'react';
import './singleFriend.css';

const SingleFriend = ({ friendSocket, setOpponentName, socket, route, setFriendSocket, currentSocket, username, name, status, setRoute }) => {

    useEffect(() => {
        socket.on('receive go to game', () => {
            setRoute('game');
        })

        socket.on('receive invite', data => handleInvite(data))

        return () => {
            socket.off('receive go to game');
            socket.off('receive invite');
        }
    },[])

    const handleInvite = (data) => {
        const btn = document.querySelector(`.btn${data.username}`);
        if (route === 'loggedIn' && btn !== null) {
            if (btn.disabled === true) {
                btn.style.backgroundColor = 'rgba(0,255,50,0.7)';
                btn.style.border = '2px solid rgba(255,255,255,0.5)';
                btn.style.color = 'rgba(0,0,0,1)';
                btn.disabled = false;
            }
            btn.childNodes[0].nodeValue = "Accept";
            setFriendSocket(data.socketid);
        }
    }

    const sendInvite = async (e) => {
        const friend = e.target.id;
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${friend}`)
            const user = await response.json();
            if (user.socketid) {
                setFriendSocket(user.socketid);
                setOpponentName(user.username);
                socket.emit('send invite', {currentSocket: currentSocket, username: username, socketid: user.socketid});
                e.target.childNodes[0].nodeValue = "Invite sent";
                e.target.style.backgroundColor = 'transparent';
                e.target.style.border = 'none';
                e.target.style.color = 'rgba(0,255,0,0.8)';
                e.target.disabled = true;
            }
        } catch(err) {
            console.log(err);
        }
    }

    const acceptInvite = (e) => {
        socket.emit('send go to game', friendSocket);
        setOpponentName(e.target.id);
        setRoute('game');
    }

    const handleOnClick = (e) => {
        if (e.target.innerHTML === 'Invite') {
            sendInvite(e)
        } else if (e.target.innerHTML === 'Accept') {
            acceptInvite(e)
        }
    }

    return (
        <div id={name} value={name} className='friendBlock'>
            <div className='friendText'>
                <h3>{name}</h3>
                <button className={'btn' + name} onClick={handleOnClick} id={name}>Invite</button>
            </div>
            <div id={status} className={status}></div>
        </div>
    )
}

export default SingleFriend;
