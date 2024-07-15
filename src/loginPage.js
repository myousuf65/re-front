import React from 'react';

import { Input, Button, message, Icon, Modal } from 'antd';
import { withRouter } from "react-router-dom";
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import AuthenticationService from './service/AuthenticationService';
import { fetchData } from './service/HelperService';
import './loginPage.css';

const sysMsg = [
  {id: 0, type: 'login-info-1', descEn: 'If you are NOT authorised to use the system, please close the browser immediately.', descTc: '如你未獲授權使用本系統，請即關閉瀏覽器。'},
  {id: 1, type: 'login-info-2', descEn: 'For technical support, please call the KM Team, at 2899 1835.', descTc: '如需技術支援，請聯絡知識管理團隊 (電話: 2899 1835)。'},
  {id: 2, type: 'login-err', descEn: 'Invalid username or password, please enter again', descTc: '無效的使用者名稱或密碼，請重新輸入您的使用者資訊'},
  {id: 3, type: 'authen-info-1', descEn: 'Please provide your personal information as required below for further verification of your identity:', descTc: '請提供以下資料，方便系統進一步核對身份:'},
  {id: 4, type: 'authen-info-2', descEn: 'Your account will be suspended after THREE unsuccessful logon attempts.', descTc: '經過三次嘗試仍未能登入，你的戶口會暫停。'},
  {id: 5, type: 'err-409', descEn: 'Login rejected: This account is in used.', descTc: '無法登陸：該帳號正在使用中。'},
  {id: 6, type: 'err-423', descEn: 'This account is suspended. To re-active, please call the KM Team, at 2899 1835.', descTc: '該帳號已被暫停, 申請恢復請聯絡知識管理團隊 (電話: 2899 1835)。'},
]

class LoginPage extends React.Component {
  state={ 
    stepOnePass: false,
    inputUsername: null, 
    inputPassword: null, 
    loginMsg: null,
    loading: false,
    stepTwoPass: false,
    authenQs: {},
    authenTries: 0,
    authenInput: null,
    authenMsg: null,
    verifying: false
  };

  componentWillMount(){
    sessionStorage.removeItem("accessToken");
  }

  componentDidMount(){
    this.showNoticeModalForPwPolicy();
  }

