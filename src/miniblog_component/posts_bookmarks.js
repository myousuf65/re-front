//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190522 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Icon, Button, Tag, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';

export default class PostsBookmarks extends React.Component{

    state={
        filteredInfo: null, 
        bookmarkList: [], 
        authorFilter: [], 
        cateFilter: [], 
        cateList: require('../temp_json/blog_cates.json'),
        loading: false
    };

    componentDidMount(){
        this.setState(state=>({ loading: true }))

        let intlData_url = sessionStorage.getItem('serverPort')+'blog/getMyBookmarks/'+sessionStorage.getItem('@userInfo.id');
        fetchData(intlData_url,'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200&&res.data){
                  this.setState({ bookmarkList: res.data.list });
                  let authorFilter = [];
                  let cateFilter = [];
                  // {record.blog.showAsAlias===1? (record.blog.alias||'Unknown'):(sessionStorage.getItem('lang')==='zh_TW'? (record.chinese_name || record.fullname):record.fullname)}
  
                  res.data.list.forEach(post=>{
                      let iAuthor = (post.blog.showAsAlias===1? (post.blog.alias||'Unknown'):(post.blog.originalCreator.fullname));
                      if(authorFilter.map(item=>{return item.value}).indexOf(iAuthor)===-1){
                          authorFilter.push({ 
                              text: iAuthor,
                              value: iAuthor
                          });
                      };
                      if(cateFilter.map(item=>{return item.value}).indexOf(post.blog.categoryId)===-1){
                          cateFilter.push({ 
                              text: sessionStorage.getItem('lang')==='zh_TW'? this.state.cateList.filter(cate=>{return cate.id===post.blog.categoryId})[0].categoryC:this.state.cateList.filter(cate=>{return cate.id===post.blog.categoryId})[0].category, 
                              value: post.blog.categoryId 
                          });
                      };
                  })
                  this.setState({ authorFilter: authorFilter, cateFilter: cateFilter, loading: false });
  
              } else {
                  this.setState({ bookmarkList: require('../temp_json/blog_resPosts.json'), loading: false });
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

    removeBookmark = (postId) => {
        let delBookmark_url = sessionStorage.getItem('serverPort')+'blog/bookmark/delete/?UserRefs='+sessionStorage.getItem('@userInfo.id')+'&PostId='+postId;
        fetchData(delBookmark_url,'post', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  this.setState(state => {
                      const newbookmarkList = state.bookmarkList.slice();
                      const index = state.bookmarkList.map(item=>{return item.id}).indexOf(postId);
                      newbookmarkList.splice(index, 1);
                      return { bookmarkList: newbookmarkList };
                  })
              } else {
                  message.warning('Your request was denied by server');
              };
            }else{
              this.setState(state=>({ loading: false }));
            }
        })
    }

    render() {
        let { filteredInfo, loading } = this.state;
        filteredInfo = filteredInfo || {};

        const tableColumns = [{
            title: sessionStorage.getItem('lang')==='zh_TW'? '標題':'Title',      //------Title
            key: 'postTitle',
            dataIndex: 'blog.postTitle',
            width: '300px',
            render: (text,record) => (
                record.blog.isDeleted===1? 
                <p onClick={()=>message.warning('Sorry, this post is not available anymore.', 2)}>{text}</p>
                :<a href={`#/miniblog/details/?id=${record.blog.id}`}>{text}</a>
            ),
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '作者':'Author',      //------Author
            key: 'originalCreator',
            dataIndex: 'blog.originalCreator',
            render: (value,record) => (
                <span>
                    {record.blog.showAsAlias===1? (record.blog.alias||'Unknown'):(record.blog.originalCreator.fullname)}
                </span>
            ),
            width: '200px',
            filters: this.state.authorFilter,
            filteredValue: filteredInfo.originalCreator || null,
            onFilter: (value, record) => {
                console.log('filter value: ',value);
                if(value==='Unknown'){
                    return record.blog.alias==='';
                }else {
                    return (record.blog.alias===value || record.blog.originalCreator.fullname === value);
                }
            },
            filterMultiple: true,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '類別':'Category',      //------Category
            key: 'categoryId',
            dataIndex: 'blog.categoryId',
            render: category => (
                <Tag color={'volcano'} key={category}>
                {
                    sessionStorage.getItem('lang')==='zh_TW'? 
                    this.state.cateList.filter(cate=>{return cate.id===category})[0].categoryC
                    :this.state.cateList.filter(cate=>{return cate.id===category})[0].category
                }
                </Tag>  
            ),
            filters: this.state.cateFilter,
            filteredValue: filteredInfo.categoryId || null,
            onFilter: (value, record) => record.blog.categoryId===value,
            filterMultiple: true,
        },{
            title: sessionStorage.getItem('lang')==='zh_TW'? '發布日期':'Publish Date',      //------Publish Date
            key: 'publishAt',
            dataIndex: 'blog.publishAt',
            render: item => (
                <span>
                    {(item===undefined? null : moment(item).format('YYYY-MM-DD'))}
                </span>
            ),
            sorter: (a, b) => a.blog.publishAt > b.blog.publishAt? 1 : -1,
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
            // width: 'auto',
            sorter: (a, b) => a.comments > b.comments? 1 : -1,
        }];

        const spinProp = {
            spinning: loading,
            delay: 500,
            tip: 'Loading...'
        }        
        const accessMode = getAccessMode();
        const paginprops = {
            size: accessMode===3?"small":"",
            pageSize: 5
        }
        
        tableColumns.push({
            title: sessionStorage.getItem('lang')==='zh_TW'? '移除':'Remove',
            key: 'remove',
            render:(text, record) =>(
                // eslint-disable-next-line
                <Icon type="delete" onClick={()=>{this.removeBookmark(record.blog.id)}} theme="twoTone" twoToneColor="#f00" title="remove this bookmark" />
            )
        })
        
        return(
            <div>
                <div style={{ display: 'inline-block', width: '100%', textAlign: 'right' }}>
                <Button onClick={this.clearFilters} icon="reload" type="primary" style={{ width:100, display: 'block', float: 'right', margin: '8px 0' }}>
                    {intl.get('@MY_BLOG.RESET')}
                </Button>
                </div>
                <Table 
                style={{ msOverflowX: 'scroll', overflowX: 'scroll' }}
                dataSource={this.state.bookmarkList} 
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
