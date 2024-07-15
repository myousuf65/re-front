//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190528 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Checkbox, Button, Select, Icon, DatePicker, Radio, Switch, TreeSelect, Divider, Input } from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import moment from 'moment';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

const { Option } = Select;

class ResEditForm extends React.Component{
    constructor(props){
        super(props);
        this.state={ 
          mode: 'time', 
          disableTag: true,
          disableCate: true,
          disableTimePicker: true, 
          disableDownloadType: false,
          ruleOptions: [], 
          ruleOptions_km: [], 
          ruleOptions_ks: [], 
          ruleOptions_wg: [], 
          userOptions: null, 
          cateOptions: this.props.cateOptions||[],
          selCate: [],
          if_km: false, 
          if_ks: false, 
          if_wg: false, 
          if_su: false, 
          if_sulist: false, 
          userGroupId: this.props.userGroupId,
          groupOptions: []
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.cateOptions!==this.state.cateOptions){
            this.setState({ cateOptions: nextProps.cateOptions })
        };

        if(nextProps.groupOptions!==this.state.groupOptions){
            this.setState({ groupOptions: nextProps.groupOptions })
        };

        if(nextProps.userGroupId!==this.state.userGroupId){
            this.setState({ userGroupId: nextProps.userGroupId })
        };
    }

    componentDidMount(){
        this.getAccessRule();
        this.setState({ groupOptions: this.props.groupOptions });
    }

    handleCateChildren=(cate)=>{
        let currentLang = sessionStorage.getItem('lang');
        let treedCate = {
            title: currentLang==='zh_TW'? cate.nameTc:cate.nameEn,
            value: cate.id,
            key: cate.id,
        };
        if(cate.children!==null){
            let children = cate.children.map(childCate=>{
                return this.handleCateChildren(childCate);
            });
            treedCate.children = children;
            // treedCate.disabled = true;
        }
        return treedCate;
    }

    handleCateChange = (value) => {
        this.setState(state=>({ selCate: value }));
    }

