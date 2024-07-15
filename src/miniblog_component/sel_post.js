//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190612 */
//Comments //***s=]*** 



import React from 'react';
import { List, Icon, Avatar, Divider, Dropdown, Menu, Tag, Button, message, Modal } from 'antd';
import { Link } from "react-router-dom";
import moment from 'moment';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
import ResourceShare from '../resources_component/resources_share';
import './sel_post.css';

import ReactPlayer from 'react-player';
import { detect } from 'detect-browser';
const browser = detect();

const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';
const userIcon = process.env.PUBLIC_URL + '/images/user-icon.png';

const IconText = ({ type, text }) => (
    <span>
      <Icon type={type} theme="twoTone" style={{ marginRight: 8 }} />
      {text}
    </span>
)
 
const confirm = Modal.confirm;

export default class SelPost extends React.Component{
    
    state = { selPost: {}, showModal: false, is_bookmarked: 0, likes: 0, liked: 0, is_liked: 0, comments: 0, tagList: [], cateList: require('../temp_json/blog_cates.json'), playing: false, videoLink: ""};
    
    componentWillReceiveProps(nextProps){
        this.setState(state=>({ loading: true }));

        if(nextProps.selPost !== null && nextProps.selPost !== undefined){
            
            this.setState(state=>({ 
                is_liked: nextProps.selPost.is_liked,
                commnets: nextProps.selPost.comments,
                likes: nextProps.selPost.likes,
                is_bookmarked: nextProps.selPost.is_bookmarked,
                tagList: nextProps.selPost.tagList? [...new Set(nextProps.selPost.tagList)]:[],
                loading: false,
                videoLink : nextProps.selPost.blog.postVideoLink
            }))

            if(nextProps.selPost.blog !== this.state.selPost){
                this.handleContentImg(nextProps.selPost.blog);
            }
        };

        if(nextProps.fileList && nextProps.fileList !== this.props.fileList ){
            this.handleGalleryList(nextProps.fileList, nextProps.selPost.blog)
        }
    }

