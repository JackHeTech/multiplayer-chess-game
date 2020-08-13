import React from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import JoinRoom from './onboard/joinroom'
import { ColorContext } from './context/colorcontext'
import Onboard from './onboard/onboard'
import JoinGame from './onboard/joingame'
import ChessGame from './chess/ui/chessgame'
/*
 *  Frontend flow: 
 * 
 * 1. user first opens this app in the browser. 
 * 2. a screen appears asking the user to send their friend their game URL to start the game.
 * 3. the user sends their friend their game URL
 * 4. the user clicks the 'start' button and waits for the other player to join. 
 * 5. As soon as the other player joins, the game starts. 
 * 
 * 
 * Other player flow:
 * 1. user gets the link sent by their friend
 * 2. user clicks on the link and it redirects to their game. If the 'host' has not yet 
 *    clicked the 'start' button yet, the user will wait for when the host clicks the start button.  
 *    If the host decides to leave before they click on the "start" button, the user will be notified
 *    that the host has ended the session. 
 * 3. Once the host clicks the start button or the start button was already clicked on
 *    before, that's when the game starts. 
 * Onboarding screen =====> Game start. 
 * 
 * Every time a user opens our site from the '/' path, a new game instance is automatically created
 * on the back-end. We should generate the uuid on the frontend, send the request with the uuid
 * as a part of the body of the request. If any player leaves, then the other player wins automatically.  
 * 
 */


function App() {

  const [didRedirect, setDidRedirect] = React.useState(false)

  const playerDidRedirect = React.useCallback(() => {
    setDidRedirect(true)
  }, [])

  const playerDidNotRedirect = React.useCallback(() => {
    setDidRedirect(false)
  }, [])

  const [userName, setUserName] = React.useState('')

  return (
    <ColorContext.Provider value = {{didRedirect: didRedirect, playerDidRedirect: playerDidRedirect, playerDidNotRedirect: playerDidNotRedirect}}>
      <Router>
        <Switch>
          <Route path = "/" exact>
            <Onboard setUserName = {setUserName}/>
          </Route>
          <Route path = "/game/:gameid" exact>
            {didRedirect ? 
              <React.Fragment>
                    <JoinGame userName = {userName} isCreator = {true} />
                    <ChessGame myUserName = {userName} />
              </React.Fragment> 
              :
              <JoinRoom />}
          </Route>
          <Redirect to = "/" />
        </Switch>
      </Router>
    </ColorContext.Provider>);
}

export default App;
