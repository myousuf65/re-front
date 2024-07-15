//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200206 */
//Comments //***s=]*** 


import React from 'react';
import { Form, Input, Button, TreeSelect, Select, Icon, Radio, Popconfirm, Tooltip } from 'antd';
import RadioGroup from 'antd/lib/radio/group';

import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
const {Option} = Select;

class ForumCateForm extends React.Component{
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
      isFather: this.props.selRecord===undefined? true:(this.props.selRecord.parentForumId>0?false:true),
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

  onDeselectGroup=(value)=>{
    var selWriter = this.props.form.getFieldValue('specialUserList_writer');
    if(Array.isArray(selWriter)){
      var selWriterIndex = selWriter.map(String).indexOf(value);
      if(selWriterIndex > -1){
        selWriter.splice(selWriterIndex,1);
        this.props.form.setFieldsValue({ specialUserList_writer: selWriter});
      }
    }
  }

  validateARWriter=(rule, value, callback)=>{
    var readerList = this.props.form.getFieldValue('accessRules_access')
    if(!this.state.isFather&&Array.isArray(readerList)&&readerList.length>0){
      if(Array.isArray(value)&&value.length>0){
        return callback();
      }
      callback('Please nominate at least one writer group.');
    }else{
      return callback();
    }
  }

  validateSUWriter=(rule, value, callback)=>{
    var readerList = this.props.form.getFieldValue('specialUser_access');
    if(!this.state.isFather&&Array.isArray(readerList)&&readerList.length>0){
      if(Array.isArray(value)&&value.length>0){
        return callback();
      }
      callback('Please nominate at least one writer.');
    }else{
      return callback();
    }
  }
  