    handleContentImg=(selPost)=> {
        var blogContent = document.createElement('div');
        blogContent.innerHTML = selPost.content;
        var imgArr = blogContent.querySelectorAll('img');

        if(imgArr.length<1){
            this.setState({ selPost, loading: false });
            return;
        }

        imgArr.forEach((img)=>{
            var imgOriginSrc = img.src;
            var imgOriginAlt = img.alt;

            if(!imgOriginAlt.startsWith('resources/')&&imgOriginSrc){
                if(imgOriginSrc.startsWith('https://dsp.csd.hksarg/kms/api/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('kms/api/')+8));
                }else if(imgOriginSrc.startsWith('https://kms.csd.gov.hk/api/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('hk/api/')+7));
                }else if(imgOriginSrc.startsWith('api/resources/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('api/')+4));
                }else if(imgOriginSrc.startsWith('https://dsp.csd.hksarg/csdkms3/kms2/filestore2/forum/')){
                    // handle those content img linking to old kms3
                    let imgId = imgOriginSrc.lastIndexOf("/");
                    if(imgId>-1&&selPost.originalCreator){
                        let newKMSImg = `resources/${selPost.originalCreator.id}/${selPost.id}/${imgOriginSrc.slice(imgId+1)}`;
                        img.setAttribute('alt', newKMSImg);
                    };
                }
            }

            img.src = loadingImg;
        });

        selPost.content = blogContent.innerHTML;

        this.setState({ selPost }, ()=>{ this.handleGalleryList(this.props.fileList, selPost); });
        
    }

    handleContentLink=(content)=>{
        var blogContent = document.createElement('div');
        blogContent.innerHTML = content;
        var linkArr = blogContent.querySelectorAll('a');

        if(linkArr.length<1){
            return content;
        }

        linkArr.forEach((link)=>{
            var thisHref = link.getAttribute('href');
            var newHref = thisHref;
            
            if(thisHref){
                if(sessionStorage.getItem('accessChannel')==="1"){
                    if(thisHref.startsWith('https://kms.csd.gov.hk/')){
                        newHref = thisHref.replace('https://kms.csd.gov.hk/','https://dsp.csd.hksarg/kms/');
                    }
                    if(thisHref.startsWith('https://kmst.csd.gov.hk/')){
                        newHref = thisHref.replace('https://kmst.csd.gov.hk/','https://dsp.csd.hksarg/kmsuat/');
                    }
                   
                }else{
                    if(thisHref.startsWith('https://dsp.csd.hksarg/kms/')){
                        newHref = thisHref.replace('https://dsp.csd.hksarg/kms/','https://kms.csd.gov.hk/');
                    }
                    if(thisHref.startsWith('https://dsp.csd.hksarg/kmsuat/')){
                        newHref = thisHref.replace('https://dsp.csd.hksarg/kmsuat/','https://kmst.csd.gov.hk/');
                    }
                }
                link.setAttribute('href', newHref);
            }
        })

        return blogContent.innerHTML
        
    }

    handleGalleryList = (galleryList, selPost) => {
        var blog = document.createElement('div');
        blog.innerHTML = selPost.content;
        var imgArr = blog.querySelectorAll( 'img' );

        imgArr.forEach(img=>{
            let match = galleryList.find(iBlob=>iBlob.ofilename===img.getAttribute('alt'));
            if(match){
                img.src = match.src;
            }else{
                img.src = brokenImg;
            }
        })

        selPost.content = blog.innerHTML;
        this.setState({ selPost, loading: false });
    }

    onClickBookmark = () => {
        var bookmark_url = sessionStorage.getItem('serverPort')+'blog/bookmark/';
        if(this.state.is_bookmarked===0){
            this.setState(state=>({ is_bookmarked: 1 }));
            bookmark_url += 'create/?UserRefs='+sessionStorage.getItem('@userInfo.id')+'&PostId='+this.state.selPost.id;
            fetchData(bookmark_url,'post',null,response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success("Bookmark Added",0.5);                    
                  } else {
                      message.warning("Your request was denied by server.");
                  };
                }
            });
        }else{
            this.setState(state => ({ is_bookmarked: 0 }));
            bookmark_url += 'delete/?UserRefs='+sessionStorage.getItem('@userInfo.id')+'&PostId='+this.state.selPost.id;
            fetchData(bookmark_url,'post',null,response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success("Bookmark Removed",0.5);
                  } else {
                      message.warning("Your request was denied by server.");
                  };
                }
            });
        };
    };

    onClickLike = () => {
        var like_url = sessionStorage.getItem('serverPort')+'blog/like/';

        if(this.state.is_liked===0){
            like_url += 'create/?CreatedBy='+sessionStorage.getItem('@userInfo.id')+'&pkId='+this.state.selPost.id;            
            fetchData(like_url, 'post', null, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success("Liked", 1);
                      this.props.handleScoring(res.score);
                      this.setState({ is_liked: 1, liked: this.state.liked===0? 1:0 });
                  } else {
                      message.warning("Your request was denied by server.");
                  };
                }
            });
            
        // }else{
        //     this.setState({ is_liked: 0, liked: this.state.liked===0? -1:0 });
            // like_url += 'delete/?CreatedBy='+sessionStorage.getItem('@userInfo.id')+'&pkId='+this.state.selPost.id;
            // fetchData(like_url,'post',null,response=>{
            //     if(response.ifSuccess){
            //       let res = response.result;
            //       if(res.status===200){
            //           message.success("Unliked",1);                    
            //       } else {
            //           message.warning("Your request was denied by server.");
            //       };
            //     }
            // });            
        };
    };


    // -------settings of Delete btn
    showDeleteConfirm = () => {
        confirm({
          title: sessionStorage.getItem('lang')==='zh_TW'? '此博客刪除後將無法找回，確定刪除?':'You will delete this post and cannot get it back, continue?',
        //   content: 'You will delete this post and cannot get it back, continue?',
          okText: intl.get('@GENERAL.DELETE'),
          okType: 'danger',
          centered: true,
          cancelText: intl.get('@GENERAL.CANCEL'),
          onOk() {
            const winHref = window.location.href;
            var postId = winHref.slice(winHref.lastIndexOf("?id=")+4);
            var delpost_url = sessionStorage.getItem('serverPort')+'blog/delete/'+postId;
            // setTimeout(()=>{
                // message.info('Your request for post delete was sent.');
                
                fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                    if(response.ifSuccess){
                      let res = response.result;
                      if(res.status===200){
                          message.success('This post has been deleted successfully. We now turn you back to Home page.', 1);
                          setTimeout(()=> { window.location.replace('#/miniblog/home') }, 2000);
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

    handleClose = () => {
        this.setState({ showModal: false })
    }

    handleOnReady=()=>{
        setTimeout(() => this.setState({ playing: true }), 100);
    }


    render() {
        const { categoryId, content, hit, postTitle } = this.state.selPost;
        const { cateList, tagList, is_bookmarked, is_liked, likes, liked, showModal, selPost, playing, videoLink} = this.state;
 
        const authorMenu = (
            <Menu>
              <Menu.Item key="1" >
                <Link to={`/miniblog/post/modify?id=${window.location.href.slice(window.location.href.lastIndexOf("?id=")+4)}`}>
                <Icon type="form" /> {intl.get('@MINI_BLOG.MODIFY')}
                </Link>
              </Menu.Item>
              <Menu.Item key="2" onClick={this.showDeleteConfirm}>
                <div>
                <Icon type="eye-invisible" /> {intl.get('@MINI_BLOG.DELETE')}
                </div>
              </Menu.Item>
            </Menu>
          );
          
        return(
            <div>
                {/* ***s=]*** Show basic info. for selected post within a ListItem */}
                <List
                    itemLayout="vertical"
                    size="middle"
                    header={categoryId===undefined? 
                        null : 
                        <Tag key="category" style={{ padding:4, fontSize:16 }} color="cyan" >
                            { sessionStorage.getItem('lang')==='zh_TW'?
                                cateList.filter(cate=>{return cate.id===categoryId})[0].categoryC
                                :cateList.filter(cate=>{return cate.id===categoryId})[0].category
                            }
                        </Tag>}
                    split={false}
                    dataSource={[this.state.selPost]}
                    renderItem={item => (
                        <List.Item
                            key={item.id}
                            // eslint-disable-next-line
                            extra={item.createdBy==sessionStorage.getItem('@userInfo.id')?
                            (<Dropdown overlay={authorMenu} trigger={['click']} placement="bottomRight"><Button><Icon type="ellipsis" /></Button></Dropdown>)
                            :(item.originalCreator===undefined?
                            null
                            // eslint-disable-next-line
                            :(item.originalCreator.id==sessionStorage.getItem('@userInfo.id')?
                            (<Dropdown overlay={authorMenu} trigger={['click']} placement="bottomRight"><Button><Icon type="ellipsis" /></Button></Dropdown>)
                            :null))
                            }
                        >
                        <List.Item.Meta
                        avatar={<Avatar src={userIcon} />}
                        title={item.postTitle}
                        description={(item.publishAt!==null? moment(item.publishAt).format('YYYY-MM-DD'):moment(item.createdAt).format('YYYY-MM-DD')) 
                        + ' by ' 
                        + (item.showAsAlias===1? (item.alias || 'Unknown') : (item.originalCreator===undefined? null: item.originalCreator.fullname))}
                        />
                        </List.Item>
                    )}
                />
                {/* ***s=]*** Show contents for selected post */}
                <div className="postContent" id="miniblog-post-details">
                    <div dangerouslySetInnerHTML={{ __html: this.handleContentLink(content) }} />
                </div>
                <Divider />
                
                {/** Show video for selected post */}
                { console.log("video link = " + videoLink)}
                { videoLink === ""? null : (
                <div className="video-container">
                        <ReactPlayer 
                        className='react-player'
                        url={videoLink} 
                        onContextMenu={e => e.preventDefault()}
                        controls 
                        width='100%'
                        height='100%'
                        playing={playing}
                        // muted={this.handleChromeAutoPlay()}
                        onReady={this.handleOnReady}
                        config={{ 
                            file: { 
                                attributes: {
                                    controlsList: 'nodownload',
                                    autoPlay: true,
                                    // muted: this.handleChromeAutoPlay()
                                } 
                            } 
                        }}
                        />
                        <span style={{ color: 'lightgray', fontSize: '0.5em' }}>{browser.version||'unknown'}</span>
                </div>
                )}
                

                {/* ***s=]*** Show Tags for selected post */}
                <div>
                    { (!Array.isArray(tagList) || !tagList.length)? 
                        (<p>Tags</p>)
                        :(tagList.map((iTag,index)=>{
                            return <Tag key={index} style={{ padding:4, fontSize:12 }} color="blue" >{iTag}</Tag>
                        })) }
                </div>
                <Divider />
                {/* ***s=]*** Show Status for selected post */}
                <div style={{ fontSize: '14px' }}>
                    <Icon type="read" title={is_bookmarked===0? 'Add bookmark':'Remove bookmark'} theme={is_bookmarked===0? 'outlined':'filled'} style={{ color:'#28a745' }} onClick = {()=>this.onClickBookmark()} /> <Divider type="vertical"/>
                    <img style={{width:'23px', cursor:"pointer"}} onClick={()=>this.setState({ showModal: true })} src={tempShare} alt="Share with Others" /> <Divider type="vertical"/>
                    <IconText type="eye" text={hit} /> <Divider type="vertical"/>
                    <Icon type="like" title={is_liked===0? 'Like':'Likes'} theme={is_liked===0? 'outlined':'filled'} style={{ color:'orange' }} onClick = {()=>this.onClickLike()} /> {(likes || 0)+liked}<Divider type="vertical"/>
                </div>

                <Modal
                    title={`${intl.get("@GENERAL.SHARE")} ${postTitle}`}
                    bodyStyle={{ maxHeight: '80vh', overflow: 'auto' }}
                    width="75vw"
                    visible={showModal}
                    destroyOnClose
                    footer={null}
                    maskClosable={false}
                    centered
                    onCancel={this.handleClose}
                >
                    <ResourceShare resourceType="MiniBlog" resourceId={selPost.id} handleClose={this.handleClose} />
                </Modal>

            </div>
        )
    }
}