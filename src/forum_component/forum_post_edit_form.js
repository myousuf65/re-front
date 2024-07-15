//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200213 */

import React, { Component } from 'react';
import { Popconfirm, Form, Icon, Input, Radio, Button, message, Breadcrumb, Upload, List, Select, Spin, Checkbox } from 'antd';
import CKEditor from 'ckeditor4-react';
import intl from 'react-intl-universal';

import { fetchData, bytesToSize, keywordsScanner } from '../service/HelperService';
import { authPostImg } from '../resources_component/authimg.js';

import "../miniblog_component/post_form.css";

const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';

const RadioGroup = Radio.Group;
const Dragger = Upload.Dragger;

class ForumPostEditForm extends Component{
    state = {
        username: '', 
        selPost: {},
        radioValue: 'user', 
        radioInput: '', 
        loading: false,
        order: 999,
        selCategory: [],
        collecting1: true,
        collecting2: true,
        imgList:[],
        fileList: [],
        uploadList:[],
        cke_ready: false,
        getPost_ready: false,
        galleryId: 0,
        showIfReplied: false,
        cke2_ready: false,
    };
    
    componentWillMount(){
        let winHref = window.location.href;
        let selPostId = winHref.slice(winHref.lastIndexOf("kc/post/modify/")+15);

        this.setState({ selPostId });
    }

    componentDidMount(){
        this.getSelPost(this.state.selPostId);
    };

