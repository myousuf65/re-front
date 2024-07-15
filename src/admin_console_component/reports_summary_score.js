//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Button, Descriptions, Table, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import ReportDetails from './reports_details.js';

import { fetchData } from '../service/HelperService';

export default class ReportSummaryScore extends React.Component{

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
  };

  componentDidMount(){
    this.props.onRefChildScore(this);
  }

  handleCancel=(e)=>{
    this.setState({ visible: false });
  }

// ------------prepare scoring summary by institution
  preByScoreSummary=(startDate, endDate, paramInst)=>{
    
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/score/'+sessionStorage.getItem('@userInfo.id');
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
              // { key: 2, title: intl.get('@REPORTS_SCORE_SUM.TOTAL'), dataIndex: 'total', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'K_ALL', record)}>{text}</Button> },
              { key: 2, title: intl.get('@REPORTS_SCORE_SUM.TOTAL'), dataIndex: 'total', width: 100, align: 'center'},
              { key: 3, title: intl.get('@MAIN_LAYOUT.PLATINUM'), dataIndex: 'lv4', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'K_LV4', record)}>{text}</Button> },
              { key: 4, title: intl.get('@MAIN_LAYOUT.GOLD'), dataIndex: 'lv3', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'K_LV3', record)}>{text}</Button> },
              { key: 5, title: intl.get('@MAIN_LAYOUT.GREEN'), dataIndex: 'lv2', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'K_LV2', record)}>{text}</Button> },
              { key: 6, title: intl.get('@MAIN_LAYOUT.BASIC'), dataIndex: 'lv1', width: 100, align: 'center', render:(text, record, index)=><Button onClick={(e)=>this.onClickInst(e, 'K_LV1', record)}>{text}</Button> },
            ];

            // 3. nominate title table column
            let titleTblData = [
              { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD')  },
              { id: 2, description: 'By Institution(s):', param: paramInst.label },
              { id: 3, description: 'Total Results:', param: res.data.length },
            ];

            this.setState(state=>({ loading: false, dataSource: res.data, summaryTitle: 'K-Rewards', selTblProp, titleTblData, paramInst }));
        } else {
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

  onClickInst=(e, type, record)=>{
    this.setState(state=>({ selRepType: type, selRecord: record }));
    this.setState({ visible: true });
  }
// ------------end of preparing summary by institution

  render(){
    const { summaryTitle, selTblProp, titleTblData, loading, visible, selRecord, selRepType, dataSource, startDate, endDate, paramInst } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }

    return(
      <div>
        <h1 style={{ margin: 0 }}><b>{summaryTitle? ("Summary: "+ summaryTitle): null } </b></h1>
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
          <ReportDetails selRecord={selRecord} selRepType={selRepType} startDate={startDate} endDate={endDate} paramInst={paramInst} />
        </Modal>
      </div>

    )
  }
}