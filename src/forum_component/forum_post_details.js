//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200115 */
//Comments //***s=]*** 


import React from 'react';
import { Icon, List, message, Avatar, Comment, Tooltip, Modal, Skeleton, Button, Popconfirm, Rate } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import categoryImg from '../images/knowledge-category-bg.png';
import categoryArrow from '../images/knowledge-bg-arrow.png';
import { fetchData } from '../service/HelperService';
import WrappedForumCommentForm from './forum_comment_form';
import './forum_post.css';
import { userLevelAvatarLib, userLevelIcons } from '../service/common';
import { throttle, checkImgsByName } from '../resources_component/authimg';
import ResourceShare from '../resources_component/resources_share';

const confirm = Modal.confirm;
const userIcon = process.env.PUBLIC_URL + '/images/user-icon.png';
const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';

const userInfo = {
  id: parseInt(sessionStorage.getItem('@userInfo.id'),10),
  staffNo: sessionStorage.getItem('@userInfo.staffNo'),
  fullname: sessionStorage.getItem('@userInfo.fullname')
};


export default class ForumPostDetails extends React.Component {
  state={ 
    category: {}, 
    selPostId: null, 
    selCategory: [],
    currentPage: 0,
    selPost: {}, 
    content: '',
    prevPost: {}, 
    nextPost: {}, 
    commentsList: [], 
    totalComments: 0,
    totalRootComments: 0,
    loadingPost: true,
    loadingCmnt: true,
    submitting: false,
    showModal: false, 
    showShareModal: false, 
    averageRating: 0,
    userRating: 0,
  };

  componentWillMount(){
    let hrefId = window.location.href.slice(window.location.href.lastIndexOf("?id=")+4);
    this.setState(state=>({ selPostId: hrefId }));
    // this.getSelPost(hrefId);
    window.addEventListener('scroll', this.onScroll, false);
  }

  onScroll=(fn)=>{
    throttle(checkImgsByName('auth-avatar'));
  }

  componentWillUnmount(){
    window.removeEventListener('scroll', this.onScroll, false);
  }

  componentDidMount(){
    this.getSelPost(this.state.selPostId);
    this.getSelComment(this.state.selPostId, 1);
  }

