import { useStoreActions, useStoreState } from 'easy-peasy'
import React, { useEffect } from 'react'

import Navigation from '../navigation/Navigation'

const Leaderboard = ({ onRouteChange }) => {
	const { topFive, route } = useStoreState(state => ({
		topFive: state.topFive,
		route: state.route,
	}))

	const { setTopFive } = useStoreActions(actions => ({
		setTopFive: actions.setTopFive,
	}))

	useEffect(() => {
		if (route === 'leaderboard') {
			getTopPlayers()
		}
	}, [route])

	const getTopPlayers = async () => {
		for (let i = 0; i < 5; i++) {
			const response = await fetch(`${process.env.REACT_APP_API_URL}/getTopFive?userNum=${i}`)
			if (!response.ok) {
				throw new Error('Error')
			}
			const data = await response.json()
			setTopFive(data)
		}
	}

	return (
		<>
			<Navigation onRouteChange={onRouteChange} />
			{topFive.length ? (
				<div className='topFiveContainer'>
					<div className='topFive'>
						{topFive.map(player => {
							return (
								<h3 key={player.username} className='LBplayer'>
									{' '}
									{player.username} : <span className='score'>{player.score}</span>
								</h3>
							)
						})}
					</div>
				</div>
			) : null}
		</>
	)
}

export default Leaderboard
