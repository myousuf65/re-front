//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190715 */
//Comments //***s=]*** 



import React from 'react';
import { Icon, Upload, message, Modal, List } from 'antd';
import intl from 'react-intl-universal';

import { fetchData, bytesToSize } from '../service/HelperService';
import WrappedPostEditForm from './post_form_edit';
import { authPostImg } from '../resources_component/authimg';
const Dragger = Upload.Dragger;

export default class SpecialCollectionPostEditor extends React.Component{

    state = { previewVisible: false, previewImage: '', selPostId: window.location.href.slice(window.location.href.lastIndexOf("?id=")+4), selPost: {}, fileList: [], uploadList: [], galleryId: -1, relatedList: [] };

    componentDidMount(){

        let getLatest_url = sessionStorage.getItem('serverPort')+'specialCollection/getLatest/'+sessionStorage.getItem('@userInfo.id')+'/0';  //---1 for create log in backend; 0 for not;
        fetchData(getLatest_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    if(res.data.list.length>3){
                        this.setState({ relatedList: res.data.list.slice(0,3) });
                    }else{
                        this.setState({ relatedList: res.data.list });
                    }
                } else {
                    message.warning('Response from server: '+ res.status);
                };
            }
        })

        const winHref = window.location.href;
        let post_id = winHref.slice(winHref.lastIndexOf("?id=")+4);
        let intl_url = sessionStorage.getItem('serverPort')+'specialCollection/getDetail/'+post_id+'?user='+sessionStorage.getItem('@userInfo.id');
        fetchData(intl_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200&&res.data.specialCollection){
                this.handleGallery(res.fileList);
                this.setState({ 
                    selPost: res.data.specialCollection,
                    galleryId: typeof(res.fileList)==='object'? res.fileList[0].galleryId : res.fileList,
                });
              }else{
                message.error('Sorry, you cannot edit this post. Back to Home Page now.', 2);
                setTimeout(()=> { window.location.replace('#/specialCollection/home') }, 2000);
              }
            }
        });
    }

    handleGallery=(fileList)=>{
        if(typeof(fileList)!=='object'){ 
            this.setState({ fileList: [] });
            return;
        }else{
            let fileListManager = [];
            fileList.forEach(item => {
                fileListManager.push(item);
            });
            this.setState({ fileList: fileListManager }, ()=>authPostImg());
        }
    }

    handlePreview = file => {
        this.setState({ previewImage: file.url || file.thumbUrl, previewVisible: true, });
    };
    
    handleCancel = () => this.setState({ previewVisible: false });

    handleChange = ({file,fileList}) => {
        let uploadList = [...fileList];
        this.setState({ uploadList: [...uploadList] })

        const status = file.status;

        if (status === 'done') {
            if(file.response.status===200){
                uploadList = fileList.filter(item=>item.uid!==file.uid);
                this.setState(state=>({
                    fileList: file.response.fileList,
                    uploadList: [...uploadList]
                }))
                authPostImg();
            }else{
                // ------handle 555 and others
                message.error(`${file.response.status}IN${bytesToSize(file.size||0)}: Failed to upload image ${file.name}`, 7);
                // message.error(`Failed to upload image ${file.name}`, 3);
            }

        } else if (status === 'error') {
            message.error(`${file.error.status}OU${bytesToSize(file.size||0)}: Failed to upload image ${file.name}`, 7);
        }
    }

    handleRemove = (image) => {
        let del_url = sessionStorage.getItem('serverPort')+'blog/gallery/delete/'+ image.id +'?user='+ sessionStorage.getItem('@userInfo.id');
        fetchData(del_url, 'post', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  let newfileList = this.state.fileList;
                  const index = newfileList.indexOf(image);
                  if(index>-1){
                      newfileList.splice(index,1);
                      this.setState(state=>({ fileList: newfileList }))
                  }else{
                      message.warning('Your request was denied by server.')
                  }
              }
            }
        })
    }

    handleDraggerRemove = file => {
        if(typeof(file.response)!=='undefined'){
            if(typeof(file.response.data)!=='undefined'&&file.response.data!==null){
                if(typeof(file.response.data.id)!=='undefined'){
                    let del_url = sessionStorage.getItem('serverPort')+'blog/gallery/delete/'+ file.response.data.id +'?user='+ sessionStorage.getItem('@userInfo.id');
                    
                    fetchData(del_url, 'post', null, response=>{
                        if(response.ifSuccess){
                          let res = response.result;
                          if(res.status===200){
                              return true;
                          }else{
                              message.warning('Your request was denied by server.',1);
                              return false;
                          }
                        }
                    });
                } else {
                    return true;
                };
            }else{
                return true;
            };
            
        } else {
            return true;
        };
    }

    openInNewTab = (url) =>{
        var win = window.open(url, '_blank');
        win.focus();
    }

    handleImgSrc = (str, target) => {
        // // ---filter out placeholder
        // if(target.getAttribute('src')===loadingImg || target.getAttribute('src')===brokenImg){
        //     message.info('Preparing... Please wait until image is loaded.', 5);
        //     return;
        // }

        const el = document.createElement('textarea');
        const ck = document.getElementById('blog-form-ckeditor-content');
        el.value = 'POST-IMG alt="' + str + '" src="' + target.getAttribute('src') + '" ';
        document.body.appendChild(el);
        el.select();
        ck.scrollIntoView();
        document.execCommand('copy');
        message.success('Now you can insert the Image into Content Editor by Paste.', 5);
        document.body.removeChild(el);
    }

    render() {
        const httpHeaders = {
            'accessToken': sessionStorage.getItem('accessToken'),
            'accesshost': window.location.hostname
        }

        let draggerprops = {
            name: 'file',
            multiple: true,
            accept: 'image/*',
            listType: 'picture',
            action: sessionStorage.getItem('serverPort')+`blog/gallery/update/${this.state.galleryId}/${sessionStorage.getItem('@userInfo.id')}`,
            headers: httpHeaders,
            fileList: this.state.uploadList,
            onChange: this.handleChange, 
            onRemove: this.handleDraggerRemove,
        };
        
        return(
            <div>

            <div className="mini-blog-header">
            <div className="container clearfix">
            <a href="#/specialCollection/home"><h2 style={{width: 'calc(100% - 260px)'}}>{intl.get('@SPECIAL_COLLECTION.SPECIAL_COLLECTION')}</h2></a>
            <a href="#/specialCollection/mySpecialCollection" className="btn-my-blog" style={{width:'260px'}}>{intl.get('@SPECIAL_COLLECTION_HOME.SPECIAL_COLLECTION')}</a>
            </div>
            </div>

            <div className="page-content">
                <div className="container create-post">
                    <div className="row">
                    <div className="col-lg-9">
                        <div className="create-post-main" id="blog-form-ckeditor-content">
                            <h3>{intl.get('@MY_BLOG.POST-MODIFICATION')}</h3>
                            <WrappedPostEditForm selPostId={this.state.selPostId} fileList={this.state.fileList} />

                        </div>
                    </div>

                    <div className="col-lg-3">
                        <div className="related-resources" style={{ marginBottom:'10%' }}>
                        <h2><span style={{ backgroundImage:'images/icon-from-the-blog.png'}}>{intl.get('@SPECIAL_COLLECTION.MOST-RECENT')}</span></h2>
                        <ul className="related-blog-list" style={{ marginBottom: 0 }}>
                            {this.state.relatedList.map(item=>{
                                return (
                                    <li key={typeof(item.specialCollection)==='undefined'? 0:item.specialCollection.id}>
                                    {/* eslint-disable-next-line */}
                                    <a href={`#/specialCollection/details/?id=${typeof(item.specialCollection)==='undefined'? 0:item.specialCollection.id}`}>{typeof(item.specialCollection)==='undefined'? '':item.specialCollection.postTitle}</a>
                                    </li>
                                )
                            })}
                        </ul>
                        </div> 
                            
                    </div>
                    </div>
                </div>
            </div>


            </div>
        )
    }
}
