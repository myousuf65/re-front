//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190522 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Button, Icon, Tag } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';

export default class PostsMyBlog extends React.Component{

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

        let intlData_url = sessionStorage.getItem('serverPort')+'blog/getMyPosts/'+sessionStorage.getItem('@userInfo.id');
        fetchData(intlData_url,'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200&&res.data){
                  let authorFilter = [];
                  let cateFilter = [];
                  res.data.list.forEach(post=>{
                      if(authorFilter.map(item=>{return item.value}).indexOf(post.blog.originalCreator.id)===-1){
                          authorFilter.push({ 
                              text: (post.blog.originalCreator.fullname) || 'Unknown', 
                              value: post.blog.originalCreator.id
                          });
                      };
                      if(cateFilter.map(item=>{return item.value}).indexOf(post.blog.categoryId)===-1){
                          cateFilter.push({ 
                              text: sessionStorage.getItem('lang')==='zh_TW'? this.state.cateList.filter(cate=>{return cate.id===post.blog.categoryId})[0].categoryC:this.state.cateList.filter(cate=>{return cate.id===post.blog.categoryId})[0].category, 
                              value: post.blog.categoryId 
                          });
                      };
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

    render() {
        let { filteredInfo, loading } = this.state;
        filteredInfo = filteredInfo || {};
        const tableColumns = [{
            title: sessionStorage.getItem('lang')==='zh_TW'? '標題':'Title',      
            key: 'postTitle',
            dataIndex: 'blog.postTitle',
            width: '300px',
            render: (text,record) => (
                // eslint-disable-next-line
                <span><a href={`#/miniblog/details/?id=${record.blog.id}`}>{text}</a> <Icon type={record.blog.is_public===0? "eye-invisible":""} title={record.blog.is_public===0? "Nonpublic Post":""} /></span>
            ),
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '原作者':'Original Creator',      //------Author
            key: 'originalCreator',
            dataIndex: 'blog.originalCreator.id',
            render: (value,record) => (
                <span>
                    {record.blog.originalCreator.fullname || 'Unknown'}
                </span>
            ),
            width: '200px',
            filters: this.state.authorFilter,
            filteredValue: filteredInfo.originalCreator || null,
            onFilter: (value, record) => record.blog.originalCreator.id===value,
            filterMultiple: true,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '類別':'Category',      //------Category
            key: 'categoryId',
            dataIndex: 'blog.categoryId',
            render: category => (
                <Tag color={'volcano'} key={category}>
                {
                    sessionStorage.getItem('lang')==='zh_TW'? 
                    this.state.cateList.filter(cate=>{return cate.id===category;})[0].categoryC
                    :this.state.cateList.filter(cate=>{return cate.id===category;})[0].category
                }
                </Tag>
            ),
            filters: this.state.cateFilter,
            filteredValue: filteredInfo.categoryId || null,
            onFilter: (value, record) => record.blog.categoryId===value,
            filterMultiple: true,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '創建日期':'Create Date',      //------Publish Date
            key: 'createdAt',
            dataIndex: 'blog.createdAt',
            render: item => (
                <span>
                    {(item===undefined? null : moment(item).format('YYYY-MM-DD'))}
                </span>
            ),
            sorter: (a, b) => a.blog.createdAt > b.blog.createdAt? 1 : -1,
            defaultSortOrder: 'descend',
            
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '瀏覽':'Views',      //------Views
            key: 'views',
            dataIndex: 'blog.hit',
            sorter: (a, b) => a.blog.hit > b.blog.hit? 1 : -1,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '讚好':'Likes',      //------Likes
            key: 'likes',
            dataIndex: 'likes',
            sorter: (a, b) => a.likes > b.likes? 1 : -1,
            
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '評論':'Comments',      //------Comments
            key: 'comments',
            dataIndex: 'comments',
            sorter: (a, b) => a.comments > b.comments? 1 : -1,

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
                rowKey={record=>record.blog.id}
                columns={tableColumns}
                pagination={paginprops}
                onChange={this.handleChange}
                />
            </div>
        )
    }
}
