//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190515 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, message, Button, Table, Icon, Popconfirm } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';

export default class MyFavourites extends React.Component{
  state = { dataSource: [], selectedRowKeys: [], loading: false };

  componentDidMount(){
    this.setState(state=>({ loading: true }));
 

      let res = JSON.parse(sessionStorage.getItem('@downloadResource')) || [];
      console.log('download resource list = ',res);
      let downloadList = res.map(icate => {
        let cateObj = { id: icate.resourceId, nameEn: icate.resourceNamceEn, nameTc: icate.resourceNameTc };
        return cateObj;
    });
     console.log('After set list,', downloadList);

      this.setState(state=>({ dataSource: res, loading: false }));
      // console.log('After set list,', firstLevelCate);
  }

  onSelectChange=(selectedRowKeys)=>{
    this.setState(state=>({ selectedRowKeys }));
  }
  

  onDownload=()=>{
    this.setState(state=>({ loading: true }));
    let res = JSON.parse(sessionStorage.getItem('@downloadResource')) || [];
    console.log('download resource list = ',res);
    let downloadList = res.map(icate => {
      let cateObj = { id: icate.resourceId, nameEn: icate.resourceNamceEn, nameTc: icate.resourceNameTc };
      return cateObj;
  });
  
   // let askDownload_url = sessionStorage.getItem('serverPort')+`resource/download/${resourceId}`;
   console.log('After clicking download button,', downloadList.length);
    
   
    for (var i= 0; i<downloadList.length;i++){
   
              console.log('For each record',downloadList[i].id);
              let askDownload_url = sessionStorage.getItem('serverPort')+`resource/download/`+downloadList[i].id;
          
          this.handleDownload(askDownload_url,downloadList[i].nameEn,downloadList[i].id);
 
   }  
       sessionStorage.removeItem('@downloadResource');
        this.setState(state=>({ loading: false  }));
  }

  handleDownload=(askDownload_url2,nameEn,id)=>{
  
    this.setState({ downloading: true });
    const { resourceId, data } = this.state;
    let askDownload_url = askDownload_url2;

    let request = new XMLHttpRequest();
    request.open('get', askDownload_url, true);
    request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
    request.setRequestHeader('accesshost', window.location.hostname);
    request.responseType = 'blob';
    
    let thisComponent = this;
    var suggestedFilename = id+'_'+ nameEn;
    var fileFormat = '.pdf';
   
    suggestedFilename += fileFormat;

    request.onload = function () {
        if(request.status === 200){
            let dataBlob = request.response;
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFilename);
            }else if ('download' in document.createElement('a')){
                // for Non-IE (chrome, firefox etc.)
                var downloadElement = document.createElement('a');
                var href = URL.createObjectURL(dataBlob);
                downloadElement.href = href;
                downloadElement.style.display = 'none';
                downloadElement.download = suggestedFilename;
                document.body.appendChild(downloadElement);
                downloadElement.click();
            
                // cleanup
                setTimeout(()=>{
                    document.body.removeChild(downloadElement);
                    URL.revokeObjectURL(href);
                }, 8000);
            }else{
                message.error("Browser dose not support.");
            }
        }else{
            message.warning(`(${request.status}) `+intl.get('@RESOURCES_DETAILS.DOWNLOAD-FAILED'), 5);
        }
        setTimeout(()=>{thisComponent.setState({ downloading: false });}, 500)
    }
    
    request.send(null);
}


  onDelete=()=>{
    this.setState(state=>({ loading: true }));
    let delInfo = {
      refs:  this.state.selectedRowKeys
   }
   console.log('delete resource id ',delInfo);
   this.setState(state=>({ loading: false }));
  }

  render(){
    const { dataSource, loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const hasSelection = selectedRowKeys.length>0;
    const tableColumns = [
      {
        title: "ID",      //------Title
        key: 'resourceId',
        dataIndex: 'resourceId',
        width: '50px',
        render: (text,record) => <a href={`#/resourcedetails/?id=${record.id}`} >{text}</a>
      },
      {
        title: intl.get('@GENERAL.TITLE'),      //------Title
        key: 'resourceNamceEn',
        dataIndex: sessionStorage.getItem('lang')==='zh_TW'? 'resourceNameTc':'resourceNamceEn',
        width: '300px',
        render: (text,record) => <a href={`#/resourcedetails/?id=${record.resourceId}`} >{text}</a>
      }
    ];
    const spinProp = {    
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }
    const accessMode = getAccessMode();
    const paginprops = {
      size: accessMode===3?"small":"",
      pageSize: 10,
      defaultCurrent: 1,
      position: 'bottom',
      showTotal: (total, range) => accessMode===3?`Total ${total}`:`${range[0]}-${range[1]} of ${total} records`,
    }

    return(
      <div>
        <div className="my-download-header">
        <div className="container clearfix">
            <h2>{intl.get('@GENERAL.DOWNLOAD')}</h2>
        </div>
        </div>

        <div className="page-content" style={{ paddingTop: 0 }}>
        <div className="container page-my-inbox">
      
          <div class="my-favourites-list" style={{ marginTop: '16px' }}>
             <Popconfirm 
            title="All selected resources will be removed, continue?" 
            icon={<Icon type="question-circle-o" style={{ verticalAlign: '0em', color: 'red' }} />}
            onConfirm={this.onDelete}
            placement="right"
            >
             <Button type="danger" style={{ margin: '8px' }} disabled={!hasSelection}>
                  <Icon type="delete" style={{ verticalAlign: '0em' }} />
                  {intl.get('@GENERAL.DELETE')}
              </Button>
              <span style={{ marginLeft: 8 }}>{hasSelection? `Selected ${selectedRowKeys.length} items`:null}</span>
            </Popconfirm>

            <Popconfirm 
            title="All selected resources will be downloaded , continue?" 
            icon={<Icon type="question-circle-o" style={{ verticalAlign: '0em', color: 'blue' }} />}
            onConfirm={this.onDownload}
            placement="right"
            >
              <Button type="primary" style={{ margin: '8px' }} >
                  <Icon type="download" style={{ verticalAlign: '0em' }} />
                  {intl.get('@GENERAL.DOWNLOAD')}
              </Button>
              {/* <span style={{ marginLeft: 8 }}>{hasSelection? `Selected ${selectedRowKeys.length} items`:null}</span> */}
            </Popconfirm>

            <Table 
            style={{ padding: '8px 4px', msOverflowX: 'scroll', overflowX: 'scroll' }}
            dataSource={dataSource} 
            loading={spinProp}
            rowKey={record=>record.resourceId}
            columns={tableColumns}
            size="middle"
            pagination={paginprops}
            rowSelection={rowSelection}
            />
          </div>


        </div>
        </div>
        <BackTop />
      </div>
    )
  }
}