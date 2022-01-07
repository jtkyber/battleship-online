import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './findMatch.css';

const FindMatch = ({ socket }) => {
    
    const { currentSocket, search, user, route } = useStoreState(state => ({
        currentSocket: state.currentSocket,
        search: state.search,
        user: state.user,
        route: state.route
    }));

    const { setSearch, setFindMatchInterval, setOpponentName, setFriendSocket, setRoute, setUser } = useStoreActions(actions => ({
        setSearch: actions.setSearch,
        setFindMatchInterval: actions.setFindMatchInterval,
        setOpponentName: actions.setOpponentName,
        setFriendSocket: actions.setFriendSocket,
        setRoute: actions.setRoute,
        setUser: actions.setUser
    }));

    useEffect(() => {
        if ((route === 'login' || route === 'register')) {
            if (user?.hash === 'guest') {
                removeGuest();
            }
        }
        socket.on('receive go to game', data => {
            console.log(data.senderName, user.username);
            setOpponentName(data.senderName);
            setFriendSocket(data.senderSocket);
            setRoute('game');
        })

        return () => {
            socket.off('receive go to game');
        }
    }, [])

    useEffect(() => {
        if (search) {
            setFindMatchInterval(setInterval(searchForMatch, 1000));
        }
    }, [search])

    // useEffect(() => {
    //     if (user?.username?.length && (route === 'login' || route === 'register')) {
    //         console.log(user);
    //         updateSearching();
    //     }
    // }, [user?.username])

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

    const updateSearching = async () => {
        try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/updateSearching', {
                method: 'put',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user.username,
                    search: !search
                })
            })
            if (!response.ok) {throw new Error('Problem updating searching status')}
            const searchChanged = await response.json();
            if (searchChanged) {
                setSearch(!search);
            }
        } catch(err) {
            console.log(err);
        }
    }

    const searchForMatch = async () => {
        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/findMatch?username=${user.username}`)
            if (!response.ok) {throw new Error('Could not find match')}
            const match = await response.json();
            if (match?.username) {
                await setFriendSocket(match.socketid);
                await setOpponentName(match.username);
                await stopSearching();
                await socket.emit('send go to game',  {receiverSocket: match.socketid, senderSocket: currentSocket, senderName: user.username});
                await setSearch(false);
                setRoute('game');
            }
        } catch(err) {
            console.log(err);
        }
    }

    const removeGuest = async () => {
        try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/removeGuestUser', {
                method: 'delete',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: user?.username
                })
            })
            if (!response.ok) {throw new Error('Problem removing guest')}
            setSearch(false);
            setUser(null);
        } catch(err) {
            console.log(err);
        }
    }

    const addGuest = async () => {
        try {
            const response = await fetch('https://calm-ridge-60009.herokuapp.com/addGuestUser', {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    socketid: currentSocket
                })
            })
            if (!response.ok) {throw new Error('Problem adding guest')}
            const data = await response.json();
            await setUser(data);
            setSearch(true);
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className={`findMatchContainer ${(route === 'login' || route === 'register') ? 'playAsGuest' : null}`}>
            {
                route === 'login' || route === 'register'
                ? <button onClick={!search ? addGuest : removeGuest} className='findMatch'>{!search ? 'Play as Guest' : 'Searching...'}</button>
                : <button onClick={updateSearching} className='findMatch'>{!search ? 'Find Match' : 'Searching...'}</button>
            }
        </div>
    )
}

export default FindMatch;
