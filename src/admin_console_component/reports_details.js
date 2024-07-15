//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Descriptions } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';

export default class ReportDetails extends React.Component{
  
  state={ detailsTitle: null, selTblProp: [], loading: false, titleTblData: [], tblData: [], visible: false, dataSource: null };

  componentDidMount(){
    switch(this.props.selRepType){
      case 'I_IL':
        this.preByInstLoginChannel(true, this.props.selRecord);
        break;
      case 'I_RL':
        this.preByInstLoginChannel(false, this.props.selRecord);
        break;
      case 'I_PH':
        this.preByInstPageHits(this.props.selRecord);
        break;
      case 'R_IL':
        this.preByRankLoginChannel(true, this.props.selRecord);
        break;
      case 'R_RL':
        this.preByRankLoginChannel(false, this.props.selRecord);
        break;
      case 'R_PH':
        this.preByRankPageHits(this.props.selRecord);
        break;
      case 'S_IL':
        this.preByStaffLoginChannel(true, this.props.selRecord);
        break;
      case 'S_RL':
        this.preByStaffLoginChannel(false, this.props.selRecord);
        break;
      case 'S_PH':
        this.preByStaffPageHits(this.props.selRecord);
        break;
      case 'S_RH':
        this.preByStaffResHits(this.props.selRecord);
        break;
      case 'MB_H':
        this.preByBlogParam('@REPORTS_BLOG_DETAIL.VIEW', 1, this.props.selRecord);
        break;
      case 'MB_L':
        this.preByBlogParam('@REPORTS_BLOG_DETAIL.LIKE', 2, this.props.selRecord);
        break;
      case 'MB_C':
        this.preByBlogParam('@REPORTS_BLOG_DETAIL.COMMENT', 3, this.props.selRecord);
        break;
      case 'Res_V':
        this.preByResParam('@REPORTS_RES_SUM.VIEWS', 1, this.props.selRecord);
        break;
      case 'Res_U':
        this.preByResUsers(this.props.selRecord);
        break;
      case 'Res_S':
        this.preByResParam('@REPORTS_RES_SUM.SHARES', 3, this.props.selRecord);
        break;
      case 'Res_D':
        this.preByResParam('@REPORTS_RES_SUM.DOWNLOADS', 2, this.props.selRecord);
        break;
      case 'K_ALL':
        this.preByScoreLevel(0, this.props.selRecord);
        break;
      case 'K_LV4':
        this.preByScoreLevel(4, this.props.selRecord);
        break;
      case 'K_LV3':
        this.preByScoreLevel(3, this.props.selRecord);
        break;
      case 'K_LV2':
        this.preByScoreLevel(2, this.props.selRecord);
        break;
      case 'K_LV1':
        this.preByScoreLevel(1, this.props.selRecord);
        break;
      default:

    }

  }

  // ----- By Inst
  preByInstLoginChannel=(ifIntranet, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/inst/login/'+sessionStorage.getItem('@userInfo.id');
    let byInstParams = {
      instId: selRecord.institutionId,
      searchType: ifIntranet? 1 : 2,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByInst_url,'post',byInstParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
            // 2. nominate table column
            let selTblProp = [
              { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
              { key: 2, title: intl.get('@REPORTS_INST_SUM.LOGIN-TYPE'), width: '15%', align: 'left', render:()=>ifIntranet? intl.get('@REPORTS_INST_SUM.INTRANET'):intl.get('@REPORTS_INST_SUM.REMOTE-ACCESS') },
              { key: 3, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center'},
              { key: 4, title: intl.get('@GENERAL.SECTION'), dataIndex: 'section', width: 100, align: 'center'},
              { key: 5, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center'},
              { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: 100, align: 'center'},
              { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), dataIndex: 'staffNo', width: 100, align: 'center'},
              { key: 8, title: intl.get('@REPORTS_INST_SUM.NOTES-ACCOUNT'), dataIndex: 'notesAccount', width: 100, align: 'center', render: ()=>null }
            ]
  
            // 3. nominate title table column
            let titleTblData = [
              { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
              { id: 2, description: 'By Institution(s):', param: selRecord.institution },
              { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
              { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
              { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
              { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
              { id: 7, description: 'Total Results:', param: res.data.length },
            ]
  
            this.setState({ loading: false, detailsTitle: 'By Institution(s): Individual Institution', selTblProp, titleTblData, dataSource: res.data });
            
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })

  }

  preByInstPageHits=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/inst/details/'+sessionStorage.getItem('@userInfo.id');
    let byInstParams = {
      instId: selRecord.institutionId,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByInst_url,'post',byInstParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@GENERAL.INST'), width: 100, dataIndex: 'institution', align: 'center'},
            { key: 2, title: intl.get('@GENERAL.SECTION'), width: 100, dataIndex: 'section', align: 'center'},
            { key: 3, title: intl.get('@GENERAL.RANK'), width: 100, dataIndex: 'rank', align: 'center'},
            { key: 4, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), width: 100, dataIndex: 'fullname', align: 'center'},
            { key: 5, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), width: 100, dataIndex: 'staffNo', align: 'center'},
            { key: 6, title: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), width: 100, dataIndex: 'hits', align: 'center'},
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'By Institution(s):', param: selRecord.institution },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'By Institution(s): Individual Institution', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })

  }

