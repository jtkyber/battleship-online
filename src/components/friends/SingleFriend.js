import React, { useEffect } from 'react';
import './singleFriend.css';

const SingleFriend = ({ friendSocket, setOpponentName, socket, route, setFriendSocket, currentSocket, username, name, status, setRoute }) => {

    useEffect(() => {
        socket.on('receive go to game', data => {
            setOpponentName(data.senderName);
            setFriendSocket(data.senderSocket);
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
                btn.style.opacity = '0.8';
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
                socket.emit('send invite', {currentSocket: currentSocket, username: username, socketid: user.socketid});
                e.target.childNodes[0].nodeValue = "Invite sent";
                e.target.style.opacity = '0.4';
                e.target.style.cursor = 'default';
                e.target.disabled = true;
            }
        } catch(err) {
            console.log(err);
        }
    }

    const acceptInvite = (e) => {
        socket.emit('send go to game',  {receiverSocket: friendSocket, senderSocket: currentSocket, senderName: username});
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
