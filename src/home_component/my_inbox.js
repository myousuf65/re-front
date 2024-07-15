//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200703 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, message, Button, Table, Icon, Popconfirm } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';

export default class MyInbox extends React.Component{
  state = { data: [], selectedRowKeys: [], loading: false };

  componentDidMount(){
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    let getList_url = sessionStorage.getItem('serverPort')+'inbox/myList/'+sessionStorage.getItem('@userInfo.id');
    
    fetchData(getList_url, 'GET', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          this.setState({ data: res.data, loading: false });
        }else{
          this.setState({ data: [], loading: false }, ()=>{ message.error(`Get ${res.status} from server.`, 3) });
        }
      }else{
        this.setState({ data: [], loading: false }, ()=>{ message.error(`Get ${response.result.status} from server.`, 3) });
      }
    });
  }

  onSelectChange=(selectedRowKeys)=>{
    this.setState({ selectedRowKeys });
  }
  
  onDelete=()=>{
    this.setState({ loading: true });
    let delInfo = {
      refs: this.state.selectedRowKeys
    }
 
    let delSelected_url = sessionStorage.getItem('serverPort')+'inbox/myList/delete/'+sessionStorage.getItem('@userInfo.id');
    
    fetchData(delSelected_url, 'post', delInfo, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>{
            let newList = state.data;
            state.selectedRowKeys.forEach(iRef=>{
              let index = newList.findIndex(item=>item.id===iRef);
              if(index>-1){ newList.splice(index,1); }
            });
  
            return { data: newList, selectedRowKeys: [], loading: false };
          })
        }else{
          this.setState({ loading: false }, ()=>{ message.error(`Get ${res.status} from server.`, 3) });
        }
      }else{
        this.setState({ loading: false }, ()=>{ message.error(`Get ${response.result.status} from server.`, 3) });
      }
    })
  }

  handleResClick=(record)=>{
    if(!record || !record.id || !record.resourceId){ return }

    let redirectUrl = `#/resourcedetails/?id=${record.resourceId}`;
    switch(record.type){
      case "resource":
        redirectUrl = `#/resourcedetails/?id=${record.resourceId}`;
        break;
      case "blog":
        redirectUrl = `#/miniblog/details/?id=${record.resourceId}`;
        break;
      case "cocktail":
        redirectUrl = `#/kc/post/details?id=${record.resourceId}`;
        break;
      default:
    }

    let jsonBody = {
      refs: [record.id]
    }
    let updateInbox_url = sessionStorage.getItem('serverPort')+'inbox/myList/read/'+sessionStorage.getItem('@userInfo.id');
    fetchData(updateInbox_url, 'post', jsonBody, response=>{});

    window.location.assign(redirectUrl)
  }

  render(){
    const { data, loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    }
    const hasSelection = selectedRowKeys.length>0;
    const tableColumns = [
      // {
      //   title: 'ID',
      //   key: 'id',
      //   dataIndex: 'id',
      //   hidden: true
      // },
      {
        title: intl.get('@GENERAL.TITLE'),
        key: 'resTitle',
        dataIndex: sessionStorage.getItem('lang')==='zh_TW'? 'titleTc':'titleEn',
        width: '300px',
        render: (text,record) => <span style={record.isRead? null:{ fontWeight: 600, color: '#007bff' }}><a onClick={()=>this.handleResClick(record)} >{text}</a></span>
      },
      {
        title: intl.get('@GENERAL.STATUS'),
        key: 'isRead',
        dataIndex: 'isRead',
        render: (text) => (text? 'Read':'Unread')
      },
      {
        title: intl.get('@GENERAL.DATE'),
        key: 'createdAt',
        dataIndex: 'createdAt',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.createdAt > b.createdAt? 1 : -1,
        defaultSortOrder: 'descend',
      },
      {
        title: intl.get('@GENERAL.SEND-FROM'),
        key: 'sendBy',
        dataIndex: 'sendBy',
      },
    ];
    const spinProp = {
      spinning: loading,
      delay: 500,
      tip: 'Loading...'
    }
    const accessMode = getAccessMode();
    const paginprops = {
      size: accessMode===3?"small":"",
      pageSize: 5,
      defaultCurrent: 1,
      position: 'bottom',
      showTotal: (total, range) => accessMode===3?`Total ${total}`:`${range[0]}-${range[1]} of ${total} records`,
    }

    return(
      <div>
        <div className="my-inbox-header">
        <div className="container clearfix">
            <h2>{intl.get('@MAIN_LAYOUT.MY-INBOX')}</h2>
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
              <Button type="danger" style={{ margin: '8px' }} disabled={!hasSelection || loading}>
                  <Icon type="delete" style={{ verticalAlign: '0em' }} />
                  {intl.get('@GENERAL.DELETE')}
              </Button>
              <span style={{ marginLeft: 8 }}>{hasSelection? `Selected ${selectedRowKeys.length} items`:null}</span>
            </Popconfirm>

            <Table 
            style={{ padding: '8px 4px', msOverflowX: 'scroll', overflowX: 'scroll' }}
            dataSource={data} 
            loading={spinProp}
            rowKey={record=>record.id}
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