  // -----end of "By Inst"


  // -----By Rank
  preByRankLoginChannel=(ifIntranet, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByRank_url = sessionStorage.getItem('serverPort')+'report/access/rank/login/'+sessionStorage.getItem('@userInfo.id');
    let byRankParams = {
      staffNo: selRecord.staffNo,
      searchType: ifIntranet? 1 : 2,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByRank_url,'post',byRankParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text, record, index)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.LOGIN-TYPE'), width: '15%', align: 'left', render:()=>ifIntranet? intl.get('@REPORTS_INST_SUM.INTRANET'):intl.get('@REPORTS_INST_SUM.REMOTE-ACCESS') },
            { key: 3, title: intl.get('@GENERAL.INST'), width: 100, align: 'center', render: ()=>selRecord.institution },
            { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, align: 'center', render: ()=>selRecord.section },
            { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, align: 'center', render: ()=>selRecord.rank },
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), width: 100, align: 'center', render: ()=>selRecord.fullname },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), width: 100, align: 'center', render: ()=>selRecord.staffNo }
          ]

          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'By Institution(s):', param: selRecord.institution },
            { id: 3, description: 'By Rank(s):', param: selRecord.rank },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.FULLNAME'), param: selRecord.fullname },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 7, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 8, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 9, description: 'Total Results:', param: res.data.length },
          ]

          this.setState({ detailsTitle: 'By Rank(s): Individual User', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    });
  }

  preByRankPageHits=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByRank_url = sessionStorage.getItem('serverPort')+'report/access/rank/details/'+sessionStorage.getItem('@userInfo.id');
    let byRankParams = {
      staffNo: selRecord.staffNo,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByRank_url,'post',byRankParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.NAME'), dataIndex: 'pageNameEN', width: '30%', align: 'left', render:(text, record)=>(<div>{text}<br />({record.pageNameTc})</div>) },
            { key: 3, title: intl.get('@GENERAL.INST'), width: 100, align: 'center', render: ()=>selRecord.institution },
            { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, align: 'center', render: ()=>selRecord.section },
            { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, align: 'center', render: ()=>selRecord.rank },
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), align: 'center', render: ()=>selRecord.fullname },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), align: 'center', render: ()=>selRecord.staffNo },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD') },
            { id: 2, description: 'By Institution(s):', param: selRecord.institution },
            { id: 3, description: 'By Rank(s):', param: selRecord.rank },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.FULLNAME'), param: selRecord.fullname },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 7, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 8, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 9, description: 'Total Results:', param: res.data.length }
          ]
  
          this.setState({ detailsTitle: 'By Rank(s): Individual User', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })

  }
  // ----- end of "By Rank"

  // ----- By Staff 
  preByStaffLoginChannel=(ifIntranet, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByStaff_url = sessionStorage.getItem('serverPort')+'report/access/staff/login/'+sessionStorage.getItem('@userInfo.id');
    let byStaffParams = {
      staffNo: selRecord.staffNo,
      searchType: ifIntranet? 1 : 2,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByStaff_url,'post',byStaffParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.LOGIN-TYPE'), width: '15%', align: 'left', render:()=>ifIntranet? intl.get('@REPORTS_INST_SUM.INTRANET'):intl.get('@REPORTS_INST_SUM.REMOTE-ACCESS') },
            { key: 3, title: intl.get('@GENERAL.INST'), width: 100, align: 'center', dataIndex: 'institution' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, align: 'center', dataIndex: 'section' },
            { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, align: 'center', dataIndex: 'rank' },
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), width: 100, align: 'center', render: ()=>selRecord.fullname },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), width: 100, align: 'center', render: ()=>selRecord.staffNo }
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_INST_SUM.FULLNAME'), param: selRecord.fullname },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: intl.get('@REPORTS_INST_SUM.FILE-ACCESS'), param: selRecord.resource_count },
            { id: 8, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'By Staff(s): Individual User', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })
  }

  preByStaffPageHits=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByStaff_url = sessionStorage.getItem('serverPort')+'report/access/staff/details/'+sessionStorage.getItem('@userInfo.id');
    let byStaffParams = {
      staffNo: selRecord.staffNo,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByStaff_url,'post',byStaffParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.NAME'), dataIndex: 'pageNameEN', width: '30%', align: 'left', render:(text, record, index)=>(<div>{text}<br />({record.pageNameTc})</div>) },
            { key: 3, title: intl.get('@GENERAL.INST'), width: 100, align: 'center', dataIndex: 'institution' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, align: 'center', dataIndex: 'section' },
            { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, align: 'center', dataIndex: 'rank' },
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), align: 'center', render: ()=>selRecord.fullname },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), align: 'center', render: ()=>selRecord.staffNo },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_INST_SUM.FULLNAME'), param: selRecord.fullname },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: intl.get('@REPORTS_INST_SUM.FILE-ACCESS'), param: selRecord.resource_count },
            { id: 8, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'By Staff: Page Hits', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })
  }

  preByStaffResHits=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByStaff_url = sessionStorage.getItem('serverPort')+'report/access/staff/resource/'+sessionStorage.getItem('@userInfo.id');
    let byStaffParams = {
      staffNo: selRecord.staffNo,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByStaff_url,'post',byStaffParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.NAME'), dataIndex: 'pageNameEN', width: '30%', align: 'left', render:(text, record, index)=>(<div>{text}<br />({record.pageNameTc})</div>) },
            { key: 3, title: intl.get('@GENERAL.INST'), width: 100, align: 'center', dataIndex: 'institution' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, align: 'center', dataIndex: 'section' },
            { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, align: 'center', dataIndex: 'rank' },
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), align: 'center', render: ()=>selRecord.fullname },
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), align: 'center', render: ()=>selRecord.staffNo },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_INST_SUM.FULLNAME'), param: selRecord.fullname },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: intl.get('@REPORTS_INST_SUM.FILE-ACCESS'), param: selRecord.resource_count },
            { id: 8, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'By Staff: File Access', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })
  }
  // ----- end of "By Staff"

  // ----- by Mini Blog
  preByBlogParam=(paramType, actionType, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByBlog_url = sessionStorage.getItem('serverPort')+'report/access/blog/details/'+sessionStorage.getItem('@userInfo.id');
    let byBlogParams = {
      blogId: selRecord.blogId,
      action: actionType,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByBlog_url,'post',byBlogParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
        
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: '30%', align: 'left' },
            { key: 3, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), dataIndex: 'section', width: 100, align: 'center' },
            { key: 5, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center' },
            { key: 6, title: intl.get('@REPORTS_BLOG_SUM.ACTION'), align: 'center', render: ()=>intl.get(paramType) },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_BLOG_SUM.TITLE'), param: selRecord.title},
            { id: 3, description: intl.get('@REPORTS_BLOG_SUM.CATE'), param: sessionStorage.getItem('lang')==='zh_TW'? selRecord.blogCategory.nameTc:selRecord.blogCategory.nameEn},
            { id: 4, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'Mini Blog: Post Action Details', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })

  }
  // ----- end of "By Mini Blog"

  // ----- by Resource
  preByResParam=(paramType, actionType, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByRes_url = sessionStorage.getItem('serverPort')+'report/access/resource/actions/'+sessionStorage.getItem('@userInfo.id');
    let byResParams = {
      resourceId: selRecord.resourceId,
      action: actionType,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByRes_url,'post',byResParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
        
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), dataIndex: 'staffNo', width: '10%', align: 'left' },
            { key: 2, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: '20%', align: 'left' },
            { key: 3, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), dataIndex: 'section', width: 100, align: 'center' },
            { key: 5, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center' },
            { key: 6, title: intl.get('@REPORTS_BLOG_SUM.ACTION'), align: 'center', render: ()=>intl.get(paramType) },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_BLOG_SUM.TITLE'), param: sessionStorage.getItem('lang')==='zh_TW'? selRecord.titleTc+'('+selRecord.resourceId+')':selRecord.titleEn+'('+selRecord.resourceId+')'},
            { id: 3, description: intl.get('@REPORTS_RES_SUM.RES-CATES'), param: sessionStorage.getItem('lang')==='zh_TW'? selRecord.categoryTc.map(item=><li>{item}</li>):selRecord.category.map(item=><li>{item}</li>)},
            { id: 4, description: intl.get('@REPORTS_RES_SUM.CREATED'), param: moment(selRecord.createdAt).format('YYYY-MM-DD H:mm:ss')},
            { id: 5, description: intl.get('@REPORTS_RES_SUM.CREATED-BY'), param: (selRecord.createdBy.fullname||"Unknown")+" [ "+(selRecord.createdBy.institution||"Institution")+", "+(selRecord.createdBy.section||"Section")+", "+(selRecord.createdBy.rank||"Rank")+" ]" },
            { id: 6, description: intl.get('@REPORTS_RES_SUM.MODIFIED'), param: moment(selRecord.modifiedAt).format('YYYY-MM-DD H:mm:ss')},
            { id: 7, description: intl.get('@REPORTS_RES_SUM.MODIFIED-BY'), param: (selRecord.modifiedBy.fullname||"Unknown")+" [ "+(selRecord.modifiedBy.institution||"Institution")+", "+(selRecord.modifiedBy.section||"Section")+", "+(selRecord.modifiedBy.rank||"Rank")+" ]" },
            { id: 8, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'Resource: Action Details', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })
  }
  // ----- end of "By Resource"

  // ----- by Resource - available user
  preByResUsers=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByRes_url = sessionStorage.getItem('serverPort')+'report/access/resource/total_user/'+sessionStorage.getItem('@userInfo.id');
    let byResParams = {
      resourceId: selRecord.resourceId,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByRes_url,'post',byResParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), dataIndex: 'staffNo', width: '10%', align: 'left' },
            { key: 2, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: '30%', align: 'left' },
            { key: 3, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center' },
            { key: 4, title: intl.get('@GENERAL.SECTION'), dataIndex: 'section', width: 100, align: 'center' },
            { key: 5, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center' }
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: intl.get('@REPORTS_BLOG_SUM.TITLE'), param: sessionStorage.getItem('lang')==='zh_TW'? selRecord.titleTc+'('+selRecord.resourceId+')':selRecord.titleEn+'('+selRecord.resourceId+')'},
            { id: 3, description: intl.get('@REPORTS_RES_SUM.RES-CATES'), param: sessionStorage.getItem('lang')==='zh_TW'? selRecord.categoryTc.map(item=><li>{item}</li>):selRecord.category.map(item=><li>{item}</li>)},
            { id: 4, description: intl.get('@REPORTS_RES_SUM.CREATED'), param: moment(selRecord.createdAt).format('YYYY-MM-DD H:mm:ss')},
            { id: 5, description: intl.get('@REPORTS_RES_SUM.CREATED-BY'), param: (selRecord.createdBy.fullname||"Unknown")+" [ "+(selRecord.createdBy.institution||"Institution")+", "+(selRecord.createdBy.section||"Section")+", "+(selRecord.createdBy.rank||"Rank")+" ]" },
            { id: 6, description: intl.get('@REPORTS_RES_SUM.MODIFIED'), param: moment(selRecord.modifiedAt).format('YYYY-MM-DD H:mm:ss')},
            { id: 7, description: intl.get('@REPORTS_RES_SUM.MODIFIED-BY'), param: (selRecord.modifiedBy.fullname||"Unknown")+" [ "+(selRecord.modifiedBy.institution||"Institution")+", "+(selRecord.modifiedBy.section||"Section")+", "+(selRecord.modifiedBy.rank||"Rank")+" ]" },
            { id: 8, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'Resource: Available User(s)', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })

  }
  // ----- end of "By Resource - available user"

  // ----- By Score
  translateLevel=(level)=>{
    let scoreLevel = null;
    if(level===4){
      scoreLevel = intl.get("@MAIN_LAYOUT.PLATINUM");
    }else if(level===3){
      scoreLevel = intl.get("@MAIN_LAYOUT.GOLD");
    }else if(level===2){
      scoreLevel = intl.get("@MAIN_LAYOUT.GREEN");
    }else if(level===1){
      scoreLevel = intl.get("@MAIN_LAYOUT.BASIC");
    }else{
      scoreLevel = 'NA';
    }
    return scoreLevel;
  }
  
  preByScoreLevel=(level, selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByScore_url = sessionStorage.getItem('serverPort')+'report/access/score/details/'+sessionStorage.getItem('@userInfo.id');
    let byScoreParams = {
      instId: selRecord.instId,
      level: level,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };

    fetchData(getByScore_url,'post',byScoreParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
          if(res.status===200){
    
            // 2. nominate table column
            let selTblProp = [
              { key: 1, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), width: 100, dataIndex: 'staffNo', align: 'center'},
              { key: 2, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), width: 100, dataIndex: 'fullname', align: 'center'},
              { key: 3, title: intl.get('@GENERAL.INST'), width: 100, dataIndex: 'institution', align: 'center'},
              { key: 4, title: intl.get('@GENERAL.SECTION'), width: 100, dataIndex: 'section', align: 'center'},
              { key: 5, title: intl.get('@GENERAL.RANK'), width: 100, dataIndex: 'rank', align: 'center'},
              { key: 6, title: 'Level', width: 100, dataIndex: 'level', align: 'center', render: (text)=>this.translateLevel(text)},
              { key: 7, title: 'K-Rewards', width: 100, dataIndex: 'userScore', align: 'center'},
            ]
    
            // 3. nominate title table column
            let titleTblData = [
              { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
              { id: 2, description: 'Institution:', param: selRecord.institution },
              { id: 3, description: 'K-Rewards:', param: level===0? intl.get("@GENERAL.ALL"):this.translateLevel(level) },
              { id: 4, description: 'Total Results:', param: res.data.length },
            ]
    
            this.setState({ detailsTitle: 'By K-Rewards:', selTblProp, titleTblData, dataSource: res.data, loading: false });
          }else{
            this.setState({ loading: false });
          }
      }else{
        this.setState({ loading: false });
      }
    })

  }

  // -----end of "By Score"
  


