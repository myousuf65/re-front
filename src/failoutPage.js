import React from 'react';
import { Button } from 'antd';
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import './loginPage.css';

export default class FailoutPage extends React.Component {

  componentWillMount(){
    sessionStorage.clear();
  }

  prepareLogo=()=>{
    if(sessionStorage.getItem('photo')===null){
      var link =window.location;
      if (link.type){
        // eslint-disable-next-line
        if (link.type == "DanaLocation"){
          sessionStorage.setItem('serverPort',',DanaInfo=.adqBfwiFos1k2s,SSL+api/');
          sessionStorage.setItem('photo',',DanaInfo=.adqBfwiFos1k2s,SSL+images/');
        }
      }else{
        let url = link.origin+link.pathname+'api/';
          let photo =link.origin+link.pathname+'images/';
          sessionStorage.setItem('serverPort', url);
          sessionStorage.setItem('photo',photo);
      }
    }
    var logoPath = sessionStorage.getItem('photo') + 'logo.png';
    return logoPath
    
  }

  render() {
    const securityMsg = 'Your session has ended. For increased security, please close your browser.\n 您已結束遠方存取。出於安全隱患考慮，請即刻關閉您的瀏覽器。'
    return (
      <div>
      <div className="login-input">
        <div style={{ maxWidth: '350px' }}>
          <LazyLoadImage effect='black-and-white' style={{ marginBottom: '1.5em', width: '100%' }} src={this.prepareLogo()} alt="logo" />
          
          <span className="alert alert-warning" style={{ color: 'red', whiteSpace: 'pre-wrap' }}> 
          {securityMsg}
          </span>
          
          <Button style={{ marginTop: '2em', width: '100%' }} type="primary" onClick={()=>{window.location.assign('/')}}>
            Re-Logon 重新登入
          </Button>
        </div>

      </div>
      </div>
      )
  }
}