    getSelPost=(selPostId)=>{
        let getSelPost_url = sessionStorage.getItem('serverPort')+'forum/post/updateget/'+sessionStorage.getItem('@userInfo.id')+'/'+selPostId;
        fetchData(getSelPost_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200){
              this.props.form.setFieldsValue({ 
                  title: res.data.title, 
                  order: res.data.order, 
                  allowComment: res.data.allowComment,
                });
              
              if(this.state.cke_ready){ this.handleContentImg(res.data, 'content') };
              if(this.state.cke2_ready){ this.handleContentImg(res.data, 'hiddenField') };

              this.getSelCatePath(res.data.categoryId);
              
              this.setState({ 
                  selPost: res.data, 
                  radioValue: res.data.isAlias? 'alias':'user', 
                  radioInput: res.data.alias? res.data.alias:'', 
                  username: res.data.createdBy, 
                  order: res.data.order, 
                  loadingPost: false,
                //   collecting: false,
                  imgList: this.imgArrHandler(res.data.content+'<div>'+res.data.hiddenField+'</div>'||'', 'get'),
                  getPost_ready:true,
                  showIfReplied: res.data.hiddenField? true:false,
                  galleryId: res.data.galleryId===undefined? 0:(res.data.galleryId||0),
                });
            }else{
              this.getSelCatePath(9);
              this.setState({ selPost: {}, username: '', order: 999, loadingPost: false, collecting1: false, collecting2: false });
              message.error('Sorry, you cannot edit this post.');
              setTimeout(()=>{window.location.assign('#/kc/post/details?id='+this.state.selPostId)}, 3000);
            }
          }else{
            this.getSelCatePath(9);
            this.setState({ selPost: {}, username: '', order: 999, loadingPost: false, collecting1: false, collecting2: false });
            message.error('Sorry, you cannot edit this post.');
            setTimeout(()=>{window.location.assign('#/kc/post/details?id='+this.state.selPostId)}, 3000);
          }
        })
    }

    handleContentImg = (selPost, type) => {
        // ---- check if has hidden content
        if(type==='hiddenField'&&!selPost.hiddenField){
            this.setState({ collecting2: false });
            return;
        };

        var blogContent = document.createElement('div');
        blogContent.innerHTML = selPost[type];
        var imgArr = blogContent.querySelectorAll( 'img' );

        if(imgArr.length<1){
            this.props.form.setFieldsValue({ [type]: selPost[type] });
            if(type==='content'){
                this.setState({ collecting1: false });
            }else if(type==='hiddenField'){
                this.setState({ collecting2: false });
            }

            return;
        }

        imgArr.forEach((img)=>{
            img.src = loadingImg;
        });

        var innerHTML_v1 = blogContent.innerHTML;
        this.props.form.setFieldsValue({ [type]: innerHTML_v1 });

        var countLoadedImg = 0;
        var thisForm = this.props.form;
        var thisComponent = this;
        imgArr.forEach((img)=>{
            let url = img.getAttribute('alt');

            if(url===null||url===undefined){
              img.src = null
              img.alt = "invalid image";
            }else{
              url = sessionStorage.getItem('serverPort')+url;
              let request = new XMLHttpRequest();
              request.open('get', url, true);
              request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
              request.setRequestHeader('accesshost', window.location.hostname);
      
              request.onloadstart = function () {
                request.responseType = 'blob';
              }

              request.onloadend = function () {
                  countLoadedImg += 1;
                  if(countLoadedImg===imgArr.length){
                    var innerHTML_v2 = blogContent.innerHTML;
                    thisForm.setFieldsValue({ [type]: innerHTML_v2 });
                    if(type==='content'){
                        thisComponent.setState({ collecting1: false });
                    }else if(type==='hiddenField'){
                        thisComponent.setState({ collecting2: false });
                    }

                    console.log(`update img for ${type}: `, innerHTML_v2);
                  }
              }
      
              request.onreadystatechange = function () {
      
                if (request.readyState ===4 && request.status === 200) {
                  let blobUrl = URL.createObjectURL(request.response);
                  img.src = blobUrl;
      
                  // img.onload = function () {
                  //   URL.revokeObjectURL(img.src);
                  // };
                }else if (request.readyState ===4 && request.status !== 200) {
                  img.src = brokenImg;
                }
      
              };
      
              request.send(null);
            }
        });
    }

    getSelCatePath=(selCateId)=>{
        let getSelPost_url = sessionStorage.getItem('serverPort')+'forum/category/family/'+sessionStorage.getItem('@userInfo.id')+'/'+selCateId;
        fetchData(getSelPost_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&res.data.length>0){
                this.setState({ selCategory: res.data });
            }else{
                this.setState({ selCategory: [] });
            }
          }else{
            this.setState({ selCategory: [] });
          }
        })
    }

    onEditorChange= (event) => {
        const data = event.editor.getData();
        return data;
    }

    onInstanceReady=(event, cke_ready_num)=>{
        this.setState({ [cke_ready_num]: true });
        if(this.state.getPost_ready){
            if(cke_ready_num==='cke_ready'){
                this.handleContentImg(this.state.selPost, 'content');
            }else if(cke_ready_num==='cke2_ready'){
                this.handleContentImg(this.state.selPost, 'hiddenField');
            };
        }
    }

    customHandler=(iEditor)=>{
        let data = this.props.form.getFieldInstance(iEditor).editor.getData();
        return data;
    }

    onRadioChange = (e) => {
        this.setState({ radioValue: e.target.value, });
    }

    onRadioInputChange = (e) => {
        this.setState({ radioInput: e.target.value, });
    }

    onRadioSelectChange = (value) => {
        this.setState({ radioInput: value, });
    }

    getCategoryId = () => {
        const cateCopy = this.state.selCategory;
        var cateArrLen = cateCopy.length;

        if(cateArrLen>0){
            return cateCopy[cateArrLen-1].id;
        }else{
            message.error('Category info is missing');
            return 0;
        }
    }

    handleNewImg = (img) => {
        console.log('new image: ', this.state.imgList.indexOf(img.url));
        if(img.url&&this.state.imgList.indexOf(img.url)<0){
            this.setState(state=>({ imgList: [...state.imgList, img.url] }));
        }
    }

    imgArrHandler = (cke_content, type) => {
        let imgArr=Array.from( new DOMParser().parseFromString( cke_content, 'text/html' )
            .querySelectorAll( 'img' ) )
            .map( img => { return img.getAttribute( 'alt' ) });

        if(type==='get'){
            return imgArr;
        }else if(type==='del'){
            let imgDiff = this.state.imgList.filter(imgUrl => !imgArr.includes(imgUrl));
            
            if(imgDiff.length>0){
                let forumImgDel_url = sessionStorage.getItem('serverPort')+'forum/post/remove/photo/'+sessionStorage.getItem('@userInfo.id');
                fetchData(forumImgDel_url,'post',imgDiff,res=>{});
            }
        }
    }

    handleSubmit = (e) => {
        let getEData = this.customHandler('content');
        let getHiddenData = this.customHandler('hiddenField');

        const { radioInput, showIfReplied } = this.state;
        // ---- wrap title & content & hidden content & alias for sensitive keywords scan
        let scanTarget = getEData;
        if(this.props.form.getFieldValue('title')){
            scanTarget = this.props.form.getFieldValue('title') + ',' + scanTarget;
        };
        if(this.props.form.getFieldValue('nominatedAuthor')==='alias'&&radioInput){
            scanTarget += ',';
            scanTarget += radioInput;
        };
        if(showIfReplied&&getHiddenData){
            scanTarget += ',';
            scanTarget += getHiddenData;
        };

        let scanResult = keywordsScanner(scanTarget);
        const postId = parseInt(this.state.selPostId,10);
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err,fieldsValues)=>{
            if(fieldsValues['nominatedAuthor']==='alias'&&!radioInput){
                message.error('Alias should not be empty', 7);
            } else if(!err&&scanResult){
                this.setState(state=>({ loading:true }));

                const values = {
                    ...fieldsValues,
                    'id': postId,
                    'category': this.state.selPost.categoryId,
                    'content': getEData===null?'':getEData,
                    'hiddenField': showIfReplied&&getHiddenData? getHiddenData:null,
                    'isAlias': fieldsValues['nominatedAuthor']==='alias'? 1:0,
                    'alias': fieldsValues['nominatedAuthor']==='alias'? radioInput:null,
                    'order': fieldsValues['order']===undefined||fieldsValues['order']===null? 999:fieldsValues['order']
                };

                // this.imgArrHandler(getEData,'del');

                let updatePost_url = sessionStorage.getItem('serverPort')+'forum/post/update/'+sessionStorage.getItem('@userInfo.id');
                fetchData(updatePost_url, 'post', values, response=>{
                  if(response.ifSuccess){
                    let res = response.result;
                    if(res.status===200){
                        message.success("Post update successfully.");
                        this.setState(state=>({ loading: false }));
                    }else{
                        message.error("Sorry, post update was rejected by server.", 2);
                        this.setState(state=>({ loading: false }));
                    }
                  }else{
                    message.error("Sorry, post update was rejected by server.", 2);
                    this.setState(state=>({ loading: false }));
                  }
                })
            }
        });

    };

    onCancelDelete = () => {
    }

    onDelete = () => {
        window.location.replace('#/kc/post/details?id='+this.state.selPostId);
    }

    handleImgSrc = (str, target) => {
        // // ---filter out placeholder
        // if(target.getAttribute('src')===loadingImg || target.getAttribute('src')===brokenImg){
        //     message.info('Preparing... Please wait until image is loaded.', 5);
        //     return;
        // }

        const el = document.createElement('textarea');
        const ck = document.getElementById('kc-form-ckeditor-content');
        el.value = 'POST-IMG alt="' + str + '" src="' + target.getAttribute('src') + '" ';
        document.body.appendChild(el);
        el.select();
        ck.scrollIntoView();
        document.execCommand('copy');
        message.success('Now you can insert the Image into Content Editor by Paste.', 5);
        document.body.removeChild(el);
    }

    onEditorPaste=(evt)=>{
    // Handle dropping a gallery image by transforming the image string into HTML.
    // Note: All pasted and dropped content is handled in one event - editor#paste.
        var dataValue = evt.data.dataValue
        if(dataValue.indexOf('<img name="auth-post-img"')===0 ){
            var divImg = document.createElement('div');
            divImg.innerHTML=dataValue;
            let img = divImg.firstElementChild;

            if(!img){ return;}

            // // ---filter out placeholder
            // if(img.getAttribute('src')===loadingImg||img.getAttribute('src')===brokenImg){
            //     message.info('Preparing... Please wait until image is loaded.', 5);
            //     return;
            // }

            evt.data.dataValue = 
                '<img ' +
                'alt="' + img.getAttribute('data') +'" '+
                'src="' + img.getAttribute('src') +'" '+
                ' />'
        }else if(dataValue.indexOf('POST-IMG alt="')===0){
            evt.data.dataValue = 
                '<img ' +
                dataValue.slice(dataValue.indexOf('G alt="')+2) +
                ' />'
        }else{
            return;
        }
    }

    handleChange = ({file, fileList}) => {
        var uploadList = [...fileList];
        this.setState({ uploadList: [...uploadList] })

        const status = file.status;

        if (status === 'done') {
            // if(file.response.status===200){
            if(!file.response.status){
                uploadList = fileList.filter(item=>item.uid!==file.uid);
                this.setState(state=>({
                    fileList: [...state.fileList, file.response],
                    uploadList: [...uploadList]
                }))
                this.handleNewImg(file.response);
                authPostImg();
            }else{
                message.error(`${file.response.status}IN${bytesToSize(file.size||0)}: Failed to upload image ${file.name}`, 7);
            }
        } else if (status === 'error') {
            message.error(`${file.error.status}OU${bytesToSize(file.size||0)}: Failed to upload image ${file.name}`, 7);
        }
    }

    handleDraggerRemove = file => {
        return true;
    };

    onCheckboxChange = (e) => {
        this.setState({ showIfReplied: e.target.checked });
    };

    render() {
        const { getFieldDecorator, getFieldError } = this.props.form;
        const { Option } = Select;
        const { selCategory, loading, selPost, collecting1, collecting2, showIfReplied } = this.state;
        
        const radioStyle = { display: 'inline', height: '30px', lineHeight: '30px', };
      
        const titleError = getFieldError('title');
        
        //   const formItemLayout = { labelCol: { span: 2 }, wrapperCol: { span: 14 },};
        // console.log('---------render --', this.state.selSubCateId, '--' , selCategory);

        const httpHeaders = {
            'accessToken': sessionStorage.getItem('accessToken'),
            'accesshost': window.location.hostname,
        }

        const draggerprops = {
            name: 'upload',
            multiple: true,
            accept: 'image/*',
            listType: 'picture',
            action: `${sessionStorage.getItem('serverPort')}forum/post/new/photo/${sessionStorage.getItem('@userInfo.id')}/0&responseType=json`,
            headers: httpHeaders,
            fileList: this.state.uploadList,
            onChange: this.handleChange, 
            // onRemove: this.handleDraggerRemove,
        };

        return(
        <div>
            <Spin spinning={collecting1||collecting2} >
            {/* <div hidden>{CKEditor.editorUrl = sessionStorage.getItem('serverPort')+'resources/js/ckeditor/ckeditor.js'}</div> */}

            <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
{/* --------------------------------Category-------------------------------------------- */}
                <Form.Item disabled>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item>{intl.get('@GENERAL.CATEGORY')}</Breadcrumb.Item>
                    {selCategory.map(iCate=>(
                        <Breadcrumb.Item key={iCate.id}>{sessionStorage.getItem('lang')==='zh_TW'? iCate.nameTc:iCate.nameEn}</Breadcrumb.Item>
                    ))}
                </Breadcrumb>
                </Form.Item>
                
{/* --------------------------------Title-------------------------------------------- */}
                <Form.Item
                validateStatus={titleError ? 'error' : ''}
                help={titleError || ''}
                >
                {getFieldDecorator('title', {
                    rules: [{ required: true, message: intl.get('@GENERAL.TITLE')+intl.get('@GENERAL.IS-REQUIRED') }],
                })(
                    <Input style={{ lineHeight: 0, maxWidth: '400px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.get('@GENERAL.TITLE')} allowClear />
                )}
                </Form.Item>

                <span hidden={selPost.canEdit<1}>
                    <Form.Item label={intl.get('@FORUM_ADMIN.STICKY')}>
                    {getFieldDecorator('order',{ initialValue: selPost.order||999 })(
                        <Select mode="single" style={{ maxWidth: '100px' }}>
                            <Option key={999} value={999}>{ intl.get('@GENERAL.NO') }</Option>
                            <Option key={1} value={1}>1</Option>
                            <Option key={2} value={2}>2</Option>
                            <Option key={3} value={3}>3</Option>
                            <Option key={4} value={4}>4</Option>
                            <Option key={5} value={5}>5</Option>
                        </Select>
                    )}
                    </Form.Item>
                </span>

{/* --------------------------------Content-------------------------------------------- */}

                <div className="row">
                <div className="col-md-9" id='kc-form-ckeditor-content'>
                <Form.Item>
                {getFieldDecorator('content', { 
                    valuePropName: 'data',
                    getValueFromEvent: this.onEditorChange,
                 })(
                    <CKEditor 
                    config={{
                        language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                        height: '25em',
                        // removeButtons: 'Html5video',
                        contentsCss: [
                            'ckeditor/contents_kc.css'
                        ],
                    }}
                    onPaste={this.onEditorPaste}
                    onInstanceReady={(e)=>this.onInstanceReady(e, 'cke_ready')}
                    onAfterSetData={evt=>{
                        var data = evt.data.dataValue;
                        console.log('onAfterSetData: ', data);
                    }}
                    />
                )}
                </Form.Item>

{/* --------------------------------Display if replied-------------------------------------------- */}
                <Form.Item>
                    <Checkbox checked={showIfReplied} onChange={this.onCheckboxChange}>{intl.get('@FORUM_GENERAL.SHOW-IF-REPLIED')}</Checkbox>
                </Form.Item>

                <div hidden={!showIfReplied}>
                    <Form.Item>
                    {getFieldDecorator('hiddenField', { 
                        valuePropName: 'data',
                        getValueFromEvent: this.onEditorChange,
                    })(
                        <CKEditor 
                        config={{
                            language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                            height: '10em',
                            // removeButtons: 'Html5video',
                            contentsCss: [
                                'ckeditor/contents_kc.css'
                            ],
                        }}
                        onPaste={this.onEditorPaste}
                        onInstanceReady={(e)=>this.onInstanceReady(e, 'cke2_ready')}
                        onAfterSetData={evt=>{
                            var data = evt.data.dataValue;
                            console.log('onAfterSetData: ', data);
                        }}
                        />
                    )}
                    </Form.Item>
                </div>

                </div>

                <div className="col-md-3" style={{ height: '500px', overflowY: 'auto' }}>
                <Form.Item>
                    <Dragger {...draggerprops}>
                        <p className="ant-upload-drag-icon">
                        <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">
                        {intl.get('@MY_BLOG.DRAGGER-TIPS')}
                        </p>
                    </Dragger>
                    <List
                    style={{ overflowY: 'auto', maxHeight: '300px' }}
                    itemLayout='horizontal'
                    header={<b>Select to insert:</b>}
                    bordered
                    dataSource={this.state.fileList}
                    renderItem = {item => (
                        <List.Item
                        key={item.id}
                        extra={
                            <img 
                            style={{ display: 'block', width: '50%', overflow: 'hidden', height: 'auto', margin: '0 auto', cursor: "pointer" }} 
                            name="auth-post-img" 
                            onClick={(e)=>this.handleImgSrc(item.url, e.target)}
                            alt={item.url} 
                            data={item.url} 
                            // onClick={(e)=>this.handleImgSrc(item.ofilename, e.target)}
                            // alt={item.ofilename} 
                            // data={item.ofilename} 
                            />
                        }
                        >
                            {item.id}
                        </List.Item>
                    )}
                    />

                </Form.Item>
                </div>
                </div>

{/* --------------------------------Alias-------------------------------------------- */}
                <Form.Item
                label={intl.get('@FORUM_GENERAL.ALIAS-AUTHOR')}
                >
                {getFieldDecorator('nominatedAuthor',{ initialValue: selPost.isAlias? "alias":"user" })(
                    <RadioGroup name="nominatedAuthor" onChange={this.onRadioChange}>
                        <Radio style={radioStyle} value="user">{this.state.username}</Radio>
                        <Radio style={radioStyle} value="alias">
                            {intl.get('@MY_BLOG.ALIAS')}
                            {
                                this.state.radioValue === "alias"?
                                <Input 
                                onChange={this.onRadioInputChange} 
                                value={this.state.radioInput} 
                                style={{ width: '8em', marginLeft:10, lineHeight: 0, display: 'inline-block' }} 
                                allowClear 
                                />
                                :null
                            }
                        </Radio>
                    </RadioGroup>
                )}
                </Form.Item>

{/* --------------------------------Read Only-------------------------------------------- */}
                <Form.Item
                label={intl.get('@FORUM_ADMIN.ALLOW-COMMENT')}
                >
                {getFieldDecorator('allowComment')(
                    <RadioGroup name="allowComment">
                        <Radio style={radioStyle} value={0}>{intl.get('@GENERAL.YES')}</Radio>
                        <Radio style={radioStyle} value={1}>{intl.get('@GENERAL.NO')}</Radio>
                    </RadioGroup>
                )}
                </Form.Item>

{/* --------------------------------Submit or Quit-------------------------------------------- */}
                <Form.Item className="formButtons">
                    <Button type="primary" loading={loading} htmlType="submit">{intl.get('@GENERAL.SAVE')}</Button>

                    <Popconfirm 
                    title="Sure to leave this page? You will lose all updates."
                    okText={intl.get('@GENERAL.CANCEL')}
                    onConfirm={this.onCancelDelete} 
                    cancelText={intl.get('@GENERAL.YES')}
                    onCancel={this.onDelete}
                    >
                    <Button type="default" title="Leave current page without saving changes">{intl.get('@GENERAL.LEAVE')}</Button>
                    </Popconfirm>
                </Form.Item>
            </Form>
            </Spin>
      </div>
      );
    }
}

const WrappedForumPostEditForm = Form.create({ name: 'forum_post_edit_form' })(ForumPostEditForm);

export default WrappedForumPostEditForm;