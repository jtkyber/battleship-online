import React, { useEffect } from 'react';
import { useStoreState, useStoreActions } from 'easy-peasy';
import './findMatch.css';

const FindMatch = ({ socket }) => {
    
    const { currentSocket, search, findMatchInterval, user } = useStoreState(state => ({
        currentSocket: state.currentSocket,
        search: state.search,
        findMatchInterval: state.search,
        user: state.user
    }));

    const { setSearch, setFindMatchInterval, setOpponentName, setFriendSocket, setRoute } = useStoreActions(actions => ({
        setSearch: actions.setSearch,
        setFindMatchInterval: actions.setFindMatchInterval,
        setOpponentName: actions.setOpponentName,
        setFriendSocket: actions.setFriendSocket,
        setRoute: actions.setRoute
    }));

    useEffect(() => {
        socket.on('receive go to game', data => {
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

    const stopSearching = async () => {
         try {
            clearInterval(findMatchInterval);
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
            if (match) {
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

    return (
        <div className='findMatchContainer'>
            <button onClick={updateSearching} className='findMatch'>{search === false ? 'Find Match' : 'Searching...'}</button>
        </div>
    )
}

export default FindMatch;
