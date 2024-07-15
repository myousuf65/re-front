//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Button, Descriptions, Table, Modal, Tooltip } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import ReportDetails from './reports_details.js';
import reqwest from 'reqwest';

import { fetchData } from '../service/HelperService';

export default class ReportSummaryRes extends React.Component{

  state = { 
    summaryTitle: null, 
    selTblProp: [], 
    loading: false, 
    titleTblData: [], 
    tblData: [], 
    visible: false, 
    selRecord: {}, 
    selRepType: null,
    startDate: null,
    endDate: null,
  };

  componentDidMount(){
    this.props.onRefChildRes(this);
  }

  handleCancel=(e)=>{
    this.setState({ visible: false });
  }

  preViewsRate=(users,hits)=>{
    if(users===0){
      return <Tooltip placement="bottom" title={0}>0</Tooltip>
    }else{
      let result_details=hits/users;
      let result_display=Math.round(result_details*10000)/10000;
      return <Tooltip placement="bottom" title={result_details}>{result_display}</Tooltip>;
    }
  }

// ------------prepare summary for resource
  preByResSummary=(startDate, endDate, paramResCate, paramSubCates, paramKM, paramKS, paramWG, paramResIds)=>{
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByRes_url = sessionStorage.getItem('serverPort')+'report/access/resource/'+sessionStorage.getItem('@userInfo.id');
    let byResParams = {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
    }

    if(paramResCate){
      byResParams.categoryId = paramResCate;
      byResParams.subcategory = paramSubCates;
      byResParams.resourceId = "";
  
      if(paramKM===1){
        byResParams.km = 1;
      }
      if(paramKS===1){
        byResParams.ks = 1;
      }
      if(paramWG===1){
        byResParams.wg = 1;
      }
    }else{
      byResParams.categoryId = null;
      byResParams.subcategory = 0;
      byResParams.resourceId = paramResIds || "";
    }

    this.fetchDataTime(getByRes_url,'post',byResParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_RES_SUM.CREATED'), dataIndex: 'createdAt', width: 100, align: 'left', render: (text)=>text? moment(text).format('YYYY-MM-DD H:mm:ss'):null },
            { key: 2, title: intl.get('@REPORTS_RES_SUM.MODIFIED'), dataIndex: 'modifiedAt', width: 100, align: 'left', render: (text)=>text? moment(text).format('YYYY-MM-DD H:mm:ss'):null },
            { key: 3, title: intl.get('@REPORTS_RES_SUM.DETAILS'), dataIndex: 'resourceId', width: '10%', align: 'left', render:(text,record)=> sessionStorage.getItem('lang')==='zh_TW'? record.titleTc+' ('+text+')' : record.titleEn+' ('+text+')' },
            { key: 4, title: intl.get('@REPORTS_RES_SUM.SHOW-ON-PAGE'), dataIndex: 'activated', width: 100, align: 'center', render:(text)=>text===1? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO') },
            { key: 5, title: intl.get('@REPORTS_RES_SUM.VIEWS'), dataIndex: 'hits', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickResource(e, 'Res_V', record)}>{text}</Button> },
            { key: 6, title: intl.get('@REPORTS_RES_SUM.USERS'), dataIndex: 'availableUsers', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickResource(e, 'Res_U', record)}>{text || 0}</Button> },
            { key: 7, title: intl.get('@REPORTS_RES_SUM.V-U'), dataIndex: 'availableUsers', width: 100, align: 'center', render:(text, record)=>text? this.preViewsRate(text,record.hits):this.preViewsRate(0,0) },
            { key: 8, title: intl.get('@REPORTS_RES_SUM.SHARES'), dataIndex: 'shared', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickResource(e, 'Res_S', record)}>{text}</Button> },
            { key: 9, title: intl.get('@REPORTS_RES_SUM.DOWNLOADS'), dataIndex: 'download', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickResource(e, 'Res_D', record)}>{text}</Button> },
          ]
  
          // 3. nominate title table column
          
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState(state=>({ loading: false, dataSource: res.data, summaryTitle: 'Resources', selTblProp, titleTblData }));
        }else{
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

  fetchDataTime (url, method, data, callback) {
    reqwest({
      url: url,
      method: method,
      contentType: "application/json;charset=UTF-8",
      headers: {
        'accessToken': sessionStorage.getItem('accessToken'),
        'accesshost': window.location.hostname,
      },
      processData: false,
      timeout: 300000,
      mode: 'cors',
      data: JSON.stringify(data),
      success: (res) => {
        callback( { ifSuccess: true, result: res } );
      },
      error: (err) => {
        if(err.status!==401&&err.status!==440){
          callback({ ifSuccess: false, result: err });
        }else{
          if(url===`${sessionStorage.getItem('serverPort')}auth/twofactorauth`){
            callback({ ifSuccess: false, result: err });
          }else if(url===`${sessionStorage.getItem('serverPort')}auth/logout`){
  
          }else if(err.status===401){
            sessionStorage.clear();
            window.location.assign('/');
          }else if(err.status===440){
            let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
            fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
            window.location.assign('#/failout');
          }
        }
      },
    })
  };

  onClickResource=(e, type, record)=>{
    this.setState(state=>({ selRepType: type, selRecord: record }))
    this.setState({ visible: true });
  }
// ------------end of preparing summary for resource

  render(){
    const { summaryTitle, selTblProp, titleTblData, loading, visible, selRecord, selRepType, dataSource, startDate, endDate } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }

    const resSumTableProp = {
      scroll:{x: '120%', y: '800px'},
      defaultExpandAllRows: true,
      expandedRowRender: (record, index, indent, expanded)=>
      <Descriptions key="descExpand" size="small" bordered column={1}>
        <Descriptions.Item key={1} label={intl.get('@REPORTS_RES_SUM.RES-CATES')}><span>{sessionStorage.getItem('lang')==='zh_TW'? record.categoryTc.map(item=><li>{item}</li>):record.category.map(item=><li>{item}</li>)}</span></Descriptions.Item>
        <Descriptions.Item key={2} label={intl.get('@REPORTS_RES_SUM.CREATED-BY')}>{record.createdBy.fullname || 'Unknown'} [ {record.createdBy.institution || 'Institution'}, {record.createdBy.section || 'Section'}, {record.createdBy.rank || 'Rank'} ]</Descriptions.Item>
        <Descriptions.Item key={3} label={intl.get('@REPORTS_RES_SUM.MODIFIED-BY')}>{record.modifiedBy.fullname || 'Unknown'} [ {record.modifiedBy.institution || 'Institution'}, {record.modifiedBy.section || 'Section'}, {record.modifiedBy.rank || 'Rank'} ]</Descriptions.Item>
      </Descriptions>,
    };

    return(
      <div>
        <h1 style={{ margin: 0 }}><b>{summaryTitle? ("Summary: "+ summaryTitle): null } </b></h1>
        {/* <Descriptions style={{ width: '50%' }} size="small" bordered column={1} >{titleTblData.map(item=>(<Item label={item.description}>{item.param}</Item>))}</Descriptions>
        <Divider dashed /> */}
        <Table
        style={{ paddingTop: '16px', msOverflowX: 'scroll', overflowX: 'scroll' }}
        title={()=><Descriptions key="titleDesc" style={{ width: '50%' }} size="small" bordered column={1} >{titleTblData.map(item=>(<Item key={item.id} label={item.description}>{item.param}</Item>))}</Descriptions>}
        loading={spinProp}
        // bordered
        locale={{emptyText: intl.get('@GENERAL.NO-RECORD-IS-FOUND')}}
        rowKey={(record,index)=>index}
        // rowClassName={record=>(record===this.state.selRecord&&showInfoForm? "res-row-selected":"res-row")}
        pagination={false}
        columns={selTblProp}
        dataSource={dataSource}
        {...resSumTableProp}
        />

        <Modal
        title="Preview"
        bodyStyle={{ height: '90%' }}
        destroyOnClose
        centered
        width='80%'
        visible={visible}
        maskClosable={false}
        onCancel={this.handleCancel}
        footer={null}
        >
          <ReportDetails selRecord={selRecord} selRepType={selRepType} startDate={startDate} endDate={endDate} />
        </Modal>
      </div>

    )
  }
}