  // Attention for password policy
  showNoticeModalForPwPolicy=()=>{
    Modal.info({
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      icon: null ,
      content: (
        <div>
          <p><center><strong>ATTENTION</strong></center></p>
          <p>NEW Departmental Portal (DP) password policy was enforced.  Please visit CSD Remote Access System at <a style={{color:'#007bff'}} href="https://access.csd.gov.hk">https://access.csd.gov.hk</a> to change your DP password every 90 days and use the new password to login KMS.</p>
          <p><center><strong>注意</strong></center></p>
          <p>部門網站已實施新的密碼政策。請每隔90天到訪懲教署遠方存取系統 <a style={{color:'#007bff'}} href="https://access.csd.gov.hk">https://access.csd.gov.hk</a> 更改部門網站密碼，並使用新密碼登入知識管理系統。</p>
        </div>
      ),
      okText: "Noted 明白"
    });
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

  handleLogin=()=>{
    if(this.state.inputUsername===null || this.state.inputUsername===""){
      this.setState({ loginMsg: "Please provide your username. \n請輸入帳號" })
    }else if(this.state.inputPassword===null || this.state.inputPassword===""){
      this.setState({ loginMsg: "Please provide the password. \n請輸入密碼" })
    }else{
      this.setState(state=>({ loading: true, loginMsg: null }));

      // -------Commented ONLY for local testing
      // let devAccessCode = "EC489CA9D2BBF7BF9592DDBD9A6625E4E71CD622AAD1BCF5E18F221DD6764F2AAA8BD7AB7368B8E04937009E6D5548AEFA648D353B733354F42F27A2ADAB2E67";
      // ------ updated at 20200330
      console.log(this.state.inputUsername, this.state.inputPassword)
      let devAccessCode = "372962F6872B085A1BD7D166F8254350E2D422E7BED55627C8DAB0476D196D29534DCB5E59C4E2870A23635BE0C338BBD8B93823D77CDE301C0E5B4587274483";
      AuthenticationService
        .executeJwtAuthenticationService(this.state.inputUsername, this.state.inputPassword, 3, devAccessCode)
        .then((response) => {
          console.log("respinse", response)
          AuthenticationService.registerSuccessfulLoginForJwt1(response.data.accessToken, response.data.accessChannel)
          console.log(response.data.accessToken, response.data.accessChannel)
          console.log("Step One: completed.");
          this.getAuthenInfo();
        }).catch((err) => {
          console.log("Step One: failed.");
          if(err.response.status===423){
            this.setState(state=>({ loading: false, stepOnePass: false, loginMsg: `${sysMsg[6].descEn} \n${sysMsg[6].descTc}` }));
          }else if(err.response.status===404 || err.response.status===502){
            this.setState(state=>({ loading: false, stepOnePass: false, loginMsg: `Failed to connect: server maintenance. \n無法連結: 服務器或在維護中` }));
          }else{
            this.setState(state=>({ loading: false, stepOnePass: false, loginMsg: `${sysMsg[2].descEn} \n${sysMsg[2].descTc}` }));
          }
        })
      // -------End of Commented area
    }
  }

  getAuthenInfo=()=>{
    let getAuthenInfo_url = sessionStorage.getItem('serverPort')+'auth/randomquestion';
    fetchData(getAuthenInfo_url, 'post', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res !== undefined){
          this.setState({ loading: false, stepOnePass: true, authenQs: res });
        }else{
          this.setState({ loading: false, stepOnePass: false, authenQs: {}, loginMsg: "No authentication file available. \n無法獲取身份認證信息" });
        }
      }else{
        message.error('Failed: API - auth/randomquestion')
        this.setState(state=>({ loading: false, stepOnePass: false, loginMsg: "Failed to connect to server. \n無法連結服務器" }));
      }
    })
  }

  handleRedirect=()=>{
    if(sessionStorage.getItem('_target')){
      window.location.assign(sessionStorage.getItem('_target'));
      sessionStorage.removeItem('_target');
    }else{
      this.props.history.push('/home');
    }
  }

  // Important Notice for access type 3
  showNoticeModal=()=>{
    Modal.info({
      // title: 'Important Notice',
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      icon: null ,
      content: (
        <div>
          <p><center>Important Note</center></p>
          <p>Files stored in Knowledge Management System (KMS) are official documents. Any unauthorized use, retention, disclosure, copying, printing, forwarding or dissemination of documents in KMS is strictly prohibited and may lead to civil or criminal liabilities. If you are not the staff of the Correctional Services Department, you are required to promptly restore these official documents to the Correctional Services Department Headquarters and destroy any copies of these documents. Please notify the Correctional Services Department Headquarters immediately if you have received these official documents in error. </p>
          <p><center>重要事項</center></p>
          <p>「知識管理系統」內存放的檔案文件乃官方文件，任何人士不得未經授權使用、保留、披露、複製、列印、轉發或發放「知識管理系統」內的官方文件，否則可能會負上民事或刑事責任。如果你不是懲教署職員，你必須迅速將這些官方文件歸還懲教署總部，並銷毀這些官方文件的任何副本。如因錯誤致令你收到這些官方文件，請立即通知懲教署總部。 </p>
        </div>
      ),
      onOk: this.handleRedirect,
      onCancel: this.handleRedirect,
      okText: "Noted 明白"
    });
  }


  handleAuthen=()=>{
    if(this.state.authenInput===null || this.state.authenInput===""){
      this.setState({ authenMsg: "Please input answer. \n請輸入答案" })
    }else{
      this.setState(state=>({ verifying: true, authenMsg: null }));

      // -------Commented ONLY for local testing
        let check2FactorAuth_url = sessionStorage.getItem('serverPort')+'auth/twofactorauth'
        let authAnswer = {
          qID: this.state.authenQs.qID,
          answer: this.state.authenInput
        }
        fetchData(check2FactorAuth_url, 'post', authAnswer, response=>{
          let res = response.result;
          if(response.ifSuccess){
            // let res = response.result;
            if(res.accessToken){
              sessionStorage.setItem('accessToken', res.accessToken);
              AuthenticationService.registerSuccessfulLoginForJwt2(this.state.inputUsername);
              this.setState(state=>({ 
                verifying: false, 
                stepTwoPass: true, 
                authenMsg: null
              }));

              this.showNoticeModal();
            }else{
              this.setState(state=>({ 
                verifying: false, 
                stepTwoPass: false, 
                authenTries: this.checkNumber(res.count)||state.authenTries+1,
                authenMsg: this.handleFailed(this.checkNumber(res.count)||state.authenTries+1)
              }));
            }
          }else{
            console.log("Step Two: failed.");

            if(res.status===409){
              this.setState({ authenMsg: `${sysMsg[5].descEn} \n${sysMsg[5].descTc}` });
              setTimeout(()=>{this.setState({ 
                stepOnePass: false,
                // inputUsername: null, 
                inputPassword: null, 
                loginMsg: null,
                loading: false,
                stepTwoPass: false,
                authenQs: {},
                authenTries: 0,
                authenInput: null,
                authenMsg: null,
                verifying: false
               });
               sessionStorage.removeItem("accessToken");
              },10000)
            }else if(res.status===423){
              this.setState(state=>({ 
                verifying: false, 
                stepTwoPass: false, 
                authenTries: 3,
                authenMsg: this.handleFailed(3)
              }));
            // }else if(response.result.status===401){
            //   //------ Expired JWT token: sever session timeout during step two
            //   let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
            //   fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
            //   window.location.assign('#/failout');
            }else {
              var authenTries = this.state.authenTries+1;
              if(res.response){
                authenTries = this.checkNumber(res.response.count)||this.state.authenTries+1;
              }
              this.setState(state=>({ 
                verifying: false, 
                stepTwoPass: false, 
                authenTries: authenTries,
                authenMsg: this.handleFailed(authenTries)
              }));
            }
          }
        })
      // -------End of Commented area
    }
  }

  checkNumber=(value)=>{
    const number = parseInt(value || 0, 10);
    if (!isNaN(number) && number > 1) {
      return number;
    }else{
      return 0;
    }
  }

  handleFailed=(authenTries)=>{
    if(authenTries>2){
      return `${sysMsg[6].descEn} \n${sysMsg[6].descTc}`
    }else if(authenTries>0){
      return `Incorrect answer, you can still attempt for ${3-authenTries} times. \n答案錯誤，你僅剩${3-authenTries}次遞交機會。`
    }else{
      return null
    }
  }

  onChange=(evt, type)=>{
    if(type==='name'){
      this.setState({ inputUsername: evt.target.value });
    }else if(type==='pw'){
      this.setState({ inputPassword: evt.target.value });
    }else if(type==='answer'){
      this.setState({ authenInput: evt.target.value });
    }
  }

  render(){
    const { loginMsg, authenQs, inputUsername, inputPassword, authenInput } = this.state;
    return(
      <div>
        {/* step one: login */}
        <div hidden={this.state.stepOnePass}>
          <div className="login-input">
            <div style={{ maxWidth: '350px' }}>
              <LazyLoadImage effect='black-and-white' style={{ marginBottom: '1.5em', width: '100%' }} src={this.prepareLogo()} alt="logo" />
              <Input
              style={{ marginTop: '8px' }}
              placeholder="Username 用戶" 
              value={inputUsername}
              allowClear
              onChange={(evt)=>this.onChange(evt,'name')}
              onPressEnter={this.handleLogin}
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }}/>}
              />
              <Input
              style={{ marginTop: '8px' }}
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password" 
              placeholder="Password 密碼"
              value={inputPassword}
              allowClear
              onChange={(evt)=>this.onChange(evt,'pw')}
              onPressEnter={this.handleLogin}
              />
              <Button style={{ marginTop: '8px', width: '100%' }} type="primary" onClick={this.handleLogin} loading={this.state.loading}>
                Logon 登入
              </Button>
              <span className="alert alert-warning" style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{ loginMsg }</span>
              <div style={{ paddingTop: '2em', fontSize: '0.95em' }}>
                <ul>
                  <li> {sysMsg[0].descEn} </li>
                  <li> {sysMsg[0].descTc} </li>
                  <br />
                  <li> {sysMsg[1].descEn} </li>
                  <li> {sysMsg[1].descTc} </li>
                </ul>
              </div>
            </div>

          </div>
        </div>

        {/* step two: Authenticator */}
        <div hidden={!this.state.stepOnePass}>
          <div className="login-notice">
            <div align="center"><b><font size="+2">Re-Authentication 再次確認身份</font></b></div>
            <div align="center"><b>(Please scroll down to read the notice and continue. 請向下拉曳本頁以細閱告示及繼續)</b></div>
            
            <table width="98%" align="center" border="1" bordercolordark="#000000" bordercolorlight="#BBBBBB" bgcolor="#EEEEBB">
              <tbody><tr>	
                <td>
                <br />
                <p align="center"><font size="+1"><u><strong>Important Notice</strong></u></font></p>
                <p><span className="cssSmall"><font color="#0000FF"><strong>Please make sure that you have read and understood this notice before proceeding with the login process.</strong></font></span></p>
                <p>
                <span className="cssSmall">
                This portal enables you to gain access to information of Knowledge Management System. You are reminded to use the system carefully to avoid leakage of information. Particular attention should be paid to the following -
                </span></p>
                <span className="cssSmall">
                  <ul style={{listStyleType:'disc', listStyle:'inside', padding: '0 2em'}}>
                    <li>            
                    you should not access this system through any shared computers available in public places such as cyber café;
                    </li><li>            
                    you should not leave the computer unattended while using this system;
                    </li><li>            
                    you should logout the system immediately after use;
                    </li><li>            
                    you should not copy any personal data to the local hard disk or other media through any means;
                    </li><li>            
                    please call the KM Team at 2899 1835 for any technical problems or doubts;
                    </li><li>            
                    please refer to the ‘IT Security Info’ corner in CSD Portal for more IT &amp; Information Security Guidelines.
                  </li></ul>
                </span>
                
                <p align="center"><font size="+1"><u><strong>重要告示</strong></u></font></p>
                <p><span className="cssSmall"><font color="#0000FF"><strong>在繼續登入程序前，請確保你已細閱並明白此告示。</strong></font></span></p>
                <p><span className="cssSmall">此網站容許你存取知識管理系統資料。我們在此提醒你要小心使用系統，以防止洩漏資料，請特別注意以下事項－</span></p>
                <span className="cssSmall">
                <ul style={{listStyleType:'disc', listStyle:'inside', padding: '0 2em'}}>
                  <li>            
                  你不應利用公眾地方（例如網吧）的共用電腦存取這個系統的資料；
                  </li><li>            
                  你不應在存取上述系統的資料期間離開使用中的電腦；
                  </li><li>            
                  使用完上述系統後應立即登出；
                  </li><li>            
                  你不應把任何個人資料複製到使用中電腦的硬碟或以任何方法下載至其他媒體；
                  </li><li>            
                  如有任何技術上的問題或疑難，請聯絡我們的技術支援熱線（電話﹕2899 1835）；
                  </li><li>            
                  你可到內聯網的「IT Security Info」專區尋閱更多有關資訊科技及資料保安的指引。 
                </li></ul>
                </span>
                </td>
              </tr></tbody>
            </table>
          </div>

          <div style={{ padding: '1em' }}>
          <LazyLoadImage effect='black-and-white' style={{ marginBottom: '1.5em', width: '100%' }} src={this.prepareLogo()} alt="logo" />
          <div style={{ fontSize: '0.9em', paddingBottom: '1em' }}>
              <div>{sysMsg[3].descEn}</div>
              <div>{sysMsg[3].descTc}</div>
            </div>
            <b>{authenQs.questionEN+' '+authenQs.questionTC+':  '}</b>
            {/* <Input 
            style={{ margin: '8px 8px 0 0',  maxWidth: '150px' }}
            placeholder="Answer 答案" 
            allowClear
            value={authenInput}
            onChange={(evt)=>this.onChange(evt,'answer')}
            onPressEnter={this.handleAuthen}
            prefix={<Icon type="security-scan" style={{ color: 'rgba(0,0,0,.25)' }} />}
            /> */}
            <Input.Password
            style={{ margin: '8px 8px 0 0',  maxWidth: '150px' }}
            visibilityToggle
            placeholder="Answer 答案" 
            allowClear
            value={authenInput}
            onChange={(evt)=>this.onChange(evt,'answer')}
            onPressEnter={this.handleAuthen}
            prefix={<Icon type="security-scan" style={{ color: 'rgba(0,0,0,.25)' }} />}
            />
            <Button style={{ marginTop: '8px', maxWidth: '350px' }} type="primary" disabled={this.state.authenTries>2} onClick={this.handleAuthen} loading={this.state.verifying}>
              Submit 遞交
            </Button>
            <div className="alert alert-warning" style={{ color: 'red', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                {this.state.authenMsg}
            </div>
            <div style={{ paddingTop: '2em', fontSize: '0.9em' }}>
              <ul>
                <li> Your account will be suspended after <span style={{color: 'red'}}><strong>THREE</strong></span> unsuccessful logon attempts. </li>
                <li> 經過<span style={{color: 'red'}}><strong>三</strong></span>次嘗試仍未能登入，你的戶口會暫停。 </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default withRouter(LoginPage);
