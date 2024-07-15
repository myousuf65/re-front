//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190517 */
//Comments //***s=]*** 



import React from 'react';
import { Icon, Form, Input, DatePicker, Radio, Checkbox, Button, Row, Col, Divider, Switch, Select, message, TreeSelect, Upload} from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import intl from 'react-intl-universal';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
import { authImg } from '../resources_component/authimg.js';

const { Option } = Select;

class RescForm extends React.Component{

    state={ 
        fileThumb: null,
        mode: 'time',
        accessChannel: [], 
        disableTimePicker: this.props.selRecord.resource.latestNews===1? false:true, 
        disableDownloadType: this.props.selRecord.resource.asWord===1? true: false,
        ruleOptions: [], 
        ruleOptions_km: [], 
        ruleOptions_ks: [], 
        ruleOptions_wg: [], 
        userOptions: null,  
        cateOptions:this.props.cateOptions||[],
        selCate: [],
        k_market: [],
        k_market1: [],
        k_market2: [],
        k_square: [],
        k_square1: [],
        k_square2: [],
        wisdom_gallery: [],
        wisdom_gallery1: [],
        wisdom_gallery2: [],
        special_user: [],
        specialUserList: [],
        specialUserList1: [],
        specialUserList2: [],
        if_km: false, 
        if_ks: false, 
        if_wg: false, 
        if_su: false, 
        if_sulist: false, 
        submitting: false,
        userGroupId: this.props.userGroupId,
        groupOptions: this.props.groupOptions||[],
    }

    componentWillMount(){
        this.getAccessChannel();
        this.getSpecialUser();     
        this.getAccessRule();
        this.handleGroups();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.submitting!==this.state.submitting){
            this.setState({ submitting: nextProps.submitting })
        };
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
        authImg();
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

    getAccessChannel=()=>{
        const accessChannel = this.props.selRecord.resource.accessChannel;

        if (accessChannel==="0"){
            this.setState(state => ({ accessChannel: ['Intranet'] }));
        } else if (accessChannel==="1"){
            this.setState(state => ({ accessChannel: ['Intranet'] }));
        } else if (accessChannel==="2"){
            this.setState(state => ({ accessChannel: ['Internet'] }));
        } else if (accessChannel==="3"){
            this.setState(state => ({ accessChannel: ['Internet'] }));
        };
    }

    getSpecialUser=()=>{
        if(Array.isArray(this.props.selRecord.special_user)){
            if(this.props.selRecord.special_user.length===0){
                this.setState(state=>({ 
                    if_su: false,
                    special_user: [],
                }));
            }else if(this.props.selRecord.special_user[0]!==null){
                this.setState(state=>({ 
                    if_su: true,
                    special_user: this.props.selRecord.special_user,
                }));
            }else{
                this.setState(state=>({ 
                    if_su: false,
                    special_user: [],
                }));
            };
        }else{
            this.setState(state=>({ 
                if_su: false,
                special_user: [],
            }));
        }
    }

