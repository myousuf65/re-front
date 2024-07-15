//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190517 */
//Comments //***s=]*** 



import React from 'react';
import { Icon, Form, Input, DatePicker, Radio, Checkbox, Button, Row, Col, Divider, Switch, Select, TreeSelect, Upload, message } from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import intl from 'react-intl-universal';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
import { authImg } from '../resources_component/authimg.js';

const { Option } = Select;

class RescForm extends React.Component{
    constructor(props){
        super(props);
        this.state={ 
            mode: 'time', 
            fileThumb: this.props.selRecord.thumbUrl||null,
            linkTo: this.props.selRecord.linkTo||null,
            accessChannel: [], 
            disableTimePicker: this.props.selRecord.latestNews===1? false:true, 
            disableDownloadType: this.props.selRecord.downloadOriginal===1? true: false,
            ruleOptions: [], 
            ruleOptions_km: [], 
            ruleOptions_ks: [], 
            ruleOptions_wg: [], 
            userOptions: null, 
            cateOptions: this.props.cateOptions,
            groupOptions: this.props.groupOptions,
            selCate: [],
            if_km: this.props.selRecord.if_km, 
            if_ks: this.props.selRecord.if_ks, 
            if_wg: this.props.selRecord.if_wg, 
            if_su: this.props.selRecord.if_su, 
            if_sulist: this.props.selRecord.if_sulist,
            userGroupId: this.props.userGroupId
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
        authImg();
    }

    handleCateChildren=(cate)=>{
        let currentLang = sessionStorage.getItem('lang');
        let treedCate = {
            title: currentLang==='zh_TW'? cate.nameTc:cate.nameEn,
            value: cate.id,
            key: cate.id
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

    handleAccessSUList = () => {
        this.setState({ if_sulist: !this.state.if_sulist });
    }

    handlePickerOpenChange = (open) => {
        if (open) {
            this.setState({ mode: 'time'});
        }
    }

    handlePickerPanelChange = (value, mode) => {
        this.setState({ mode });
    }
    
    disabledDate = (current) => {
        // Can not select days before today and today
        return current && current < moment().endOf('day');
      }

    handleRuleArray = (rules) => {
        return rules;
    }

    handleValidator = (rule, val, callback) => {
        if (!val) {
            callback();
        }

        let domainCorrect = val.startsWith(sessionStorage.getItem('@resourceVideoDomain'));
        let formatCorrect = val.endsWith(sessionStorage.getItem('@resourceVideoFormat'));
        if (domainCorrect && formatCorrect) {
            callback();
        }else {
            callback('Video Link Invalid');
        }
    }

    handleCateChange = (value) => {
        this.setState(state=>({ selCate: value }));
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

    handleThumbChange = info => {
        let status = info.file.status;
        let res = info.file.response;
        if(status === 'error'){
            
            if(res.status===401){
                message.error("Your Login Session is Expired.");
                sessionStorage.clear();
                window.location.assign('/');
            }else if(res.status===440){
                let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
                fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
                window.location.assign('#/failout');
            }else if(res.msg !== undefined && res.msg !== null){
                message.error("Failed to upload: " + res.msg);
            }else{
                message.error("Failed to upload.");
            }
        }else if(status === 'done'){
            // ------ update thumbnail
            let newFileThumb = res.data.nfilename? `resources/${res.data.nfilename}`:null;
            this.setState({ fileThumb: newFileThumb }, ()=>authImg());
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,fieldsValues)=>{
            if(!err){
                const values = {
                ...fieldsValues,
                'resourceTypeId': this.props.selRecord.resourceTypeId,
                'ofilename': this.props.selRecord.ofilename,
                'nfilename': this.props.selRecord.nfilename,
                'filesize': this.props.selRecord.filesize,
                'thumbUrl': this.state.fileThumb,
                // 'resCate': this.state.selCate,
               
                'latestNews': fieldsValues['latestNews']===true? 1 : 0,
                'latestNewsExpiry': fieldsValues['latestNews']===true? fieldsValues['latestNewsExpiry'].format('YYYY-MM-DD HH:mm:ss') : null,
                'accessChannel': fieldsValues['accessChannel']!=null? (fieldsValues['accessChannel']==="Internet"? ["Intranet","Internet"]:["Intranet"]): ["Intranet"], 
                'k_market': fieldsValues['if_km']===true? fieldsValues['k_market'] : [],
                'k_square': fieldsValues['if_ks']===true? fieldsValues['k_square'] : [],
                'wisdom_gallery': fieldsValues['if_wg']===true? fieldsValues['wisdom_gallery'] : [],
                'special_user': fieldsValues['if_su']===true? fieldsValues['special_user'] : [],
                'special_user_list': fieldsValues['if_sulist']===true? fieldsValues['special_user_list'] : [],
            };
            
            this.props.handleInfoForm(values);

            }
        });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const { originalname, videoLink, resourceTypeId, titleEn, titleTc, descEn, descTc,linkTo, resCate, accessChannel, latestNews, latestNewsExpiry, activated, 
            if_km, k_market, if_ks, k_square, if_wg, wisdom_gallery, if_su, special_user, if_sulist, special_user_list, downloadOriginal, downloadType } = this.props.selRecord;

        const { fileThumb, ruleOptions_km, ruleOptions_ks, ruleOptions_wg, userOptions, userGroupId, groupOptions, disableDownloadType } = this.state;

        const uploadProps = {
            name: 'file',
            multiple: false,
            action: sessionStorage.getItem('serverPort')+'upload/videoImg/?user='+sessionStorage.getItem('@userInfo.id'),
            headers: {'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,},
            accept: 'image/*',
            listType: 'text',
            onChange: this.handleThumbChange,
        }

        return(
            <div>
            <img 
            style={{ display: 'block', maxWidth: '50%', margin: '0 auto', paddingBottom: '5%' }} 
            alt={resourceTypeId>1? "VIDEO":"RES-DOC"}
            name="auth-img"
            data={fileThumb} 
            />

            <div style={{ padding: '0 0 5%' }} hidden={resourceTypeId!==2}>
                <Upload {...uploadProps}>
                    <Button>
                        <Icon type="upload" /> Upload Video Thumbnail
                    </Button>
                </Upload>
            </div>

            <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6}, }} wrapperCol={{xs:{span:24}, sm:{span:18},}} labelAlign="left" >
            
            {/* -------oFilename */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.FILENAME')}>
                    {getFieldDecorator('originalname', {initialValue: originalname })(
                        <Input disabled={resourceTypeId===2? false:true} />
                    )}
                </Form.Item>

            {/* -------videoLink */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.VIDEO-LINK')} help={resourceTypeId>1? "input rule: https://ams.csd.gov.hk/path/abc.mp4":null} >
                    {getFieldDecorator('videoLink', {initialValue: videoLink, rules: [{required: (resourceTypeId>1? true:false), whitespace: true}, {validator: this.handleValidator}]})(
                        <Input disabled={resourceTypeId>1? false : true}/>
                    )}
                </Form.Item>

            {/* -------titleEn */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.TITLE-EN')} help="please provide at least one title (EN or 中文)" >
                    {getFieldDecorator('titleEn', {initialValue: titleEn})(
                        <Input />
                    )}
                </Form.Item>
            
            {/* -------titleTc */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.TITLE-TC')} help="please provide at least one title (EN or 中文)">
                    {getFieldDecorator('titleTc', {initialValue: titleTc})(
                        <Input />
                    )}
                </Form.Item>

            {/* -------desc_en */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-EN')} help="please provide at least one Tag (EN or 中文)">
                    {getFieldDecorator('descEn', {initialValue: descEn})(
                        <Input />
                    )}
                </Form.Item>

            {/* -------desc_tc */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-TC')} help="please provide at least one Tag (EN or 中文)">
                    {getFieldDecorator('descTc', {initialValue: descTc})(
                        <Input />
                    )}
                </Form.Item>
            
            {/* -------desc_tc */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.LINK-TO')}>
                    {getFieldDecorator('linkTo', {initialValue: linkTo})(
                        <Input />
                    )}
                </Form.Item>
            
                <Divider />  

            {/* -------category */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.CATEGORY')} help="please assign at least one category">
                    {getFieldDecorator('resCate', {initialValue: resCate})(
                        <TreeSelect 
                        dropdownStyle={{ maxHeight: '300px', overflow: 'auto' }}
                        dropdownMatchSelectWidth={true}
                        allowClear={true}
                        treeData={this.state.cateOptions}
                        onChange={this.handleCateChange}
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

                {/* --------original download */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DOWNLOAD-ORIGINAL')}>
                    {getFieldDecorator('downloadOriginal', {initialValue: resourceTypeId===2? 0:(downloadOriginal||0)})(
                        <RadioGroup disabled={userGroupId!==5||resourceTypeId===2}>
                            <Radio value={1} onClick={()=>{this.setState({ disableDownloadType: true }); this.props.form.setFieldsValue({ downloadType: 1 })}}>{intl.get('@RES_DRAWER_INFO.DOWNLOAD-ORIGINAL-FILE')}</Radio>
                            <Radio value={0} onClick={()=>this.setState({ disableDownloadType: false })}>PDF</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

                <Form.Item label={intl.get('@RES_DRAWER_INFO.DOWNLOAD-TYPE')}>
                    {getFieldDecorator('downloadType', {initialValue: resourceTypeId===2? 0:(downloadType||0)})(
                        <RadioGroup disabled={userGroupId!==5||resourceTypeId===2||disableDownloadType}>
                            <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                            <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

            {/* -------access channel */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
                    {getFieldDecorator('accessChannel', { initialValue: (accessChannel.length>1? "Internet":"Intranet") })(
                        <RadioGroup disabled={userGroupId<5}>
                            <Radio value="Intranet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTRANET')}</Radio>
                            <Radio value="Internet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTERNET')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>
            
                <Row gutter={12}>
                    <Col span={8}>
                        {/* -------latest news */}
                        <Form.Item label={intl.get('@RES_DRAWER_INFO.LATEST-NEWS')}>
                            {getFieldDecorator('latestNews', {initialValue:this.props.selRecord.latestNews>0? true:false})(
                                <Switch disabled={userGroupId<5} defaultChecked={latestNews===1? true:false} onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                            )}
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        {/* -------latest news expiry */}
                        <Form.Item label={intl.get('@RES_DRAWER_INFO.EXPIRY-DATE')}>
                            {getFieldDecorator('latestNewsExpiry', {initialValue: latestNewsExpiry===null? moment().add(1,'days'):moment(latestNewsExpiry) })(
                                <DatePicker 
                                locale={locale}
                                format="YYYY-MM-DD HH:mm:ss"
                                mode={this.state.mode} 
                                disabled={this.state.disableTimePicker}
                                disabledDate={(current)=>{return current&&current<moment().endOf('day')}}
                                showTime
                                onOpenChange={this.handlePickerOpenChange} 
                                onChange={value=>console.log("DatePicker: ", value)}
                                onPanelChange={this.handlePickerPanelChange} 
                                />
                            )}
                        </Form.Item>
                    </Col>
                </Row>

            {/* -------show on page */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.SHOW-ON-PAGE')}>
                    {getFieldDecorator('activated', {initialValue: activated})(
                        <RadioGroup disabled={userGroupId!==5&&userGroupId!==3}>
                            <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                            <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

                <Divider />

                <h5 >{intl.get('@RES_MANAGEMENT.ACCESS-RULE')} </h5>
                <h6 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE-REMARKS')} </h6>
                <Form.Item>
                    {getFieldDecorator('if_km', {initialValue: if_km})(
                        <Checkbox defaultChecked={ if_km } onClick={this.handleAccessKM} >{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                   
                    {getFieldDecorator('k_market', {initialValue: k_market})(
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
                
                <Form.Item >                   
                    {getFieldDecorator('k_square', {initialValue: k_square})(
                        <Select optionFilterProp="label" disabled={!this.state.if_ks} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {ruleOptions_ks.length===0? null:ruleOptions_ks.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_wg', {initialValue: if_wg})(
                        <Checkbox defaultChecked={ if_wg } onClick={this.handleAccessWG} >{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                    
                    {getFieldDecorator('wisdom_gallery', {initialValue: wisdom_gallery})(
                        <Select optionFilterProp="label" disabled={!this.state.if_wg} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {ruleOptions_wg.length===0? null:ruleOptions_wg.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_su', {initialValue: if_su})(
                        <Checkbox defaultChecked={ if_su } onClick={this.handleAccessSU} >{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                   
                    {getFieldDecorator('special_user', {initialValue: special_user})(
                        <Select onSearch={this.handleSpecialUser} filterOption={false} optionLabelProp="value" disabled={!this.state.if_su} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶可為空":"special user can be left blank"} >
                            {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_sulist', {initialValue: if_sulist})(
                        <Checkbox defaultChecked={ if_sulist } onClick={this.handleAccessSUList} >{intl.get('@SPL_USR_GRP.GENERAL')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                   
                    {getFieldDecorator('special_user_list', {initialValue: special_user_list})(
                        <Select filterOption={false} disabled={!this.state.if_sulist} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶組可為空":"special user group can be left blank"} >
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

const WrappedRescForm = Form.create({ name: 'resc_creator' })(RescForm);

export default WrappedRescForm;