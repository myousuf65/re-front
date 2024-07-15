import React from 'react';

import { HashRouter as Router, Route, Switch, Redirect } from "react-router-dom";

import AuthenticatedRoute from './component/AuthenticatedRoute';
import Mainlayout from './main_layout';
import LoginPage from './loginPage';
import FailoutPage from './failoutPage';
import LoadingPage from './loadingPage';
import CaptivePortalPage from './captivePortalPage';

export default class App extends React.Component {

  render() {
    const checker1 = sessionStorage.getItem('authenticatedUser');
    const checker2 = sessionStorage.getItem('accessToken');
    return (
      <div>
        <Router>
          <Switch>
            <Route path="/" exact render={()=><Redirect to="/home" />} />
            <Route path="/login" exact render={()=>(checker1&&checker2? <Redirect to="/home" />:<LoginPage />)} />
            <Route path="/failout" exact render={()=><FailoutPage />} />
            <Route path="/loading" exact render={()=><LoadingPage />} />
            <Route path="/captiveportal" exact render={()=><CaptivePortalPage />} />
            <AuthenticatedRoute path="/" exact component={Mainlayout} />
            <AuthenticatedRoute path="/home" exact component={Mainlayout} />
            <AuthenticatedRoute component={Mainlayout} />
          </Switch>

        </Router>
      </div>
      )
  }
}