    getAccessRule=()=>{
        let accessRule_url = sessionStorage.getItem('serverPort')+'resource/getAllRAR/'+sessionStorage.getItem('@userInfo.id');
        fetchData(accessRule_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  let kmList = [];
                  res.data.kmarket.forEach(ikm=>{
                      kmList.push(ikm.id);
                  });
                  let ksList = [];
                  res.data.ksquare.forEach(iks=>{
                      ksList.push(iks.id);
                  });
                  let wgList  = [];
                  res.data.wisdomgallery.forEach(iwg=>{
                      wgList.push(iwg.id);
                  });
      
                  // let recordRules = this.props.selRecord.accessRuleList.map(v => parseInt(v, 10));
                  let selRecordAC = this.props.selRecord.accessRuleList;
                  let k_market = selRecordAC.kmarket.map(item=>(item.id));
                  let k_market1 = selRecordAC.kmarket.filter(item=> !kmList.includes(item.id));
                  let k_market2 = selRecordAC.kmarket.filter(item=> kmList.includes(item.id));
                  let k_square = selRecordAC.ksquare.map(item=>(item.id));
                  let k_square1 = selRecordAC.ksquare.filter(item=> !ksList.includes(item.id));
                  let k_square2 = selRecordAC.ksquare.filter(item=> ksList.includes(item.id));
                  let wisdom_gallery = selRecordAC.wisdomgallery.map(item=>(item.id));
                  let wisdom_gallery1 = selRecordAC.wisdomgallery.filter(item=> !wgList.includes(item.id));
                  let wisdom_gallery2 = selRecordAC.wisdomgallery.filter(item=> wgList.includes(item.id));
      
                  this.setState(state=>({ 
                      ruleOptions: res.data, 
                      ruleOptions_km: res.data.kmarket, 
                      ruleOptions_ks: res.data.ksquare, 
                      ruleOptions_wg: res.data.wisdomgallery, 
  
                      k_market: k_market, 
                      k_market1: k_market1, 
                      k_market2: k_market2, 
                      if_km: (k_market.length>0? true:false),
                      k_square: k_square, 
                      k_square1: k_square1, 
                      k_square2: k_square2, 
                      if_ks: (k_square.length>0? true:false),
                      wisdom_gallery: wisdom_gallery,
                      wisdom_gallery1: wisdom_gallery1,
                      wisdom_gallery2: wisdom_gallery2,
                      if_wg: (wisdom_gallery.length>0? true:false)
                  }));
              }else{
                  this.setState(state=>({ 
                      ruleOptions: [], 
                      k_market1: [],
                      k_square1: [],
                      wisdom_gallery1: [],
                      ruleOptions_km: [], 
                      ruleOptions_ks: [], 
                      ruleOptions_wg: [] 
                  }));                
              }
            }
        });
    }

    handleGroups=()=>{
        let groupOptions = this.state.groupOptions.map(item => item.id);
        let selRecordGroups = this.props.selRecord.special_group;
        if(Array.isArray(selRecordGroups)){
            let specialUserList = selRecordGroups.map(item => item.id);
            let specialUserList1 = selRecordGroups.filter(item=> !groupOptions.includes(item.id));
            let specialUserList2 = selRecordGroups.filter(item=> groupOptions.includes(item.id));
            let if_sulist = selRecordGroups.length>0? true:false;

            this.setState({ specialUserList, specialUserList1, specialUserList2, if_sulist });
        }
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

    handleRuleArray = (rules) => {
        return rules;
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

    handleUploaderChange = info => {
        let status = info.file.status;
        let res = info.file.response;
        if(status === 'error'){
            
            if(res.status===401){
                message.error("Your Login Session is expired.");
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
            // ------ update nfilename
            this.props.form.setFieldsValue({
                nfilename: res.data.nfilename
            });

            // ------ replace thumbnail
            // if (info.file.originFileObj.type.startsWith('image/')){
            //     const r = new FileReader();
            //     r.readAsDataURL(info.file.originFileObj);
            //     r.onload = e => {
            //         this.setState({ fileThumb: `${sessionStorage.getItem('serverPort')}${e.target.result}` });
            //     };
            // } else {
            //     this.setState({ fileThumb: process.env.PUBLIC_URL + '/images/pdf.png' });
            // }
        }
    }

    handleThumbChange = info => {
        let status = info.file.status;
        let res = info.file.response;
        if(status === 'error'){
            
            if(res.status===401){
                message.error("Your Login Session is expired.");
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
            this.props.form.setFieldsValue({nfilename: res.data.nfilename||'null'});
            this.setState({ fileThumb: newFileThumb }, ()=>authImg());
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,fieldsValues)=>{
            if(!err){
                const values = {
                ...fieldsValues,
                'k_market2': fieldsValues['if_km']===true? fieldsValues['k_market2']:[],
                'k_square2': fieldsValues['if_ks']===true? fieldsValues['k_square2']:[],
                'wisdom_gallery2': fieldsValues['if_wg']===true? fieldsValues['wisdom_gallery2'] : [],
                'ofilename': this.props.selRecord.resource.ofilename,
                'filesize': this.props.selRecord.resource.filesize,
                'thumbnail': this.state.fileThumb||this.props.selRecord.resource.thumbnail,
                // 'resCate': this.state.selCate,
                'downloadOriginal': this.props.selRecord.resource.type==="VIDEO"? 0:(fieldsValues['downloadOriginal']||0),
                'downloadType': this.props.selRecord.resource.type==="VIDEO"? 0:(fieldsValues['downloadType']||0),
                'latestNews': fieldsValues['latestNews']===true? 1 : 0,
                'latestNewsExpiry': fieldsValues['latestNews']===true? fieldsValues['latestNewsExpiry'].format('YYYY-MM-DD HH:mm:ss') : null,
                'accessChannel': fieldsValues['accessChannel']!=null? (fieldsValues['accessChannel']==="Internet"? ["Intranet","Internet"]:["Intranet"]): ["Intranet"], 
                'k_market': fieldsValues['if_km']===true? fieldsValues['k_market1'].concat(fieldsValues['k_market2']) : fieldsValues['k_market1'],
                'k_square': fieldsValues['if_ks']===true? fieldsValues['k_square1'].concat(fieldsValues['k_square2']) : fieldsValues['k_square1'],
                'wisdom_gallery': fieldsValues['if_wg']===true? fieldsValues['wisdom_gallery1'].concat(fieldsValues['wisdom_gallery2']) : fieldsValues['wisdom_gallery1'],
                'special_user': fieldsValues['if_su']===true? fieldsValues['special_user'] : [],
                'special_user_list': fieldsValues['if_sulist']===true? fieldsValues['specialUserList1'].concat(fieldsValues['specialUserList2']) : fieldsValues['specialUserList1'],
                };
                
                this.props.handleInfoForm(values);
            }
        });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const { nfilename, videoLink, thumbnail, type, titleEn, titleTc, descEn, descTc,linkTo, latestNews, latestNewsExpiry, activated, asWord, asWatermark } = this.props.selRecord.resource; 
        const { fileThumb, accessChannel, if_km, k_market1, k_market2, if_ks, k_square1, k_square2, if_wg, wisdom_gallery1, wisdom_gallery2, if_su, special_user, userGroupId, if_sulist, specialUserList1, specialUserList2, groupOptions, disableDownloadType } = this.state;
        
        // const { accessRuleList } = this.props.selRecord.accessRuleList;

        const { ruleOptions_km, ruleOptions_ks, ruleOptions_wg, userOptions, submitting } = this.state;

        const uploadFileReplacement = sessionStorage.getItem('serverPort')+'upload/single/?user='+sessionStorage.getItem('@userInfo.id');
        const uploadVideoThumbnail = sessionStorage.getItem('serverPort')+'upload/videoImg/?user='+sessionStorage.getItem('@userInfo.id');
        const acceptFileType = 'image/*,.doc,.docx,.xml,application/msword,.pdf,.xlsx,.xls';
        const acceptImgOnly = 'image/*';

        const uploadProps = {
            name: 'file',
            multiple: false,
            action: type === "VIDEO"? uploadVideoThumbnail : uploadFileReplacement,
            headers: {'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,},
            accept: type === "VIDEO"? acceptImgOnly : acceptFileType,
            listType: 'text',
            onChange: type === "VIDEO"? this.handleThumbChange : this.handleUploaderChange,
        }

        return(
            <div>

            <img 
            style={{ display: 'block', width: '50%', margin: '0 auto', paddingBottom: '5%' }} 
            alt={type==="VIDEO"? "VIDEO":"RES-PDF"}
            name="auth-img"
            data={fileThumb||thumbnail} 
            />

            <div style={{ padding: '0 0 5%' }} >
                <Upload {...uploadProps}>
                    <Button>
                        <Icon type="upload" /> { type==="VIDEO"? "Upload Video Thumbnail":"Select File for Replace"}
                    </Button>
                </Upload>
            </div>

            <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6}, }} wrapperCol={{xs:{span:24}, sm:{span:18},}} labelAlign="left" >
            
            {/* -------nfilename */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.FILENAME')}>
                    {getFieldDecorator('nfilename', {initialValue: nfilename})(
                        <Input disabled={true} />
                    )}
                </Form.Item>

            {/* -------videoLink */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.VIDEO-LINK')}>
                    {getFieldDecorator('videoLink', {initialValue: videoLink})(
                        <Input disabled={true}/>
                    )}
                </Form.Item>

            {/* -------titleEn */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.TITLE-EN')} help="please provide at least one title (EN or 中文)">
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
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-EN')} help="please provide at least one tag (EN or 中文)">
                    {getFieldDecorator('descEn', {initialValue: descEn})(
                        <Input />
                    )}
                </Form.Item>

            {/* -------desc_tc */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.DESCRIPTION-TC')} help="please provide at least one tag (EN or 中文)">
                    {getFieldDecorator('descTc', {initialValue: descTc})(
                        <Input />
                    )}
                </Form.Item>    

         
            {/* ------- link to         */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.LINK-TO')} >
                    {getFieldDecorator('linkTo', {initialValue: linkTo})(
                        <Input />
                    )}
                </Form.Item>    
                <Divider />

            {/* -------category */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.CATEGORY')} help="please assign at least one category">
                    {getFieldDecorator('resCate', {initialValue: (this.props.selRecord.categoryId || null)})(
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
                    {getFieldDecorator('downloadOriginal', {initialValue: type==="VIDEO"? 0:(asWord||0)})(
                        <RadioGroup disabled={userGroupId!==5||type==="VIDEO"}>
                            <Radio value={1} onClick={()=>{this.setState({ disableDownloadType: true }); this.props.form.setFieldsValue({ downloadType: 1 })}}>{intl.get('@RES_DRAWER_INFO.DOWNLOAD-ORIGINAL-FILE')}</Radio>
                            <Radio value={0} onClick={()=>this.setState({ disableDownloadType: false })}>PDF</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

                <Form.Item label={intl.get('@RES_DRAWER_INFO.DOWNLOAD-TYPE')}>
                    {getFieldDecorator('downloadType', {initialValue: type==="VIDEO"? 0:(asWatermark||0)})(
                        <RadioGroup disabled={userGroupId!==5||type==="VIDEO"||disableDownloadType}>
                            <Radio value={1}>{intl.get('@GENERAL.YES')}</Radio>
                            <Radio value={0}>{intl.get('@GENERAL.NO')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>

            {/* -------access channel */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
                {getFieldDecorator('accessChannel', { initialValue: (accessChannel[0] || 'Intranet') })(
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
                            {getFieldDecorator('latestNews', {initialValue:latestNews>0? true:false})(
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

                <h5 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE')}</h5>
                <h6 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE-REMARKS')} </h6>
                <Form.Item>
                    {getFieldDecorator('if_km', {initialValue: if_km})(
                        <Checkbox checked={ if_km } onClick={this.handleAccessKM} >{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item>     
                    {getFieldDecorator('k_market1', {initialValue: k_market1.map(item=>(item.id))})(
                        <Select disabled mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS1')} >
                            {/* {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===1}).map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})} */}
                            {k_market1.length===0? null:k_market1.map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item >
                    {getFieldDecorator('k_market2', {initialValue: k_market2.map(item=>(item.id))})(
                        <Select optionFilterProp="label" disabled={!if_km} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {/* {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===1}).map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})} */}
                            {ruleOptions_km.length===0? null:ruleOptions_km.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                
                <Form.Item >
                    {getFieldDecorator('if_ks', {initialValue: if_ks})(
                        <Checkbox checked={ if_ks } onClick={this.handleAccessKS} >{intl.get('@RES_MANAGEMENT.K-SQUARE')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                   
                    {getFieldDecorator('k_square1', {initialValue: k_square1.map(item=>(item.id))})(
                        <Select disabled mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS1')} >
                            {/* {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===2}).map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})} */}
                            {k_square1.length===0? null:k_square1.map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item >
                    {getFieldDecorator('k_square2', {initialValue: k_square2.map(item=>(item.id))})(
                        <Select optionFilterProp="label" disabled={!if_ks} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {/* {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===2}).map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})} */}
                            {ruleOptions_ks.length===0? null:ruleOptions_ks.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_wg', {initialValue: if_wg})(
                        <Checkbox checked={ if_wg } onClick={this.handleAccessWG} >{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item>                    
                    {getFieldDecorator('wisdom_gallery1', {initialValue: wisdom_gallery1.map(item=>(item.id))})(
                        <Select disabled mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS1')} >
                            {wisdom_gallery1.length===0? null:wisdom_gallery1.map(item=>{ return <Option key={item.id} value={item.id} >{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>                    
                    {getFieldDecorator('wisdom_gallery2', {initialValue: wisdom_gallery2.map(item=>(item.id))})(
                        <Select optionFilterProp="label" disabled={!if_wg} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} >
                            {ruleOptions_wg.length===0? null:ruleOptions_wg.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_su', {initialValue: if_su})(
                        <Checkbox checked={ if_su } onClick={this.handleAccessSU} >{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item>
                    {getFieldDecorator('special_user', {initialValue: special_user})(
                        <Select onSearch={this.handleSpecialUser} filterOption={false} optionLabelProp="value" disabled={!if_su} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶可為空":"special user can be left blank"} >
                            {userOptions===null? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
                        </Select>
                    )}
                </Form.Item>
                {/* ----20200623 special user group */}
                <Form.Item>
                    {getFieldDecorator('if_sulist', {initialValue: if_sulist})(
                        <Checkbox checked={ if_sulist } onClick={this.handleAccessSUList} >{intl.get('@SPL_USR_GRP.GENERAL')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item>                    
                    {getFieldDecorator('specialUserList1', {initialValue: specialUserList1.map(item=>(item.id))})(
                        <Select disabled mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS1')} >
                            {specialUserList1.length===0? null:specialUserList1.map(item=>{ return <Option key={item.id} value={item.id} >{item.groupName}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>                    
                    {getFieldDecorator('specialUserList2', {initialValue: specialUserList2.map(item=>(item.id))})(
                        <Select optionFilterProp="label" disabled={!if_sulist} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶組可為空":"special user group can be left blank"} >
                            {groupOptions.length===0? null:groupOptions.map(item=>{ return <Option key={item.id} value={item.id}>{item.groupName}</Option>})}
                        </Select>
                    )}
                </Form.Item>
                
                <div style={{ paddingBottom: '50px' }} />
            
            </Form>

            <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
                <Button style={{ marginRight: '8px' }} type="primary" onClick={ this.handleSubmit } loading={submitting}>{intl.get('@RES_DRAWER_INFO.SAVE')}</Button>
            </div>

            </div>
        )
    }
}

const WrappedRescForm = Form.create({ name: 'resc_creator' })(RescForm);

export default WrappedRescForm;