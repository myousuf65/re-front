//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190521 */
//Comments //***s=]*** 



import React from 'react';
import { Comment, List, Tooltip, Icon, Menu, Dropdown, Modal, message, Avatar } from 'antd';
import moment from 'moment';
import MenuItem from 'antd/lib/menu/MenuItem';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
import { userLevelAvatarLib, userLevelIcons } from '../service/common';
import { throttle, checkImgsByName } from '../resources_component/authimg';

const userIcon = process.env.PUBLIC_URL + '/images/user-icon.png';

const confirm = Modal.confirm;

export default class SelPostComments extends React.Component{

  state = { postId: this.props.postId, commentList: [], totalComments: 0, totalRootComments: 0, likedList : [], currentPage: 1, loading: true };
  
  componentDidMount(){
    this.setState({ postId: this.props.postId });
    this.handlePageChange(1);
    this.props.handleCommentList(this);
    window.addEventListener('scroll', this.onScroll, false);
  }

  onScroll=(fn)=>{
    throttle(checkImgsByName('auth-avatar'));
  }

  componentWillUnmount(){
    window.removeEventListener('scroll', this.onScroll, false);
  }

  handlePageChange = page => {
    this.setState({ currentPage: page, loading: true });

    let postId = this.props.postId;
    let getComnt_url= sessionStorage.getItem('serverPort')+'blog/comment/getComments/'+postId+'?user='+sessionStorage.getItem('@userInfo.id')+'&page='+page;
    fetchData(getComnt_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ 
            commentList: res.data.list,
            totalComments: res.data.total,
            totalRootComments: res.data.total_for_page,
            loading: false
          });
        }else{
          this.setState({loading: false});
        }
      }
    })
  }

  handleCommentList = (type, rootCmnt, cmnt, newCmnt) => {
    this.setState({loading: true});
    if(type==='new'){
      this.handleNewComment(rootCmnt, cmnt);
    }else if(type==='updated'){
      this.handleUpdateComment(rootCmnt, cmnt, newCmnt);
    }
  }

  handleNewComment=(rootCmnt, cmnt)=>{
    // ------add a root comment
    if(rootCmnt===null){
      let newCommentList = this.state.commentList.slice();
        newCommentList.splice(0,0,cmnt);
        this.setState(state => ({ 
          commentList: newCommentList,
          totalComments: (state.totalComments + 1),
          totalRootComments: (state.totalRootComments + 1),
          loading: false,
        }));
    // ------add a subcomment
    }else{
      let newCommentList = this.state.commentList.slice();
      let root_index = newCommentList.indexOf(rootCmnt);
      let newRootCmnt = rootCmnt;
      newRootCmnt.subComments.splice(0,0,cmnt);
      newCommentList.splice(root_index,1,newRootCmnt);
      this.setState(state => ({ 
        commentList: newCommentList,
        totalComments: (state.totalComments + 1),
        loading: false,
      }));
    }
  }

  handleUpdateComment=(rootCmnt, cmnt, newCmnt)=>{

    // ------update a root comment
    if(rootCmnt===null){
      let newCommentList = this.state.commentList.slice();
      let cmnt_index = newCommentList.indexOf(cmnt);
      if (cmnt_index>-1){
        let updatedCmnt = cmnt;
        updatedCmnt.alias = newCmnt.alias;
        updatedCmnt.content = newCmnt.content;
        updatedCmnt.showAsAlias = newCmnt.showAsAlias;

        newCommentList.splice(cmnt_index,1,updatedCmnt);
        this.setState(state => ({ 
          commentList: newCommentList,
          loading: false,
        }));
      }
    // ------update a subcomment
    }else{
      let newCommentList = this.state.commentList.slice();
      let root_index = newCommentList.indexOf(rootCmnt);
      let cmnt_index = rootCmnt.subComments.indexOf(cmnt);
      if (cmnt_index>-1&&root_index>-1){
        let newRootCmnt = rootCmnt;
        let updatedCmnt = cmnt;
        updatedCmnt.alias = newCmnt.alias;
        updatedCmnt.content = newCmnt.content;
        updatedCmnt.showAsAlias = newCmnt.showAsAlias;
        
        newRootCmnt.subComments.splice(cmnt_index,1,updatedCmnt);
        newCommentList.splice(root_index,1,newRootCmnt);
        this.setState(state => ({ 
          commentList: newCommentList,
          loading: false,
        }));
      }
    };
  }

  handleLike=(rootCmnt, cmnt)=>{
    // let postId = this.props.postId;
    let postId = this.state.postId;
    // ------like a comment
    if(cmnt.liked===0){
      let liked_url = sessionStorage.getItem('serverPort')+'blog/like/comment/create/?CreatedBy='+sessionStorage.getItem('@userInfo.id')+'&pkId='+ cmnt.id+'&blogId='+ postId;

      fetchData(liked_url, 'post', null, response=>{})

      if(rootCmnt===null){
        let newCommentList = this.state.commentList.slice();
        let cmnt_index = newCommentList.indexOf(cmnt);
        if (cmnt_index>-1){
          let newCmnt = cmnt;
          newCmnt.likes += 1;
          newCmnt.liked = 1;
          newCommentList.splice(cmnt_index,1,newCmnt);
          this.setState(state => ({ 
            commentList: newCommentList,
          }));
        }
      }else{
        let newCommentList = this.state.commentList.slice();
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
            commentList: newCommentList,
          }));
        }
      };
    }
  }

  handleDelete = (rootCmnt, cmnt) =>{

    let delcmnt_url = sessionStorage.getItem('serverPort')+'blog/comment/delete';
    let delcmnt_data = {commentId:cmnt.id, createdBy: parseInt(sessionStorage.getItem('@userInfo.id'))};

    this.setState({loading: true});
    fetchData(delcmnt_url,'post', delcmnt_data, response=>{
      if(response.ifSuccess){
          message.success('This comment has been deleted successfully.', 1);

          // ------delete a root comment
            if(rootCmnt===null){
              let newCommentList = this.state.commentList.slice();
              let cmnt_index = newCommentList.indexOf(cmnt);
              if (cmnt_index>-1){
                newCommentList.splice(cmnt_index,1);
                this.setState(state => ({ 
                  commentList: newCommentList,
                  totalComments: (state.totalComments - 1),
                  totalRootComments: (state.totalRootComments - 1),
                  loading: false,
                }));
              }
          // ------delete a subcomment
            }else{
              let newCommentList = this.state.commentList.slice();
              let root_index = newCommentList.indexOf(rootCmnt);
              let cmnt_index = rootCmnt.subComments.indexOf(cmnt);
              if (cmnt_index>-1&&root_index>-1){
                let newRootCmnt = rootCmnt;
                newRootCmnt.subComments.splice(cmnt_index,1);
                newCommentList.splice(root_index,1,newRootCmnt);
                this.setState(state => ({ 
                  commentList: newCommentList,
                  totalComments: (state.totalComments - 1),
                  loading: false,
                }));
              }
            }
      }
    })
    
  }

  // -------settings of Delete btn
  showDeleteConfirm = (rootCmnt,cmnt) => {

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

  handleModify=(rootcmnt,cmnt)=>{
    this.props.handleCmntModify(rootcmnt,cmnt);
  }

  handleReplyTo = ( rootCmnt, cmntAuthor) => {
      this.props.showModal(rootCmnt, cmntAuthor);
  }

  handleUserAvatar = ( commentItem )=>{
    let imgPath = commentItem.showAsAlias? commentItem.createdBy.aliasPhoto:commentItem.createdBy.profilePhoto;
    let userLevel = commentItem.createdBy.userScoreLevel||1;

    if(!imgPath || imgPath === "null"){
      imgPath = "default";
    }

    if(userLevelIcons.includes(imgPath)){
      imgPath = `images/profile/${imgPath}.png`;
      return <Avatar size="large" src={imgPath} />
    }
    console.log('user management form , line 259 : user level = ', userLevel);
    console.log('sel post cmnts , line 260 = ',imgPath);
    if(userLevel < 4 && commentItem.usergroup !== 4){
      return <Avatar size="large" src={imgPath || userIcon} />
    }else{
      return <img className="auth-avatar" name="auth-avatar" data-alt="0" data={imgPath} alt="Avatar" src={userIcon} />
    }
  }

  render() {
    const cmntMenu = ((rootcmnt,cmnt)=>
      <Menu>
        {/* eslint-disable-next-line */}
        <MenuItem style={{ fontSize: '12px' }} onClick={()=>this.handleModify(rootcmnt,cmnt)}><Icon type="form" />{intl.get('@MINI_BLOG.MODIFY')}</MenuItem>
        {/* eslint-disable-next-line */}
        <MenuItem style={{ fontSize: '12px' }} onClick={()=>this.showDeleteConfirm(rootcmnt,cmnt)}><Icon type="eye-invisible" />{intl.get('@MINI_BLOG.DELETE')}</MenuItem> 
      </Menu>
    );

    const moreBtn = ((rootcmnt,cmnt)=>
      <span>
        <Dropdown 
          disabled={
            // eslint-disable-next-line. only comment creater can be deleted.
            cmnt.createdBy.id==sessionStorage.getItem('@userInfo.id')? false:true
          } 
          overlay={cmntMenu(rootcmnt,cmnt)}
          placement="bottomLeft"
        >
          <Icon type="ellipsis" />
        </Dropdown>
      </span>
    )

    const paginprops = {
      defaultCurrent: 1,
      current: this.state.currentPage,
      showQuickJumper: true,
      position: 'both',
      size: 'small',
      // hideOnSinglePage: true,
      simple: true,
      pageSize: 5,
      total: this.state.totalRootComments,
      // showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} posts`,
      onChange: this.handlePageChange,
    }

    const { totalComments, commentList, loading } = this.state;

    return(
        <List
        className="comment-list"
        header={ intl.get('@MINI_BLOG.TOTAL-COMMENTS', {comments:(totalComments || 0)}) }
        itemLayout="horizontal"
        loading={loading}
        pagination={paginprops}
        dataSource={commentList}
        renderItem={item => (
          <List.Item>
            <Comment
              key={ item.id }
              style={{ width: '100%' }}
              actions={[
                <span><Icon type="like" onClick={()=>this.handleLike(null,item)} theme={item.liked===1 ? 'filled' : 'outlined'} /> {item.likes} </span>,
                <span onClick={()=>this.handleReplyTo(item, item.createdBy)}><Icon type="message" />{intl.get('@MINI_BLOG.REPLY-TO')}</span>,
                moreBtn(null,item)
              ]}
              author={item.showAsAlias===1? (item.alias||'Unknown'):(item.createdBy.fullname)}
              avatar={this.handleUserAvatar(item)}
              content={<div style={{ color: 'rgba(0,0,0,0.9)', fontFamily: 'Microsoft JhengHei, Segoe UI Emoji' }} dangerouslySetInnerHTML={{ __html: item.content }} />}
              datetime={<Tooltip title={moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')} >{moment(item.createdAt).fromNow()}</Tooltip>}
            > 
              {item.subComments===[] || item.subComments===null? null:item.subComments.map(subcmnt => {
                return <Comment
                        key={subcmnt.id}
                        actions={[
                          <span><Icon type="like" onClick={()=>this.handleLike(item, subcmnt)} theme={subcmnt.liked===1 ? 'filled' : 'outlined'} /> {subcmnt.likes} </span>,
                          <span onClick={()=>this.handleReplyTo(item, subcmnt.createdBy)}><Icon type="message" />{intl.get('@MINI_BLOG.REPLY-TO')}</span>,
                          moreBtn(item, subcmnt)
                        ]}
                        author={subcmnt.showAsAlias===1? (subcmnt.alias||'Unknown'):(subcmnt.createdBy.fullname)}
                        avatar={this.handleUserAvatar(item)}
                        content={<div style={{ color: 'rgba(0,0,0,0.9)', fontFamily: 'Microsoft JhengHei, Segoe UI Emoji' }} dangerouslySetInnerHTML={{ __html: subcmnt.content }} />}
                        datetime={<Tooltip title={moment(subcmnt.createdAt).format('YYYY-MM-DD HH:mm:ss')} >{moment(subcmnt.createdAt).fromNow()}</Tooltip>}
                        />
                })
              }
            </Comment>
          </List.Item>
        )}
      />
    )
  }
}
