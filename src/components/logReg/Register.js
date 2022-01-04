import React, { useState } from 'react';

const Register = ({onRouteChange, loadUser, currentSocket}) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const register = document.querySelector('.register');

    const onSubmitRegister = (e) => {
        if (userName.length < 5) {
            register.style.setProperty("--reg-log-alert", '"Username must be at least 5 characters"');
        } else if (userName.length > 10) {
            register.style.setProperty("--reg-log-alert", '"Username cannot be more than 10 characters"');
        } else if (password.length < 5) {
            register.style.setProperty("--reg-log-alert", '"Password must be at least 5 characters"');
        } else {
            fetch('https://calm-ridge-60009.herokuapp.com/register', {
              method: 'post',
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
              } else if (user === 'no socketid') {
                register.style.setProperty("--reg-log-alert", '"Server error. Please try again"');
                }
                else if (!user.ok) {
                    register.style.setProperty("--reg-log-alert", '"Username has already been taken"');
                    console.log(user);
              }
            })
        }
    }

    return (
        <div className='register'>
            <h1>Register</h1>
            <div className='username'>
                <h4>Username</h4>
                <input onChange={(e) => setUserName(e.target.value)} type='text' />
            </div>
            <div className='password'>
                <h4>Password</h4>
                <input onChange={(e) => setPassword(e.target.value)}type='password' />
            </div>
            <button className='registerBtn' value='register' onClick={onSubmitRegister}>Register</button>
            <button value='goToLogin' onClick={onRouteChange} className='changeLogReg'>Login</button>
        </div>
    )
}

export default Register;

