import { Howl } from 'howler'
import ambientWaves from './audioclips/ambient-waves.mp3'
import buttonClick from './audioclips/button-click.mp3'
import dropShip from './audioclips/drop-ship.mp3'
import gameTheme from './audioclips/game-theme.mp3'
import hitSound from './audioclips/hit-sound.mp3'
import hoverSound from './audioclips/hover-sound.mp3'
import incomingMissile from './audioclips/incoming-missile.mp3'
import lobbyTheme from './audioclips/lobby-theme.mp3'
import missSound from './audioclips/miss-sound.mp3'
import missileLaunch from './audioclips/missile-launch.mp3'
import missileLock from './audioclips/missile-lock.mp3'
import notificationSound from './audioclips/notification.mp3'
import pickUpShip from './audioclips/pick-up-ship.mp3'
import rotateShip from './audioclips/rotate-ship.mp3'
import shipPlacementTheme from './audioclips/ship-placement-theme.mp3'
import shipSunkSound from './audioclips/ship-sunk.mp3'

const handleWaveFade = () => {
	if (audio.ambientWaves.volume() === 0) {
		audio.ambientWaves.stop()
	}
}

const handleLobbyFade = () => {
	if (audio.lobbyTheme.volume() === 0) {
		audio.lobbyTheme.stop()
	}
}

const handleGameFade = () => {
	if (audio.gameTheme.volume() === 0) {
		audio.gameTheme.stop()
	}
}

const isMobileDevice = () => {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		return true
	}
	return false
}

export const audio = {
	ambientWaves: new Howl({
		src: ambientWaves,
		loop: true,
		volume: 0.2,
		// onfade: handleWaveFade
	}),

	lobbyTheme: new Howl({
		src: lobbyTheme,
		loop: true,
		volume: 0.5,
		// onfade: handleLobbyFade
	}),

	shipPlacementTheme: new Howl({
		src: shipPlacementTheme,
		loop: true,
		volume: 0.5,
	}),

	gameTheme: new Howl({
		src: gameTheme,
		loop: true,
		volume: 0.3,
		// onfade: handleGameFade
	}),

	buttonClick: new Howl({
		src: buttonClick,
		volume: 0.6,
	}),

	hoverSound: new Howl({
		src: hoverSound,
		volume: 0.6,
		mute: isMobileDevice,
	}),

	hitSound: new Howl({
		src: hitSound,
		volume: 0.7,
	}),

	missSound: new Howl({
		src: missSound,
		volume: 0.4,
	}),

	shipSunkSound: new Howl({
		src: shipSunkSound,
		volume: 0.9,
	}),

	notificationSound: new Howl({
		src: notificationSound,
		volume: 0.9,
	}),

	pickUpShip: new Howl({
		src: pickUpShip,
		volume: 0.9,
	}),

	dropShip: new Howl({
		src: dropShip,
		volume: 0.9,
	}),

	rotateShip: new Howl({
		src: rotateShip,
		volume: 0.9,
	}),

	missileLock: new Howl({
		src: missileLock,
		volume: 0.9,
	}),

	missileLaunch: new Howl({
		src: missileLaunch,
		volume: 1,
	}),

	incomingMissile: new Howl({
		src: incomingMissile,
		volume: 1,
	}),
}
