//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190717 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Button, Table, message, Popconfirm, Drawer, Icon } from 'antd';
import intl from 'react-intl-universal';

import './blog_cate_management.css';
import WrappedCateInfoForm from './blog_cate_form';
// import { fetchData } from '../service/HelperService';

export default class blogCateManagement extends React.Component{
  state={
    showInfoForm: false,
    visiblepop: false,
    resultList: [],
    selCate: [],
    isNewCate: true,
  };

  componentDidMount(){
    this.setState(state=>({ resultList: require('../temp_json/blog_cates.json') }))
    // let getBlogCate_url = sessionStorage.getItem('serverPort')+'miniblog/cate/all';
    // fetchData(getBlogCate_url, 'get', null, response=>{
    //   if(response.ifSuccess){
    //     let res = response.result;
    //     if(res.data !== undefined&&res.status===200){
    //       this.setState(state=>({ 
    //         resultList: res.data,
    //         disableEditBtn: true,
    //       }));
    //     } else {
    //       this.setState({ 
    //         resultList: [],
    //         disableEditBtn: true,
    //       });
    //     }
    //   }
    // });
  }

  onClickEdit=(cate)=>{
    this.setState(state=>({ selCate: cate, isNewCate: false, showInfoForm: true }));
  }

  onClickCreate=()=>{
    this.setState(state=>({ selCate: {}, isNewCate: true, showInfoForm: true }));
  }

  // -------settings of Delete btn

  onDelete = (selCate) => {
    // let selRecordIDs = selCate.id;
    // let delete_url = sessionStorage.getItem('serverPort')+'miniblogcate/delete/'+sessionStorage.getItem('@userInfo.id');

    // -------to be modified
    // fetchData(delete_url,'post',{id:selRecordIDs},response=>{
    //   if(response.ifSuccess){
    //     let res = response.result;
    //     if(res.status===200){
          message.success("Delete request accept");
  
          this.setState(state=>{ 
            state.resultList.splice(state.resultList.indexOf(selCate),1); 
            return {resultList: state.resultList};
          });
    //     } else {
    //       message.error("Delete request denied");
    //     };
    //   }
    // });
  }

  onCancelDelete = () => {
    message.info("You just cancelled deleting.")
  }

  onCloseInfoForm=()=>{
    this.setState({ showInfoForm: false, selUserId: null, selCate: {} });
  }

  handleInfoForm=(isNewCate, cateInfo)=>{

    if(isNewCate){
      cateInfo.id = this.state.resultList.length+1;
      this.setState(state=>({ resultList: [...state.resultList, cateInfo], showInfoForm: false }));
      message.success('Category created successfully!');
    }else{
      this.setState(state=>{ state.resultList.splice(state.resultList.indexOf(state.selCate),1,cateInfo); return {resultList: state.resultList, showInfoForm: false} });
      message.success('Category updated successfully!');
    }

    // if(isNewCate){
    //   let createCate_url = sessionStorage.getItem('serverPort')+'miniblogcate/create';
    //   fetchData(createCate_url, 'post', cateInfo, response=>{
    //     if(response.ifSuccess){
    //       let res = response.result;
    //       if(res.status === 200){
    //         this.setState(state=>({ resultList: [...state.resultList, res.data], showInfoForm: false }));
    //         message.success('Category created successfully!');
    //       }else{
    //         message.error('Failed to create: ', res.msg);
    //       }
    //     }
    //   })
    // }else{
    //   let updateCate_url = sessionStorage.getItem('serverPort')+'miniblogcate/update';
    //   fetchData(updateCate_url, 'post', cateInfo, response=>{
    //     if(response.ifSuccess){
    //       let res = response.result;
    //       if(res.status === 200){
    //         this.setState(state=>{ state.resultList.splice(state.resultList.indexOf(state.selCate),1,res.data); return {resultList: state.resultList, showInfoForm: false} });
    //         message.success('Category updated successfully!');
    //       }else{
    //         message.error('Failed to update: ', res.msg);
    //       }
    //     }
    //   })
    // }
  }

