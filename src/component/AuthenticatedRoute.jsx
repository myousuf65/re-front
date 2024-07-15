import React, { Component } from 'react'
import { Route, Redirect } from 'react-router-dom'
import AuthenticationService from '../service/AuthenticationService';

class AuthenticatedRoute extends Component {

    render() {
        // const authenUser = sessionStorage.getItem('authenticatedUser');
        // const broadcastStatus = sessionStorage.getItem('broadcastStatus');    //---getSessionStorage 0: not yet; 1: ing; 2: ok; 3: further login

        if (AuthenticationService.isUserLoggedIn()) {
            return <Route {...this.props} />
        // } else if (sessionStorage.getItem('syncSession')!==null) {  || (link.host==="dsptest.csd.ccgo.hksarg")
        //     return <Redirect to="/loading" />
        } else if (window.location.hostname==='dsp.csd.hksarg') {
            let winHref = window.location.href;
            sessionStorage.setItem('_target', winHref);
            return <Redirect to="/loading" />
        }    else if (window.location.hostname==='dsptest.csd.ccgo.hksarg') {
            let winHref = window.location.href;
            sessionStorage.setItem('_target', winHref);
            return <Redirect to="/loading" />
        }    
        else {
            let winHref = window.location.href;
            sessionStorage.setItem('_target', winHref);
            return <Redirect to="/login" />
        }

    }
}

export default AuthenticatedRoute