  getSelPost=(selPostId)=>{
    this.setState({ loadingPost: true });
    // setTimeout(()=>{this.setState({ selPost: tempSelPost, prevPost: undefined||{}, nextPost: tempNextPost, loadingPost: false })}, 2000)
    
    let getSelPost_url = sessionStorage.getItem('serverPort')+'forum/post/details/'+selPostId+'/'+sessionStorage.getItem('@userInfo.id')
    fetchData(getSelPost_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data.post!==undefined){
          let selPost = res.data.post;
          let content = selPost.content;

          if(selPost.hiddenField){
            content += '<p>&nbsp</p><p>&nbsp</p>';
            if(selPost.hiddenField==="0"){
              content += `<p style='color:#fd7e14;font-style:italic;font-weight: bold;'>${intl.get('@FORUM_GENERAL.HIDDEN-FIELD-TIPS')}</p>`;
              content += '<p>&nbsp</p>';
            }else{
              content += selPost.hiddenField;
              content += '<p>&nbsp</p>';
            }
          };

          this.getCateInfo(selPost.category);
          this.getSelCatePath(selPost.category);
          this.handleContentImg(content);
          this.setState({ 
            selPost: selPost, 
            // averageRating: res.data.post.averageRating||0,
            // userRating: res.data.post.userRating||0,
            prevPost: res.data.prePost||{}, 
            nextPost: res.data.nextPost||{}, 
            loadingPost: false 
          });
          
        }else{
          // this.setState({ selPost: {}, averageRating: 0, userRating:0, prevPost: {}, nextPost: {}, loadingPost: false });
          this.setState({ selPost: {}, prevPost: {}, nextPost: {}, loadingPost: false });
          message.error('Sorry, this post is unavailable now. Will redirect to homepage');
          setTimeout(()=>{window.location.assign('#/kc/home')}, 3000);
        }
      }else{
        // this.setState({ selPost: {}, averageRating: 0, userRating:0, prevPost: {}, nextPost: {}, loadingPost: false });
        this.setState({ selPost: {}, prevPost: {}, nextPost: {}, loadingPost: false });
        if(response.result.status!==401&&response.result.status!==440){
          message.error('Sorry, this post is unavailable now. Will redirect to homepage');
          setTimeout(()=>{window.location.assign('#/kc/home')}, 3000);
        }
      }
    })
  }

  getSelComment=(selPostId, selPage)=>{
    this.setState({ loadingCmnt: true });
    // setTimeout(()=>{this.setState({ commentsList: tempCommentList, currentPage: selPage, totalComments: 4, totalRootComments: 6, loadingCmnt: false })}, 3000)

    let getSelCmnt_url = sessionStorage.getItem('serverPort')+'forum/comment/getcomment/'+selPostId+'?user='+sessionStorage.getItem('@userInfo.id')+'&page='+selPage;
    fetchData(getSelCmnt_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ commentsList: res.data.list||[], currentPage: selPage, totalRootComments: res.data.total_for_page, loadingCmnt: false });
        }else{
          this.setState({ commentsList: [], currentPage: 0, totalRootComments: 0, loadingCmnt: false });
        }
      }else{
        this.setState({ commentsList: [], currentPage: 0, totalRootComments: 0, loadingCmnt: false });
      }
    })
  }

  handlePageChange = page => {
    this.getSelComment(this.state.selPostId, page);
  }

  getSelCatePath=(selCate)=>{
    let getSelPost_url = sessionStorage.getItem('serverPort')+'forum/category/family/'+sessionStorage.getItem('@userInfo.id')+'/'+selCate.id;
    fetchData(getSelPost_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
            this.setState({ selCategory: res.data });
        }else{
            this.setState({ selCategory: [] });
        }
      }else{
        this.setState({ selCategory: [] });
      }
    })
  }

  handleUserAvatar = ( commentItem )=>{
    let imgPath = commentItem.showAsAlias? commentItem.createdBy.aliasPhoto:commentItem.createdBy.profilePhoto;
    let userLevel = commentItem.createdBy.userScoreLevel||1;
    let imgBorder = userLevelAvatarLib.find(l => l.level === userLevel).style;

    if(!imgPath || imgPath === "null"){
      imgPath = "default";
    }

    if(userLevelIcons.includes(imgPath)){
      imgPath = `images/profile/${imgPath}.png`;
      return <Avatar size="large" style={imgBorder} src={imgPath} />
    }

    if(userLevel < 4 && commentItem.usergroup !== 4){
      return <Avatar size="large" style={imgBorder} src={imgPath || userIcon} />
    }else{
      return <img className="auth-avatar" style={imgBorder} name="auth-avatar" data-alt="0" data={imgPath} alt="Avatar" src={userIcon} />
    }
  }

  onClickSubCate=(subCate)=>{
    const {selCategory} = this.state;
    if(selCategory!==undefined&&selCategory!==null){
      if(selCategory.length>1){
        window.location.assign('#/kc/postlist/'+selCategory[0].id+'/?id='+selCategory[1].id);
      }else if(selCategory.length>0){
        window.location.assign('#/kc/category/'+selCategory[0].id);
      }else{
        window.location.assign('#/kc/home');
      }
    }else{
      window.location.assign('#/kc/home');
    };
  }

  handleReadOnly=()=>{
    if(this.state.selPost.allowComment!==undefined){
      if(this.state.selPost.allowComment===0&&this.state.commentsList.length>0){
        const { commentsList, selPost, loadingCmnt } = this.state;
        const paginprops = {
          defaultCurrent: 1,
          current: this.state.currentPage,
          showQuickJumper: true,
          position: 'bottom',
          size: 'small',
          simple: true,
          pageSize: 20,
          total: this.state.totalRootComments,
          onChange: this.handlePageChange,
        }
        return(
          <List
            className="comment-list"
            style={{ margin: '20px 0' }}
            itemLayout="horizontal"
            pagination={paginprops}
            loading={loadingCmnt}
            dataSource={commentsList}
            renderItem={(item,index) => (
              <List.Item className="knowledge-post-reply clearfix">
                <Comment
                  key={ item.id }
                  style={{ width: '100%', padding: '0 15px' }}
                  actions={[
                    // <span><Icon type="like" onClick={()=>this.handleLike(null,item)} theme={item.liked===1 ? 'filled' : 'outlined'} /> {item.likes} </span>,
                    <span onClick={()=>this.handleReplyTo(item)}><Icon type="bulb" />{intl.get('@MINI_BLOG.REPLY-TO')}</span>,
                    // eslint-disable-next-line
                    <span hidden={sessionStorage.getItem('@userInfo.id')!=item.user.id&&selPost.canEdit<1} onClick={()=>this.showDeleteConfirm(null,item)}><Icon type="delete" />{intl.get('@MINI_BLOG.DELETE')}</span>,
                    // moreBtn(null,item)
                  ]}
                  author={`#${(this.state.currentPage-1)*paginprops.pageSize+index+1} ${item.showAsAlias? (item.alias||'Unknown'):(item.user.fullname)}`}
                  // avatar={<Avatar size="large" src={userIcon}></Avatar>}
                  avatar={this.handleUserAvatar(item)}
                  content={<div className="knowledge-reply-content" dangerouslySetInnerHTML={{ __html: item.content }} />}
                  datetime={<Tooltip title={moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')} >{moment(item.createdAt).fromNow()}</Tooltip>}
                > 
                  {item.subComments===[] || item.subComments===null? null:item.subComments.map(subcmnt => {
                    return <Comment
                            style={{ borderTop: '1px solid #15664c' }}
                            key={subcmnt.id}
                            actions={[
                              // <span><Icon type="like" onClick={()=>this.handleLike(item, subcmnt)} theme={subcmnt.liked===1 ? 'filled' : 'outlined'} /> {subcmnt.likes} </span>,
                              // <span hidden={selPost.allowComment<1} onClick={()=>this.handleReplyTo(item)}><Icon type="bulb" />{intl.get('@MINI_BLOG.REPLY-TO')}</span>,
                              // eslint-disable-next-line
                              <span hidden={sessionStorage.getItem('@userInfo.id')!=subcmnt.user.id&&selPost.canEdit<1} onClick={()=>this.showDeleteConfirm(item,subcmnt)}><Icon type="delete" />{intl.get('@MINI_BLOG.DELETE')}</span>,
                              // moreBtn(item, subcmnt)
                            ]}
                            author={subcmnt.showAsAlias? (subcmnt.alias||'Unknown'):(subcmnt.user.fullname)}
                            // avatar={<Avatar size="large" src={userIcon}></Avatar>}
                            avatar={this.handleUserAvatar(item)}
                            content={<div className="knowledge-reply-content" style={{ color: 'rgba(0,0,0,0.9)'}} dangerouslySetInnerHTML={{ __html: subcmnt.content }} />}
                            datetime={<Tooltip title={moment(subcmnt.createdAt).format('YYYY-MM-DD HH:mm:ss')} >{moment(subcmnt.createdAt).fromNow()}</Tooltip>}
                            />
                    })
                  }
                </Comment>
                {/* <span style={{ padding: '0 30px 0 15px' }}>{(this.state.currentPage-1)*5+index+1}F</span> */}
              </List.Item>
              )}
            />
        )
      }
    }
  }

  handleContentImg=(content)=>{
    var postContent = document.createElement('div');
    postContent.innerHTML = content;
    var imgArr = postContent.querySelectorAll( 'img' );

    if(imgArr.length<1){ this.setState({ content }); return };

    imgArr.forEach((img)=>{ img.src = loadingImg; });
    content = postContent.innerHTML;

    this.setState({ content });

    var thisComponent = this;
    var blobCount = 0;
    imgArr.forEach((img)=>{
      if(img.alt){
        let url = sessionStorage.getItem('serverPort') + img.alt;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'blob';
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadend = function () {
          blobCount = blobCount + 1;
          if(blobCount===imgArr.length){
            thisComponent.setState({ content: postContent.innerHTML });
          }
        }

        request.onreadystatechange = function () {
          if (request.readyState ===4 && request.status === 200) {
            img.src = URL.createObjectURL(request.response);
          }else if (request.readyState ===4 && request.status !== 200) {
            img.src = brokenImg;
          }
        };

        request.send(null);
      }
    })
  }

  handleContentLink=(content)=>{
    var blogContent = document.createElement('div');
    blogContent.innerHTML = content;
    var linkArr = blogContent.querySelectorAll( 'a');

    if(linkArr.length<1){
        return content;
    }

    linkArr.forEach((link)=>{
        var thisHref = link.getAttribute('href');
        var newHref = thisHref;

        if(sessionStorage.getItem('accessChannel')==="1"){
            if(thisHref.startsWith('https://kms.csd.gov.hk/')){
                newHref = thisHref.replace('https://kms.csd.gov.hk/','https://dsp.csd.hksarg/kms/');
            }
            if(thisHref.startsWith('https://kmst.csd.gov.hk/')){
                newHref = thisHref.replace('https://kmst.csd.gov.hk/','https://dsp.csd.hksarg/kmsuat/');
            }

        }  
        else{ 
            if(thisHref.startsWith('https://dsp.csd.hksarg/kms/')){
                newHref = thisHref.replace('https://dsp.csd.hksarg/kms/','https://kms.csd.gov.hk/');
            }
            if(thisHref.startsWith('https://dsptest.csd.ccgo.hksarg/kmsuat/')){
                newHref = thisHref.replace('https://dsptest.csd.ccgo.hksarg/kmsuat/','https://kmst.csd.gov.hk/');
            }

        }
        link.setAttribute('href', newHref);
    })

    return blogContent.innerHTML
    
  } 

  prePostCard=()=>{
    // const { selPost, content, userRating, averageRating } = this.state;
    const { selPost, content } = this.state;

    if(selPost.id!==undefined){
      return (            
        // <div className="knowledge-post-details clearfix" hidden={currentPage>1}>
        <div className="knowledge-post-details clearfix">
        <div className="knowledge-post-header clearfix">
          
            <div className="user-icon"><Avatar size="large" src={userIcon}></Avatar></div>
            <div className="knowledge-post-topic">
              <p className="post-name">{selPost.title}</p>
              <p className="post-date">{intl.get('@FORUM_GENERAL.CREATED-AT')} {moment(selPost.createdAt).format('YYYY-MM-DD HH:mm:ss')} / {selPost.isAlias===1? (selPost.alias||'Unknown'):selPost.createdBy}</p>
            </div>
            {/* eslint-disable-next-line */}
            {selPost.allowComment===0? <a onClick={()=>this.handleReplyTo(null)} className="btn-post-reply">{intl.get('@FORUM_GENERAL.REPLY')}</a>:null}
        </div>
        <div id="forum-post-details" className="knowledge-post-content">
          <div dangerouslySetInnerHTML={{ __html: this.handleContentLink(content) }} />
        </div>

        {/* <Button style={{ marginRight: '4px' }}>Reply</Button> */}
        {/* <Button style={{ marginRight: '4px' }}>{intl.get('@REPORTS_BLOG_SUM.LIKES')}</Button> */}

        <div className="forum-share-rate">
          <div className="left">
            <img style={{cursor:"pointer"}} src={tempShare} onClick={()=>this.setState({ showShareModal: true })} alt="Share with Others" />
          </div>
          {/* <div className="right">
            <Rate onChange={this.handleRating} style={{ fontSize: "1.6em" }} value={userRating} />
            <span>{intl.get("@RESOURCES_DETAILS.YOUR-RATING")}{userRating} | {intl.get("@RESOURCES_DETAILS.AVERAGE-RATING")}( {averageRating} / 5 )</span>
            <span class="rate-mobile">{intl.get("@RESOURCES_DETAILS.AVERAGE-RATING-MOBILE")}{averageRating} / 5</span>
          </div> */}
        </div>

        <div hidden={sessionStorage.getItem('@userInfo.fullname')!==selPost.createdBy && selPost.canEdit<1 }>
        <Button style={{ marginRight: '4px' }} type="primary" onClick={()=>window.location.assign('#/kc/post/modify/'+selPost.id)}>{intl.get('@GENERAL.EDIT')}</Button>
        <Popconfirm 
        title={sessionStorage.getItem('lang')==='zh_TW'? '此帖刪除後將無法找回，確定刪除?':'You will delete this post and cannot get it back, continue?'}
        onConfirm={this.handlePostDelete}
        okText={intl.get('@GENERAL.YES')}
        cancelText={intl.get('@GENERAL.CANCEL')}
        >
          <Button style={{ marginRight: '4px' }} type='danger'>{intl.get('@GENERAL.DELETE')}</Button>
        </Popconfirm>
        </div>
        </div>
        )
    }else{
      return <Skeleton avatar paragraph={{ rows: 4 }} active />
    }

  }

  // handleRating=value=>{
  //   if(!value){
  //       message.warning("Invalid Rating");
  //       return;
  //   }

  //   const oldRate = this.state.userRating;
  //   this.setState({ userRating: value });
  //   var updateRate = {
  //       resourceId: Number(this.state.selPost.id),
  //       rating: value,
  //   }

  //   let postRate_url = sessionStorage.getItem('serverPort')+'forum/rating/'+sessionStorage.getItem('@userInfo.id');
  //   fetchData(postRate_url, 'post', updateRate, response=>{
  //       let res = response.result;
  //       if(response.ifSuccess&&res.status===200&&res.data&&Number(res.data)===res.data){
  //           this.setState({ averageRating: res.data });
  //       }else{
  //           this.setState({ userRating: oldRate });
  //           message.warning("Failed to rate. Please try it later.");
  //       }
  //   })
  // }

  handlePostDelete=(e)=>{
    this.setState({loadingPost: true})
    let delSelPost_url = sessionStorage.getItem('serverPort')+'forum/post/delete/'+this.state.selPost.id+'/'+sessionStorage.getItem('@userInfo.id')
    fetchData(delSelPost_url, 'post', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('Delete successfully.')
          window.location.assign('#/kc/home')
          this.setState({ selPost: {}, averageRating: 0, userRating:0, prevPost: {}, nextPost: {} });
        }else{
          message.error('Sorry, you cannot delete this post.');
          this.setState({ loadingPost: false });
          setTimeout(()=>{window.location.assign('#/kc/home')}, 3000);
        }
      }else{
        message.error('Sorry, your request was denied by server.');
        this.setState({ loadingPost: false });
      }
    })
  }

  preRelatedPost=(type)=>{
    const {prevPost, nextPost} = this.state;
    if(type==='previous'&&prevPost.id!==undefined){
      return(
        <div className="prev-post">
            <p>{intl.get('@FORUM_GENERAL.PRE-POST')} &nbsp;&nbsp;<a href={`#/kc/post/details?id=${prevPost.id}`} className="title">{prevPost.title}</a></p>
        </div>
      )
    }else if(type==='next'&&nextPost.id!==undefined){
      return(
        <div className="next-post">
            <p>{intl.get('@FORUM_GENERAL.NEXT-POST')} &nbsp;&nbsp;<a href={`#/kc/post/details?id=${nextPost.id}`} className="title">{nextPost.title}</a></p>
        </div>
      )
    }
  }

  handleReplyTo=(selComment)=>{
    this.setState({ showModal: true, selComment })
  }

  handleCancel=(e)=>{
    this.setState({ showModal: false });
  }

  handleCmntSubmit=(values)=>{
    this.setState({ submitting: true });
    // setTimeout(()=>{
    //   this.addNewComment(this.state.selComment, tempNewCmnt);
    //   this.setState({ submitting: false, showModal: false });
    // },2000)
    let createCmnt_url = sessionStorage.getItem('serverPort')+'forum/comment/new/'+sessionStorage.getItem('@userInfo.id');
    fetchData(createCmnt_url, 'post', values, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success("Comment created.")
          var resData = res.data;
          resData.user = userInfo;
          resData.subComments = [];
          if(values.isReply2Cmnt===1){
            this.addNewComment(null, resData);
          }else{
            this.addNewComment(this.state.selComment, resData);
          }
          this.setState({ submitting: false, showModal: false });
        }else{
          this.setState({ submitting: false });
        }
      }else{
        this.setState({ submitting: false });
      };

      if(this.state.selPost&&this.state.selPost.hiddenField==="0"){
        this.getSelPost(this.state.selPostId);
        console.log('check if show hidden content after creating');
      }

    })
  }

  addNewComment=(rootCmnt, cmnt)=>{
    this.setState({ loadingCmnt: true});
    if(rootCmnt===null){
      let newCommentList = this.state.commentsList.slice();
        // newCommentList.splice(0,0,cmnt);
        newCommentList.push(cmnt);
        this.setState(state => ({ 
          commentsList: newCommentList,
          totalComments: (state.totalComments + 1),
          totalRootComments: (state.totalRootComments + 1),
          loadingCmnt: false,
        }));
    // ------add a subcomment
    }else{
      let newCommentList = this.state.commentsList.slice();
      let root_index = newCommentList.indexOf(rootCmnt);
      let newRootCmnt = rootCmnt;
      // newRootCmnt.subComments.splice(-1,0,cmnt);
      newRootCmnt.subComments.push(cmnt);
      newCommentList.splice(root_index,1,newRootCmnt);
      this.setState(state => ({ 
        commentsList: newCommentList,
        totalComments: (state.totalComments + 1),
        loadingCmnt: false,
      }));
    }
  }

  handleDelete = (rootCmnt, cmnt) =>{
    this.setState({loadingCmnt: true});

    let delcmnt_url = sessionStorage.getItem('serverPort')+'forum/comment/delete/'+cmnt.id+'/'+sessionStorage.getItem('@userInfo.id');
    fetchData(delcmnt_url, 'post', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('This comment has been deleted successfully.', 1);

            // ------delete a root comment
              if(rootCmnt===null){
                let newCommentList = this.state.commentsList.slice();
                let cmnt_index = newCommentList.indexOf(cmnt);
                if (cmnt_index>-1){
                  console.log('cmnt_index: ',cmnt_index);
                  newCommentList.splice(cmnt_index,1);
                  this.setState(state => ({ 
                    commentsList: newCommentList,
                    totalComments: (state.totalComments - 1),
                    totalRootComments: (state.totalRootComments - 1),
                    loadingCmnt: false,
                  }));
                }
            // ------delete a subcomment
              }else{
                let newCommentList = this.state.commentsList.slice();
                let root_index = newCommentList.indexOf(rootCmnt);
                let cmnt_index = rootCmnt.subComments.indexOf(cmnt);
                if (cmnt_index>-1&&root_index>-1){
                  let newRootCmnt = rootCmnt;
                  console.log('cmnt_index: ',cmnt_index);
                  console.log('root_index: ',root_index);
                  newRootCmnt.subComments.splice(cmnt_index,1);
                  newCommentList.splice(root_index,1,newRootCmnt);
                  this.setState(state => ({ 
                    commentsList: newCommentList,
                    totalComments: (state.totalComments - 1),
                    loadingCmnt: false,
                  }));
                }
              }
          
        }else{
          
          this.setState({ loadingCmnt: false });
        }
      }else{
        this.setState({ loadingCmnt: false });
      }

      if(this.state.selPost&&this.state.selPost.hiddenField&&this.state.selPost.hiddenField!=="0"){
        this.getSelPost(this.state.selPostId);
        console.log('check if show hidden content after deleting');
      }
    })
  }

  // -------settings of Delete btn
  showDeleteConfirm = (rootCmnt,cmnt) => {
    // console.log('commentsList: ', this.state.commentsList);

    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此條評論將被永久刪除，確定繼續嗎？':'You will delete this comment and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: () => this.handleDelete(rootCmnt,cmnt),
      
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
  }


  handleLike=(rootCmnt, cmnt)=>{
    let postId = this.state.postId;
    // ------like a comment
    if(cmnt.liked===0){
      let liked_url = sessionStorage.getItem('serverPort')+'forum/like/comment/create/?CreatedBy='+sessionStorage.getItem('@userInfo.id')+'&pkId='+ cmnt.id+'&postId='+ postId;

      fetchData(liked_url, 'post', null, response=>{})

      if(rootCmnt===null){
        let newCommentList = this.state.commentsList.slice();
        let cmnt_index = newCommentList.indexOf(cmnt);
        if (cmnt_index>-1){
          let newCmnt = cmnt;
          newCmnt.likes += 1;
          newCmnt.liked = 1;
          newCommentList.splice(cmnt_index,1,newCmnt);
          this.setState(state => ({ 
            commentsList: newCommentList,
          }));
        }
      }else{
        let newCommentList = this.state.commentsList.slice();
        let root_index = newCommentList.indexOf(rootCmnt);
        let cmnt_index = rootCmnt.subComments.indexOf(cmnt);
        if (cmnt_index>-1&&root_index>-1){
          let newRootCmnt = rootCmnt;
          let newCmnt = cmnt;
          newCmnt.likes += 1;
          newCmnt.liked = 1;
          newRootCmnt.subComments.splice(cmnt_index,1,newCmnt);
          newCommentList.splice(root_index,1,newRootCmnt);
          this.setState(state => ({ 
            commentsList: newCommentList,
          }));
        }
      };
    }
  }

  getCateInfo=(selCate)=>{
    if(typeof selCate === 'object' && selCate !== null){
      let getCateInfo_url = sessionStorage.getItem('serverPort')+`forum/category/info/${sessionStorage.getItem('@userInfo.id')}/${selCate.id}`;
      fetchData(getCateInfo_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            this.setState({ category: res.data })
          }
        }
      })
    }
  }

  handleClose = () => {
    this.setState({ showShareModal: false })
  }

  render(){
    const {selPost, showModal, selPostId, category, showShareModal} = this.state;
    
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
            <div className="knowledge-right knowledge-header-color1" onClick={()=>this.onClickSubCate(selPost.category)}>
              {/* eslint-disable-next-line */}
              <img src={categoryImg} className="knowledge-category-bg" style={{ opacity: 1 }} />
              <h1>{selPost.category===undefined? null:(sessionStorage.getItem('lang')==='zh_TW'? category.nameTc:category.nameEn)}</h1>
            </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-md-12">


            <div className="knowledge-post-bg clearfix">

              {this.prePostCard()}

              {this.handleReadOnly()}

            </div>
            {this.preRelatedPost('previous')}
            {this.preRelatedPost('next')}
            {/* <a href="knowledge-cocktail-post.html" className="btn-post-back">返回上頁</a> */}
            </div>   
          </div>
          <Modal
          title="Reply"
          // bodyStyle={{ height: '60%' }}
          destroyOnClose
          centered
          width='80%'
          visible={showModal}
          maskClosable={false}
          footer={null}
          onCancel={this.handleCancel}
          // onOk={this.handleCmntSubmit}
          >
            <WrappedForumCommentForm postId={selPostId} rootCmnt={this.state.selComment} handleCmntSubmit={this.handleCmntSubmit} handleCancel={this.handleCancel} submitting={this.state.submitting}/>
          </Modal>

          <Modal
            title={`${intl.get("@GENERAL.SHARE")} ${selPost.title}`}
            bodyStyle={{ maxHeight: '80vh', overflow: 'auto' }}
            width="75vw"
            visible={showShareModal}
            destroyOnClose
            footer={null}
            maskClosable={false}
            centered
            onCancel={this.handleClose}
          >
            <ResourceShare resourceType="KnowledgeCocktail" resourceId={selPost.id} handleClose={this.handleClose} />
          </Modal>
      </div>

      </div>
    )
  }

}