  render(){
    const { Content } = Layout;
    const { showInfoForm, resultList, } = this.state;

    const table_column = [{key: 1, title: intl.get('@BLOG_CATE_MANAGEMENT.ID'), sorter: (a,b)=> a.id - b.id, dataIndex: 'id'},
                          {key: 2, title: intl.get('@BLOG_CATE_MANAGEMENT.CATE-EN'), dataIndex: 'category'},
                          {key: 3, title: intl.get('@BLOG_CATE_MANAGEMENT.CATE-TC'), dataIndex: 'categoryC'},
                          {key: 4, 
                            title: intl.get('@BLOG_CATE_MANAGEMENT.GO-PUBLIC'), 
                            // filters: [{text: intl.get('@GENERAL.YES'),value:1},{text: intl.get('@GENERAL.NO'),value:0}],
                            // onFilter: (value, record) => record.public===value,
                            align: 'center', dataIndex: 'public', 
                            render: text=>(text===1? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO'))
                          },
                          {key: 5, 
                            title: intl.get('@BLOG_CATE_MANAGEMENT.ALLOW-COMMENT'), 
                            // filters: [{text: intl.get('@GENERAL.YES'),value:1},{text: intl.get('@GENERAL.NO'),value:0}], 
                            // onFilter: (value, record) => record.public===value,                            
                            align: 'center', dataIndex: 'allowComment', 
                            render: text=>(text===1? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO'))
                          },
                          {key: 6, title: intl.get('@BLOG_CATE_MANAGEMENT.ORDERING'), defaultSortOrder: 'ascend', sorter: (a,b)=>a.ordering - b.ordering, align: 'center', dataIndex: 'ordering'},
                          {key: 7, 
                            title: intl.get('@BLOG_CATE_MANAGEMENT.ADMIN'), 
                            render: (text, record)=>(
                            <span>
                              <Button className="cate-admin-btn" type="primary" onClick={()=>this.onClickEdit(record)}>
                                <Icon type="form" />
                                {/* {intl.get('@BLOG_CATE_MANAGEMENT.EDIT')} */}
                              </Button>
                              <Popconfirm
                              key={record.id}
                              title="Selected category will be deleted and all blogs under this category will be unavailable, continue?"
                              onVisibleChange={this.handleVisibleChange} 
                              okText={intl.get('@GENERAL.CANCEL')}
                              onConfirm={()=>this.onCancelDelete} 
                              cancelText={intl.get('@GENERAL.YES')}
                              onCancel={()=>this.onDelete(record)}
                              >
                                <Button className="cate-admin-btn" type="danger" >
                                  <Icon type="delete" />
                                  {/* {intl.get('@BLOG_CATE_MANAGEMENT.DELETE')} */}
                                </Button>
                              </Popconfirm>
                              
                            </span>) },
                          ];
    const paginprops = {
      defaultCurrent: 1,
      pageSize: 10,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`
    }

    return (
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@BLOG_CATE_MANAGEMENT.CATE-ADMIN')} 
            </div>
            <div style={{ display: 'inline-block', width: '35%', textAlign: 'right' }}>
                <Button className="res_create_btn" shape="round" type="primary" onClick={this.onClickCreate} >{intl.get("@BLOG_CATE_MANAGEMENT.NEW-CATE")}</Button>
            </div>
          </h1>

          <div className="cms-white-box">
            <Table 
              style={{ paddingTop: '16px' }}
              rowKey={record=>record.id}
              rowClassName={(record,index)=>{return record===this.state.selCate? "row-selected" : "user-row"}}
              // bordered
              // rowSelection={rowSelection}
              pagination={paginprops}
              columns={table_column}
              dataSource={resultList}
            />

            <Drawer
            id="drawer-indiv-info"
            title={this.state.isNewCate? intl.get('@BLOG_CATE_MANAGEMENT.CATE-CREATE'):intl.get('@BLOG_CATE_MANAGEMENT.CATE-UPDATE')}
            width='40%'
            onClose={this.onCloseInfoForm}
            destroyOnClose={true}
            visible={showInfoForm}
            >
              <WrappedCateInfoForm cateInfo={this.state.selCate} isNewCate={this.state.isNewCate} handleInfoForm={this.handleInfoForm} />
              {/* <WrappedUserMntForm handleInfoForm={this.handleInfoForm} selUserId={this.state.selUserId} generalUser={sessionStorage.getItem('@userInfo.id')<3} /> */}
            </Drawer>

          </div>
        </Content>
      </div>
    )
  }
}