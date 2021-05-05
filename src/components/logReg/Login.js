import React, { useState } from 'react';
import './logReg.css';

const Login = ({onRouteChange, loadUser, currentSocket}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const logReg = document.querySelector('.logReg');

    const onSubmitLogin = (e) => {
        fetch('http://localhost:8000/login', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            username: userName,
            password: password,
            socketid: currentSocket
          })
        })
        .then(response => response.json())
        .then(user => {
          if (user.username) {
            loadUser(user);
            onRouteChange(e);
          } else if (logReg !== null) {
            logReg.style.setProperty("--reg-log-alert", '"The username or password you entered does not exist"');
          }
        })
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
