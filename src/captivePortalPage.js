import React from 'react';
import { Button } from 'antd';

import './loginPage.css';

const logo_url = process.env.PUBLIC_URL + '/images/logo.png';

export default class CaptivePortalPage extends React.Component {

  handleLang=()=>{
    var lang = window.navigator.language;
    if(lang.startsWith("zh")){
      return "訪問網站";
    }else{
      return "Visit KMS";
    }
  }

  render() {
    return (
      <div>
      <div className="login-input">
        <div style={{ maxWidth: '350px' }}>
          <img src={logo_url} style={{ width: '100%' }} alt="logo"/>
          <Button style={{ marginTop: '2em', width: '100%' }} type="primary" href="https://kms.csd.gov.hk/" >
            {this.handleLang()}
          </Button>
        </div>
      </div>
      </div>
      )
  }
}