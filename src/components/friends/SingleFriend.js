import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './singleFriend.css';

const SingleFriend = ({ friendInGame, name, status }) => {

    const { route, user, channel } = useStoreState(state => ({
        route: state.route,
        user: state.user,
        channel: state.channel
    }));

    const { setOpponentName, setRoute } = useStoreActions(actions => ({
        setOpponentName: actions.setOpponentName,
        setRoute: actions.setRoute
    }));    

    useEffect(() => {

        channel.bind('receive-go-to-game', data => {
            setOpponentName(data.senderName);
            setRoute('game');
            return data
        })

        channel.bind('receive-invite', data => {
            handleInvite(data)
            return data
        })


        return () => {
            channel.unbind('receive-go-to-game')
            channel.unbind('receive-go-to-game')
        }
    },[])

    useEffect(() => {
        const btn = document.querySelector(`.btn${name}`);
        if (status !== 'offline' && !friendInGame) {
            btn.style.opacity = '0.8';
            btn.disabled = false;
            btn.childNodes[0].nodeValue = "Invite";
        }
    },[status, friendInGame])

    const handleInvite = (data) => {
        const btn = document.querySelector(`.btn${data.username}`);
        if (route === 'loggedIn' && btn !== null) {
            if (btn.disabled === true) {
                btn.style.opacity = '0.8';
                btn.disabled = false;
            }
            btn.childNodes[0].nodeValue = "Accept";
        }
    }

    const sendInvite = async (e) => {
        const friend = e.target.id;
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/findFriend?username=${friend}`)
            const user1 = await response.json();
            if (user1.username) {
                await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendInvite?username=${user.username}&friendName=${user1.username}`)
                e.target.childNodes[0].nodeValue = "Invite sent";
                e.target.style.opacity = '0.4';
                e.target.style.cursor = 'default';
                e.target.disabled = true;
            }
        } catch(err) {
            console.log(err);
        }
    }

    const acceptInvite = async (e) => {
        await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendGoToGame?username=${user.username}&friendName=${name}`)
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
                {
                    friendInGame && status === 'online'
                    ? <button disabled className={`btn${name} friendInGameBtn`}>In Game</button>
                    : 
                        status === 'online'
                        ? <button className={`btn${name} friendOnlineBtn`} onClick={handleOnClick} id={name}>Invite</button>
                        : <button disabled className={`btn${name} friendOfflineBtn`}>Offline</button>
                }
            </div>
            <div id={status} className={status}></div>
        </div>
    )
}

export default SingleFriend;