// ----- By Management By Eva
preByInstLoginChannel=(ifIntranet, selRecord)=>{
  // 1. fetch data from server
  this.setState({ loading: true });
  let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/inst/login/'+sessionStorage.getItem('@userInfo.id');
  let byInstParams = {
    instId: selRecord.institutionId,
    searchType: ifIntranet? 1 : 2,
    startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
    endDate: moment(this.props.endDate).format('YYYY-MM-DD')
  };
  fetchData(getByInst_url,'post',byInstParams,response=>{
    if(response.ifSuccess){
      let res = response.result;
      if(res.status===200){

          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_INST_SUM.CREATED'), width: '20%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD H:mm:ss')},
            { key: 2, title: intl.get('@REPORTS_INST_SUM.LOGIN-TYPE'), width: '15%', align: 'left', render:()=>ifIntranet? intl.get('@REPORTS_INST_SUM.INTRANET'):intl.get('@REPORTS_INST_SUM.REMOTE-ACCESS') },
            { key: 3, title: intl.get('@GENERAL.INST'), dataIndex: 'institution', width: 100, align: 'center'},
            { key: 4, title: intl.get('@GENERAL.SECTION'), dataIndex: 'section', width: 100, align: 'center'},
            { key: 5, title: intl.get('@GENERAL.RANK'), dataIndex: 'rank', width: 100, align: 'center'},
            { key: 6, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), dataIndex: 'fullname', width: 100, align: 'center'},
            { key: 7, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), dataIndex: 'staffNo', width: 100, align: 'center'},
            { key: 8, title: intl.get('@REPORTS_INST_SUM.NOTES-ACCOUNT'), dataIndex: 'notesAccount', width: 100, align: 'center', render: ()=>null }
          ]

          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'By Institution(s):', param: selRecord.institution },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: 'Total Results:', param: res.data.length },
          ]

          this.setState({ loading: false, detailsTitle: 'By Institution(s): Individual Institution', selTblProp, titleTblData, dataSource: res.data });
          
      }else{
        this.setState({ loading: false });
      }
    }else{
      this.setState({ loading: false });
    }
  })

}

