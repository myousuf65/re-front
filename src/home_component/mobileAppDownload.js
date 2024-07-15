//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20201103 */


import React from 'react';
import { BackTop, Icon, Modal, Button, message } from 'antd';
import intl from 'react-intl-universal';
import { detect } from 'detect-browser';
import NoSleep from 'nosleep.js';
import axios from 'axios';

// import { isBetaUser } from '../service/common';
import { fetchData } from '../service/HelperService';

import './mobileAppDownload.css';

const browser = detect();
var noSleep = new NoSleep();

export default class MobileAppPage extends React.Component{

  state = { android_downloading: false, ios_downloading: false };

  onClickVideo = vType => {
    switch(vType){
      case "android":
        return "#/resourcedetails/?id=44245";
      case "ios":
        return "#/resourcedetails/?id=44246";
      default:
        // eslint-disable-next-line
        return "javascript:void(0)";
    }
  }

  handlePDFLang = deviceType => {
      switch(deviceType){
        case "android":
          return "#/resourcedetails/?id=44247";
        case "ios":
          return "#/resourcedetails/?id=44248";
        default:
          // eslint-disable-next-line
          return "javascript:void(0)";
      }
  }

  /// summary
  /// 1. user can download apk when the accessChannel is 1, 2, 3, or 4;
  /// 2. iOS user is not allowed to download apk and will receive failed msg;
  handleAndroidDwnld = () => {
    const osType = browser.os;
    if(osType === 'iOS'){
      let modalTitle = intl.get('@APP_DWN.FAILED-DWNLD');
      let modalContent = (
        <div>
          <p>{intl.get('@APP_DWN.NO-FOR-IOS')}</p>
        </div>
      );
      this.showNoticeModal(modalTitle, modalContent, intl.get('@GENERAL.BACK'));
      return;
    }

    /// download if applicable
    this.showDwnldModal(this.getApk);
  }

  startNoSleep=(mode)=>{
    if(mode){
      noSleep.enable();
    }else{
      noSleep.disable();
    }
  }


