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

export default class ReportSummaryBlog extends React.Component{

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
    isResTable: false,
  };

  componentDidMount(){
    this.props.onRefChildBlog(this);
  }

  handleCancel=(e)=>{
    this.setState({ visible: false });
  }

// ------------prepare summary for miniblog
  preByBlogSummary=(startDate, endDate, blogCate)=>{
    this.setState(state=>({ loading: true, startDate: startDate, endDate: endDate, dataSource: [], selTblProp: [], titleTblData: [] }));
    // 1. fetch data from server
    let getByBlog_url = sessionStorage.getItem('serverPort')+'report/access/blog/'+sessionStorage.getItem('@userInfo.id');
    let byBlogParams = {
      categoryId: blogCate.key,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD')
    }
    fetchData(getByBlog_url,'post',byBlogParams,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          // 2. nominate table column
          let selTblProp = [
            { key: 1, title: intl.get('@REPORTS_BLOG_SUM.TITLE'), dataIndex: 'title', width: '10%', align: 'left' },
            { key: 2, title: intl.get('@REPORTS_BLOG_SUM.AUTHOR'), dataIndex: 'originalCreator.fullname', width: 100, align: 'left' },
            { key: 3, title: intl.get('@REPORTS_BLOG_SUM.PUBLISH-DATE'), dataIndex: 'publishAt', width: 100, align: 'center', render:(text)=>moment(text).format('YYYY-MM-DD') },
            { key: 4, title: intl.get('@REPORTS_BLOG_SUM.CATE'), dataIndex: sessionStorage.getItem('lang')==='zh_TW'? 'blogCategory.nameTc':'blogCategory.nameEn', width: 100, align: 'left'},
            { key: 5, title: intl.get('@REPORTS_BLOG_SUM.IS-DELETED'), dataIndex: 'isDeleted', width: 100, align: 'center', render:(text)=>text? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO')},
            { key: 6, title: intl.get('@REPORTS_BLOG_SUM.GO-PUBLIC'), dataIndex: 'isPublic', width: 100, align: 'center', render:(text)=>text? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO')},
            { key: 7, title: intl.get('@REPORTS_BLOG_SUM.HITS'), dataIndex: 'hits', width: 100, align: 'center', render:(text, record)=><Button onClick={(e)=>this.onClickMiniblog(e, 'MB_H', record)}>{text}</Button> },
            { key: 8, title: intl.get('@REPORTS_BLOG_SUM.LIKES'), dataIndex: 'likes', width: 100, align: 'center', render:(text, record)=><Button onClick={(e)=>this.onClickMiniblog(e, 'MB_L', record)}>{text}</Button> },
            { key: 9, title: intl.get('@REPORTS_BLOG_SUM.COMMENTS'), dataIndex: 'comments', width: 100, align: 'center', render:(text, record)=><Button onClick={(e)=>this.onClickMiniblog(e, 'MB_C', record)}>{text}</Button> },
          ]
  
          // 3. nominate title table column
          let titleTblData = [
            { id: 1, description: 'Report Period:', param: intl.get('@GENERAL.FROM')+moment(startDate).format('YYYY-MM-DD')+intl.get('@GENERAL.TO')+moment(endDate).format('YYYY-MM-DD') },
            { id: 2, description: 'Category:', param: blogCate.label },
            { id: 3, description: 'Total Results:', param: res.data.length },
          ]
  
          this.setState(state=>({ loading: false, dataSource: res.data, summaryTitle: 'Mini Blog', selTblProp, titleTblData }));
        }else{
          this.setState(state=>({ loading: false }));
        }
      }else{
        this.setState(state=>({ loading: false }));
      }
    })
  }

  onClickMiniblog=(e, type, record)=>{
    this.setState(state=>({ selRepType: type, selRecord: record }))
    this.setState({ visible: true });
  }
// ------------end of preparing summary for miniblog

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