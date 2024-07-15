//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200206 */
//Comments //***s=]*** 


import React from 'react';
import {Layout, Form, Input, Button, TreeSelect, Select, Icon, Radio, message, Popconfirm, Tooltip } from 'antd';
import RadioGroup from 'antd/lib/radio/group';

import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

class ForumNewCateForm extends React.Component{
  state={ 
    userOptions: null, 
    cateOptions: [], 
    ruleOptions: [], 
    groupOptions: [],
    selRuleOptions: [], 
    selUserOptions: [], 
    selGroupOptions: [],
    imgUrl: '', 
    imgUrl_head: null, 
    loadingIcon: false, 
    submitting: false, 
    isFather: true 
  }

  componentWillMount = () =>{
    this.getForumCate();
    this.getSplUsrGroupList();
  }

  getForumCate=()=>{
      this.setState({ loading: true });
      let getForumCate_url = sessionStorage.getItem('serverPort')+'forum/admin/categoryall/'+sessionStorage.getItem('@userInfo.id');
      fetchData(getForumCate_url,'get',null,response=>{
          if(response.ifSuccess){
          let res = response.result;
              if(res.data !== undefined && res.status === 200){
                  this.handleCateList_Lv1(res.data);
              } else {
                  this.setState({
                      cateOptions: [],
                  });
              }
          }else{
              this.setState({
                  cateOptions: [],
              });
          }
      })
  }

  handleCateList_Lv1=(cateList)=>{
    let pre_cateList = cateList.map(cate=>({
        key: cate.id,
        value: cate.id,
        title: cate.nameTc===cate.nameEn? cate.nameEn:`${cate.nameEn} (${cate.nameTc})`,
    }));
    this.setState({ cateOptions: pre_cateList });
  }

  onChangeParentId=(selParentId)=>{
    if(selParentId!==undefined&&selParentId!==null&&selParentId!==0){
      if(this.state.isFather){
        this.setState({ isFather: false });
        this.props.form.setFieldsValue({ imgUrl: null });
      }
    }else{
      if(!this.state.isFather){
        this.setState({ isFather: true });
        this.props.form.setFieldsValue({ imgUrl: null });
      }
    }
  }

