//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200206 */
//Comments //***s=]*** 


import React from 'react';
import { Form, Input, Button, TreeSelect, Select, Popconfirm} from 'antd';

import CKEditor from 'ckeditor4-react';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
const {Option} = Select;

class FaqCateForm extends React.Component{
  state={ 
    userOptions: null, 
    ruleOptions: [], 
    groupOptions: [],
    selRuleOptions: [], 
    selUserOptions: [], 
    selGroupOptions: [],
    imgUrl: null, 
    imgUrl_head: null, 
    loadingIcon: false, 
    isFather: true, 
    submitting: false, 
    deleting: false,
  }

  componentDidMount(){
    this.initialRuleOptions();
    
    this.setState({ 
      isFather: this.props.selRecord===undefined? true:(this.props.selRecord.level===0?true:false),
      selUserOptions: this.props.selRecord===undefined? []:(this.props.selRecord.specialUser_access||[]),
      groupOptions: this.props.groupOptions || [],
    })

    this.initialSelGroupOptions();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.updating!==this.state.submitting){
      this.setState({ submitting: nextProps.updating });
    }
    if(nextProps.deleting!==this.state.deleting){
      this.setState({ deleting: nextProps.deleting});
    }
  }


  onEditorChange=(event) => {
    let data = event.editor.getData();
    this.setState(state=>({ content: data }));
    return data;
}


  initialSelGroupOptions=()=>{
    const { selRecord, groupOptions } = this.props;
    if(!selRecord || !selRecord.specialGroup_access || !groupOptions){
      return
    }

    let selGroupOptions =groupOptions.filter(item=>selRecord.specialGroup_access.find(sel=>sel===item.id));
    this.setState({ selGroupOptions: selGroupOptions.map(iGroup=>(<Option key={iGroup.id}>{iGroup.groupName}</Option>)) })
  }

  initialRuleOptions=()=>{
    if(this.props.selRecord){
      let selReader = this.props.selRecord.accessRules_access||[];
      var selReaderArray = [];
      let getARbyId_header = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1&id=';

      selReader.forEach((iReaderId,index,array)=>{
        fetchData(getARbyId_header+iReaderId, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&res.data!==undefined&&res.data[0]!==undefined){
              selReaderArray.push(res.data[0]);
            }else{
              selReaderArray.push({id: iReaderId, description: `Invalid ${iReaderId}`});
            }
          }else{
            selReaderArray.push({id: iReaderId, description: `Invalid ${iReaderId}`});
          }

          if(index===array.length-1){
            console.log('selReaderArray: ',selReaderArray)
            this.setState({ ruleOptions: selReaderArray, selRuleOptions: selReaderArray.map(item=><Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>) });
          }
        });
      });
    }
  }


  onSearchUser = (inputs) => {
    if(inputs){
      let getUserByStaffNo_url = sessionStorage.getItem('serverPort')+'user/getUserByStaffNo/'+sessionStorage.getItem('@userInfo.id')+'?staffNo='+inputs;
      fetchData(getUserByStaffNo_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200&&res.data!==undefined){
            this.setState(state=>({ userOptions: res.data }));
          }else{
            this.setState(state=>({ userOptions: null }));
          }
        }else{
          this.setState(state=>({ userOptions: null }));
        }
      })
    }
  }

  onSearchAccessRule=(inputs)=>{
    if(inputs===undefined||inputs===null||inputs===''){
      this.setState(state=>({ ruleOptions: [] }));
    }else{
      let getARbyDesc_url = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1&description='+inputs;
      fetchData(getARbyDesc_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200&&res.data!==undefined){
            this.setState(state=>({ ruleOptions: res.data }));
          }else{
            this.setState(state=>({ ruleOptions: [] }));
          }
        }else{
          this.setState(state=>({ ruleOptions: [] }));
        }
      })
    }
  }

  onChangeAccessRule=(value, option)=>{
    this.setState({ selRuleOptions: option });
  }

  onDeselect=(value)=>{
    var selWriter = this.props.form.getFieldValue('accessRules_writer');
    console.log(value);
    console.log(selWriter);
    if(Array.isArray(selWriter)){
      // var selWriterIndex = selWriter.map(String).indexOf(value);
      var selWriterIndex = selWriter.indexOf(value);
      console.log(selWriterIndex)
      if(selWriterIndex > -1){
        selWriter.splice(selWriterIndex,1);
        this.props.form.setFieldsValue({ accessRules_writer: selWriter});
      }
    }
  }

  onChangeSpecialUser=(value)=>{
    this.setState({ selUserOptions: value });
  }

  onDeselectUser=(value)=>{
    var selWriter = this.props.form.getFieldValue('specialUser_writer');
    if(Array.isArray(selWriter)){
      var selWriterIndex = selWriter.map(String).indexOf(value);
      // var selWriterIndex = selWriter.indexOf(value);
      if(selWriterIndex > -1){
        selWriter.splice(selWriterIndex,1);
        this.props.form.setFieldsValue({ specialUser_writer: selWriter});
      }
    }
  }

  onChangeGroup=(value, option)=>{
    this.setState({ selGroupOptions: option })
  }

  

  

  
  handleSubmit=(e)=>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, fieldsValues)=>{
      if(!err){
        this.setState({ submitting: true });
        const values = {
          'id': this.props.selRecord.id,
          ...fieldsValues,
          'titleTc': fieldsValues['titleTc']===null||fieldsValues['titleTc']===''?fieldsValues['titleEn']:fieldsValues['titleTc'],
          'level': fieldsValues['parentForumId']===null||fieldsValues['parentForumId']===0? 1:2,
          'parentForumId': fieldsValues['parentForumId'] || 0,
        };

        if(this.state.isFather){
          values.accessChannel = 2;
          // delete values.accessChannel;
          delete values.showInfo;
          delete values.admin;
          delete values.orderBy;
        }else{
          delete values.tabStyle;
        }
        // console.log('forumCate Edit', values);
        // setTimeout(()=>{this.setState({ submitting: false })},1000)

        this.props.handleInfoForm(values);
      }
    })
  }

  handleDelete=(e)=>{
    this.setState({ deleting:true });
    this.props.handleDelete(this.props.selRecord.id)
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const { selRecord, cateOptions } = this.props;
    const { userOptions, ruleOptions, groupOptions, selRuleOptions, selUserOptions, selGroupOptions, submitting, deleting } = this.state;

     return(
      <div>
        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left">




        <span hidden={selRecord.level===1}>
          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-EN')}>
            {getFieldDecorator('titleEn', { initialValue: selRecord.titleEn })(
              <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-TC')}>
            {getFieldDecorator('titleTc', { initialValue: selRecord.titleTc })(
              <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>
        </span>
        <span hidden={selRecord.level===0}>
        <Form.Item label={intl.get('@FAQ_ADMIN.QUESTION-EN')}>
            {getFieldDecorator('QuestionEn', { initialValue: selRecord.questionEn})(
              <textarea   style={{minWidth: '500px'}} allowClear />
            )}
          </Form.Item>
          <Form.Item label={intl.get('@FAQ_ADMIN.QUESTION-TC')}>
            {getFieldDecorator('QuestionTc', { initialValue: selRecord.questionTc })(
              <textarea style={{minWidth: '500px'}} allowClear />
            )}
          </Form.Item>
          <Form.Item label={intl.get('@FAQ_ADMIN.ANSWER-EN')}>
            {getFieldDecorator('AnswerEn', { initialValue: selRecord.answerEn, valuePropName: 'data',getValueFromEvent: this.onEditorChange  })(
              // <textarea style={{minWidth: '500px'}} allowClear />
              <CKEditor 
              config={{
                  // language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                  toolbar: [
                      { name: 'clipboard', items: [ 'Undo', 'Redo' ] },
                      { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                      { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', '-', 'RemoveFormat' ] },
                      { name: 'insert', items: [ 'EmojiPanel' ] },
                  ],
              }}
              onChange={this.onEditorChange}
              />

            )}
          </Form.Item>
          <Form.Item label={intl.get('@FAQ_ADMIN.ANSWER-TC')}>
            {getFieldDecorator('AnswerTc', { initialValue: selRecord.answerTc,valuePropName: 'data',getValueFromEvent: this.onEditorChange   })(
              // <textarea  style={{minWidth: '500px'}} allowClear />
              <CKEditor 
              config={{
                  // language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                  toolbar: [
                      { name: 'clipboard', items: [ 'Undo', 'Redo' ] },
                      { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                      { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Strike', '-', 'RemoveFormat' ] },
                      { name: 'insert', items: [ 'EmojiPanel' ] },
                  ],
              }}
              onChange={this.onEditorChange}
              />
            )}
          </Form.Item>
        </span>

        </Form>

        <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
          <Button style={{ marginRight: '8px' }} disabled={deleting} type="primary" onClick={ this.handleSubmit } loading={submitting}>{intl.get('@GENERAL.SAVE')}</Button>
          <Popconfirm placement="topRight" title={sessionStorage.getItem('lang')==='zh_TW'? '你將刪除該主題，確定？':'Sure to delete this category?'} okText={intl.get('@GENERAL.YES')} cancelText={intl.get('@GENERAL.CANCEL')} onConfirm={this.handleDelete}>
            <Button type="danger" disabled={submitting} loading={deleting} >{intl.get('@GENERAL.DELETE')}</Button>
          </Popconfirm>
        </div>
      </div>
    )
  }
}

const WrappedFaqCateForm = Form.create({name: 'faq_cate_form'})(FaqCateForm);
export default WrappedFaqCateForm;
