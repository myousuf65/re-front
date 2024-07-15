//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190526 */
//Comments //***s=]*** 


import React, { Component } from 'react';
import { Form, Input, Radio, Button, Popconfirm, message } from 'antd';

import CKEditor from 'ckeditor4-react';
import intl from 'react-intl-universal';
import { keywordsScanner } from '../service/HelperService';

const RadioGroup = Radio.Group;

class CommentForm extends Component{

    state = {
        username: (sessionStorage.getItem('@userInfo.fullname') || 'NULL'), 
        selectedValue: 0, 
        radioInput: '', 
        postId: null,
        submitting: false,
    };

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props!==nextProps||
            this.state!==nextState
          )
    }
    
    componentWillReceiveProps(nextProps){
    
        if(nextProps.postId !== null || nextProps.postId !== undefined){
            this.setState(state => ({ postId: nextProps.postId }));
        };

        if(nextProps.submitting !== this.state.submitting){
            this.setState(state => ({ submitting: nextProps.submitting }));
        };

        if(nextProps.hindCmntEditor&&!this.props.hindCmntEditor){
            this.props.form.resetFields();
        }

    }

    onEditorChange=(event) => {
        const data = event.editor.getData();
        // let data = this.props.form.getFieldInstance('content').editor.getData();
        return data;
    }

    customHandler=()=>{
        let data = this.props.form.getFieldInstance('content').editor.getData();
        return data;
    }

    onRadioChange = (e) => {
        this.setState({ selectedValue: e.target.value, });
        if(e.target.value===0){ this.setState({ radioInput: '' }) };
    }

    onPopconfirmOk = (e) => {
        // console.log(e);
        this.props.form.resetFields();
        this.setState({ selectedValue: 0, radioInput: '' });
        this.props.quitCmntEditor();
    }

    onRadioInputChange = (e) => {
      this.setState({ radioInput: e.target.value, });
    }

    handleSubmit = (e) => {
      let getEData = this.customHandler();

      const { radioInput } = this.state;
      // ---- wrap content & alias for further scan
      let scanTarget = getEData;
      if(this.props.form.getFieldValue('showAsAlias')===1&&radioInput){
          scanTarget += ',';
          scanTarget += radioInput;
      }

      let scanResult = keywordsScanner(scanTarget);
      e.preventDefault();
      
      this.props.form.validateFields((err,fieldsValues)=>{
        if(!getEData){
            message.error(sessionStorage.getItem('lang')==='zh_TW'? '內容不可為空':'Type your comment here.', 7);
        } else if(fieldsValues['showAsAlias']===1&&!radioInput){
            message.error('Alias should not be empty', 7);
        } else if(!err&&scanResult){
            const values = {
                'postId': this.state.postId,
                'createdBy': sessionStorage.getItem('@userInfo.id'),
                ...fieldsValues,
                'content': getEData || "",
                'rootCmntId': this.props.rootCmnt===null? -1:this.props.rootCmnt.id,
                'alias': fieldsValues['showAsAlias']===1? radioInput:'',
            };

            // this.props.form.resetFields();
            this.setState({ submitting: true });
            
            this.props.handleCmntSubmit(values);
          }
      });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const radioStyle = { display: 'inline', height: '30px', lineHeight: '30px', };

        return(
            <Form style={{ marginBottom: '75px', display: 'block' }} onSubmit={this.handleSubmit} >
                {/* <div hidden>{CKEditor.editorUrl = sessionStorage.getItem('serverPort')+'resources/js/ckeditor/ckeditor.js'}</div> */}
                {/* ***s=]*** Input Area */}
                <Form.Item className="comment-form"
                >
                {getFieldDecorator('content', 
                { 
                    rules: [
                        {max: 1500, message: sessionStorage.getItem('lang')==='zh_TW'? '應用更多格式可能會影響你的評論長度(總長度300字以內)':'Content cannot be longer than 300 characters (html format considered).'}, 
                        // {required: true, message: sessionStorage.getItem('lang')==='zh_TW'? '內容不可為空':'Type your comment here.'}
                    ], 
                    getValueFromEvent: this.onEditorChange
                })(
                    <CKEditor 
                    config={{
                        language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                        toolbar: [
                            { name: 'clipboard', items: [ 'Cut', 'Copy', 'Paste', '-', 'Undo', 'Redo' ] },
                            { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                            { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', '-', 'RemoveFormat' ] },
                            { name: 'insert', items: [ 'EmojiPanel' ] },
                        ],
                    }}
                    />
                )}
                </Form.Item>

                {/* ***s=]*** Replier Name */}
                <Form.Item
                // className="col-md-8"
                // label={sessionStorage.getItem('lang')==='zh_TW'? '回覆':'Reply as'}
                // style={{ float: 'left', display: 'inline-block', width: '60%', minHeight:'80px' }}
                >
                {getFieldDecorator('showAsAlias',{ initialValue: this.state.selectedValue })(
                    <RadioGroup onChange={this.onRadioChange}>
                    <Radio style={radioStyle} value={0}>{this.state.username}</Radio>
                    <Radio style={radioStyle} value={1}>
                    {intl.get('@MY_BLOG.ALIAS')}
                        {this.state.selectedValue === 1? <Input style={{ width: '8em', marginLeft:10 }} onChange={this.onRadioInputChange} allowClear /> : null}
                    </Radio>
                </RadioGroup>
                )}
                </Form.Item>
                {/* ***s=]*** Button */}
                <Form.Item  
                // className="col-md-4"
                // style={{ width: '100%' }}
                // style={{ float: 'right', display: 'inline-block', width: '40%', minHeight:'80px' }}
                >
                    <Button shape="round" htmlType="submit" type="primary" loading={this.state.submitting} >{intl.get('@MINI_BLOG.SUBMIT')}</Button>
                    <Popconfirm title={sessionStorage.getItem('lang')==='zh_TW'? '你將放棄此次編輯，確定？':'Sure to quit and discard this draft?'} okText={intl.get('@GENERAL.YES')} cancelText={intl.get('@GENERAL.CANCEL')} onConfirm={this.onPopconfirmOk}><Button style={{ marginLeft: '1em' }} shape="round">{intl.get('@MINI_BLOG.CANCEL')}</Button></Popconfirm>
                </Form.Item>
            </Form>
        )
    }
}

const WrappedCommentForm = Form.create({ name: 'comment_form' })(CommentForm);
export default WrappedCommentForm;