  getSplUsrGroupList = () =>{
    let getSUGrpList_url = sessionStorage.getItem('serverPort')+'splusrgrp/getAll/'+sessionStorage.getItem('@userInfo.id');
    
    fetchData(getSUGrpList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&Array.isArray(res.data)){
          this.setState({ groupOptions: res.data.sort((a,b) => (a.groupName > b.groupName) ? 1 : ((b.groupName > a.groupName) ? -1 : 0)) });
        }else{
            this.setState({ groupOptions: [] });
        }
      }else{
        this.setState({ groupOptions: [] });
      }
    })
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
    if(Array.isArray(selWriter)){
      var selWriterIndex = selWriter.indexOf(value);
      if(selWriterIndex > -1){
        selWriter.splice(selWriterIndex,1)
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
      var selWriterIndex = selWriter.indexOf(value);
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
        this.setState({submitting:true});
        var values = {
          ...fieldsValues,
          'nameTc': fieldsValues['nameTc']===undefined||fieldsValues['nameTc']===null||fieldsValues['nameTc']===''?fieldsValues['nameEn']:fieldsValues['nameTc'],
          'imgUrl': fieldsValues['imgUrl']||null,
          'tabStyle': fieldsValues['tabStyle']||null,
          'level': this.state.isFather? 1:2,
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

        // setTimeout(()=>{console.log('forumCate Creation: ', values); this.setState({submitting:false});}, 1000)

        let newCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/create/'+sessionStorage.getItem('@userInfo.id');
        fetchData(newCate_url,'post',values,response=>{
          if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  message.success('Create Successfully!');
                  this.setState({submitting:false});
                  window.location.assign('#/adminconsole/kc/category/management');
              }else{
                  message.error(res.msg);
                  this.setState({submitting:false});
              }
          }else{
              message.error('Server denied.');
              this.setState({submitting:false});
          }
        })
      }
    })
  }

  handleCancel=(e)=>{
    message.success(sessionStorage.getItem('lang')==='zh_TW'? '取消創建':'Creation Cancelled');
    window.location.assign('#/adminconsole/kc/category/management');
  }

  render(){
    const { getFieldDecorator } = this.props.form;
    const { Option } = Select;
    const { Content } = Layout;
    const { cateOptions, userOptions, ruleOptions, groupOptions, selRuleOptions, selUserOptions, selGroupOptions, submitting } = this.state;

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
      <div className="clearfix" style={{ width:'100%' }} >
      <Content className="cms-content" >
        <h1>
          <div style={{ display: 'inline-block', width: '60%' }}>
          {intl.get('@FORUM_ADMIN.CREATION')}
          </div>

          <div style={{ display: 'inline-block', width: '40%', textAlign: 'right' }}>
              <Button className="res_create_btn" shape="round" type="primary" href="#/adminconsole/kc/category/management" ><Icon type="rollback" /> {intl.get("@RES_MANAGEMENT.BACK")}</Button>
          </div>
        </h1>

        <div className="cms-white-box">
        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left">

          <Form.Item 
          label={
            <span>
              {intl.get('@FORUM_ADMIN.PARENT')}&nbsp;
              <Tooltip title="Leave it empty if new category belongs to level 1.">
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          }
          >
            {getFieldDecorator('parentForumId', { initialValue: null })(
              <TreeSelect 
              dropdownStyle={{ maxHeight: '200px', overflow: 'auto' }}
              allowClear
              dropdownMatchSelectWidth={true}
              treeData={cateOptions}
              onChange={this.onChangeParentId}
              />
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-EN')}>
            {getFieldDecorator('nameEn', {rules: [{required: true, message: 'English Name is required.'}]})(
              <Input allowClear style={{maxWidth: '400px'}} />
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.NAME-TC')}>
            {getFieldDecorator('nameTc')(
              <Input allowClear style={{maxWidth: '400px'}} />
            )}
          </Form.Item>

          <Form.Item label="Icon">
            {getFieldDecorator('imgUrl')(
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
            {getFieldDecorator('tabStyle', { initialValue: 'color1' })(
              <Select disabled={!this.state.isFather} allowClear mode="single" style={{ width: '100%' }}>
                {lv1TabStyle.map(iClass=><Option key={iClass.id} value={iClass.value} style={{ background: iClass.color }} >{iClass.description}</Option>)}
              </Select>
            )}
          </Form.Item>

          <span hidden={this.state.isFather}>

          <Form.Item label={intl.get('@FORUM_ADMIN.GO-PUBLIC')}>
            {getFieldDecorator('showInfo', { initialValue: 1 })(
              <RadioGroup>
                <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
              </RadioGroup>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
            {getFieldDecorator('accessChannel', { initialValue: 1 })(
              <RadioGroup>
                <Radio value={1}>{intl.get('@RES_DRAWER_INFO.ACCESS-INTRANET')}</Radio>
                <Radio value={2}>{intl.get('@RES_DRAWER_INFO.ACCESS-INTERNET')}</Radio>
              </RadioGroup>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.ORDER')}>
            {getFieldDecorator('orderBy', {initialValue: 999})(
              <Select mode="single" style={{ width: '100%' }}>
                <Option key={999} value={999}>{ intl.get('@FORUM_ADMIN.DEFAULT') }</Option>
                <Option key={1} value={1}>1</Option>
                <Option key={2} value={2}>2</Option>
                <Option key={3} value={3}>3</Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.ADMIN')}>
            {getFieldDecorator('admin', {rules: [{required: !this.state.isFather, message: 'Admin is required.'}]})(
              <Select onSearch={this.onSearchUser} filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('accessRules_access')(
              <Select placeholder="Search by Access Rule Description" onDeselect={this.onDeselect} onChange={this.onChangeAccessRule} onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {getFieldDecorator('accessRules_writer')(
              <Select filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
                {selRuleOptions? selRuleOptions:null }
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('specialUser_access')(
              <Select onDeselect={this.onDeselectUser} onChange={this.onChangeSpecialUser} onSearch={this.onSearchUser} filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {getFieldDecorator('specialUser_writer')(
              <Select filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
                {selUserOptions.length===0? null: selUserOptions.map(item=>{ return <Option key={item}>{item}</Option>})}
              </Select>
            )}
          </Form.Item>

          <h5 style={{ paddingBottom: '16px' }}>{intl.get('@SPL_USR_GRP.GENERAL')}</h5>

          <Form.Item label={intl.get('@FORUM_ADMIN.READER')}>
            {getFieldDecorator('specialUserList_access')(
              <Select onDeselect={this.onDeselectGroup} onChange={this.onChangeGroup} filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0 } mode="multiple" style={{ width: '100%' }} >
                {!Array.isArray(groupOptions)||groupOptions.length===0? null:groupOptions.map(iGroup=>(<Option key={iGroup.id}>{iGroup.groupName}</Option>))}
              </Select>
            )}
          </Form.Item>

          <Form.Item label={intl.get('@FORUM_ADMIN.WRITER')}>
            {getFieldDecorator('specialUserList_writer')(
              <Select filterOption={false} mode="multiple" style={{ width: '100%' }} >
                {selGroupOptions? selGroupOptions:null }
              </Select>
            )}
          </Form.Item>
          </span>

          <Form.Item>
            <Button style={{ marginRight: '8px' }}  type="primary" onClick={ this.handleSubmit } loading={submitting}>{intl.get('@GENERAL.CREATE')}</Button>
            <Popconfirm placement="topRight" title={sessionStorage.getItem('lang')==='zh_TW'? '你將放棄此次編輯，確定？':'Sure to quit and discard this draft?'} okText={intl.get('@GENERAL.YES')} cancelText={intl.get('@GENERAL.CANCEL')} onConfirm={this.handleCancel}>
              <Button type="danger" disabled={submitting} >{intl.get('@GENERAL.CANCEL')}</Button>
            </Popconfirm>
          </Form.Item>
        </Form>
        </div>
      </Content>
      </div>
    )
  }
}

const WrappedForumNewCateForm = Form.create({name: 'forum_new_cate_form'})(ForumNewCateForm);
export default WrappedForumNewCateForm;