  showNoticeModalForPwPolicy=()=>{
    Modal.info({
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      icon: null ,
      content: (
        <div>
          <p><center><strong>Download completed</strong></center></p>
          <p>You will be logged off in less than a minute.</p>
        
        </div>
      ),
       okText: "Noted 明白"
    });
  }
  getApk=()=>{
    this.startNoSleep(true);
    this.setState({ android_downloading: true });

    let getapk_url = sessionStorage.getItem('serverPort')+'mobile/download/android/'+sessionStorage.getItem('@userInfo.id');
    let filename = "";

    axios.get(getapk_url, {
      responseType: 'blob',
      headers: {
        'accessToken': sessionStorage.getItem('accessToken'),
        'accesshost': window.location.hostname,
      }
    })
    .then(res => { 
      filename = res.headers["content-disposition"] || "";
      let index = filename.indexOf("attachment;filename=");
      if(index<0){
        filename = "csd_kms_app_ver.apk"
      }else{
        filename = filename.slice(index+20);
      }

      filename = filename||"csd_kms_app_ver.apk";
      return res.data;
    })
    .then(blob => {
      let bl = new Blob([blob], {type: "application/octet-stream"});

      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        // for IE
        window.navigator.msSaveOrOpenBlob(bl, filename);

      }else if ('download' in document.createElement('a')){
        // for Non-IE (chrome, firefox etc.)
        var downloadElement = document.createElement('a');
        var href = window.URL.createObjectURL(bl);
        downloadElement.href = href;
        downloadElement.style.display = 'none';
        downloadElement.download = filename;
        document.body.appendChild(downloadElement);
        downloadElement.click();
    
        // cleanup
        setTimeout(()=>{
          document.body.removeChild(downloadElement);
          URL.revokeObjectURL(href);
        }, 7200000);
      }

      this.setState({ android_downloading: false });
      this.startNoSleep(false);
      // message.success(intl.get('@APP_DWN.SUCCEED'), 5);
      this.showNoticeModalForPwPolicy();
      setTimeout(()=>{ this.handleLogout();},22000);
     
    }).catch( err => {
      this.setState({ android_downloading: false });
      this.startNoSleep(false);

      if(err.response.status!==401&&err.response.status!==440){
        message.error(intl.get('@APP_DWN.FAILED')+" ("+  err.response.status +")", 5)
      }else{
        if(err.response.status===401){
          sessionStorage.clear();
          window.location.assign('/');
        }else if(err.response.status===440){
          let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
          fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
        }
      }
    })
  }

  /// summary
  /// 1. only iOS user can download iOS version
  handleIOSDwnld = () => {
    const osType = browser.os;
    if(osType !== 'iOS' && osType !== 'Mac OS'){
      let modalTitle = intl.get('@APP_DWN.FAILED-DWNLD');
      let modalContent = (
        <div>
          <p>{intl.get('@APP_DWN.IOS-ONLY')}</p>
        </div>
      );
      this.showNoticeModal(modalTitle, modalContent, intl.get('@GENERAL.BACK'));  
      return;
    }

    /// download if applicable
    this.getPlist();
   
    // this.getPlistFromBackend();
  }

  getPlist=()=>{
    this.setState({ ios_downloading: true });
    var headers = {
      'accessToken': sessionStorage.getItem('accessToken'),
      'accesshost': window.location.hostname,
    }

    let getios_url = sessionStorage.getItem('serverPort')+'mobile/download/ios/'+sessionStorage.getItem('@userInfo.id');
    axios.post(getios_url, null, {
      headers: headers
    })
    .then( res => { 
      var downloadElement = document.createElement('a');
      var href = "itms-services://?action=download-manifest&url=https://kms.csd.gov.hk/mobile/7507d9bb7b858dc26a0925eac7f3b1c4/manifest.plist";
      downloadElement.href = href;
      downloadElement.style.display = 'none';
      document.body.appendChild(downloadElement);
      downloadElement.click();
  
      // cleanup & guide
      setTimeout(()=>{
        document.body.removeChild(downloadElement);
        this.showNoticeModal(intl.get('@APP_DWN.IOS-DWN-GUIDE-TITLE'), intl.get('@APP_DWN.IOS-DWN-GUIDE-CONTENT'), '')
        this.setState({ ios_downloading: false });
      }, 5000);
      this.showNoticeModalForPwPolicy();
      setTimeout(()=>{ this.handleLogout();},22000);
     
    })
    .catch( err => {
      this.setState({ ios_downloading: false });

      if(!err.repsonse){
        message.error(err.message, 5);
        return;
      }

      if(err.response.status!==401&&err.response.status!==440){
        message.error(intl.get('@APP_DWN.FAILED')+" ("+  err.response.status +")", 5)
      }else{
        if(err.response.status===401){
          sessionStorage.clear();
          window.location.assign('/');
        }else if(err.response.status===440){
          let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
          fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
        }
      }
    })
  }


  handleLogout=()=>{
    let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
    console.log('Mobile App Download, handle logout');
    
    fetchData(clearBackendSession_url, 'post', null, repsonse=>{
      sessionStorage.clear();
      window.location.replace("/");
    });
  }



  getPlistFromBackend=()=>{
    this.setState({ ios_downloading: true });
    var headers = {
      'accessToken': sessionStorage.getItem('accessToken'),
      'accesshost': window.location.hostname,
    }

    let getios_url = sessionStorage.getItem('serverPort')+'mobile/download/ios/'+sessionStorage.getItem('@userInfo.id');
    axios.post(getios_url, null, {
      headers: headers
    })
    .then( res => { 
      if(!res.data || !res.data.endsWith('.plist')){
        throw new Error("Error");
      }
      var downloadElement = document.createElement('a');
      var href = "itms-services://?action=download-manifest&url="+res.data;
      // var href = "itms-services://?action=download-manifest&url=https://kms.csd.gov.hk/mobile/7507d9bb7b858dc26a0925eac7f3b1c4/manifest.plist";
      downloadElement.href = href;
      downloadElement.style.display = 'none';
      document.body.appendChild(downloadElement);
      downloadElement.click();
  
      // cleanup & guide
      setTimeout(()=>{
        document.body.removeChild(downloadElement);
        this.showNoticeModal(intl.get('@APP_DWN.IOS-DWN-GUIDE-TITLE'), intl.get('@APP_DWN.IOS-DWN-GUIDE-CONTENT'), '')
        this.setState({ ios_downloading: false });
      }, 5000);
    })
    .catch( err => {
      this.setState({ ios_downloading: false });

      if(!err.repsonse){
        message.error(err.message, 5);
        return;
      }

      if(err.response.status!==401&&err.response.status!==440){
        message.error(intl.get('@APP_DWN.FAILED')+" ("+  err.response.status +")", 5)
      }else{
        if(err.response.status===401){
          sessionStorage.clear();
          window.location.assign('/');
        }else if(err.response.status===440){
          let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
          fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
        }
      }
    })
  }

  showDwnldModal=(onOk)=>{
    Modal.confirm({
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      title: intl.get('@APP_DWN.TIME-COST-TITLE'),
      content: intl.get('@APP_DWN.TIME-COST-CONTENT'),
      onOk: onOk,
      onCancel:()=>{},
      okText: intl.get('@GENERAL.CONTINUE'),
      cancelText: intl.get('@GENERAL.CANCEL')
    });
  }

  showNoticeModal=(title, content, okText)=>{
    Modal.warning({
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      //icon: null ,
      title: title,
      content: content,
      onOk(){},
      onCancel(){},
      okText: okText
    });
  }
  
  render(){
    const { android_downloading, ios_downloading } = this.state;

    return(
      <div>
        <div className="container app-dwn">
            <span style={{ display: 'block'}}>
              <h3 className="app-dwn-desc">
                <p>{intl.get('@APP_DWN.H3')}</p>
              </h3>
              <h1 className="app-dwn-desc">
                <p>{intl.get('@APP_DWN.H1')}</p>
              </h1>
            </span>
          <div className="row" style={{ padding:"16px 0" }}>
            <div className="col-sm-6 app-dwn-col">
              <div className="app-dwn-div">
                <Icon className="app-os-type" type="android" theme="filled" style={{ color: '#A4C639' }} />
              </div>
              <div><Button className="app-dwn-btn" loading={android_downloading} onClick={this.handleAndroidDwnld}>Android</Button></div>
              <div className="app-dwn-div-intro" >
                <span>{intl.get('@APP_DWN.GUIDE')}</span>
                {/* eslint-disable-next-line */}
                <p><a className="app-dwn-intro" href={this.handlePDFLang('android')}>{intl.get('@APP_DWN.DWN-PDF')}</a> / <a className="app-dwn-intro" href={this.onClickVideo("android")}>{intl.get('@APP_DWN.WATCH-VIDEO')}</a></p>
              </div>
            </div>
            <div className="col-sm-6 app-dwn-col">
              <div className="app-dwn-div"> 
                <Icon className="app-os-type" type="apple" theme="filled" style={{ color: '#A2AAAD' }} />
              </div>
              <div><Button className="app-dwn-btn" loading={ios_downloading} onClick={this.handleIOSDwnld}>iPhone/iPad</Button></div>
              <div className="app-dwn-div-intro" >
                <span>{intl.get('@APP_DWN.GUIDE')}</span>
                {/* eslint-disable-next-line */}
                <p><a className="app-dwn-intro" href={this.handlePDFLang('ios')}>{intl.get('@APP_DWN.DWN-PDF')}</a> / <a className="app-dwn-intro" href={this.onClickVideo("ios")}>{intl.get('@APP_DWN.WATCH-VIDEO')}</a></p>
              </div>
            </div>
          </div>
        </div>
        <BackTop />
      </div>
    )
  }
}

export class MobileIOSHandlePage extends React.Component{

}