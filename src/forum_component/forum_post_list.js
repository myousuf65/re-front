//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200310 */
//Comments //***s=]*** 


import React from 'react';
import { Icon, message, Pagination, Skeleton, Button } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import categoryArrow from '../images/knowledge-bg-arrow.png';
import { fetchData } from '../service/HelperService';

export default class ForumPostList extends React.Component {
  state={ category: {}, canCreate: 0, subCateList: [], selSubCateId: 0, postList: [], currentPage: 0, totalPosts: 0, loadingCate: true, loadingPost: true };

  componentWillMount(){
    this.getSubId();
  }

  componentDidMount(){
    this.getSubCateList();
    this.getPostList(this.state.selSubCateId, 1);
  }

  getSubId=()=>{
    let selSubCateId = window.location.href.slice(window.location.href.lastIndexOf("?id=")+4);
    this.setState(state=>({ selSubCateId: parseInt(selSubCateId,10) }));
  }

  getSubCateList=()=>{
    let href = window.location.href
    let startIndex = href.lastIndexOf("/postlist")+10;
    let endIndex = href.lastIndexOf("/?id=");
    let selCateId = href.slice(startIndex,endIndex);

    this.setState({loadingCate: true})

    if(parseInt(selCateId,10)>0){

      let getParentCate_url = sessionStorage.getItem('serverPort')+`forum/category/info/${sessionStorage.getItem('@userInfo.id')}/${selCateId}`;
      fetchData(getParentCate_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            this.setState({ category: res.data });
          }else{
            this.setState({ category: {} });
            message.error(res.msg)
          }
        }else{
          this.setState({ category: {} });
        }
      })

      let getSubCategory_url = sessionStorage.getItem('serverPort')+`forum/category/${sessionStorage.getItem('@userInfo.id')}/${selCateId}`;
      fetchData(getSubCategory_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            this.setState(state=>{
              let selCategory = res.data.find(icate=>icate.id === state.selSubCateId);

              console.log('state.selCateId: ', state.selSubCateId)
              console.log('res.data: ', res.data)
              console.log('canCreate: ', selCategory)
              if(selCategory!==undefined){
                return { subCateList: res.data, loadingCate: false, canCreate: selCategory.canCreate||0 }
              }else{
                return { subCateList: res.data, loadingCate: false, canCreate: 0 }
              }
            })

            // this.setState({ subCateList: res.data, loadingCate: false });
          }else{
            this.setState({ subCateList: [], loadingCate: false, canCreate: 0 });
            message.error(res.msg)
          }
        }else{
          this.setState({ subCateList: [], loadingCate: false, canCreate: 0 });
        }
      })
    }else{
      this.setState({ subCateList: [], category: {}, canCreate: 0,  loadingCate: false });
    }
  }

  changeSubId=(newSubId)=>{
    if(newSubId!==this.state.selSubCateId){
      const {subCateList} = this.state;
      var canCreate = 0;
      if(subCateList&&Array.isArray(subCateList)){
        let selCategory = subCateList.find(icate=>icate.id === newSubId);
        canCreate = selCategory.canCreate || 0;
      }
      this.setState({selSubCateId: newSubId, canCreate });
      this.getPostList(newSubId,1);
    }
  }

  preSubCateCard=(subCate)=>{
    return (
      // eslint-disable-next-line
      <div key={subCate.id} className={subCate.id==this.state.selSubCateId? "knowledge-tab-box active":"knowledge-tab-box"} >
        {/* eslint-disable-next-line */}
        <a href={`#/kc/postlist/${this.state.category.id}/?id=${subCate.id}`} onClick={()=>this.changeSubId(subCate.id)} style={subCate.id==this.state.selSubCateId? {color: '#FFF'}:null}>{sessionStorage.getItem('lang')==='zh_TW'? subCate.nameTc:subCate.nameEn}</a>
        <Icon hidden={subCate.showInfo===undefined||subCate.showInfo===1} type="eye-invisible" style={{ color: '#FFF', position: 'absolute', top: 0, right: 0, padding: '6px' }} />
      </div> 
    )
  }
  
  onClickSubCate=(subCateId)=>{
    if(subCateId!==undefined){
      window.location.assign('#/kc/category/'+subCateId);
    }
  }

  // onClickTool=(subCateId)=>{
  //   let getSelCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/get/'+sessionStorage.getItem('@userInfo.id')+'/'+subCateId;
  //   fetchData(getSelCate_url,'get',null,response=>{
  //       if(response.ifSuccess){
  //           let res = response.result;
  //           if(res.status===200&&res.data[0]!==undefined){
  //               this.setState({ selRecord: res.data[0], showInfoForm: true })
  //           }else{
  //               message.error(res.msg);
  //               this.setState({ showInfoForm:false });
  //           }
  //       }else{
  //           message.error('Server denied.');
  //           this.setState({ showInfoForm:false });
  //       }
  //   })
  //   this.setState({ showInfoForm: true })
  // }

  // handleInfoForm = (updates) => {
  //   this.setState({ updating: true })
    
  //   let updateCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/update/'+sessionStorage.getItem('@userInfo.id');
  //   fetchData(updateCate_url,'post',updates,response=>{
  //       if(response.ifSuccess){
  //           let res = response.result;
  //           if(res.status===200){
  //               message.success('Update Successfully!')
  //               this.setState({ updating: false, showInfoForm: false });
  //               this.getForumCate();
  //           }else{
  //               message.error(res.msg);
  //               this.setState({ updating: false });
  //           }
  //       }else{
  //           message.error('Server denied.');
  //           this.setState({ updating: false });
  //       }
  //   })
  // };

  // onCloseInfoForm = () => {
  //   this.setState({ showInfoForm: false, selRecord: {} });
  // }

  getPostList=(selSubCateId, page)=>{

    this.setState({ loadingPost: true });
    let getPostList_url=sessionStorage.getItem('serverPort')+'forum/category/post/'+sessionStorage.getItem('@userInfo.id')+'/?categoryId='+selSubCateId+'&page='+page;
    fetchData(getPostList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ currentPage: res.total===0?0:page, postList: res.data, totalPosts: res.total, loadingPost: false });
        }else{
          message.error(res.msg);
          this.setState({ currentPage: 0, postList: [], totalPosts: 0, loadingPost: false });
        }
      }else{
        this.setState({ currentPage: 0, postList: [], totalPosts: 0, loadingPost: false });
      }
    })
  }

  onChangePage=page=>{
    this.getPostList(this.state.selSubCateId, page);
  }

  prePostCard=(post)=>{
    if(post.order<999){
      return (
        <div key={post.id} className="knowledge-row">
        <div className="container clearfix">
          {/* <div className="topic"><a href={`#/kc/post/details?id=${post.id}`}><b><span><Icon type="pushpin" rotate={-45} title='Pinned' theme="filled" style={{color: '#fd7e14'}} /> [{post.category.nameEn}] </span>{post.title}</b></a></div> */}
          <div className="topic"><a href={`#/kc/post/details?id=${post.id}`}><b><span><Icon type="pushpin" title='Pinned' theme="filled" style={{color: '#fd7e14', paddingRight: '8px'}} /></span>{post.title}</b></a></div>
          <div className="poster-by"><p><b>{post.isAlias? (post.alias||'Unknown'):post.createdBy}</b></p></div>
          <div className="comments"><p><b>{post.comments||0}/{post.hit}</b></p></div>
          {/* <div className="laster-reply"><p><b>{post.lastUpdatedBy===undefined? (post.isAlias? (post.alias||'Unknown'):post.createdBy):post.lastUpdatedBy}<br/>{moment(post.lastUpdatedAt===undefined?post.createdAt:post.lastUpdatedAt).fromNow()}</b></p></div> */}
          <div className="laster-reply"><p><b>{this.handleAuthor(post)}<br/>{moment(post.lastUpdatedAt===undefined?post.createdAt:post.lastUpdatedAt).fromNow()}</b></p></div>
        </div>
      </div>
      )
    }else{
      return (
        <div key={post.id} className="knowledge-row">
        <div className="container clearfix">
          <div className="topic"><a href={`#/kc/post/details?id=${post.id}`}><b>{post.title}</b></a></div>
          <div className="poster-by"><p><b>{post.isAlias? (post.alias||'Unknown'):post.createdBy}</b></p></div>
          <div className="comments"><p><b>{post.comments||0}/{post.hit}</b></p></div>
          {/* <div className="laster-reply"><p><b>{post.lastUpdatedBy===undefined? (post.isAlias? (post.alias||'Unknown'):post.createdBy):post.lastUpdatedBy}<br/>{moment(post.lastUpdatedAt===undefined?post.createdAt:post.lastUpdatedAt).fromNow()}</b></p></div> */}
          <div className="laster-reply"><p><b>{this.handleAuthor(post)}<br/>{moment(post.lastUpdatedAt===undefined?post.createdAt:post.lastUpdatedAt).fromNow()}</b></p></div>
        </div>
      </div>
      )
    }
  }

  handleAuthor=(post)=>{
    const { createdBy, isAlias, alias, lastUpdatedBy } = post;
    
    if(lastUpdatedBy!==undefined){
      if(createdBy===lastUpdatedBy){
        if(isAlias){
          return alias||'Unknown';
        }else{
          return createdBy;
        }
      }else{
        return lastUpdatedBy;
      }
    }else{
      if(isAlias){
        return alias||'Unknown';
      }else{
        return createdBy;
      }
    }
  }

  handleCanCreate=()=>{
    return (
      <div className="container" hidden={this.state.canCreate!==1} style={{ width: '100%', display: 'flex' }}>
        <Button style={{ margin: '0 0 1em auto' }} type="primary" onClick={()=>window.location.assign('#kc/post/new/'+this.state.selSubCateId)}>{intl.get('@FORUM_GENERAL.NEW-POST')}</Button>
      </div>
    )
  }


  render(){
    const {category, subCateList, postList, loadingCate, loadingPost} = this.state;
    return(
      <div>
        <div className="container knowledge-top clearfix">
          <div className="row">
            <div className="col-12">
            <div className="knowledge-left" onClick={()=>window.location.assign('#/kc/home')}>
              <h1>{intl.get('@FORUM_GENERAL.KNOWLEDGE-COCKTAIL')}</h1>
              {/* eslint-disable-next-line */}
              <img src={categoryArrow} className="knowledge-bg-arrow" />
            </div>
            <div className={`knowledge-right knowledge-header-${category.tabStyle!==undefined? category.tabStyle:"color1"}`} onClick={()=>this.onClickSubCate(category.id)}>
              {/* eslint-disable-next-line */}
              <img src={(category.imgUrl!==undefined && category.imgUrl!=='null' && category.imgUrl)? `images/${category.imgUrl}`:""} className="knowledge-category-bg" />
              <h1>{sessionStorage.getItem('lang')==='zh_TW'? category.nameTc:category.nameEn}</h1>
            </div>
            </div>
          </div>
        </div>

        <div className="container">
          <Skeleton loading={loadingCate} title={false} active paragraph={{rows:5}} >
            <div className="row">
              <div className="col-md-12">
              <div className="knowledge-tab-list clearfix">
                {subCateList.length>0? subCateList.map(item=>this.preSubCateCard(item)): null}
              </div>  
              </div>
            </div>
          </Skeleton>
        </div>

        <Skeleton loading={loadingPost} title={false} active paragraph={{rows:5}} >
        {/* <div className="container" style={{backgroud:'rgba(0, 0, 0, 0.45)'}}>
          <h3>Please note that general user CANNOT visit current subcategory and its posts</h3>
        </div> */}

        {this.handleCanCreate()}

        <div className="container">
          <div className="row">
            <div className="col-md-12">
            <div className="knowledge-post-list clearfix">
            <div className="knowledge-row knowledge-header-row">
              <div className="container clearfix">
                <div className="topic"><p><strong>{intl.get('@FORUM_GENERAL.TITLE')}</strong></p></div>
                <div className="poster-by"><p><strong>{intl.get('@FORUM_GENERAL.AUTHOR')}</strong></p></div>
                <div className="comments"><p><strong>{intl.get('@FORUM_GENERAL.R-V')}</strong></p></div>
                <div className="laster-reply"><p><strong>{intl.get('@FORUM_GENERAL.LAST-UPDATE')}</strong></p></div>
              </div>
            </div>

            {postList.length>0? postList.map(post=>this.prePostCard(post)): null}

            <div style={{ marginTop: '20px'}}>
              <Pagination style={{ float: 'right'}} onChange={this.onChangePage} current={this.state.currentPage} total={this.state.totalPosts} pageSize={30} simple />
            </div>

            </div>     
            </div>    
          </div>
        </div>

        {this.handleCanCreate()}

        </Skeleton>

      </div>
    )
  }

}