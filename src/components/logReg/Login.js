import { useStoreState, useStoreActions } from 'easy-peasy';

const Login = ({ onRouteChange}) => {
    
    const { userName, password, search } = useStoreState(state => ({
        userName: state.userName,
        password: state.password,
        search: state.search
    }));

    const { setUserName, setPassword, setUser, setSearch } = useStoreActions(actions => ({
        setUserName: actions.setUserName,
        setPassword: actions.setPassword,
        setUser: actions.setUser,
        setSearch: actions.setSearch
    }));
    
    const login = document.querySelector('.login');

    const onSubmitLogin = async (e) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                username: userName,
                password: password
              })
            })
            const user1 = await res.json();
            if (user1.username) {
                if (search) {
                    setSearch(false);
                }
                setUser(user1);
                onRouteChange(e);
            } else if (user1 === 'no socketid') {
                login.style.setProperty("--reg-log-alert", '"Server error. Please try again"');
            } else if (login !== null) {
                login.style.setProperty("--reg-log-alert", '"The username or password you entered is incorrect"');
            }
        } catch(err) {
            console.log(err);
        }

    }

    return (
        <div className='login'>
            <h1>Log In</h1>
            <div className='username'>
                <h4>Username</h4>
                <input placeholder='Username...' onChange={(e) => setUserName(e.target.value)} type='text' />
            </div>
            <div className='password'>
                <h4>Password</h4>
                <input placeholder='Password...' onChange={(e) => setPassword(e.target.value)} type='password' />
            </div>
            <button className='loginBtn' value='login' onClick={onSubmitLogin}>Login</button>
            <button value='goToRegister' onClick={onRouteChange} className='changeLogReg'>Register</button>
        </div>
    )
}

export default Login;
