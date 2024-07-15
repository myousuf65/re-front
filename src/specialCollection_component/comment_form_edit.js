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

class CommentEditForm extends Component{

    state = { selectedValue: -1, radioInput: '', cke_cmnt_ready: false, editSubmitting: false };

    shouldComponentUpdate(nextProps, nextState) {
        return (
            this.props!==nextProps||
            this.state!==nextState
          )
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.editSubmitting !== this.state.editSubmitting){
            this.setState(state => ({ editSubmitting: nextProps.editSubmitting }));
        };

        if(nextProps.selCmnt!==true&&nextProps.selCmnt!==this.props.selCmnt){
            this.setState({ radioInput: nextProps.selCmnt.alias })
            this.setContent(this.state.cke_cmnt_ready,nextProps.selCmnt);
        }
    }

    setContent=(cke_cmnt_ready, selCmnt)=>{
        if(cke_cmnt_ready&&selCmnt.content!==undefined){
            this.props.form.setFieldsValue({ content: selCmnt.content });
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
        // this.props.form.resetFields();
        // this.setState({ selectedValue: 0, radioInput: '' });
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
            message.error(sessionStorage.getItem('lang')==='zh_TW'? '留言內容不可為空':'Type your comment here.', 7);
        } else if(fieldsValues['showAsAlias']===1&&!radioInput){
            message.error('Alias should not be empty', 7);
        } else if(!err&&scanResult){
            const values = {
                'id':this.props.selCmnt.id,
                'modifiedBy': sessionStorage.getItem('@userInfo.id'),
                // 'isReply2cmnt': this.props.isReply2cmnt,
                ...fieldsValues,
                'content': getEData || "",
                'alias': fieldsValues['showAsAlias']===1? radioInput:'',
            };

            // this.props.form.resetFields();
            // this.setState({ selectedValue: 0, radioInput: '', editSubmitting: true });
            this.setState({ editSubmitting: true });

            this.props.handleCmntModifySubmit(values);

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
                        {max:1500, message: sessionStorage.getItem('lang')==='zh_TW'? '應用更多格式可能會影響你的評論長度(總長度300字以內)':'Content cannot be longer than 300 characters (html format considered).'}, 
                            // {required: true, message: sessionStorage.getItem('lang')==='zh_TW'? '內容不可為空':'Type your comment here.'}
                        ], 
                    // initialValue: this.state.cke_cmnt_ready? this.props.selCmnt.content:"", 
                    valuePropName: 'data', 
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
                    onInstanceReady = {evt=> {this.setState({ cke_cmnt_ready: true }); this.setContent(true, this.props.selCmnt)}}
                    />
                )}
                </Form.Item>

                {/* ***s=]*** Replier Name */}
                <Form.Item
                // label={sessionStorage.getItem('lang')==='zh_TW'? '':'Name to be used as the replier'}
                // // style={{ float: 'left' }}
                // style={{ float: 'left', display: 'inline-block', width: '60%', minHeight:'80px' }}
                >
                {getFieldDecorator('showAsAlias',{ initialValue: this.props.selCmnt.showAsAlias })(
                <RadioGroup onChange={this.onRadioChange}>
                    <Radio style={radioStyle} value={0}>{this.props.selCmnt.createdBy===undefined? null : (this.props.selCmnt.createdBy.fullname)}</Radio>
                    <Radio style={radioStyle} value={1}>
                    {intl.get('@MY_BLOG.ALIAS')}
                        {
                            this.state.selectedValue === -1?
                                (this.props.selCmnt.showAsAlias===1?
                                    <Input style={{ width: '8em', marginLeft:10 }} onChange={this.onRadioInputChange} defaultValue={this.props.selCmnt.alias} allowClear />
                                    :null)
                                : (this.state.selectedValue === 1?
                                    <Input style={{ width: '8em', marginLeft:10 }} onChange={this.onRadioInputChange} defaultValue={this.props.selCmnt.alias} allowClear />
                                    :null)
                        }
                    </Radio>
                </RadioGroup>
                )}
                </Form.Item>
                {/* ***s=]*** Button */}
                <Form.Item 
                // style={{ float: 'right', display: 'inline-block', width: '40%', minHeight:'80px' }}
                >
                    <Button loading={this.state.editSubmitting} shape="round" htmlType="submit" type="primary" >{intl.get('@MINI_BLOG.SUBMIT')}</Button>
                    <Popconfirm title={sessionStorage.getItem('lang')==='zh_TW'? '你將放棄此次編輯，確定？':'Sure to quit and discard this draft?'} okText={intl.get('@GENERAL.YES')} cancelText={intl.get('@GENERAL.CANCEL')} onConfirm={this.onPopconfirmOk}><Button style={{ marginLeft: '1em' }} shape="round">{intl.get('@MINI_BLOG.CANCEL')}</Button></Popconfirm>
                </Form.Item>
            </Form>
        )
    }
}

const WrappedCommentEditForm = Form.create({ name: 'comment_form_edit' })(CommentEditForm);
export default WrappedCommentEditForm;