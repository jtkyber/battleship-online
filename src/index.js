import { StoreProvider, createStore } from 'easy-peasy'
import React from 'react'
import 'react-app-polyfill/ie11'
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import model from './model'
import reportWebVitals from './reportWebVitals'

const store = createStore(model)

const root = createRoot(document.getElementById('root'))

root.render(
	<StoreProvider store={store}>
		<App />
	</StoreProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
