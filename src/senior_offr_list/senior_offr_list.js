//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200907 */
//Comments //***s=]*** 

import React from 'react';
import { Layout, Tabs, message, Button, Spin } from 'antd';
import { detect } from 'detect-browser';
import moment from 'moment';
import intl from 'react-intl-universal';

import 'react-pdf/dist/Page/AnnotationLayer.css';

import PDFReader from './pdf_reader.js';
import { fetchData } from '../service/HelperService.js';

const browser = detect();
const blockOS_arr = ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile'];

export default class SeniorOffrList extends React.Component{

  state={ defaultActiveKey: "1", dataDiscip: [], dataCivil: [], loading: true }

  // componentWillMount(){
  //   if(window.location.hostname!=='dsp.csd.hksarg'){
  //     window.location.assign('#/home');
  //   }
  // }

  render(){
    const { Content } = Layout;
    const { TabPane } = Tabs;
    const { defaultActiveKey } = this.state;

    return(
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@OFFICER_LIST.TOP-TITILE')}
            </div>
          </h1>

          <div className="cms-white-box">

            <Tabs type="card" defaultActiveKey={defaultActiveKey} >

              <TabPane key={1} tab={intl.get('@OFFICER_LIST.DISCIPLINED')}>
                <OffrList id="1" type="1" />
              </TabPane>

              <TabPane key={2} tab={intl.get('@OFFICER_LIST.CIVILIAN')}>
                <OffrList id="2" type="2" />
              </TabPane>
              
            </Tabs>
          </div>
        </Content>
      </div>
    )
  }
};

class OffrList extends React.Component{
  state={
    loading: true,
    disabledBtn: true,
    type: null,
    downloading: false
  }

  componentWillReceiveProps(nextProps){
    console.log('this: ', this.props.type, ' \nnext: ', nextProps.type);
    
    if(nextProps.type!==this.props.type){
      this.setState({ type: nextProps.type }, ()=>this.handleListType(nextProps.type));
    }
  }

  componentDidMount(){
    this.setState({ type: this.props.type }, ()=>this.handleListType(this.state.type));
  }

  handleListType=(type)=>{

    this.setState({ loading: true });

    if(type!=='1'&&type!=='2'){
      this.setState({ loading: false });
      return;
    };
    
    let getOffrList_url = `${sessionStorage.getItem('serverPort')}offrlist/${sessionStorage.getItem('@userInfo.id')}/${type}`;
    let dataSource = null;

    fetchData(getOffrList_url, 'get', null, response=>{
      
      if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            dataSource = sessionStorage.getItem('serverPort')+res.data;
          } else {
            message.error(`Sorry, your request was rejected by Server. (${res.status})`);
          };
      }else{
        message.error(`Sorry, your request was rejected by Server. (${response.result.status})`);
      }

      this.setState({ dataSource, loading: false });
    })
  }

  handleDownload=()=>{
    if(this.state.type!=='1'&&this.state.type!=='2'){
      return;
    };
    let askDownload_url = sessionStorage.getItem('serverPort')+`offrlist/download/${sessionStorage.getItem('@userInfo.id')}/${this.state.type}`;
    
    this.setState(state=>({ downloading: true }));
    let request = new XMLHttpRequest();
    request.open('get', askDownload_url, true);
    request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
    request.setRequestHeader('accesshost', window.location.hostname);

    request.onloadstart = function () {
      request.responseType = 'blob';
    }
    
    let thisComponent = this;
    var suggestedFileName = `senior officer list (${this.state.type==='1'? 'disciplined':'civilian'})_${moment().format("YYYYMMDD")}.pdf`

    request.onload = function () {
        if(request.status ===200){
            let dataBlob = request.response;
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFileName);
            } else if (blockOS_arr.includes(browser.os)) {
                message.warning(`Sorry, ${browser.os} doesn't allowed to download.`, 3);
            }else {
                // for Non-IE (chrome, firefox etc.)
                var downloadElement = document.createElement('a');
                var href = URL.createObjectURL(dataBlob);
                downloadElement.href = href;
                downloadElement.style.display = 'none';
                downloadElement.download = suggestedFileName;
                document.body.appendChild(downloadElement);
                downloadElement.click();
            
                // cleanup
                document.body.removeChild(downloadElement);
                URL.revokeObjectURL(href);
            } 
        }else{
            message.error(`Sorry, current is unavailable for download (${request.status})`, 3);
        }
        setTimeout(()=>{thisComponent.setState({ downloading: false });}, 500)
    }
    
    request.send(null);
  }

  handleLoad=(ifLoad)=>{
    this.setState({ disabledBtn: !ifLoad });
  }

  render(){
    const { loading, downloading, dataSource, disabledBtn } = this.state;
    return (
      <div>
        <Spin spinning={loading}>
        <Button disabled={disabledBtn} hidden={blockOS_arr.includes(browser.os)} loading={downloading} onClick={this.handleDownload} className="btn-download">
          {intl.get('@GENERAL.DOWNLOAD')}
        </Button>
        <PDFReader pdfUrl={dataSource} handleLoad={this.handleLoad} />
        </Spin>
      </div>
    )
  }

}