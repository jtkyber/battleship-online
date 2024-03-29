import { action, persist } from 'easy-peasy'

const isMobileDevice = () => {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		return true
	}
	return false
}

const isIOSDevice = () => {
	if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
		return true
	}
	return false
}

const model = {
	//State

	stored: persist(
		{
			soundOn: true,
			musicOn: true,
			isMobile: isMobileDevice(),
			isIOS: isIOSDevice(),
			showGameInstructions: true,
		},
		{
			storage: 'localStorage',
		}
	),

	route: 'login',
	user: null,
	opponentName: '',
	unsortedFriends: [],
	findMatchInterval: 0,
	checkOppStatusInterval: 0,
	updatLastOnlineInterval: 0,
	getOnlineFriendsInterval: 0,
	search: false,
	friendRequests: [],
	userName: '',
	password: '',
	topFive: [],
	allFriends: [],
	friendFilter: '',
	friendSearch: '',
	friendsOnline: [],
	gameRoute: 'placeShips',
	playerIsReady: false,
	yourTurn: false,
	chatText: '',
	inviteSent: false,
	inviteReceived: false,
	playerTurnText: '',
	showFriendsMobile: false,
	showChatMobile: false,
	audioStarted: false,
	shipIsSelected: false,
	deviceInPortrait: true,
	opponentIsReady: false,
	firstGameInstructionLoad: true,
	gameTimer: 90,
	gameCountdownInterval: 0,
	skippedTurns: 0,
	playingWithAI: false,
	aiShipLayout: {},
	allSquareIDs: [],
	aiTurn: false,
	aiShotMatchedToUserShot: '',
	channel: '',
	pusher: null,

	//Actions

	setRoute: action((state, input) => {
		state.route = input
	}),

	setUser: action((state, input) => {
		state.user = input
	}),

	setOpponentName: action((state, input) => {
		state.opponentName = input
	}),

	setUnsortedFriends: action((state, input) => {
		state.unsortedFriends = input
	}),

	setFindMatchInterval: action((state, input) => {
		state.findMatchInterval = input
	}),

	setCheckOppStatusInterval: action((state, input) => {
		state.checkOppStatusInterval = input
	}),

	setUpdatLastOnlineInterval: action((state, input) => {
		state.updatLastOnlineInterval = input
	}),

	setGetOnlineFriendsInterval: action((state, input) => {
		state.getOnlineFriendsInterval = input
	}),

	setSearch: action((state, input) => {
		state.search = input
	}),

	setFriendRequests: action((state, input) => {
		state.friendRequests = input
	}),

	setUserName: action((state, input) => {
		state.userName = input
	}),

	setPassword: action((state, input) => {
		state.password = input
	}),

	setTopFive: action((state, input) => {
		state.topFive = input
	}),

	setAllFriends: action((state, input) => {
		state.allFriends = input
	}),

	setFriendFilter: action((state, input) => {
		state.friendFilter = input
	}),

	setFriendSearch: action((state, input) => {
		state.friendSearch = input
	}),

	setFriendsOnline: action((state, input) => {
		state.friendsOnline = input
	}),

	setGameRoute: action((state, input) => {
		state.gameRoute = input
	}),

	setPlayerIsReady: action((state, input) => {
		state.playerIsReady = input
	}),

	setYourTurn: action((state, input) => {
		state.yourTurn = input
	}),

	setChatText: action((state, input) => {
		state.chatText = input
	}),

	setInviteSent: action((state, input) => {
		state.inviteSent = input
	}),

	setInviteReceived: action((state, input) => {
		state.inviteReceived = input
	}),

	setPlayerTurnText: action((state, input) => {
		state.playerTurnText = input
	}),

	setSoundOn: action(state => {
		state.stored.soundOn = !state.stored.soundOn
	}),

	setMusicOn: action(state => {
		state.stored.musicOn = !state.stored.musicOn
	}),

	setIsMobile: action((state, input) => {
		state.stored.isMobile = input
	}),

	setShowFriendsMobile: action((state, input) => {
		state.showFriendsMobile = input
	}),

	setShowChatMobile: action((state, input) => {
		state.showChatMobile = input
	}),

	setAudioStarted: action(state => {
		state.audioStarted = true
	}),

	setShipIsSelected: action((state, input) => {
		state.shipIsSelected = input
	}),

	setShowGameInstructions: action((state, input) => {
		state.stored.showGameInstructions = input
	}),

	setDeviceInPortrait: action((state, input) => {
		state.deviceInPortrait = input
	}),

	setOpponentIsReady: action((state, input) => {
		state.opponentIsReady = input
	}),

	setFirstGameInstructionLoad: action((state, input) => {
		state.firstGameInstructionLoad = input
	}),

	setGameTimer: action((state, input) => {
		state.gameTimer = input
	}),

	setGameCountdownInterval: action((state, input) => {
		state.gameCountdownInterval = input
	}),

	setSkippedTurns: action((state, input) => {
		state.skippedTurns = input
	}),

	setPlayigWithAI: action((state, input) => {
		state.playingWithAI = input
	}),

	setAiShipLayout: action((state, input) => {
		state.aiShipLayout = input
	}),

	setAllSquareIDs: action((state, input) => {
		state.allSquareIDs = input
	}),

	setAIturn: action((state, input) => {
		state.aiTurn = input
	}),

	setAIShotMatchedToUserShot: action((state, input) => {
		state.aiShotMatchedToUserShot = input
	}),

	setChannel: action((state, input) => {
		state.channel = input
	}),

	setPusher: action((state, input) => {
		state.pusher = input
	}),
}

export default model
