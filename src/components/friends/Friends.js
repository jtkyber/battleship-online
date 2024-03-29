import { useStoreActions, useStoreState } from 'easy-peasy'
import React, { useEffect } from 'react'
import SingleFriend from './SingleFriend'
import './friends.css'

const Friends = () => {
	const {
		unsortedFriends,
		user,
		allFriends,
		friendFilter,
		friendSearch,
		friendsOnline,
		getOnlineFriendsInterval,
		isMobile,
		showFriendsMobile,
		channel,
	} = useStoreState(state => ({
		unsortedFriends: state.unsortedFriends,
		user: state.user,
		allFriends: state.allFriends,
		friendFilter: state.friendFilter,
		friendSearch: state.friendSearch,
		friendsOnline: state.friendsOnline,
		getOnlineFriendsInterval: state.getOnlineFriendsInterval,
		isMobile: state.stored.isMobile,
		showFriendsMobile: state.showFriendsMobile,
		channel: state.channel,
	}))

	const {
		setUnsortedFriends,
		setAllFriends,
		setFriendFilter,
		setFriendSearch,
		setFriendsOnline,
		setGetOnlineFriendsInterval,
	} = useStoreActions(actions => ({
		setUnsortedFriends: actions.setUnsortedFriends,
		setAllFriends: actions.setAllFriends,
		setFriendFilter: actions.setFriendFilter,
		setFriendSearch: actions.setFriendSearch,
		setFriendsOnline: actions.setFriendsOnline,
		setGetOnlineFriendsInterval: actions.setGetOnlineFriendsInterval,
	}))

	let userFromLastFriendRequest

	// Start fetching friends on component mount
	// -----------------------------------------------------------------------------------
	useEffect(() => {
		fetchFriends()

		setGetOnlineFriendsInterval(setInterval(getOnlineFriends, 1000))

		return () => {
			clearInterval(getOnlineFriendsInterval)
		}
	}, [])

	useEffect(() => {
		if (channel !== user.username) return
		channel.bind('update-friend-status', data => {
			getOnlineFriends()
			return data
		})

		return () => {
			if (channel) channel.unbind('update-friend-status')
		}
	}, [channel])
	//-----------------------------------------------------------------------------------
	// Sort the friends when fetching has finished/unsortedFriends has updated
	//-----------------------------------------------------------------------------------
	useEffect(() => {
		sortFriends()
	}, [friendsOnline, unsortedFriends])

	//-----------------------------------------------------------------------------------
	// Sort friends. Online at top
	//-----------------------------------------------------------------------------------
	const sortFriends = () => {
		const offlineFriends = []
		const justAdded = []
		let onlineSorted = []
		let offlineSorted = []

		unsortedFriends.forEach(f => {
			if (f.username === userFromLastFriendRequest?.username) {
				justAdded.push(f)
			} else {
				let addFriendToOffline = true
				friendsOnline.forEach(olF => {
					if (olF.username === f.username) {
						return (addFriendToOffline = false)
					}
				})

				if (addFriendToOffline) {
					offlineFriends.push(f)
				}
			}
		})

		onlineSorted = friendsOnline.sort((a, b) => {
			return a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1
		})

		offlineSorted = offlineFriends.sort((a, b) => {
			return a.username.toLowerCase() > b.username.toLowerCase() ? 1 : -1
		})

		if (justAdded.length) {
			setAllFriends(justAdded.concat(onlineSorted).concat(offlineSorted))
		} else {
			setAllFriends(onlineSorted.concat(offlineSorted))
		}
	}

	const getOnlineFriends = async () => {
		try {
			const response = await fetch(
				`${process.env.REACT_APP_API_URL}/getFriendsOnline?username=${user.username}`
			)
			if (!response.ok) {
				throw new Error('Could not get online friends')
			}
			const onlineFriends = await response.json()
			setFriendsOnline(onlineFriends)
		} catch (err) {
			console.log(err)
		}
	}

	//-----------------------------------------------------------------------------------
	// Get array of friends
	// -----------------------------------------------------------------------------------
	const fetchFriends = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/getFriends?username=${user.username}`)
			if (!response.ok) {
				throw new Error('Problem accessing friends list')
			}
			const friends = await response.json()
			if (user?.friends?.length && friends?.length) {
				setUnsortedFriends(friends)
				getOnlineFriends()
			} else {
				setAllFriends([])
				setUnsortedFriends([])
				setFriendsOnline([])
			}
		} catch (err) {
			console.log(err)
		}
	}
	//-----------------------------------------------------------------------------------
	// Send friend request
	//-----------------------------------------------------------------------------------
	const sendFriendRequest = async () => {
		document.querySelector('.addFriendInput').value = ''
		const friendAlert = document.querySelector('.friendsContainer')
		let friendName = ''
		let friendsRequests = ''
		let friendsRequestsArray = []
		//-----------------------------------------------------------------------------------
		// Check to see if friend already sent user request
		//-----------------------------------------------------------------------------------
		try {
			const res = await fetch(`${process.env.REACT_APP_API_URL}/getFriendRequests?username=${user.username}`)
			if (!res.ok) {
				throw new Error('Could not get friend requests')
			}
			const requests = await res.json()
			if (requests !== null && requests !== '') {
				const requestsArray = requests.split(',')
				if (requestsArray.includes(friendSearch)) {
					friendAlert.style.setProperty('--add-friend-alert', '"User already sent you a request"')
					throw new Error('User already sent you a request')
				}
			}
			//-----------------------------------------------------------------------------------
			// Check to see if friend exists
			//-----------------------------------------------------------------------------------
			const res2 = await fetch(`${process.env.REACT_APP_API_URL}/findFriend?username=${friendSearch}`)
			if (!res2.ok) {
				friendAlert.style.setProperty('--add-friend-alert', '"User does not exist"')
				throw new Error('User does not exist')
			}
			const user1 = await res2.json()
			if (user1.username === user.username) {
				friendAlert.style.setProperty('--add-friend-alert', '"Cannot add yourself as a friend"')
				throw new Error('Cannot add self as friend')
			} else if (user1.username) {
				friendName = user1.username
				//-----------------------------------------------------------------------------------
				// Add user to friend's friendrequests
				//-----------------------------------------------------------------------------------
				let friendList = []
				if (user1.friends !== null && user1.friends !== '') {
					friendList = user1.friends.split(',')
				}
				if (user1.friendrequests !== null && user1.friendrequests !== '') {
					friendsRequestsArray = user1.friendrequests.split(',')
					if (friendsRequestsArray.includes(user.username)) {
						friendAlert.style.setProperty('--add-friend-alert', '"You have already sent them a request"')
						throw new Error('You have already sent them a request')
					} else if (friendList.includes(user.username)) {
						friendAlert.style.setProperty('--add-friend-alert', '"User is already your friend"')
						throw new Error('User is already your friend')
					} else {
						friendsRequestsArray.push(user.username)
						friendsRequests = user1.friendrequests.concat(`,${user.username}`)
					}
				} else {
					if (friendList.includes(user.username)) {
						friendAlert.style.setProperty('--add-friend-alert', '"User is already your friend"')
						throw new Error('User is already your friend')
					}
					friendsRequests = user.username
					friendsRequestsArray = [user.username]
				}
			}
			friendAlert.style.setProperty('--add-friend-alert', '""')
			const res3 = await fetch(`${process.env.REACT_APP_API_URL}/updateFriendRequests`, {
				method: 'put',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requestlist: friendsRequests,
					username: friendName,
				}),
			})
			if (!res3.ok) {
				throw new Error('Could not add self to friendrequests of friend')
			}
			const selfAdded = await res3.json()
			if (selfAdded) {
				await fetch(`${process.env.REACT_APP_PUSHER_URL}/sendFriendRequest?channelName=${friendSearch}`)
				userFromLastFriendRequest = user1
			}
		} catch (err) {
			console.log(err)
		}
	}

	const friendIsOnline = last => {
		const curTime = Date.now()
		if (last > curTime - 5000 && last) {
			return true
		} else {
			return false
		}
	}

	return (
		<div
			className={`friendsContainer ${isMobile ? 'mobile' : null} ${
				!showFriendsMobile && isMobile ? 'hide' : null
			}`}>
			<div className='friendsContainerHeader'>
				<h2>Friends</h2>
				<input
					className='friendSearch'
					onChange={e => setFriendFilter(e.target.value)}
					type='text'
					placeholder='Filter friends'
				/>
			</div>
			<div className='friendsSection'>
				<div className='friendsListContainer'>
					{allFriends.length ? (
						<div className='friendsList'>
							{
								//-----------------------------------------------------------------------------------
								// Map through the user's friends
								// Return a single friend div w/ their username and status
								//-----------------------------------------------------------------------------------
								allFriends.map(f => {
									if (f.username && f.username.toLowerCase().includes(friendFilter.toLowerCase())) {
										if (friendIsOnline(f.lastonline)) {
											return (
												<SingleFriend
													friendInGame={f.ingame}
													key={f.username}
													name={f.username}
													status='online'
												/>
											)
										} else {
											return (
												<SingleFriend
													friendInGame={f.ingame}
													key={f.username}
													name={f.username}
													status='offline'
												/>
											)
										}
									} else return null
								})
							}
						</div>
					) : (
						<h4 className='noFriends'>No friends have been added</h4>
					)}
				</div>
			</div>
			<div className='addFriend'>
				<h3 className='addFriendText'>Add a friend</h3>
				<input
					className='addFriendInput'
					onChange={e => setFriendSearch(e.target.value)}
					type='text'
					placeholder='Enter a username'
				/>
				<button className='friendRequestBtn' onClick={sendFriendRequest}>
					Send
				</button>
			</div>
		</div>
	)
}

export default Friends
