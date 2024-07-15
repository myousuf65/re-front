//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Descriptions, Table } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
// import { ExportReport } from '../component/ExportCSV.js';

export default class ReportSummaryRank extends React.Component{

  state = { 
    summaryTitle: null, 
    selTblProp: [], 
    loading: false, 
    titleTblData: [], 
    tblData: [], 
    startDate: null,
    endDate: null,
    rankList: [],
    exporting: false
  };

  componentDidMount(){
    this.props.onRefChildRank(this);
  }

// ------------prepare summary by rank
  preByRankSummary=(startDate, endDate, paramInst, paramRank)=>{
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByRank_url = sessionStorage.getItem('serverPort')+'report/access/rank2/'+sessionStorage.getItem('@userInfo.id');
    let byRankParams = {
      rankId: paramRank.key,
      instId: paramInst.key,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    }

    fetchData(getByRank_url,'post',byRankParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          // this.setState(state=>({ dataSource: res.data.sort((a,b) => (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0)) }));
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center' },
            { key: 2, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center' },
            { key: 3, title: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), dataIndex: 'intranet_count', width: 100, align: 'center'},
            { key: 4, title: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), dataIndex: 'internet_count', width: 100, align: 'center'},
            { key: 5, title: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), dataIndex: 'total_count', width: 100, align: 'center'},
            { key: 6, title: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), dataIndex: 'hit_count', width: 100, align: 'center'},
          ]
  
          // 3. nominate title table column
  
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'By Institution(s):', param: paramInst.label },
            { id: 3, description: 'By Rank(s):', param: paramRank.label },
            { id: 4, description: 'Total Results:', param: res.data.length },
          ]

          let dataSource = res.data.sort((a,b) => (a.rank > b.rank) ? 1 : ((b.rank > a.rank) ? -1 : 0));
  
          this.setState(state=>(
            { loading: false, dataSource, summaryTitle: 'By Rank(s)', selTblProp, titleTblData }));
  
        } else {
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

// ------------end of preparing summary by rank

  // handleExport=()=>{
  //   this.setState({ exporting: true }, ()=>setTimeout(()=>this.setState({ exporting:false }), 1000))
  //   const { titleTblData, dataSource } = this.state;
    
  //   if(!titleTblData||!dataSource){ console.log('---quit---'); return };
  //   if(!Array.isArray(dataSource) || dataSource.length<1){ console.log('---quit---');return };

  //   let filename = `${moment().format('YYYYMMDD')}_KMS_REPORT_BY_RANK`;

  //   ExportReport(titleTblData, dataSource, filename);
  // }

  render(){
    const { summaryTitle, selTblProp, titleTblData, loading, dataSource } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    };

    return(
      <div>
        {/* <div style={{ marginBottom: '2em' }}>
          <Button type="primary" disabled={!Array.isArray(dataSource)||dataSource.length<1} loading={exporting} onClick={this.handleExport}>{intl.get('@GENERAL.EXPORT-AS-EXCEL')}</Button>
        </div> */}
        <h1 style={{ margin: 0 }}><b>{summaryTitle? ("Summary: "+ summaryTitle): null } </b></h1>
        <Table
        style={{ paddingTop: '16px', msOverflowX: 'scroll', overflowX: 'scroll' }}
        title={()=><Descriptions key="titleDesc" style={{ width: '50%' }} size="small" bordered column={1} >{titleTblData.map(item=>(<Item key={item.id} label={item.description}>{item.param}</Item>))}</Descriptions>}
        loading={spinProp}
        // bordered
        locale={{emptyText: intl.get('@GENERAL.NO-RECORD-IS-FOUND')}}
        rowKey={(record,index)=>index}
        pagination={false}
        scroll={{y: '800px'}}
        columns={selTblProp}
        dataSource={dataSource}
        />
      </div>

    )
  }
}