  handleSubmit=(e)=>{
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, fieldsValues)=>{
      if(!err){
        this.setState({ submitting: true });
        const values = {
          'id': this.props.selRecord.id,
          ...fieldsValues,
          'nameTc': fieldsValues['nameTc']===null||fieldsValues['nameTc']===''?fieldsValues['nameEn']:fieldsValues['nameTc'],
          'imgUrl': fieldsValues['imgUrl']||null,
          'tabStyle': fieldsValues['tabStyle']||null,
          'level': fieldsValues['parentForumId']===null||fieldsValues['parentForumId']===0? 1:2,
          'parentForumId': fieldsValues['parentForumId'] || 0,
        };

        if(this.state.isFather){
          values.accessChannel = 2;
          // delete values.accessChannel;
          delete values.showInfo;
          delete values.admin;
          delete values.orderBy;
          delete values.accessRules_access;
          delete values.accessRules_writer;
          delete values.specialUser_access;
          delete values.specialUser_writer;
          delete values.specialUserList_access;
          delete values.specialUserList_writer;
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

    const lv1Icons = [
      {id: 1, name: 'Buildings', path: 'category/embassy.png' },
      {id: 2, name: 'Files', path: 'category/paper.png' },
      {id: 3, name: 'Book', path: 'category/book.png' },
      {id: 4, name: 'People', path: 'category/teamwork.png' },
      {id: 5, name: 'Laws', path: 'category/law.png' },
    ]

    const lv2Icons = require('../forum_component/forum_icon_subCate.json');

    const lv1TabStyle = [
      {id: 1, value: 'color1', color: '#1eab85', description: 'Grass (default)' },
      {id: 2, value: 'color2', color: '#067d97', description: 'Blue-green' },
      {id: 3, value: 'color3', color: '#b84069', description: 'Red' },
      {id: 4, value: 'color4', color: '#476ac4', description: 'Sky' },
      {id: 5, value: 'color5', color: '#fd8c24', description: 'Orange' },
    ]

    return(
      <div>
        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left">

          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-EN')}>
            {getFieldDecorator('nameEn', { initialValue: selRecord.nameEN, rules: [{required: true, message: 'English Name is required.'}] })(
              <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-TC')}>
            {getFieldDecorator('nameTc', { initialValue: selRecord.nameTc })(
              <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>

          <Form.Item label="Icon">
            {getFieldDecorator('imgUrl', { initialValue: selRecord.imgUrl })(
              <Select allowClear mode="single" style={{ width: '100%' }}>
                {this.state.isFather? 
                lv1Icons.map(iPic=><Option key={iPic.id} value={iPic.path}><span><img style={{ height: '20px', width: 'auto', background: 'black' }} src={`images\\${iPic.path}`} alt={iPic.name} /></span> {iPic.name}</Option>)
                :lv2Icons.map(iPic=><Option key={iPic.id} value={iPic.path}><span><img style={{ height: '20px', width: 'auto' }} src={`images\\${iPic.path}`} alt={iPic.name} /></span> {iPic.name}</Option>)}
              </Select>
            )}
          </Form.Item>

          <Form.Item
          label=
          {<span>
            Tab Color&nbsp;
            <Tooltip title="Only appliable to level 1.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>}
          >
            {getFieldDecorator('tabStyle', { initialValue: selRecord.tabStyle||'color1' })(
              <Select disabled={!this.state.isFather} allowClear mode="single" style={{ width: '100%' }}>
                {lv1TabStyle.map(iClass=><Option key={iClass.id} value={iClass.value} style={{ background: iClass.color }} >{iClass.description}</Option>)}
              </Select>
            )}
          </Form.Item>

          <span hidden={this.state.isFather}>

          <Form.Item label={intl.get('@FORUM_ADMIN.PARENT')}>
            {getFieldDecorator('parentForumId', { initialValue: selRecord.parentForumId||null, rules: [{required: !this.state.isFather, message: 'Parent is required.'}] })(
              <TreeSelect 
              dropdownStyle={{ maxHeight: '200px', overflow: 'auto' }}
              allowClear
              dropdownMatchSelectWidth={true}
              treeData={cateOptions}
              />
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.GO-PUBLIC')}>
            {getFieldDecorator('showInfo', { initialValue: selRecord.showInfo===undefined||selRecord.showInfo===null? 1:selRecord.showInfo })(
              <RadioGroup>
                <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
              </RadioGroup>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
            {getFieldDecorator('accessChannel', { initialValue: selRecord.accessChannel||1 })(
              <RadioGroup>
                <Radio value={1}>{intl.get('@RES_DRAWER_INFO.ACCESS-INTRANET')}</Radio>
                <Radio value={2}>{intl.get('@RES_DRAWER_INFO.ACCESS-INTERNET')}</Radio>
              </RadioGroup>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.ORDER')}>
            {getFieldDecorator('orderBy', {initialValue: selRecord.orderBy||999})(
              <Select mode="single" style={{ width: '100%' }}>
                <Option key={999} value={999}>{ intl.get('@FORUM_ADMIN.DEFAULT') }</Option>
                <Option key={1} value={1}>1</Option>
                <Option key={2} value={2}>2</Option>
                <Option key={3} value={3}>3</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.ADMIN')}>
            {getFieldDecorator('admin', { initialValue: selRecord.admin?selRecord.admin.map(String):null, rules: [{required: !this.state.isFather, message: 'Admin is required.'}]})(
              <Select onSearch={this.onSearchUser} filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('accessRules_access',{initialValue: selRecord.accessRules_access?selRecord.accessRules_access.map(String):null})(
              <Select placeholder="Search by Access Rule Description" onDeselect={this.onDeselect} onChange={this.onChangeAccessRule} onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {getFieldDecorator('accessRules_writer', { initialValue: selRecord.accessRules_writer?selRecord.accessRules_writer.map(String):null })(
              <Select filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
                {/* {selRuleOptions.length===0? null:selRuleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})} */}
                {selRuleOptions? selRuleOptions:null }
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('specialUser_access', {initialValue: selRecord.specialUser_access?selRecord.specialUser_access.map(String):null})(
              <Select onDeselect={this.onDeselectUser} onChange={this.onChangeSpecialUser} onSearch={this.onSearchUser} filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {/* {getFieldDecorator('specialUser_writer', { initialValue: selRecord.specialUser_writer||null })( */}
            {getFieldDecorator('specialUser_writer', {initialValue: selRecord.specialUser_writer? selRecord.specialUser_writer.map(String):null})(
              <Select filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {selUserOptions.length===0? null: selUserOptions.map(item=>{ return <Option key={item}>{item}</Option>})}
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@SPL_USR_GRP.GENERAL')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('specialUserList_access', {initialValue: selRecord.specialGroup_access? selRecord.specialGroup_access.map(String):[]})(
              <Select onDeselect={this.onDeselectGroup} onChange={this.onChangeGroup} filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 } mode="multiple" style={{ width: '100%' }} >
                {!Array.isArray(groupOptions)||groupOptions.length===0? null:groupOptions.map(iGroup=>(<Option key={iGroup.id}>{iGroup.groupName}</Option>))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {getFieldDecorator('specialUserList_writer', {initialValue: selRecord.specialUserList_writer? selRecord.specialUserList_writer.map(String):[]})(
              <Select filterOption={false} mode="multiple" style={{ width: '100%' }} >
                {selGroupOptions? selGroupOptions:null }
              </Select>
            )}
          </Form.Item>
          <div style={{ paddingBottom: '30px' }} />
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

const WrappedForumCateForm = Form.create({name: 'forum_cate_form'})(ForumCateForm);
export default WrappedForumCateForm;