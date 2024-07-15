//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190522 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Button, Icon, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { fetchData, getAccessMode } from '../service/HelperService';

const confirm = Modal.confirm;

export default class PostsMySpecialCollection extends React.Component{

    state={ 
        filteredInfo: null, 
        postList: [], 
        authorFilter: [], 
        cateFilter: [], 
        cateList: require('../temp_json/blog_cates.json'),
        loading: false
    }

    componentDidMount(){
        this.setState(state=>({ loading:true }));

        let intlData_url = sessionStorage.getItem('serverPort')+'specialCollection/getMyPosts/'+sessionStorage.getItem('@userInfo.id');
        fetchData(intlData_url,'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200&&res.data){
                  let authorFilter = [];
                  let cateFilter = [];
                  res.data.list.forEach(post=>{
                      if(authorFilter.map(item=>{return item.value}).indexOf(post.specialCollection.originalCreator.id)===-1){
                          authorFilter.push({ 
                              text: (post.specialCollection.originalCreator.fullname) || 'Unknown', 
                              value: post.specialCollection.originalCreator.id
                          });
                      };
                      {/*}
                      if(cateFilter.map(item=>{return item.value}).indexOf(post.specialCollection.categoryId)===-1){
                          cateFilter.push({ 
                              text: sessionStorage.getItem('lang')==='zh_TW'? this.state.cateList.filter(cate=>{return cate.id===post.specialCollection.categoryId})[0].categoryC:this.state.cateList.filter(cate=>{return cate.id===post.specialCollection.categoryId})[0].category, 
                              value: post.specialCollection.categoryId 
                          });
                      };*/}
                  })
                  this.setState(state=>({ postList: res.data.list, authorFilter: authorFilter, cateFilter: cateFilter, loading: false }));
              } else {
                  this.setState({ postList: [], loading: false });
              };
            }else{
              this.setState(state=>({ loading: false }));
            }
        })
    }

    handleChange = (pagination, filters) => {
        this.setState({ filteredInfo: filters });
    }

    clearFilters = () => {
        this.setState({ filteredInfo: null });
    }

    showDeleteConfirm = (postId) => {
        confirm({
          title: sessionStorage.getItem('lang')==='zh_TW'? '此常用資料刪除後將無法找回，確定刪除?':'You will delete this post and cannot get it back, continue?',
        //   content: 'You will delete this post and cannot get it back, continue?',
          okText: intl.get('@GENERAL.DELETE'),
          okType: 'danger',
          centered: true,
          cancelText: intl.get('@GENERAL.CANCEL'),
          onOk() {
            //const winHref = window.location.href;
            //var postId = winHref.slice(winHref.lastIndexOf("?id=")+4);
            var delpost_url = sessionStorage.getItem('serverPort')+'specialCollection/delete/'+postId;
            // setTimeout(()=>{
                // message.info('Your request for post delete was sent.');
                
                fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                    if(response.ifSuccess){
                      let res = response.result;
                      if(res.status===200){
                          message.success('This post has been deleted successfully. We now turn you back to Home page.', 1);
                          //setTimeout(()=> { window.location.replace('#/specialCollection/myspecialCollection') }, 2000);
                          
                          setTimeout(()=> { window.location.reload(); }, 2000);
                      }else if(res.status===555){
                          message.warning('Sorry, your request was denied by server.');
                      }else{
                          message.error(res.status,": ", res.msg);
                      };
                    }
                })

            // }, 2000);
          },
          onCancel() { 
            // message.info("Delete request cancelled");
          },
        });
    }

    render() {
        let { filteredInfo, loading } = this.state;
        filteredInfo = filteredInfo || {};
        const tableColumns = [{
            title: sessionStorage.getItem('lang')==='zh_TW'? '標題':'Title',      
            key: 'postTitle',
            dataIndex: 'specialCollection.postTitle',
            width: '300px',
            render: (text,record) => (
                // eslint-disable-next-line
                <span><a href={`#/specialCollection/post/modify?id=${record.specialCollection.id}`}>{sessionStorage.getItem('lang')==='zh_TW'? record.specialCollection.postTitleZh:record.specialCollection.postTitle}</a> <Icon type={record.specialCollection.is_public===0? "eye-invisible":""} title={record.specialCollection.is_public===0? "Nonpublic Post":""} /></span>
            ),
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '原作者':'Original Creator',      //------Author
            key: 'originalCreator',
            dataIndex: 'specialCollection.originalCreator.id',
            render: (value,record) => (
                <span>
                    {record.specialCollection.originalCreator.fullname || 'Unknown'}
                </span>
            ),
            width: '200px',
            filters: this.state.authorFilter,
            filteredValue: filteredInfo.originalCreator || null,
            onFilter: (value, record) => record.specialCollection.originalCreator.id===value,
            filterMultiple: true,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '發佈日期':'publish Date',      //------Publish Date
            key: 'publishAt',
            dataIndex: 'specialCollection.publishAt',
            render: item => (
                <span>
                    {(item===undefined? null : moment(item).format('YYYY-MM-DD'))}
                </span>
            ),
            sorter: (a, b) => a.specialCollection.publishAt > b.specialCollection.publishAt? 1 : -1,
            defaultSortOrder: 'descend',
            
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function',      //------Publish Date
            render: record => (
                <div>
                    <a href={`#/specialCollection/post/modify?id=${record.specialCollection.id}`}>
                        <Button className="cate-admin-btn" type="primary">
                            <Icon type="form" />
                        </Button>
                    </a>
                     
                    <Button className="cate-admin-btn" type="danger" onClick={ () => this.showDeleteConfirm(record.specialCollection.id)}>
                        <Icon type="delete" />
                    </Button>    
                </div>
            ),
            sorter: (a, b) => a.specialCollection.createdAt > b.specialCollection.createdAt? 1 : -1,
            defaultSortOrder: 'descend',
            
        }];

        const spinProp = {
            spinning: loading,
            delay: 500,
            tip: 'Loading...'
        };
        const accessMode = getAccessMode();
        const paginprops = {
            size: accessMode===3?"small":"",
            pageSize: 5,
        }

        return(
            <div>
                <div style={{ display: 'inline-block', width: '100%', textAlign: 'right' }}>
                <Button onClick={this.clearFilters} icon="reload" type="primary" style={{ width:100, display: 'block', float: 'right', margin: '8px 0' }}>
                    {intl.get('@MY_BLOG.RESET')}
                </Button>
                </div>

                <Table 
                style={{ msOverflowX: 'scroll', overflowX: 'scroll' }}
                dataSource={this.state.postList} 
                loading={spinProp}
                rowKey={record=>record.specialCollection.id}
                columns={tableColumns}
                pagination={paginprops}
                onChange={this.handleChange}
                />
            </div>
        )
    }
}
