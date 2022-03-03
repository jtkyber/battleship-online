# Battleship
## Description
A battleship web-app that lets users play against friends, random players, or the AI
## Features
* Fully custom game board
* Game timers for placing ships and for each turn (except when playing against AI)
  * 90 seconds to place ships
  * 15 seconds to choose a shot or the turn ends. After 3 consecutive missed turns, the user is kicked from the match and the opponent wins
* Make an account to add friends, invite them to matches, and have a saved score
* View your friends' status ("Online/Offline/In Game"), which is updated in real time
* View a top-five leaderboard
* Sound effects for various actions, and music that changes based on the state of the game (out of game/placing ships/game in progress)
* Chat with the opponent while in a match
* Find a match with a random player, even without an account
* Play against a custom AI, which has decision-making similar to that of a normal player. Also does not require an account
* User and server error handling when logging in, adding a friend, placing ships, etc.
* Responsive and mobile friendly
## How to place ships (Instructions button available in-game)
#### Deskop
* To pick up a ship, left click once on the ship you want to move
* To rotate a ship, right click or press "spacebar" while the ship is selected
* To drop a ship, left click again when it is in position
#### Mobile
* To pick up a ship, tap once on the ship you want to move
* To rotate a ship, tap the selected ship once again
* To drop a ship, let go of the screen if dragging the ship, or tap elsewhere on the screen if the ship was not moved after selection/rotation
## Tech Stack
* Javascript
* HTML
* CSS
* React.js
* Bootstrap
* Node.js
* Express.js
* PostgreSQL
* Knex.js
* Socket.io
* Heroku
* Easy-Peasy (state management)
* Howler.js
* jQuery
