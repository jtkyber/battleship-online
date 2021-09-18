import React, { useState } from 'react';
import './logReg.css';

const Login = ({onRouteChange, loadUser, currentSocket}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const logReg = document.querySelector('.logReg');

    const onSubmitLogin = async (e) => {
        try {
            const res = await fetch('https://calm-ridge-60009.herokuapp.com/login', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                username: userName,
                password: password,
                socketid: currentSocket
              })
            })
            const user = await res.json();
            if (user.username) {
                loadUser(user);
                onRouteChange(e);
            } else if (user === 'no socketid') {
                logReg.style.setProperty("--reg-log-alert", '"Server error. Please try again"');
            } else if (logReg !== null) {
                logReg.style.setProperty("--reg-log-alert", '"The username or password you entered is incorrect"');
            }
        } catch(err) {
            console.log(err);
        }

    }

    return (
        <div className='logReg'>
            <h1>Log In</h1>
            <div className='username'>
                <h4>Username</h4>
                <input onChange={(e) => setUserName(e.target.value)} type='text' />
            </div>
            <div className='password'>
                <h4>Password</h4>
                <input onChange={(e) => setPassword(e.target.value)} type='password' />
            </div>
            <button className='loginBtn' value='login' onClick={onSubmitLogin}>Login</button>
            <button value='goToRegister' onClick={onRouteChange} className='changeLogReg'>Register</button>
        </div>
    )
}

export default Login;
