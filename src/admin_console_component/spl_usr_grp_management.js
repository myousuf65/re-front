//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200618 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, Button, Table, Icon, message, Popconfirm, Drawer, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
import WrappedSplUsrGrpForm from './spl_usr_group_form';
import './res_management.css';

// const tempData = [
//   { id: 1, groupName: 'test', userList: ['10024','12240'], createdAt: 1592727349000, modifiedAt: null }
// ]

export default class SplUsrGrpManagement extends React.Component{

  state = {
    searchId: null,
    searchName: null,
    searchStaffNo: null,
    loading: true,
    creating: false,
    updating: false,
    current: 1,
    total_results: 0,
    selectedRows: [],
    selectedRowKeys: [],
    selRecord: null,
    visiblepop: false,
    showInfoForm: false,
  };

  componentDidMount(){
    this.handlePageChange(1);
  }

  // ----Search Area----
  onInputBlur = (field, e) => {
    this.setState({ [field]: e.target.value });
  }

  onSearch = () =>{
    this.handlePageChange(1);
  }

  handlePageChange = page => {
    const { searchId, searchName, searchStaffNo } = this.state;
    this.setState({ current: page, loading: true, selRecord: null, selectedRows: [], selectedRowKeys: [] });

    var getGroupList_url = sessionStorage.getItem('serverPort')+'splusrgrp/search/'+sessionStorage.getItem('@userInfo.id')+'?page='+page;
    var searchParam = '';

    if(searchId){ searchParam += `&searchId=${searchId}` };
    if(searchName){ searchParam += `&searchName=${searchName}` };
    if(searchStaffNo){ searchParam += `&searchStaff=${searchStaffNo}` };

    if(searchParam){
      getGroupList_url += searchParam;
    }

    fetchData( getGroupList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          this.setState({ resultList: res.data, total_results: res.total })
        }else{
          this.setState({ resultList: [], total_results: 0 })
        }
      }else{
        this.setState({ resultList: [], total_results: 0 })
      };
      this.setState({ loading: false });
    })
  }

  handleNewGroup = values => {
    this.setState({ creating: true });
    let createGroup_url = sessionStorage.getItem('serverPort')+'splusrgrp/create/'+sessionStorage.getItem('@userInfo.id');
    fetchData(createGroup_url, 'post', values, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('Success!', 5);
          this.setState({ showModal: false });
        }else{
          message.error(res.msg, 5);
        }
      }else{
        message.error(response.result.status);
      };

      this.setState({ creating: false });
      this.handlePageChange(1);
    })
  }

  handleEditGroup = values => {
    this.setState({ updating: true });
    let updateGroup_url = sessionStorage.getItem('serverPort')+'splusrgrp/update/'+sessionStorage.getItem('@userInfo.id');
    fetchData(updateGroup_url, 'post', values, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('Success!', 5);
          this.setState({ showInfoForm: false });
        }else{
          message.error(res.msg, 5);
        }
      }else{
        message.error(response.result.status);
      };
      this.setState({ updating: false });
      this.handlePageChange(this.state.current||1);
    })
  }

  handleDeleteGroup = () =>{
    this.setState({ loading: true, visiblepop: false });
    let delGroup_url = sessionStorage.getItem('serverPort')+'splusrgrp/delete/'+sessionStorage.getItem('@userInfo.id');
    let delJson = {
      id: this.state.selectedRowKeys
    };
    fetchData(delGroup_url, 'post', delJson, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('Success!', 5);
          this.handlePageChange(this.state.current);
        }else{
          message.error(res.msg, 5);
          this.setState({ loading: false });
        }
      }else{
        message.error(response.result.status);
        this.setState({ loading: false });
      };
    })
  }

  showInfoForm = (record) => {
    this.setState({ showInfoForm: true, selRecord: record });
  };

  onCloseInfoForm = () => {
    this.setState({ showInfoForm: false });
  }
 
  render(){
    const { Content } = Layout;
    const { resultList, loading, visiblepop, showInfoForm, current, total_results, selectedRowKeys, selectedRows, showModal, creating, updating, selRecord } = this.state;
    const table_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, title:'Group Name',dataIndex:'groupName'},
                          {key: 3, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '創建日期':'Created Date'), 
                          dataIndex: 'modifiedAt',
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},
                          ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys,  selectedRows });
      },
    };
  
    const paginprops = {
      position: 'both',
      defaultCurrent: 1,
      current: current,
      pageSize: 50,
      total: total_results,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
      onChange: this.handlePageChange,
    }

    return(
      <div className="clearfix" style={{ width:'100%' }} >
        <Content className="cms-content" >
          
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              Special User Group Management
            </div>
            <div style={{ display: 'inline-block', width: '35%', textAlign: 'right' }}>
              <Button shape="round" type="primary" onClick={e=>this.setState({ showModal: true })} ><Icon type="plus" /> New Group</Button>
            </div>
          </h1>
          <div className="cms-white-box">
              <div className="res_search">
              <h5>{intl.get('@RES_MANAGEMENT.SEARCH')}</h5>
              <div style={{ width:'50%' }}><Input className="res-search-input" allowClear placeholder="ID" onBlur={e=>this.onInputBlur('searchId', e)} /></div>
              <div style={{ width:'50%' }}><Input className="res-search-input" allowClear placeholder={sessionStorage.getItem('lang')==="zh_TW"? "組名":"Group Name"} onBlur={e=>this.onInputBlur('searchName', e)} /></div>
              <div style={{ width:'50%' }}><Input className="res-search-input" allowClear placeholder={intl.get('@USER_MANAGEMENT.STAFF-NO')} onBlur={e=>this.onInputBlur('searchStaffNo', e)} /></div>

              <div style={{ textAlign: 'right', margin: '8px 0' }} >
                <Button className="res_btn" shape="round" type="primary" disabled={loading} onClick={this.onSearch}>{intl.get('@RES_MANAGEMENT.SEARCH')}</Button>
              </div>
            </div>

            <div style={{ padding: '4px' }}>
              <h5>{intl.get('@RES_MANAGEMENT.RESULTS')}</h5>
              <Table 
              style={{ paddingTop: '16px' }}
              loading={loading}
              rowKey={record=>record.id}
              rowClassName={record=>(record===selRecord&&showInfoForm? "res-row-selected":"res-row")}
              rowSelection={rowSelection}
              pagination={paginprops}
              columns={table_column}
              dataSource={resultList}
              onRow={record => ({ 
                onClick: event => this.showInfoForm(record)
              })}
              />
              <div style={{ textAlign: 'right', margin: '8px 0' }} >
                <Popconfirm 
                  title="All selected records will be deleted, continue?" 
                  visible={visiblepop} 
                  okText="Cancel"
                  placement="topRight"
                  onConfirm={e=>this.setState({ visiblepop: false })} 
                  cancelText="Yes"
                  onCancel={this.handleDeleteGroup}>
                  <Button className="res_btn" shape="round" disabled={loading||(selectedRows.length===0)} type="danger" onClick={e=>this.setState({ visiblepop: true })}>{intl.get('@GENERAL.DELETE')}</Button>
                </Popconfirm>
                </div>
            </div>

            <Modal
            title="New Group"
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='80%'
            visible={showModal}
            maskClosable={false}
            footer={null}
            onCancel={e=>this.setState({ creating: false, showModal: false })}
            >
              <WrappedSplUsrGrpForm handleSubmit={this.handleNewGroup} selRecord={null} submitting={creating} />
            </Modal>

            <Drawer
              id = "drawer-indiv-info"
              title={intl.get('@ACCESS_RULE_MANAGEMENT.DETAILS')}
              width='45%'
              onClose={this.onCloseInfoForm}
              destroyOnClose={true}
              visible={showInfoForm}
            >
              <WrappedSplUsrGrpForm
              handleSubmit={this.handleEditGroup}
              selRecord={selRecord}
              submitting={updating}
              />
            </Drawer>

          </div>
        </Content>
      </div>
    )
  }
}