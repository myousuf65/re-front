import React from 'react';
import { Modal, List, Upload, Button, Form, Icon, Input, Select, message, Radio } from 'antd';
import intl from 'react-intl-universal';
import CKEditor from 'ckeditor4-react';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData,bytesToSize } from '../service/HelperService';
import {authPostImg} from '../resources_component/authimg.js';
import './elearning_question.css';
moment.locale('zh-hk');

const { Option } = Select;
const Dragger = Upload.Dragger;
class QuestionForm extends React.Component{

  state ={ uploadList: [],randomSetting:null,ans_num:2, correctAns:null,submitting: false, selRecord: this.props.selRecord, catAllList:this.props.catAllList, fileList: [], ruleOptions: [] , category: [], categoryList: []};

  componentDidMount(){
    this.loadCategory();
    if(this.state.fileList.length === 0){
      this.initialGalleryList();
    }
  }

  componentWillReceiveProps(nextProps){
    // if(nextProps.submitting!==this.state.submitting){
    //   this.setState({ submitting: nextProps.submitting });
    // };
    // if(nextProps.selRecord!==this.state.selRecord){
    //   this.setState({ selRecord: nextProps.selRecord });
    // };
  }

  initialGalleryList = () => {
    let checkGallery_url = sessionStorage.getItem('serverPort')+`elearning/gallery/check/${sessionStorage.getItem('@userInfo.id')}`;
    fetchData(checkGallery_url, 'get', null, response=>{
        if(response.ifSuccess){
        let res = response.result;
        //   if(res.fileList!==null&&res.msg!=='Gallery Created'){
        if(res.fileList&&res.msg!=='Gallery Created'){
            let fileListManager = [];
            res.fileList.forEach(item => {
                fileListManager.push(item);
                fetchData(sessionStorage.getItem('serverPort')+item.ofilename, 'get', null, response=>{})
            })
            this.setState({ fileList: fileListManager });
            authPostImg();
        }
        }
    })
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

          // if(file.error.status===413){
          //     message.error(`${file.name}: Image size ${bytesToSize(file.size||0)} > 1 MB`);
          // }else{
          //     message.error(`Failed to upload image ${file.name}`);
          // }
      }
  }

  handleRemove = (image) => {
      let del_url = sessionStorage.getItem('serverPort')+'elearning/gallery/delete/'+ image.id +'?user='+ sessionStorage.getItem('@userInfo.id');
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
                  let del_url = sessionStorage.getItem('serverPort')+'elearning/gallery/delete/'+ file.response.data.id +'?user='+ sessionStorage.getItem('@userInfo.id');
                  
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

  handleImgSrc = (str, target) => {
      // // ---filter out placeholder
      // var loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
      // var brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
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

  loadCategory = ()=> {
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchAllCategory/'+sessionStorage.getItem('@userInfo.id')+'?cat=0';
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            category: res.data,
          });
        } else {
          this.setState({ 
            category: [],
          });
        }
      }
    });
  }

  onEditorChange=(event) => {
    const data = event.editor.getData();
    return data;
  }

  handleSubmit = e => {
    const { correctAns,ans_num,randomSetting } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        const answerValues = []; // 用于存储Answer的值的数组
        for(let i =1; i<=ans_num; i++) {
            answerValues.push(fieldsValues[`answer_${i}`]);
        }
        const values = {
            ...fieldsValues,
            'createdBy': sessionStorage.getItem('@userInfo.id'),
            'post_video_link': fieldsValues['post_video_link'] || "",
            'correct_ans' : correctAns || 0,
            'random_setting' : randomSetting || 0,
            'answer': answerValues.join(";,;"),
        };

        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/create_question/'+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    message.success("Post create successfully.");
                    this.props.handleQuestionAdd();
                }else{
                    message.error("Sorry, post creation was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post creation was rejected by server.", 1);
            }
        })
      }
    });
  };

  onCancelDelete() {
    this.props.handleQuestionAdd();
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
            // var loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
            // var brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
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

    handleCorrectAnswerChange = (e) => {
        const correctAnsValue = e.target.value;
        this.setState({ correctAns: correctAnsValue });
    };

    handleAnswerCountChange = value => {
        this.setState({ ans_num: value });
    };

    generateAnswerInputs = () => {
        const { getFieldDecorator, getFieldValue, getFieldError, isFieldTouched } = this.props.form;
        const count = getFieldValue('answerCount');
      
        const answerInputs = [];
        for (let i = 1; i <= count; i++) {
          const fieldName = `answer_${i}`;
          const correctAnsName = `correct_ans${i}`;
          const error = isFieldTouched(fieldName) && getFieldError(fieldName);
      
          answerInputs.push(
            <Form.Item
              label={`Answer ${i}`}
              key={fieldName}
              validateStatus={error ? 'error' : ''}
              help={error || ''}
            >
              {getFieldDecorator(fieldName, {
                initialValue: this.state[fieldName],
                rules: [
                  { required: true, message: `Answer ${i} is required` }
                ]
              })(
                <Input min={2} max={8} style={{ lineHeight: 0, maxWidth: '800px' }} placeholder={`Answer ${i}`} />
              )}
      
                
                <Radio value={i}>{sessionStorage.getItem('lang')==='zh_TW'? '答案':'Answer'}</Radio>
                
            </Form.Item>
          );
        }
      
        return answerInputs;
    }

  render(){
    const httpHeaders = {
      'accessToken': sessionStorage.getItem('accessToken'),
      'accesshost': window.location.hostname
    }

    let draggerprops = {
      name: 'file',
      multiple: true,
      accept: 'image/*',
      listType: 'picture',
      action: sessionStorage.getItem('serverPort')+`elearning/gallery/upload/${sessionStorage.getItem('@userInfo.id')}`,
      headers: httpHeaders,
      fileList: this.state.uploadList,
      onChange: this.handleChange, 
      onRemove: this.handleDraggerRemove,
    };
    const { catAllList,randomSetting } = this.state;
    const radioStyle = { display: 'inline', height: '30px', lineHeight: '30px', };
    const { getFieldDecorator, getFieldError } = this.props.form;
    const questionError = getFieldError('question');

    return(
      <div className="container">
        <div className="row">
          <div className="col-lg-9">
            <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
                <Form.Item
                    label={intl.get('@E_LEARNING.QUESTION')}
                    validateStatus={questionError ? 'error' : ''}
                    >
                    {getFieldDecorator('question', { 
                        valuePropName: 'data',
                        rules: [{ required: true, message: intl.get('@E_LEARNING.QUESTION') + ' '+intl.get('@GENERAL.IS-REQUIRED') }],
                        getValueFromEvent: this.onEditorChange 
                    })(
                            <CKEditor 
                            config={{
                                language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                                height: '25em',
                                // removeButtons: 'Html5video',
                                image2_altRequired: true
                            }}
                            onInstanceReady={this.onEditorReady}
                            onPaste={this.onEditorPaste}
                            />
                    )}
                </Form.Item>
                <Form.Item
                    label={intl.get('@E_LEARNING.VIDEO_LINK')}
                    >
                    {getFieldDecorator('post_video_link', {
                        rules: [{ required: false, message: intl.get('@E_LEARNING.VIDEO_LINK')+" "+intl.get('@GENERAL.IS-REQUIRED') }],
                    })(
                        <Input style={{ lineHeight: 0, maxWidth: '900px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} allowClear />
                    )}
                </Form.Item>
                <Form.Item label="Answer Count">
                        {getFieldDecorator('answerCount', {
                            initialValue: 2, // 默认答案数量为2
                            rules: [
                            { required: true, message: 'Answer count is required' },
                            ]
                        })(
                            <Select onChange={this.handleAnswerCountChange}>
                            {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(count => (
                                <Option key={count} value={count}>{count}</Option>
                            ))}
                            </Select>
                        )}
                </Form.Item>
                <Radio.Group name="correct_ans" onChange={this.handleCorrectAnswerChange}>
                    {this.generateAnswerInputs()}
                </Radio.Group>
                <Form.Item label={intl.get('@E_LEARNING.RANDOM')}>
                {getFieldDecorator('randomSetting', {
                    rules: [{ required: true, message: intl.get('@GENERAL.REQUIRED') }],
                    initialValue: randomSetting,
                })(
                    <Radio.Group name="rnd_ans" onChange={this.handleRandomAnswerChange}>
                    <Radio style={radioStyle} value={1}>
                        {sessionStorage.getItem('lang') === 'zh_TW'
                        ? '隨機答案'
                        : 'Random Answer'}
                    </Radio>
                    <Radio style={radioStyle} value={0}>
                        {sessionStorage.getItem('lang') === 'zh_TW'
                        ? '順序答案'
                        : 'Sequential Answer'}
                    </Radio>
                    </Radio.Group>
                )}
                </Form.Item>
                <Form.Item label={intl.get('@E_LEARNING.CATEGORY')}>
                    {getFieldDecorator('catId', { 
                        rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                        initialValue:("1")
                    })(
                        <Select>
                            {catAllList.map((categoryName, index) => (
                            <Option key={categoryName.id}>{categoryName.title}</Option>
                            ))}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item className="formButtons">
                    <Button type="primary" htmlType="submit">{intl.get('@GENERAL.SAVE')}</Button>
                    {/* <Popconfirm 
                    title="Sure to leave this page? You may lose the unsaved edits."
                    okText={intl.get('@GENERAL.CANCEL')}
                    onConfirm={this.onCancelDelete} 
                    cancelText={intl.get('@GENERAL.YES')}
                    onCancel={this.onDelete}
                    >
                        <Button type="default" title="Leave current page without saving changes">{intl.get('@GENERAL.LEAVE')}</Button>
                    </Popconfirm> */}
                </Form.Item>
                
            </Form>
          </div>
          <div className="col-lg-3">
                    <div className="related-resources" >
                        <h2><span style={{ backgroundImage:'images/icon-from-the-blog.png', color: 'gold'}}><b>{intl.get('@MY_BLOG.GALLERY-MANAGER')}</b></span></h2>
                        <div className="gallery-manager" style={{ minHeight: 'auto' }}>
                        <Dragger {...draggerprops} onPreview={this.handlePreview}>
                            <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-hint">
                            {intl.get('@MY_BLOG.DRAGGER-TIPS')}
                            </p>
                        </Dragger>
                        <List
                            itemLayout='horizontal'
                            header={<b>{intl.get('@MY_BLOG.UNARCHIVED')}</b>}
                            bordered
                            dataSource={this.state.fileList.sort((a,b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0))}
                            renderItem = {item => (
                                <List.Item
                                key={item.id}
                                extra={
                                    <img 
                                    style={{ display: 'block', width: '20%', overflow: 'hidden', height: 'auto', margin: '0 auto', cursor: "pointer" }} 
                                    name="auth-post-img" 
                                    disabled={true}
                                    onClick={(e)=>this.handleImgSrc(item.ofilename, e.target)}
                                    alt={item.ofilename} 
                                    data={item.ofilename} 
                                    />
                                }
                                >
                                    <Icon 
                                    onClick={()=>this.handleRemove(item)}
                                    type="delete" theme="twoTone" twoToneColor="#f00" title="remove this image" />
                                    {item.id}
                                    {/* eslint-disable-next-line */}
                                    {/* <a onClick={()=>this.openInNewTab(`${sessionStorage.getItem('serverPort')}${item.ofilename}`)}>{item.id}</a> */}
                                    
                                </List.Item>
                            )}
                        />
                        
                        <Modal centered destroyOnClose visible={this.state.previewVisible} footer="Photo Gallery" onCancel={this.handleCancel}>
                            <img alt="gallery-img" style={{ width: '100%', height: 'auto' }} src={this.state.previewImage} />
                        </Modal>
                        </div>
                    </div>           
                </div>
            </div>

        </div>
    )
  }
}

const elearningQuestionForm= Form.create({name:'quiz_form'})(QuestionForm);
export default elearningQuestionForm;