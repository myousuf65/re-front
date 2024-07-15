//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Button, Descriptions, Table, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import ReportDetails from './reports_details.js';

import { fetchData } from '../service/HelperService';

export default class ReportSummaryStaff extends React.Component{

  state = { 
    summaryTitle: null, 
    selTblProp: [], 
    loading: false, 
    titleTblData: [], 
    dataSource: [], 
    visible: false, 
    selRecord: {}, 
    selRepType: null,
    startDate: null,
    endDate: null,
    userGroupInfo: {},
  };

  componentDidMount(){
    this.props.onRefChildStaff(this);
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.userGroupInfo !== null && nextProps.userGroupInfo !== undefined && this.state.userGroupInfo!==nextProps.userGroupInfo){
        this.setState(state=>({ 
          userGroupInfo: nextProps.userGroupInfo
        }))
    }
  }
  handleCancel=(e)=>{
    this.setState({ visible: false });
  }

// ------------prepare summary by staff
  preByStaffSummary=(startDate, endDate, fullname, staffNo)=>{
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByStaff_url = sessionStorage.getItem('serverPort')+'report/access/staff/'+sessionStorage.getItem('@userInfo.id');
    let byStaffParams = {
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    };

    if(fullname!==null){
      byStaffParams.fullname = fullname;
    }

    if(staffNo!==null){
      byStaffParams.staffNo = staffNo;
    }
    
    fetchData(getByStaff_url,'post',byStaffParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
        // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: '25%', align: 'left' },
            { key: 2, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), dataIndex: 'staffNo', width: 100, align: 'left' },
            { key: 3, title: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), dataIndex: 'intranet_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickStaff(e, 'S_IL', record)}>{text}</Button> },
            { key: 4, title: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), dataIndex: 'internet_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickStaff(e, 'S_RL', record)}>{text}</Button> },
            { key: 5, title: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), dataIndex: 'total_count', width: 100, align: 'center'},
            { key: 6, title: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), dataIndex: 'hit_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickStaff(e, 'S_PH', record)}>{text}</Button> },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.FILE-ACCESS'), dataIndex: 'resource_count', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickStaff(e, 'S_RH', record)}>{text}</Button> },
          ]
      
          // 3. nominate title table column
          
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'Fullname:', param: fullname },
            { id: 3, description: 'Staff No.:', param: staffNo },
            { id: 4, description: 'Total Results:', param: res.data.length },
          ]
      
          this.setState(state=>({ loading: false, dataSource: res.data, summaryTitle: 'By Staff(s)', selTblProp, titleTblData }));
        }else{
          if(res.status===500){
            message.warning(intl.get('@REPORTS_STAFF_SUM.REMARKS-500', {instName: this.state.userGroupInfo.instName||(sessionStorage.getItem('lang')==='zh_TW'? '您所屬懲教院所':'your institution ')}), 5)
          }else if(res.status===505){
            message.info(intl.get('@REPORTS_STAFF_SUM.REMARKS-505'), 5)
          }
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

  onClickStaff=(e, type, record)=>{
    this.setState(state=>({ selRepType: type, selRecord: record }))
    this.setState({ visible: true });
  }
// ------------end of preparing summary by staff

  render(){
    const { summaryTitle, selTblProp, titleTblData, loading, visible, selRecord, selRepType, dataSource, startDate, endDate } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }
    
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
        scroll={{y: '800px'}}
        columns={selTblProp}
        dataSource={dataSource}
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