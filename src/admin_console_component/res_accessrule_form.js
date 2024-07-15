//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190528 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Checkbox, Button, Select} from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

const { Option } = Select;

class ResAccessRuleForm extends React.Component{
    constructor(props){
        super(props);
        this.state={ ruleOptions: [], ruleOptions_km: [], ruleOptions_ks: [], ruleOptions_wg: [], userOptions: null, if_km: false, if_ks: false, if_wg: false, if_su: false, if_sulist: false, groupOptions: [] }
    }

    componentDidMount(){
        this.getAccessRule();
        this.setState({ groupOptions: this.props.groupOptions });
    }
    
    componentWillReceiveProps(nextProps){

        if(nextProps.groupOptions!==this.state.groupOptions){
            this.setState({ groupOptions: nextProps.groupOptions });
        };

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

    handleAccessSUList = () =>{
        this.setState({ if_sulist: !this.state.if_sulist });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,fieldsValues)=>{
            if(!err){
                const values = {
                ...fieldsValues,
                'k_market': fieldsValues['if_km']===true? fieldsValues['k_market'] : [],
                'k_square': fieldsValues['if_ks']===true? fieldsValues['k_square'] : [],
                'wisdom_gallery': fieldsValues['if_wg']===true? fieldsValues['wisdom_gallery'] : [],
                'special_user': fieldsValues['if_su']===true? fieldsValues['special_user'] : [],
                'special_user_list': fieldsValues['if_sulist']===true? fieldsValues['special_user_list'] : [],
            };
            
            this.props.handleAccessRule(values);

            }
        });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const { ruleOptions_km, ruleOptions_ks, ruleOptions_wg, userOptions, if_km, if_ks, if_wg, if_su, if_sulist, groupOptions } = this.state;

        return(
            <div>

            <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6}, }} wrapperCol={{xs:{span:24}, sm:{span:18},}} labelAlign="left" >
            
            <h6 style={{ paddingBottom: '16px' }}>{intl.get('@RES_MANAGEMENT.ACCESS-RULE-REMARKS')} </h6>
                
                <Form.Item>
                    {getFieldDecorator('if_km', {initialValue: if_km})(
                        <Checkbox onClick={this.handleAccessKM} >{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                
                    {getFieldDecorator('k_market')(
                        <Select optionFilterProp="label" disabled={!this.state.if_km} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} onChange={this.handleChange} >
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
                    {getFieldDecorator('k_square')(
                        <Select optionFilterProp="label" disabled={!this.state.if_ks} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} onChange={this.handleChange} >
                            {ruleOptions_ks.length===0? null:ruleOptions_ks.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_wg', {initialValue: if_wg})(
                        <Checkbox onClick={this.handleAccessWG} >{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                    
                    {getFieldDecorator('wisdom_gallery')(
                        <Select optionFilterProp="label" disabled={!this.state.if_wg} mode="multiple" style={{ width: '100%' }} placeholder={intl.get('@RES_DRAWER_INFO.RULE-REMARKS')} onChange={this.handleChange} >
                            {ruleOptions_wg.length===0? null:ruleOptions_wg.map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                        </Select>
                    )}
                </Form.Item>

                <Form.Item>
                    {getFieldDecorator('if_su', {initialValue: if_su})(
                        <Checkbox onClick={this.handleAccessSU} >{intl.get('@RES_DRAWER_INFO.SPECIAL-USER')}</Checkbox>
                    )}
                </Form.Item>
                
                <Form.Item >                   
                    {getFieldDecorator('special_user')(
                        <Select onSearch={this.handleSpecialUser} filterOption={false} optionLabelProp="value" disabled={!this.state.if_su} mode="multiple" style={{ width: '100%' }} placeholder={sessionStorage.getItem('lang')==="zh_TW"? "特殊訪問用戶可為空":"special user can be left blank"} onChange={this.handleChange} >
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

const WrappedResAccessRuleForm = Form.create({ name: 'res_access_rule_editor' })(ResAccessRuleForm);

export default WrappedResAccessRuleForm;