preByInstPageHits=(selRecord)=>{
    // 1. fetch data from server
    this.setState({ loading: true });
    let getByInst_url = sessionStorage.getItem('serverPort')+'report/access/inst/details/'+sessionStorage.getItem('@userInfo.id');
    let byInstParams = {
      instId: selRecord.institutionId,
      startDate: moment(this.props.startDate).format('YYYY-MM-DD'),
      endDate: moment(this.props.endDate).format('YYYY-MM-DD')
    };
    fetchData(getByInst_url,'post',byInstParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
  
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@GENERAL.INST'), width: 100, dataIndex: 'institution', align: 'center'},
            { key: 2, title: intl.get('@GENERAL.SECTION'), width: 100, dataIndex: 'section', align: 'center'},
            { key: 3, title: intl.get('@GENERAL.RANK'), width: 100, dataIndex: 'rank', align: 'center'},
            { key: 4, title: intl.get('@REPORTS_INST_SUM.FULLNAME'), width: 100, dataIndex: 'fullname', align: 'center'},
            { key: 5, title: intl.get('@REPORTS_INST_SUM.STAFF-NO'), width: 100, dataIndex: 'staffNo', align: 'center'},
            { key: 6, title: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), width: 100, dataIndex: 'hits', align: 'center'},
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(this.props.startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(this.props.endDate).format('YYYY-MM-DD')  },
            { id: 2, description: 'By Institution(s):', param: selRecord.institution },
            { id: 3, description: intl.get('@REPORTS_INST_SUM.INTRANET-COUNTS'), param: selRecord.intranet_count },
            { id: 4, description: intl.get('@REPORTS_INST_SUM.INTERNET-COUNTS'), param: selRecord.internet_count },
            { id: 5, description: intl.get('@REPORTS_INST_SUM.TOTAL-ACCESS'), param: selRecord.total_count },
            { id: 6, description: intl.get('@REPORTS_INST_SUM.PAGE-HITS'), param: selRecord.hit_count },
            { id: 7, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState({ detailsTitle: 'By Institution(s): Individual Institution', selTblProp, titleTblData, dataSource: res.data, loading: false });
        }else{
          this.setState({ loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    })


}

// -----end of "By Inst"


  render(){
    const { detailsTitle, selTblProp, titleTblData, loading, dataSource } = this.state;
    const { Item } = Descriptions;

    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }

    return(
      <div>
        <h6 style={{ margin: 0 }}><b>{detailsTitle? detailsTitle : null } </b></h6>
        <Table
        style={{ paddingTop: '16px', msOverflowX: 'scroll', overflowX: 'scroll' }}
        title={()=><Descriptions style={{ width: '50%' }} size="small" bordered column={1} >{titleTblData.map(item=>(<Item label={item.description}>{item.param}</Item>))}</Descriptions>}
        loading={spinProp}
        // bordered
        locale={{emptyText: intl.get('@GENERAL.NO-RECORD-IS-FOUND')}}
        rowKey={(record,index)=>index}
        pagination={false}
        scroll={{ y: '800px' }}
        columns={selTblProp}
        dataSource={dataSource}
        />
      </div>
    )
  }
}