import { action, persist } from 'easy-peasy';

const model = {

    //State

    stored: persist(
        {
            
        },
        {
            storage: 'localStorage',
        }

    ),

    route: 'login',
    user: {
        username: '',
        wins: 0
    },
    currentSocket: null,
    friendSocket: null,
    opponentName: '',
    unsortedFriends: [],
    findMatchInterval: 0,
    checkOppStatusInterval: 0,
    updatLastOnlineInterval: 0,
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
    opponentIsReady: false,
    yourTurn: false,
    chatText: '',
    inviteSent: false,
    inviteReceived: false,

    //Actions

    setRoute: action((state, input) => {
        state.route = input;
    }),

    setUser: action((state, input) => {
        state.user = input;
    }),

    setCurrentSocket: action((state, input) => {
        state.currentSocket = input;
    }),

    setFriendSocket: action((state, input) => {
        state.friendSocket = input;
    }),

    setOpponentName: action((state, input) => {
        state.opponentName = input;
    }),

    setUnsortedFriends: action((state, input) => {
        state.unsortedFriends = input;
    }),

    setFindMatchInterval: action((state, input) => {
        state.findMatchInterval = input;
    }),

    setCheckOppStatusInterval: action((state, input) => {
        state.checkOppStatusInterval = input;
    }),

    setUpdatLastOnlineInterval: action((state, input) => {
        state.updatLastOnlineInterval = input;
    }),

    setSearch: action((state, input) => {
        state.search = input;
    }),

    setFriendRequests: action((state, input) => {
        state.friendRequests = input;
    }),

    setUserName: action((state, input) => {
        state.userName = input;
    }),

    setPassword: action((state, input) => {
        state.password = input;
    }),

    setTopFive: action((state, input) => {
        state.topFive = input;
    }),

    setAllFriends: action((state, input) => {
        state.allFriends = input;
    }),

    setFriendsFilter: action((state, input) => {
        state.friendFilter = input;
    }),

    setFriendSearch: action((state, input) => {
        state.friendSearch = input;
    }),

    setFriendsOnline: action((state, input) => {
        state.friendsOnline = input;
    }),

    setGameRoute: action((state, input) => {
        state.gameRoute = input;
    }),
    
    setPlayerIsReady: action((state, input) => {
        state.playerIsReady = input;
    }),

    setOpponentIsReady: action((state, input) => {
        state.opponentIsReady = input;
    }),

    setYourTurn: action((state, input) => {
        state.yourTurn = input;
    }),

    setChatText: action((state, input) => {
        state.chatText = input;
    }),

    setInviteSent: action((state, input) => {
        state.inviteSent = input;
    }),

    setInviteReceived: action((state, input) => {
        state.inviteReceived = input;
    }),
}

export default model;