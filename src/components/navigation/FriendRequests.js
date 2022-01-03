import React, { useState, useEffect } from 'react';
import './navigation.css';
import msgIcon from './msg-icon.png';
import { Dropdown } from 'react-bootstrap';

const FriendRequests = ({ setUnsortedFriends, socket, username }) => {
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        updateRequests();

        socket.on('receive friend request', () => {
            updateRequests();
        })

        return () => {
            socket.off('receive friend request');
        }
    },[])

    const updateRequests = async () => {
        const navBar = document.querySelector('nav');
        try {
            const res = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriendRequests?username=${username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                navBar.style.setProperty('--notification-color', 'rgba(255,0,0,0.8)');
                setFriendRequests(requests.split(','));
            } else {
                navBar.style.setProperty('--notification-color', 'transparent');
                setFriendRequests(null);
            }
        } catch(err) {
            console.log(err)
        }
    }

    const removeRequest = async (friend) => {
        let newRequestList = '';
        try {
            const res = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriendRequests?username=${username}`);
            if (!res.ok) {
                throw new Error('Could not get friend requests')
            }
            const requests = await res.json();
            if (requests !== null && requests !== '') {
                const newRequestListArray = requests.split(',');
                if (newRequestListArray.length <= 1) {
                    newRequestList = null;
                } else {
                    const index = newRequestListArray.indexOf(friend);
                    if (index > -1) {
                        newRequestListArray.splice(index, 1);
                        newRequestList = newRequestListArray.join(',');
                    }
                }
            }

            const res2 = await fetch('https://calm-ridge-60009.herokuapp.com/updateFriendRequests', {
                method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        requestlist: newRequestList,
                        username: username
                    })
            });
            if (!res2.ok) {
                throw new Error('Could not update friend requests');
            }
            const userRemoved = await res2.json();
            if (userRemoved) {
                updateRequests();
            }
        } catch(err) {
            console.log(err);
        }
    }

    const onRemoveRequest = (e) => {
        removeRequest(e.target.id);
    }

     const addFriend = async (friend) => {
        console.log('friend added');
        document.querySelector('.addFriendInput').value = '';
        let friendList = '';
        let friendArray = [];
        let friendlistOfFriends = '';
        let friendSocketId = '';
//-----------------------------------------------------------------------------------
        // Search the database to check if the name matches any users in the databse
//-----------------------------------------------------------------------------------
        try {
            const res = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${friend}`);
            if (!res.ok) {
                throw new Error('User does not exist')
            }
            const user = await res.json();
            if (user.username === username) {
                throw new Error('Cannot add self as friend')
            } else if (user.username) {
                let friendlistOfFriendsArray = [];
                friendSocketId = user.socketid;
                if (user.friends !== null && user.friends !== '') {
                    friendlistOfFriendsArray = user.friends.split(',');
                    if (friendlistOfFriendsArray.includes(username)) {
                        throw new Error('You are already a friend of the user');
                    }
                }
                friendlistOfFriendsArray.push(username);
                if (friendlistOfFriendsArray.length > 1) {
                    friendlistOfFriends = friendlistOfFriendsArray.join(',');
                } else {
                    friendlistOfFriends = friendlistOfFriendsArray[0];
                }
    //-----------------------------------------------------------------------------------
                // If friend exists, grab the user's friend list string
                // Make a temporary string and array with the new friend
    //-----------------------------------------------------------------------------------
                const res2 = await fetch(`https://calm-ridge-60009.herokuapp.com/getFriends?username=${username}`)
                if (!res2.ok) {throw new Error('Problem accessing friends list')}
                const friends = await res2.json();
                if (friends.length) {
                    friends.forEach(f => {
                        if (f.username === friend) {
                            throw new Error('User already your friend');
                        }
                    })
                }
                friendArray.push(friend);
                friendList = friendArray.join(',');

    //-----------------------------------------------------------------------------------
                // Update the user's friend list with the new friends string
                // Pass the updated friends array to 'fetchFriendData'
    //-----------------------------------------------------------------------------------
                const res3 = await fetch('https://calm-ridge-60009.herokuapp.com/addFriend', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        friendlist: friendList
                    })
                })
                if (!res3.ok) {throw new Error('Problem adding friend')}
                const userAdded = await res3.json();
                if (userAdded) {
                    let allF = [];
                    for (let friend of friendArray) {
                        try {
                            const response = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${friend}`);
                            if (!response.ok) {throw new Error('User does not exist')}
                            const user = await response.json();
                            if (user.socketid) {
                                allF.push({name: user.username, status: 'online'})
                            } else {
                                allF.push({name: user.username, status: 'offline'})
                            }
                        } catch(err) {
                            console.log(err);
                        }
                    }
                    setUnsortedFriends(allF);
                }
                const res4 = await fetch('https://calm-ridge-60009.herokuapp.com/addSelfToFriend', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        friendlist: friendlistOfFriends,
                        friendname: friend
                    })
                })
                if (!res4.ok) {throw new Error('Problem adding self to friendlist of friend')}
                const selfAdded = await res4.json();
                if (selfAdded && friendSocketId !== null) {
                    socket.emit('update user status', friendSocketId);
                }
            }
        } catch(err) {
            console.log(err);
        }
    }

    const addFriendStart = async (e) => {
        try {
            const res = await fetch(`https://calm-ridge-60009.herokuapp.com/findFriend?username=${e.target.id}`);
            if (!res.ok) {
                throw new Error('User does not exist')
            }
            const user = await res.json();
            if (user.username) {
                removeRequest(e.target.id);
                // socket.emit('send add friend', {socketid: user.socketid, user: username})
                addFriend(e.target.id);
                // Can't add friend if their offline   FIX
            }
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <>
            <Dropdown className='dropdown'>
              <Dropdown.Toggle variant="success" className='messageToggle' id="dropdown-basic"><img src={msgIcon} alt='Message Icon' /></Dropdown.Toggle>
              <Dropdown.Menu id='dropdowns'>
              {
                friendRequests !== null
                ?
                  friendRequests.map(request => {
                    return (
                        <div key={request} className='dropdownItem'>
                            <div className='text'>Friend request from <h3 className="requesterName">{request}</h3></div>
                            <div>
                                <button onClick={addFriendStart} id={request} className='acceptInvite'>Accept</button>
                                <button onClick={onRemoveRequest} id={request} className='rejectInvite'>Reject</button>
                            </div>
                        </div>
                    )
                  })
                  : (null)
              }
              </Dropdown.Menu>
            </Dropdown>
        </>
    )
}

export default FriendRequests;
