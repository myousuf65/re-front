//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190530 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Icon, Form,Radio, message, Button,Checkbox, Divider, Select, Row, Col, Spin } from 'antd';
import intl from 'react-intl-universal';

import TextArea from 'antd/lib/input/TextArea';

import { fetchData } from '../service/HelperService';

class AccEditForm extends React.Component{
    constructor(props){
        super(props);
        this.state={
            institution : [],
            section :[],
            ranking1 : [], //--group up rank
            ranking2 : [], //--group up rank
            ranking3 : [], //--group up rank
            selSection: [],
            selRank1: [], //--group up rank
            selRank2: [], //--group up rank
            selRank3: [], //--group up rank
            allSectionIds: [],
            allRankIds1: [], //--group up rank
            allRankIds2: [], //--group up rank
            allRankIds3: [], //--group up rank
            checkAllSection: false,
            checkAllRank1: false, //--group up rank
            checkAllRank2: false, //--group up rank
            checkAllRank3: false, //--group up rank
            sectionInterminate: false,
            rankInterminate1: false, //--group up rank
            rankInterminate2: false, //--group up rank
            rankInterminate3: false, //--group up rank
            loadingSection: false,
            loadingRank: false,
        };
    }


    componentDidMount(){
        this.getInstitutions();
        this.getSections();
        this.getRank();
    }

