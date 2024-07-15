//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Button, Descriptions, Table, Modal, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import ReportDetails from './reports_details.js';

import { fetchData } from '../service/HelperService';
import { ExportReport } from '../component/ExportCSV.js';

export default class ReportSummaryInst extends React.Component{

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
    paramInst: null,
    exporting: false,
    userGroupInfo: {},
  };

  componentWillReceiveProps(nextProps){
    if(nextProps.userGroupInfo && this.state.userGroupInfo !== nextProps.userGroupInfo){
      this.setState(state=>({ 
        userGroupInfo: nextProps.userGroupInfo
      }));
    }
  }

  componentDidMount(){
    this.props.onRefChildInst(this);
  }

  handleCancel=(e)=>{
    this.setState({ visible: false });
  }

// ------------prepare summary by institution
  preByInstSummary=(startDate, endDate, paramInst)=>{
    
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/inst/'+sessionStorage.getItem('@userInfo.id');
    let instParam = {
      instId: paramInst.key,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    };

    fetchData(getByInst_url, 'post', instParam, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
            // 2. nominate table column
            let selTblProp = [
              { key: 1, title: intl.get('@REPORTS_INST_SUM.INST'), dataIndex: 'institution', width: 100, align: 'left' },
              { key: 2, title: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), dataIndex: 'intranet_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'I_IL', record)}>{text}</Button> },
              { key: 3, title: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), dataIndex: 'internet_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'I_RL', record)}>{text}</Button> },
              { key: 4, title: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), dataIndex: 'total_count', width: 100, align: 'center'},
              { key: 5, title: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), dataIndex: 'hit_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'I_PH', record)}>{text}</Button> },
            ];
  
            // 3. nominate title table column
            let titleTblData = [
              { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD')  },
              { id: 2, description: 'By Institution(s):', param: paramInst.label },
              { id: 3, description: 'Total Results:', param: res.data.length },
            ];
  
            this.setState(state=>({ loading: false, dataSource: res.data, summaryTitle: 'By Institution(s)', selTblProp, titleTblData, paramInst }));
  
        } else {
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

  onClickInst=(e, type, record)=>{
    this.setState(state=>({ selRepType: type, selRecord: record }))
    this.setState({ visible: true });
  }

  handleExport=(exportData)=>{
    const { titleTblData } = this.state;
    
    if(!titleTblData||!exportData){ console.log('---quit---'); this.setState({ exporting:false }, message.error("Failed to export due to invalid outputs.")); return };

    let filename = `${moment().format('YYYYMMDD')}_KMS_REPORT_BY_INST`;

    var key_arr = Object.keys(exportData);

    var summaryData = [
      { item: titleTblData[0].description, description: titleTblData[0].param },
      { item: titleTblData[1].description, description: titleTblData[1].param }
    ]

    key_arr.forEach(x=>{
      let iR = {
        item: x,
        description: x === 'page hit'? exportData[x].reduce((a, b) => a + (b["hits"]||0), 0):exportData[x].length
      };
      
      summaryData.push(iR);
    })

    setTimeout(()=>this.setState({ exporting: false }), 1000);
    ExportReport(summaryData||titleTblData, exportData, filename);
  }

  showNoticeModal=(title, content)=>{
    Modal.warning({
      centered: true,
      bodyStyle: { maxWidth: '75%' },
      //icon: null ,
      title: title,
      content: content,
      onOk(){},
      onCancel(){},
      okText: intl.get('@GENERAL.BACK')
    });
  }

  getExportList=()=>{
    const { paramInst, startDate, endDate } = this.state;

    let reportDuration = moment(endDate).diff(moment(startDate), "days");

    if(reportDuration > 7){
      let modalTitle= "Cancelled Export: ";
      let modalContent = (
        <div>
          <p>System only provide no more than 1-week data for exporting.</p>
        </div>
      )
      this.showNoticeModal(modalTitle,modalContent);
      return
    }

    message.info("It may take more than 1 min for report preparation, please wait patiently until download starts.");

    this.setState({ exporting: true });
    let getExportList_url = sessionStorage.getItem('serverPort')+'report/download/inst/'+sessionStorage.getItem('@userInfo.id');
    
    let instParam = {
      instId: paramInst.key,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    };
    fetchData(getExportList_url, 'post', instParam, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          message.success("Excel Data is ready");

          var exportObj = { 'Invalid Data': [] };
          if(Array.isArray(res.data)){
            let resData = res.data;
            resData.forEach(x=>{
              if(x.createdAt){
                x.createdAt = moment(x.createdAt).format('YYYY-MM-DD HH:mm:ss');
              }
            })

            let ws1 = intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS');
            let ws2 = intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS');
            let ws3 = intl.get('@REPORTS_INST_SUM.PAGE-HITS');

            exportObj = {};
            exportObj[ws1] = resData;
            exportObj[ws2] = resData;
            exportObj[ws3] = resData;

          }else{
            let resData = res.data;
            if(resData.internet){
              resData.internet.forEach(x=>{
                if(x.createdAt){
                  x.createdAt = moment(x.createdAt).format('YYYY-MM-DD HH:mm:ss');
                }
              })
            }
            if(resData.intranet){
              resData.intranet.forEach(x=>{
                if(x.createdAt){
                  x.createdAt = moment(x.createdAt).format('YYYY-MM-DD HH:mm:ss');
                }
              })
            }
            exportObj = res.data;
          }
          this.handleExport(exportObj);
        } else {
          message.error(`Failed to export (${res.status}): ${res.status===200? 'invalid format':res.msg}`, 3);
          this.setState({ exporting: false });
        }
      }else{
        message.error(`Failed to export (${response.status})`, 3);
        this.setState({ exporting: false });
      }
    })
  }
// ------------end of preparing summary by institution

  render(){
    const { summaryTitle, selTblProp, titleTblData, loading, visible, selRecord, selRepType, dataSource, startDate, endDate, paramInst, exporting, userGroupInfo } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }

    return(
      <div>
        <div hidden={ !userGroupInfo || userGroupInfo.groupId !== 5} style={{ marginBottom: '2em' }}>
          <Button type="primary" disabled={!Array.isArray(dataSource)||dataSource.length<1 || !userGroupInfo || userGroupInfo.groupId !== 5} loading={exporting} onClick={this.getExportList}>{intl.get('@GENERAL.EXPORT-AS-EXCEL')}</Button>
        </div>
        <h1 style={{ margin: 0 }}><b>{summaryTitle? ("Summary: "+ summaryTitle): null } </b></h1>
        <Table
        style={{ paddingTop: '16px', msOverflowX: 'scroll', overflowX: 'scroll' }}
        title={()=><Descriptions key="titleDesc" style={{ width: '50%' }} size="small" bordered column={1} >{titleTblData.map(item=>(<Item key={item.id} label={item.description}>{item.param}</Item>))}</Descriptions>}
        loading={spinProp}
        // bordered
        locale={{emptyText: intl.get('@GENERAL.NO-RECORD-IS-FOUND')}}
        rowKey={(record,index)=>index}
        pagination={false}
        scroll={{ y: '800px' }}
        columns={ selTblProp }
        dataSource={ dataSource }
        />

        <Modal
        title="Preview"
        bodyStyle={{ maxHeight: '80vh', overflowY: 'scroll' }}
        destroyOnClose
        centered
        width='80%'
        visible={visible}
        maskClosable={false}
        onCancel={this.handleCancel}
        footer={null}
        >
          <ReportDetails selRecord={selRecord} selRepType={selRepType} startDate={startDate} endDate={endDate} paramInst={paramInst} />
        </Modal>
      </div>

    )
  }
}