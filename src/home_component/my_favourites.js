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
    //this.setState(state=>({ dataSource: tempFavourites, loading: false }));
    let getList_url = sessionStorage.getItem('serverPort')+'resource/favourites/getList/'+sessionStorage.getItem('@userInfo.id');
    
    // ---20191223 comming global fetch func
    fetchData(getList_url, 'GET', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({ dataSource: res.data, loading: false }));
        }else{
          message.error(`(${res.status}) Your request was rejected by server.`, 3);
          this.setState(state=>({ loading: false }));
        }
      }
    });
  }

  onSelectChange=(selectedRowKeys)=>{
    this.setState(state=>({ selectedRowKeys }));
  }
  
  onDelete=()=>{
    this.setState(state=>({ loading: true }));
    let delInfo = {
      refs:  this.state.selectedRowKeys
   }
 
    let delSelected_url = sessionStorage.getItem('serverPort')+'resource/favourites/delete/'+sessionStorage.getItem('@userInfo.id');
    
    fetchData(delSelected_url, 'post', delInfo, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>{
            let newList = state.dataSource;
            state.selectedRowKeys.forEach(iRef=>{
              let index = newList.findIndex(item=>item.id===iRef);
              if(index>-1){ newList.splice(index,1); }
            });
  
            return { dataSource: newList, selectedRowKeys: [], loading: false }
          })
        }else{
          message.error(`(${res.status}) Your request was rejected by server.`, 3);
          this.setState(state=>({ loading: false }));
        }
      }
    })
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
        title: intl.get('@GENERAL.TITLE'),      //------Title
        key: 'resTitle',
        dataIndex: sessionStorage.getItem('lang')==='zh_TW'? 'titleTc':'titleEn',
        width: '300px',
        render: (text,record) => <a href={`#/resourcedetails/?id=${record.id}`} >{text}</a>
      },
      {
        title: sessionStorage.getItem('lang')==='zh_TW'? '添加日期':'Added at',      //------Added at
        key: 'createdAt',
        dataIndex: 'createdAt',
        width: '300px',
        render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
        sorter: (a, b) => a.createdAt > b.createdAt? 1 : -1,
        defaultSortOrder: 'descend',
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
        <div className="my-favourites-header">
        <div className="container clearfix">
            <h2>{intl.get('@MAIN_LAYOUT.MY-FAVOUR')}</h2>
        </div>
        </div>

        <div className="page-content" style={{ paddingTop: 0 }}>
        <div className="container page-my-inbox">
          {/* <div style={{ display: 'inline-block', width: '100%', margin: '8px 0' }}>
            <Popconfirm 
            title="All selected resources will be removed, continue?" 
            icon={<Icon type="question-circle-o" style={{ verticalAlign: '0em', color: 'red' }} />}
            placement="right"
            >
              <Button type="danger" disabled={!hasSelection}>
                  <Icon type="delete" style={{ verticalAlign: '0em' }} />
                  {intl.get('@GENERAL.DELETE')}
              </Button>
              <span style={{ marginLeft: 8 }}>{hasSelection? `Selected ${selectedRowKeys.length} items`:null}</span>
            </Popconfirm>
          </div> */}

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

            <Table 
            style={{ padding: '8px 4px', msOverflowX: 'scroll', overflowX: 'scroll' }}
            dataSource={dataSource} 
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