    getInstitutions =()=>{
        let institutions_url =sessionStorage.getItem('serverPort')+'institutions/all';
        fetchData(institutions_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState(state=>({ institution: res.data.sort((a,b) => (a.instName > b.instName) ? 1 : ((b.instName > a.instName) ? -1 : 0)) }));
                }
            }
        });
    } 

    getSections = () =>{
        this.setState(state=>({ loadingSection: true }));
        let sections_url =sessionStorage.getItem('serverPort')+'sections/all';
        fetchData(sections_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState(state=>({ 
                        section: res.data.sort((a,b) => (a.sectionName > b.sectionName) ? 1 : ((b.sectionName > a.sectionName) ? -1 : 0)), 
                        allSectionIds: res.data.map(item=>{ return item.id }),
                        loadingSection: false
                    }));
                }
            }
        });
    }

    getRank = () =>{
        this.setState(state=>({ loadingRank: true }));
        let rank_url = sessionStorage.getItem('serverPort')+'ranks/all';
        fetchData(rank_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState(state=>{
                        let resRankArr = res.data.sort((a,b) => (a.rankName > b.rankName) ? 1 : ((b.rankName > a.rankName) ? -1 : 0));
                        let rank1 = [];
                        let rank2 = [];
                        let rank3 = [];
    
                        resRankArr.forEach(iRank=>{
                            if(iRank.rankTypeId===1){
                                rank1.push(iRank);
                            } else if(iRank.rankTypeId===2){
                                rank2.push(iRank);
                            } else if(iRank.rankTypeId===3){
                                rank3.push(iRank);
                            };
                        });
    
                        return { ranking1: rank1, allRankIds1: rank1.map(item=>{ return item.id }), 
                                ranking2: rank2, allRankIds2: rank2.map(item=>{ return item.id }),
                                ranking3: rank3, allRankIds3: rank3.map(item=>{ return item.id }),
                                loadingRank: false };
                    });
                }
            }
            
        });
    }

    onCheckAllSectionChange = e => {
        this.props.form.setFieldsValue({
            section: e.target.checked? this.state.allSectionIds : [],
        });
        
        this.setState(state=>({ 
            selSection: e.target.checked? state.section : [],
            sectionInterminate: false, 
            checkAllSection: e.target.checked,
        }))
    }

    onSectionGroupChange = (checkedList) => {
        this.setState(state=>({ 
            selSection: checkedList, 
            sectionInterminate: !!checkedList.length && checkedList.length < state.section.length, 
            checkAllSection: checkedList.length === state.section.length,
        }))
    }

    // ----group up ranks 20190813
    onCheckAllRankChange = (e, rankTypeId) => {

        if(rankTypeId===1){
            this.props.form.setFieldsValue({
                rank1: e.target.checked? this.state.allRankIds1 : [],
            });

            this.setState(state=>({ 
                selRank1: e.target.checked ? state.allRankIds1 : [],
                rankInterminate1: false,
                checkAllRank1: e.target.checked,
            }))
        } else if(rankTypeId===2){
            this.props.form.setFieldsValue({
                rank2: e.target.checked? this.state.allRankIds2 : [],
            });
            this.setState(state=>({ 
                selRank2: e.target.checked ? state.allRankIds2 : [],
                rankInterminate2: false,
                checkAllRank2: e.target.checked,
            }))
        } else if(rankTypeId===3){
            this.props.form.setFieldsValue({
                rank3: e.target.checked? this.state.allRankIds3 : [],
            });
            this.setState(state=>({ 
                selRank3: e.target.checked ? state.allRankIds3 : [],
                rankInterminate3: false,
                checkAllRank3: e.target.checked,
            }))
        } 
    }

    // ----group up ranks 20190813
    onRankGroupChange = (checkedList, rankTypeId) => {
        if(rankTypeId===1){
            this.setState(state=>({ 
                selRank1: checkedList, 
                rankInterminate1: !!checkedList.length && checkedList.length < state.ranking1.length, 
                checkAllRank1: checkedList.length === state.ranking1.length,
            }))
        } else if(rankTypeId===2){
            this.setState(state=>({ 
                selRank2: checkedList, 
                rankInterminate2: !!checkedList.length && checkedList.length < state.ranking2.length, 
                checkAllRank2: checkedList.length === state.ranking2.length,
            }))
        } else if(rankTypeId===3){
            this.setState(state=>({ 
                selRank3: checkedList, 
                rankInterminate3: !!checkedList.length && checkedList.length < state.ranking3.length, 
                checkAllRank3: checkedList.length === state.ranking3.length,
            }))
        }

    }

    handleSubmit = (e) => {
        const { selRank1, selRank2, selRank3, checkAllRank1, checkAllRank2, checkAllRank3 } = this.state;
        e.preventDefault();
        let selRankIds = selRank1.concat(selRank2, selRank3);
        this.props.form.validateFields((err, fieldsValues) => {
            console.log('Received values of form: ', fieldsValues);
            if (!err) {
                if (selRankIds.length>0){
                    const newAccessRule ={
                        ...fieldsValues,
                        'areaId':fieldsValues['areaId'] || null,
                        'description': fieldsValues['description'] || null,
                        'createdBy':sessionStorage.getItem('@userInfo.id'),
                        'inst': Array.isArray(fieldsValues['inst'])? fieldsValues['inst']:[fieldsValues['inst']],
                        'section': this.state.checkAllSection? [0]: (fieldsValues['section'] || null),
                        'rank': checkAllRank1&&checkAllRank2&&checkAllRank3? [0]: (selRankIds || null)
                    };

                    delete newAccessRule['rank1'];
                    delete newAccessRule['rank2'];
                    delete newAccessRule['rank3'];

                    let createPost_url = sessionStorage.getItem('serverPort')+'access_rule/add';
                    fetchData(createPost_url, 'post', newAccessRule, response => {
                        if(response.ifSuccess){
                            let res = response.result;
                            if(res.status===200){
                                message.success("Access rule create successfully.");
                                setTimeout(()=> { window.location.replace(`#/adminconsole/accessrule`) }, 1000);
                            }else{
                                message.error("Access rule create failed. ",1);
                            }
                        }
                    })
                } else {
                    message.error('Please nominate at least one Rank.');
                };
            }
        });
    };

    onAreaIDChange=(e)=>{
        let existingInst = this.props.form.getFieldValue('inst');
        
        if(e.target.value !==3 && existingInst===0){
            this.props.form.setFieldsValue({'inst':[]});
        }else if(e.target.value !==2 && (Array.isArray(existingInst))){
            if(this.props.form.getFieldValue('inst').length > 1){
                this.props.form.setFieldsValue({'inst': existingInst[0] });
            }
        }
    }

    render() { 
        const { Option } = Select;
        const { Content } = Layout;
        const { getFieldDecorator } = this.props.form;

        // eslint-disable-next-line
        const { ranking1, ranking2, ranking3, rankInterminate1, rankInterminate2, rankInterminate3, checkAllRank1, checkAllRank2, checkAllRank3, selRank1, selRank2, selRank3, institution, section, sectionInterminate, checkAllSection, selSection, loadingSection, loadingRank } = this.state;

        var sectionList = []
        section.forEach(item =>{
            sectionList.push({
                value:item.id,
                label:item.sectionName
            })
        })
     
        return(
            <div className="clearfix" style={{ width:'100%' }} >
                <Content className="cms-content" >
                    <h1>
                        <div style={{ display: 'inline-block', width: '60%' }}>
                            {intl.get('@ACCESS_RULE_MANAGEMENT.NEW')}
                        </div>

                        <div style={{ display: 'inline-block', width: '40%', textAlign: 'right' }}>
                            <Button className="res_create_btn" shape="round" type="primary" href="#/adminconsole/accessrule" ><Icon type="rollback" /> {intl.get("@RES_MANAGEMENT.BACK")}</Button>
                        </div>
                        
                    </h1>
                    
                    <div className="cms-white-box">

                    <Form onSubmit={this.handleSubmit}>

                        <Form.Item label={intl.get('@GENERAL.TYPE')}>
                            {getFieldDecorator('areaId',{rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                                <Radio.Group onChange={this.onAreaIDChange}>
                                    <Radio value={1}>{intl.get('@RESOURCES_SHOWALL.K-MARKET')}</Radio>
                                    <Radio value={2}>{intl.get('@RESOURCES_SHOWALL.K-SQUARE')}</Radio>
                                    <Radio value={3}>{intl.get('@RESOURCES_SHOWALL.WISDOM-GALLERY')}</Radio>
                                </Radio.Group>
                                )}
                        </Form.Item> 
                        
                        <Form.Item label={intl.get('@GENERAL.DESCRIPTION')}>
                            {getFieldDecorator('description',{rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(<TextArea rows={3}/>)}
                        </Form.Item>

                        <Divider orientation="left">
                            <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                            {intl.get('@ACCESS_RULE_MANAGEMENT.INST')}
                        </Divider>

                        {/* <Form.Item>
                            {getFieldDecorator('inst', {rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                                <Select>
                                    <Option disabled={this.props.form.getFieldValue('areaId')===3? false:true} key={0} value={0}>{intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}</Option>
                                    {institution.map(item=>(<Option key={item.id} value={item.id}>{item.instName}</Option> ))}
                                </Select>
                            )}
                        </Form.Item> */}

                        <Form.Item>
                            {getFieldDecorator('inst', {rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                                <Select showSearch mode={this.props.form.getFieldValue('areaId')===2? 'multiple':'default'} optionFilterProp="label">
                                    <Option disabled={this.props.form.getFieldValue('areaId')===3? false:true} key={0} value={0} label={intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}>{intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}</Option>
                                    {institution.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option> ))}
                                </Select>
                            )}
                        </Form.Item>

                        <Divider orientation="left">
                            <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                            {intl.get('@ACCESS_RULE_MANAGEMENT.SECTION')}
                        </Divider>

                        <Spin spinning={loadingSection}>

                        <Checkbox 
                        key="selallsection"
                        style={{ padding: '8px 0 16px' }}
                        indeterminate={sectionInterminate}
                        onChange={this.onCheckAllSectionChange}
                        checked={checkAllSection}
                        >
                            <b>{intl.get('@GENERAL.SELECT-ALL')}</b>
                        </Checkbox> <br />
                        
                        <Form.Item>
                            {getFieldDecorator('section', {rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }] })(
                                // <Checkbox.Group options={sectionList} onChange={this.onSectionGroupChange} style={{width: '100%'}} />
                                <Checkbox.Group onChange={this.onSectionGroupChange} style={{width: '100%'}} >
                                    <Row>
                                    {/* {sectionList.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0)).map(item=>(<Col span={6}><Checkbox style={{ maxWidth: '200px' }} key={item.value} value={item.value}>{item.label}</Checkbox></Col>))} */}
                                    {sectionList.map(item=>(<Col span={6}><Checkbox style={{ maxWidth: '200px' }} key={item.value} value={item.value}>{item.label}</Checkbox></Col>))}
                                    </Row>
                                </Checkbox.Group>
                            )}
                        </Form.Item>
                        </Spin>

                        <Divider orientation="left">
                            <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                            {intl.get('@ACCESS_RULE_MANAGEMENT.RANK')}
                        </Divider>

                        <Spin spinning={loadingRank}>
                        
                        {/* -----Rank type 1 */}
                        <Divider style={{ fontSize: '14px' }} dashed>{intl.get('@ACCESS_RULE_MANAGEMENT.RANK-1')}</Divider>
                        <Checkbox 
                        key="selallrank1"
                        style={{ padding: '8px 0 16px' }}
                        indeterminate={rankInterminate1}
                        onChange={(e)=>this.onCheckAllRankChange(e,1)}
                        checked={checkAllRank1}
                        >
                            <b>{intl.get('@GENERAL.SELECT-ALL')}</b>
                        </Checkbox> <br />

                        <Form.Item>
                            {getFieldDecorator('rank1')(
                                <Checkbox.Group style={{ width: '100%' }} onChange={(checkedList)=>this.onRankGroupChange(checkedList,1)}>
                                    <Row>
                                        {ranking1.map(item=>(<Col span={6}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
                                    </Row>
                                </Checkbox.Group>
                            )}
                        </Form.Item>
                        
                        {/* -----Rank type 2 */}
                        <Divider style={{ fontSize: '14px' }} dashed>{intl.get('@ACCESS_RULE_MANAGEMENT.RANK-2')}</Divider>
                        <Checkbox 
                        key="selallrank2"
                        style={{ padding: '8px 0 16px' }}
                        indeterminate={rankInterminate2}
                        onChange={(e)=>this.onCheckAllRankChange(e,2)}
                        checked={checkAllRank2}
                        >
                            <b>{intl.get('@GENERAL.SELECT-ALL')}</b>
                        </Checkbox> <br />

                        <Form.Item>
                            {getFieldDecorator('rank2')(
                                <Checkbox.Group onChange={(checkedList)=>this.onRankGroupChange(checkedList,2)}>
                                    <Row>
                                        {ranking2.map(item=>(<Col span={6}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
                                    </Row>
                                </Checkbox.Group>
                            )}
                        </Form.Item>
                        
                        {/* -----Rank type 3 */}
                        <Divider style={{ fontSize: '14px' }} dashed>{intl.get('@ACCESS_RULE_MANAGEMENT.RANK-3')}</Divider>
                        <Checkbox 
                        key="selallrank3"
                        style={{ padding: '8px 0 16px' }}
                        indeterminate={rankInterminate3}
                        onChange={(e)=>this.onCheckAllRankChange(e,3)}
                        checked={checkAllRank3}
                        >
                            <b>{intl.get('@GENERAL.SELECT-ALL')}</b>
                        </Checkbox> <br />

                        <Form.Item>
                            {getFieldDecorator('rank3')(
                                <Checkbox.Group onChange={(checkedList)=>this.onRankGroupChange(checkedList,3)}>
                                    <Row>
                                        {ranking3.map(item=>(<Col span={6}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
                                    </Row>
                                </Checkbox.Group>
                            )}
                        </Form.Item>

                        </Spin>

                    </Form>

                    <div>
                        <Button style={{ marginRight: '8px' }}  type="primary" onClick={ this.handleSubmit }>{intl.get('@GENERAL.SAVE')}</Button>
                    </div>

                    </div>
                </Content>
            </div>
        )
    }
}

const WrappedAccEditForm = Form.create({name:'acc_edit_form'})(AccEditForm);
export default WrappedAccEditForm;