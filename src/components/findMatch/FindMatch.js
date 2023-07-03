import { useStoreActions, useStoreState } from 'easy-peasy'
import React, { useEffect } from 'react'
import './findMatch.css'

const FindMatch = () => {
	const { search, user, route, channel } = useStoreState(state => ({
		search: state.search,
		user: state.user,
		route: state.route,
		channel: state.channel,
	}))

	const { setSearch, setFindMatchInterval, setOpponentName, setRoute, setUser } = useStoreActions(
		actions => ({
			setSearch: actions.setSearch,
			setFindMatchInterval: actions.setFindMatchInterval,
			setOpponentName: actions.setOpponentName,
			setRoute: actions.setRoute,
			setUser: actions.setUser,
		})
	)

	useEffect(() => {
		if (route === 'login' || route === 'register') {
			if (user?.hash === 'guest') {
				removeGuest()
			}
		}

		return () => {}
	}, [])

	useEffect(() => {
		if (search) {
			// setFindMatchInterval(setInterval(searchForMatch, 5000));
			searchForMatch()
		}
	}, [search, user])

	useEffect(() => {
		if (channel) {
			channel.bind('receive-go-to-game', data => {
				setOpponentName(data.senderName)
				setRoute('game')
				return data
			})
		}

		return () => {
			if (channel) channel.unbind('receive-go-to-game')
		}
	}, [channel])

	// useEffect(() => {
	//     if (user?.username?.length && (route === 'login' || route === 'register')) {
	//         console.log(user);
	//         updateSearching();
	//     }
	// }, [user?.username])

	const stopSearching = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/updateSearching`, {
				method: 'put',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user.username,
					search: false,
				}),
			})
			if (!response.ok) {
				throw new Error('Problem updating searching status')
			}
		} catch (err) {
			console.log(err)
		}
	}

	const updateSearching = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/updateSearching`, {
				method: 'put',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user.username,
					search: !search,
				}),
			})
			if (!response.ok) {
				throw new Error('Problem updating searching status')
			}
			const searchChanged = await response.json()
			if (searchChanged) {
				setSearch(!search)
			}
		} catch (err) {
			console.log(err)
		}
	}

	const searchForMatch = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/findMatch`, {
				method: 'put',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user.username,
				}),
			})
			if (!response.ok) {
				throw new Error('Could not find match')
			}
			const match = await response.json()
			if (match?.username) {
				setOpponentName(match.username)
				stopSearching()
				setSearch(false)
				const res2 = await fetch(
					`${process.env.REACT_APP_PUSHER_URL}/sendGoToGame?friendName=${match?.username}&username=${user?.username}`
				)
				const opponentJoined = await res2.json()
				if (opponentJoined) {
					setOpponentName(match.username)
					setRoute('game')
				}
			}
		} catch (err) {
			console.log(err)
		}
	}

	const removeGuest = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/removeGuestUser`, {
				method: 'delete',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: user?.username,
				}),
			})
			if (!response.ok) {
				throw new Error('Problem removing guest')
			}
			setSearch(false)
			setUser(null)
		} catch (err) {
			console.log(err)
		}
	}

	const addGuest = async () => {
		try {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/addGuestUser`, {
				method: 'post',
				headers: { 'Content-Type': 'application/json' },
			})
			if (!response.ok) {
				throw new Error('Problem adding guest')
			}
			const data = await response.json()
			await setUser(data)
			setSearch(true)
		} catch (err) {
			console.log(err)
		}
	}

	return (
		<div className={`findMatchContainer ${route === 'login' || route === 'register' ? 'playAsGuest' : null}`}>
			{route === 'login' || route === 'register' ? (
				<button onClick={!search ? addGuest : removeGuest} className='findMatch'>
					{!search ? 'Play as Guest' : 'Searching...'}
				</button>
			) : (
				<button onClick={updateSearching} className='findMatch'>
					{!search ? 'Find Match' : 'Searching...'}
				</button>
			)}
		</div>
	)
}

export default FindMatch
