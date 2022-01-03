import React, { useState, useEffect } from 'react';
import SingleFriend from './SingleFriend';
import './friends.css';

const Friends = ({ friendSocket, opponentName, setOpponentName, unsortedFriends, setUnsortedFriends, socket, route, setFriendSocket, currentSocket, username, showOnlineStatusToFriends, setRoute }) => {
    const [allFriends, setAllFriends] = useState([]);
    const [friendFilter, setFriendFilter] = useState('');
    const [friendSearch, setFriendSearch] = useState('');
    const [friendsOnline, setFriendsOnline] = useState([]);

    // Start fetching friends on component mount
// -----------------------------------------------------------------------------------
    useEffect(() => {
        fetchFriends();
        showOnlineStatusToFriends();

        socket.on('update friend status', () => {
            console.log('test')
            getOnlineFriends();
        });

        const timer = setInterval(getOnlineFriends, 3000);

        return () => {
            socket.off('update friend status');
            clearInterval(timer);
        }
    }, [])
//-----------------------------------------------------------------------------------
    // Sort the friends when fetching has finished/unsortedFriends has updated
//-----------------------------------------------------------------------------------
    useEffect(() => {
        sortFriends();
    },[unsortedFriends, friendsOnline])
    
//-----------------------------------------------------------------------------------
    // Sort friends. Online at top
//-----------------------------------------------------------------------------------
    const sortFriends = () => {
        const offlineFriends = [];
        const justAdded = [];
        unsortedFriends.forEach(f => {
            if (f.username === friendSearch) {
                justAdded.push(f)
            } else {
                let addFriendToOffline = true;
                friendsOnline.forEach(olF => {
                    if (olF.username === f.username) {
                        return addFriendToOffline = false;
                    }
                })

                if (addFriendToOffline) {
                    offlineFriends.push(f);
                }
            }
        })
        if (justAdded.length) {
            setAllFriends(justAdded.concat(friendsOnline).concat(offlineFriends));
        } else {
            setAllFriends(friendsOnline.concat(offlineFriends));
        }
    }

    const getOnlineFriends = async () => {
         try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriendsOnline?username=${username}`)
            const onlineFriends = await response.json();
            setFriendsOnline(onlineFriends);
        } catch(err) {
            console.log(err);
        }
    }

//-----------------------------------------------------------------------------------
    // Get array of friends
// -----------------------------------------------------------------------------------
    const fetchFriends = async () => {

        try {
            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriends?username=${username}`)
            if (!response.ok) {throw new Error('Problem accessing friends list')}
            const friends = await response.json();
            if (friends.length) {
                setUnsortedFriends(friends);
                getOnlineFriends();
            } else {
                setAllFriends([]);
            }
        } catch(err) {
            console.log(err);
        }
    }
//-----------------------------------------------------------------------------------
    // Send friend request
//-----------------------------------------------------------------------------------
    const sendFriendRequest = async () => {
        document.querySelector('.addFriendInput').value = '';
        const friendAlert = document.querySelector('.friendsContainer');
        let friendName = '';
        let friendSocketId = '';
        let friendsRequests = '';
        let friendsRequestsArray = [];
//-----------------------------------------------------------------------------------
        // Check to see if friend already sent user request
//-----------------------------------------------------------------------------------
        try {
            const res = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriendRequests?username=${username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                const requestsArray = requests.split(',');
                if (requestsArray.includes(friendSearch)) {
                    friendAlert.style.setProperty('--add-friend-alert', '"User already sent you a request"');
                    throw new Error('User already sent you a request')
                }
            }
//-----------------------------------------------------------------------------------
            // Check to see if friend exists
//-----------------------------------------------------------------------------------
            const res2 = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${friendSearch}`);
            if (!res2.ok) {
                friendAlert.style.setProperty('--add-friend-alert', '"User does not exist"');
                throw new Error('User does not exist')
            }
            const user = await res2.json();
            if (user.username === username) {
                friendAlert.style.setProperty('--add-friend-alert', '"Cannot add yourself as a friend"');
                throw new Error('Cannot add self as friend')
            } else if (user.username) {
                friendName = user.username;
                friendSocketId = user.socketid;
//-----------------------------------------------------------------------------------
                // Add user to friend's friendrequests
//-----------------------------------------------------------------------------------
                let friendList = [];
                if (user.friends !== null && user.friends !== '') {
                    friendList = user.friends.split(',');
                }
                if (user.friendrequests !== null && user.friendrequests !== '') {
                    friendsRequestsArray = user.friendrequests.split(',');
                    if (friendsRequestsArray.includes(username)) {
                        friendAlert.style.setProperty('--add-friend-alert', '"You have already sent them a request"');
                        throw new Error('You have already sent them a request');
                    } else if (friendList.includes(username)) {
                        friendAlert.style.setProperty('--add-friend-alert', '"User is already your friend"');
                        throw new Error('User is already your friend');
                    } else {
                        friendsRequestsArray.push(username);
                        friendsRequests = user.friendrequests.concat(`,${username}`);
                    }
                } else {
                    if (friendList.includes(username)) {
                        friendAlert.style.setProperty('--add-friend-alert', '"User is already your friend"');
                        throw new Error('User is already your friend');
                    }
                    friendsRequests = username;
                    friendsRequestsArray = [username];
                }
            }
            friendAlert.style.setProperty('--add-friend-alert', '""');
            const res3 = await fetch('https://calm-ridge-60009.herokuapp.com/updateFriendRequests', {
                method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        requestlist: friendsRequests,
                        username: friendName
                    })
            });
            if (!res3.ok) {
                throw new Error('Could not add self to friendrequests of friend');
            }
            const selfAdded = await res3.json();
            if (selfAdded) {
                console.log('self added to friends list');
                socket.emit('send friend request', friendSocketId);
            }
        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className='friendsContainer'>
            <div className='friendsContainerHeader'>
                    <h2>Friends</h2>
                    <input className='friendSearch' onChange={(e) => setFriendFilter(e.target.value)} type='text' placeholder='Enter a username'/>
            </div>
            <div className='friendsSection'>


                <div className='friendsListContainer'>
                {
                    allFriends.length
                    ?
                    <div className='friendsList'>
                    {
//-----------------------------------------------------------------------------------
                        // Map through the user's friends
                        // Return a single friend div w/ their username and status
//-----------------------------------------------------------------------------------
                        allFriends.map(f => {
                            if (f.username && f.username.toLowerCase().includes(friendFilter.toLowerCase())) {
                                return <SingleFriend friendSocket={friendSocket} opponentName={opponentName} setOpponentName={setOpponentName} socket={socket} route={route} setFriendSocket={setFriendSocket} currentSocket={currentSocket} username={username} key={f.username} name={f.username} status={friendsOnline.includes(f) ? 'online' : 'offline'} setRoute={setRoute} />
                            } else return null
                        })
                    }
                    </div>
                    : <h4 className='noFriends'>No friends have been added</h4>
                }
                </div>
                <div className='addFriend'>
                    <h3 className='addFriendText' >Add a friend</h3>
                    <input className='addFriendInput' onChange={(e) => setFriendSearch(e.target.value)} type='text' placeholder='Enter a username'/>
                    <button className='friendRequestBtn' onClick={sendFriendRequest}>Send Request</button>
                </div>
            </div>
        </div>
    )
}

export default Friends;