    getAccessRule=()=>{
        let accessRule_url = sessionStorage.getItem('serverPort')+'resource/getAllRAR/'+sessionStorage.getItem('@userInfo.id');
        fetchData(accessRule_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                this.setState(state=>({ 
                    ruleOptions: res.data, 
                    ruleOptions_km: res.data.kmarket, 
                    ruleOptions_ks: res.data.ksquare, 
                    ruleOptions_wg: res.data.wisdomgallery, 
                }));
              }else{
                this.setState(state=>({ 
                    ruleOptions: [], 
                    ruleOptions_km: [], 
                    ruleOptions_ks: [], 
                    ruleOptions_wg: []
                }));                
              }
            }
        });
    }

    onSwitchClick = (checked) => {
      this.setState({ disableTimePicker: !checked });
    }

    handlePickerOpenChange = (open) => {
        if (open) {
          this.setState({ mode: 'time'});
        }
    }

    handlePickerPanelChange = (value, mode) => {
        this.setState({ mode });
    }

    handleAccessKM = () => {
        this.setState({ if_km: !this.state.if_km });
    }

    handleAccessKS = () => {
        this.setState({ if_ks: !this.state.if_ks });
    }

    handleAccessWG = () => {
        this.setState({ if_wg: !this.state.if_wg });
    }

    handleAccessSU = () => {
        this.setState({ if_su: !this.state.if_su });
    }

    handleAccessSUList = () =>{
        this.setState({ if_sulist: !this.state.if_sulist });
    }

    onCheckBoxChange = (e) => {
        this.setState(state=>({ disableCate: !e.target.checked }));
        return e.target.checked;
    }

    handleTagUpdate = (e) => {
        this.setState(state=>({ disableTag: !e.target.checked }));
        return e.target.checked;
    }

    handleSpecialUser = (inputs) => {
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
                }
            })
        }else{
            this.setState(state=>({ userOptions: null }));
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,fieldsValues)=>{
            if(!err){
              const values = {
              ...fieldsValues,
            //   'resCate': this.state.selCate,
            //   'resCate': this.state.disableCate? [] : fieldsValues['resCate'],
              'descEn': fieldsValues['descEn']===""&&fieldsValues['descTc']!==""? fieldsValues['descTc']:fieldsValues['descEn'],
              'descTc': fieldsValues['descTc']===""&&fieldsValues['descEn']!==""? fieldsValues['descEn']:fieldsValues['descTc'],
              'latestNews': fieldsValues['latestNews']===true? 1 : 0,
              'latestNewsExpiry': fieldsValues['latestNews']===true? fieldsValues['latestNewsExpiry'].format('YYYY-MM-DD HH:mm:ss') || null : null,
              'accessChannel': fieldsValues['accessChannel']!==null? (fieldsValues['accessChannel']==="Internet"? ["Intranet","Internet"]:["Intranet"]): ["Intranet"], 
              'k_market': fieldsValues['if_km']===true? fieldsValues['k_market'] : [],
              'k_square': fieldsValues['if_ks']===true? fieldsValues['k_square'] : [],
              'wisdom_gallery': fieldsValues['if_wg']===true? fieldsValues['wisdom_gallery'] : [],
              'special_user': fieldsValues['if_su']===true? fieldsValues['special_user'] : [],
              'special_user_list': fieldsValues['if_sulist']===true? fieldsValues['special_user_list'] : [],
            };

            if (this.state.disableTag){
                delete values['descEn'];
                delete values['descTc'];
            }

            if (this.state.disableCate){
                delete values['resCate'];
            }

            if(this.state.userGroupId===5){

            }else if(this.state.userGroupId===3){
                delete values['downloadOriginal']; //--uat
                delete values['downloadType']; //--uat
                delete values['accessChannel'];
                delete values['latestNews'];
                delete values['latestNewsExpiry'];
            }else{
                delete values['downloadOriginal']; //--uat
                delete values['downloadType']; //--uat
                delete values['accessChannel'];
                delete values['latestNews'];
                delete values['latestNewsExpiry'];
                delete values['activated'];
            }

            this.props.handleMultiEditor(values);

            }
        });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const { disableTag, disableCate, ruleOptions_km, ruleOptions_ks, ruleOptions_wg, userOptions, disableTimePicker, mode, if_km, if_ks, if_wg, if_su, userGroupId, if_sulist, groupOptions, disableDownloadType } = this.state;

        return(
            <div>

            <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6}, }} wrapperCol={{xs:{span:24}, sm:{span:18},}} labelAlign="left" >
            
                {/* -------Tag */}
                <Form.Item help={disableTag? null:"please provide at least one tag (EN or 中文)" }>
                    {getFieldDecorator('updateTag', {initialValue: false, getValueFromEvent: this.handleTagUpdate})(
                        <Checkbox onChange={this.handleTagUpdate}>Update Tag</Checkbox>
                    )}
                </Form.Item>
                {/* -------desc_en */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-EN')}>
                    {getFieldDecorator('descEn', {initialValue:""})(
                        <Input disabled={disableTag} style={{ lineHeight: 0}} allowClear />
                    )}
                </Form.Item>

                {/* -------desc_tc */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-TC')}>
                    {getFieldDecorator('descTc', {initialValue:""})(
                        <Input disabled={disableTag} style={{ lineHeight: 0}} allowClear />
                    )}
                </Form.Item>
                
                <Divider />

                {/* -------category */}
                <Form.Item>
                    {getFieldDecorator('updateCate', {initialValue: false, getValueFromEvent: this.onCheckBoxChange})(
                        <Checkbox onChange={this.onCheckBoxChange}>Update Category</Checkbox>
                    )}
                </Form.Item>
                <Form.Item label={intl.get('@RES_DRAWER_INFO.CATEGORY')} help={disableCate? null:"please assign at least one category"}>
                    {getFieldDecorator('resCate', {initialValue: []})(
                        <TreeSelect 
                        dropdownStyle={{ maxHeight: '300px', overflow: 'auto' }}
                        dropdownMatchSelectWidth={true}
                        allowClear={true}
                        treeData={this.state.cateOptions}
                        onChange={this.handleCateChange}
                        disabled={disableCate}
                        // treeCheckable={true}
                        multiple={true}
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        />
                    )}
                </Form.Item>
                
                <Divider />

                {userGroupId!==5? 
                (
                    <div style={{ whiteSpace: 'pre-wrap', paddingBottom: '1em', color: '#007bff' }}>
                        <b>{intl.get('@RES_DRAWER_INFO.PUBLISH-REMARKS-1')}</b>
                        {intl.get('@RES_DRAWER_INFO.PUBLISH-REMARKS-2')}
                        <b>{(userGroupId!==3? (intl.get('@RES_DRAWER_INFO.SHOW-ON-PAGE')+', '):'')+intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}</b>
                        {(sessionStorage.getItem('lang')==='zh_TW'? "或":" or ")}
                        <b>{intl.get('@RES_DRAWER_INFO.LATEST-NEWS')}</b> 
                        {intl.get('@RES_DRAWER_INFO.PUBLISH-REMARKS-3')}
                    </div>
                )
                :null}

                {/* -------original download*/}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DOWNLOAD-ORIGINAL')}>
                    {getFieldDecorator('downloadOriginal', {initialValue: 0})(
                        <RadioGroup disabled={userGroupId!==5}>
                            <Radio value={1} onClick={()=>{this.setState({ disableDownloadType: true }); this.props.form.setFieldsValue({ downloadType: 1 })}}>{intl.get('@RES_DRAWER_INFO.DOWNLOAD-ORIGINAL-FILE')}</Radio>
                            <Radio value={0} onClick={()=>this.setState({ disableDownloadType: false })}>PDF</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

                <Form.Item label={intl.get('@RES_DRAWER_INFO.DOWNLOAD-TYPE')}>
                    {getFieldDecorator('downloadType', {initialValue: 0})(
                        <RadioGroup disabled={userGroupId!==5||disableDownloadType}>
                            <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                            <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

              {/* -------access channel*/}
              <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
                {getFieldDecorator('accessChannel', { initialValue: 'Intranet' })(
                    <RadioGroup disabled={userGroupId<5}>
                        <Radio value="Intranet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTRANET')}</Radio>
                        <Radio value="Internet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTERNET')}</Radio>
                    </RadioGroup>
                )}
              </Form.Item>
            
              {/* -------latest news */}
              <Form.Item label={intl.get('@RES_DRAWER_INFO.LATEST-NEWS')}>
                {getFieldDecorator('latestNews')(
                    <Switch disabled={userGroupId<5} onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                )}
              </Form.Item>

              {/* -------latest news expiry date*/}
              <Form.Item label={intl.get('@RES_DRAWER_INFO.EXPIRY-DATE')}>
                {getFieldDecorator('latestNewsExpiry', {initialValue: moment().add(1,'days') })(
                  <DatePicker 
                    locale={locale}
                    format="YYYY-MM-DD HH:mm:ss"
                    mode={mode} 
                    disabled={disableTimePicker}
                    disabledDate={(current)=>{return current&&current<moment().endOf('day')}}
                    showTime
                    onOpenChange={this.handlePickerOpenChange} 
                    onChange={value=>console.log("DatePicker: ", value)}
                    onPanelChange={this.handlePickerPanelChange} 
                  />
                )}
              </Form.Item>


          {/* -------show on page */}
              <Form.Item label={intl.get('@RES_DRAWER_INFO.SHOW-ON-PAGE')}>
                  {getFieldDecorator('activated', {initialValue: 0})(
                      <RadioGroup disabled={userGroupId!==5&&userGroupId!==3}>
                          <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                          <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
                      </RadioGroup>
                  )}
              </Form.Item>

              <Divider />
              
              <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE')}</h5>
              <h6 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE-REMARKS')} </h6>
              <Form.Item>
                {getFieldDecorator('if_km', {initialValue: if_km})(
                    <Checkbox onClick={this.handleAccessKM} >{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
                )}
              </Form.Item>

              <Form.Item>
                {getFieldDecorator('k_market')(
                    <Select optionFilterProp="label" disabled={!this.state.if_km} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                        {ruleOptions_km.length===0? null:ruleOptions_km.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                    </Select>
                )}
              </Form.Item>

              
              <Form.Item >
                  {getFieldDecorator('if_ks', {initialValue: if_ks})(
                      <Checkbox defaultChecked={ if_ks } onClick={this.handleAccessKS} >{intl.get('@RES_MANAGEMENT.K-SQUARE')}</Checkbox>
                  )}
              </Form.Item>

              <Form.Item>
                  {getFieldDecorator('k_square')(
                      <Select optionFilterProp="label" disabled={!this.state.if_ks} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                          {ruleOptions_ks.length===0? null:ruleOptions_ks.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                      </Select>
                  )}
              </Form.Item>

              <Form.Item>
                  {getFieldDecorator('if_wg', {initialValue: if_wg})(
                      <Checkbox onClick={this.handleAccessWG} >{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
                  )}
              </Form.Item>

              <Form.Item>
                  {getFieldDecorator('wisdom_gallery')(
                      <Select optionFilterProp="label" disabled={!this.state.if_wg} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {ruleOptions_wg.length===0? null:ruleOptions_wg.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                      </Select>
                  )}
              </Form.Item>

              <Form.Item>
                  {getFieldDecorator('if_su', {initialValue: if_su})(
                      <Checkbox onClick={this.handleAccessSU} >{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</Checkbox>
                  )}
              </Form.Item>

              <Form.Item>
                  {getFieldDecorator('special_user')(
                      <Select onSearch={this.handleSpecialUser} filterOption={false} optionLabelProp="value" disabled={!this.state.if_su} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶可為空":"special user can be left blank"} >
                        {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
                      </Select>
                  )}
              </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_sulist', {initialValue: if_sulist})(
                        <Checkbox onClick={this.handleAccessSUList} >{intl.get('@SPL_USR_GRP.GENERAL')}</Checkbox>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('special_user_list')(
                        <Select disabled={!this.state.if_sulist} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶組可為空":"special user group can be left blank"} >
                            {!Array.isArray(groupOptions)? null:groupOptions.map(item=><Option key={item.id} value={item.id}>{item.groupName}</Option>)}
                        </Select>
                    )}
                </Form.Item>
              
              <div style={{ paddingBottom: '50px' }} />
            
            </Form>

            <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
                <Button style={{ marginRight: '8px' }} type="primary" onClick={ this.handleSubmit }>{intl.get('@RES_DRAWER_INFO.SAVE')}</Button>
            </div>

            </div>
        )
    }
}

const WrappedResEditForm = Form.create({ name: 'res_editor' })(ResEditForm);

export default WrappedResEditForm;