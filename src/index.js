import 'react-app-polyfill/ie11';
import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const store = createStore(model);

ReactDOM.render(
  <StoreProvider store={store}>
        <App />
    </StoreProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
