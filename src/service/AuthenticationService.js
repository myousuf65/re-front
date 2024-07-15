import axios from 'axios'

//  const API_URL = 'http://localhost:8080/'
// const API_URL = sessionStorage.getItem('serverPort');

export const USER_NAME_SESSION_ATTRIBUTE_NAME = 'authenticatedUser'
export const SESSION_ATTRIBUTE_NAME_TOKEN = 'accessToken'
export const SESSION_ATTRIBUTE_NAME_CHANNEL = 'accessChannel'
export const SESSION_ATTRIBUTE_NAME_CODE = 'accessCode'
export const CHANNEL_DP = 1
export const CHANNEL_ACCESS_CSD_GOV_HK = 2
export const CHANNEL_KMS_CSD_GOV_HK = 3
export const CHANNEL_MOBILE_APP = 4

class AuthenticationService {

    APP_URL= "http://localhost:8080"
     executeBasicAuthenticationService(username, password) {
         return axios.get(`${API_URL}/basicauth`,
             { headers: { authorization: this.createBasicAuthToken(username, password) } })
     }
   

    executeJwtAuthenticationService(username, password, accessChannel, accessCode) {
         

        console.log(username, password, accessChannel, accessCode);
        console.log("port: ", sessionStorage.getItem("serverPort"))
    
        //return axios.post(`${sessionStorage.getItem('serverPort')}auth/generatetoken`, {
        //    username,
        //    password,
        //    accessChannel,
        //    accessCode
        //})

        const url = 'http://localhost:8080/'
            return axios.post(`${url}auth/generatetoken`, {
            username,
            password,
            accessChannel,
            accessCode
        })
        // const res = axios.post(`${sessionStorage.getItem('serverPort')}auth/generatetoken`, {
        //         username,
        //         password,
        //         accessChannel,
        //         accessCode
        //     })
            // console.log(res)
        
    }

    executeJwtAuthenticationServiceForDP(clientHost) {
        return axios.post(`${sessionStorage.getItem('serverPort')}auth/generatetokendp`, {
            clientHost
        })
    }

    createBasicAuthToken(username, password) {
        return 'Basic ' + window.btoa(username + ":" + password);
    }

    registerSuccessfulLogin(username, password, accessChannel) {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username)
        sessionStorage.setItem(SESSION_ATTRIBUTE_NAME_CHANNEL, accessChannel)
        this.setupAxiosInterceptors(this.createBasicAuthToken(username, password))
    }

    registerSuccessfulLoginForJwt(username, token, accessChannel) {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username)
        sessionStorage.setItem(SESSION_ATTRIBUTE_NAME_TOKEN, token)
        sessionStorage.setItem(SESSION_ATTRIBUTE_NAME_CHANNEL, accessChannel)
        this.setupAxiosInterceptors(this.createJWTToken(token))
    }

    registerSuccessfulLoginForJwt1(token, accessChannel) {
        sessionStorage.setItem(SESSION_ATTRIBUTE_NAME_TOKEN, token)
        sessionStorage.setItem(SESSION_ATTRIBUTE_NAME_CHANNEL, accessChannel)
        this.setupAxiosInterceptors(this.createJWTToken(token))
    }

    registerSuccessfulLoginForJwt2(username) {
        sessionStorage.setItem(USER_NAME_SESSION_ATTRIBUTE_NAME, username)
    }

    createJWTToken(token) {
        return 'Bearer ' + token
    }

    logout() {
        sessionStorage.removeItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
    }

    isUserLoggedIn() {
        console.log('Is user new dp logged in ');
        let hostname = window.location.hostname;
        let user = sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME);
        if (hostname === 'dsp.csd.hksarg' && user === null) { //------for intranet
            this
            .executeJwtAuthenticationServiceForDP(hostname)
            .then((response) => {
                this.registerSuccessfulLoginForJwt(response.data.username, response.data.accessToken, CHANNEL_DP)
                console.log("Registered Success");
                
                if(sessionStorage.getItem('_target')){
                    window.location.assign(sessionStorage.getItem('_target'));
                    sessionStorage.removeItem('_target');
                }else{
                    window.location.assign('#/home');
                }
                return true;
            }).catch(() => {
                window.location.assign('#/');
                console.log("Registered fail");
                return false;
            })
        } else if (hostname === 'dsptest.csd.ccgo.hksarg' && user === null) { //------for intranet
            this
            .executeJwtAuthenticationServiceForDP(hostname)
            .then((response) => {
                this.registerSuccessfulLoginForJwt(response.data.username, response.data.accessToken, CHANNEL_DP)
                console.log("Registered Success");
                
                if(sessionStorage.getItem('_target')){
                    window.location.assign(sessionStorage.getItem('_target'));
                    sessionStorage.removeItem('_target');
                }else{
                    window.location.assign('#/home');
                }
                return true;
            }).catch(() => {
                window.location.assign('#/');
                console.log("Registered fail");
                return false;
            })
        }   
        
        
        else if (user === null) {     //------for remote access login
            return false;
        }else{
            return true;
        }
    }

    getLoggedInUserName() {
        let user = sessionStorage.getItem(USER_NAME_SESSION_ATTRIBUTE_NAME)
        if (user === null) return ''
        return user
    }

    setupAxiosInterceptors(token) {
        axios.interceptors.request.use(
            (config) => {
                if (this.isUserLoggedIn()) {
                    config.headers.authorization = token
                }
                return config
            }
        )
    }
}

export default new AuthenticationService()
