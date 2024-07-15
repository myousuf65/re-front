//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190802 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Radio, message, Button,Checkbox, Select, Divider, Row, Col} from 'antd';
import intl from 'react-intl-universal';

import TextArea from 'antd/lib/input/TextArea';


class AccUpdateForm extends React.Component{
    constructor(props){
        super(props);
        this.state={ 
            institution : [],
            section :[],
            // ranking : [],
            ranking1 : [], //--group up rank
            ranking2 : [], //--group up rank
            ranking3 : [], //--group up rank
            selSection: [],
            // selRank: [],
            selRank1: [], //--group up rank
            selRank2: [], //--group up rank
            selRank3: [], //--group up rank
            allSectionIds: [],
            // allRankIds: [],
            allRankIds1: [], //--group up rank
            allRankIds2: [], //--group up rank
            allRankIds3: [], //--group up rank
            checkAllSection: false,
            // checkAllRank: false,
            checkAllRank1: false, //--group up rank
            checkAllRank2: false, //--group up rank
            checkAllRank3: false, //--group up rank
            sectionInterminate: true,
            // rankInterminate: true,
            rankInterminate1: false, //--group up rank
            rankInterminate2: false, //--group up rank
            rankInterminate3: false, //--group up rank
        };
    }

    componentWillMount(){
        this.getInstitutions();
        this.getSections();
        this.getRank();
    }

    componentDidMount(){
        this.setState(state=>{
            let resRankArr = this.props.ranking;
            let selRank = this.props.selRecord.rankIdList;
            let rank1 = [];
            let rank2 = [];
            let rank3 = [];

            resRankArr.forEach(iRank=>{
                if(iRank.rankTypeId===1){
                    rank1.push(iRank.id);
                } else if(iRank.rankTypeId===2){
                    rank2.push(iRank.id);
                } else if(iRank.rankTypeId===3){
                    rank3.push(iRank.id);
                };
            });

            let selRank1 = selRank.filter(iRank => rank1.includes(iRank));
            let selRank2 = selRank.filter(iRank => rank2.includes(iRank));
            let selRank3 = selRank.filter(iRank => rank3.includes(iRank));

            let checkAllRank1 = false;
            let checkAllRank2 = false;
            let checkAllRank3 = false;

            let checkAllSection = false;
            let selSection = this.props.selRecord.sectionIdList;
            let sectionInterminate = true;

            if(this.props.selRecord.sectionIdList[0]===0){
                selSection = this.props.allSectionIds;
                this.props.form.setFieldsValue({
                    section: this.props.allSectionIds,
                });
                sectionInterminate = false;
                checkAllSection = true;
            }

            let rankInterminate1 = true;
            let rankInterminate2 = true;
            let rankInterminate3 = true;

            if(this.props.selRecord.rankIdList[0]===0){
                this.props.form.setFieldsValue({
                    rank1: rank1,
                    rank2: rank2,
                    rank3: rank3,
                });
                rankInterminate1 = false;
                rankInterminate2 = false;
                rankInterminate3 = false;
                checkAllRank1 = true;
                checkAllRank2 = true;
                checkAllRank3 = true;
            } else {
                if(selRank1===rank1){
                    rankInterminate1 = false;
                    checkAllRank1 = true;
                } else if (selRank1.length<1){
                    rankInterminate1 = false;
                    checkAllRank1 = false;
                }
                
                if(selRank2===rank2){
                    rankInterminate2 = false;
                    checkAllRank2 = true;
                } else if (selRank2.length<1){
                    rankInterminate2 = false;
                    checkAllRank2 = false;
                }

                if(selRank3===rank3){
                    rankInterminate3 = false;
                    checkAllRank3 = true;
                } else if (selRank3.length<1){
                    rankInterminate3 = false;
                    checkAllRank3 = false;
                }
            }

            return { 
                selSection,
                sectionInterminate,
                checkAllSection,
                selRank1,
                selRank2,
                selRank3,
                rankInterminate1,
                rankInterminate2,
                rankInterminate3,
                checkAllRank1,
                checkAllRank2,
                checkAllRank3,
            }
        })
    }

    getInstitutions = () =>{
        this.setState(state=>({ institution: this.props.institution }));
    }  

    getSections = () =>{
        this.setState(state=>({ section: this.props.section, allSectionIds: this.props.allSectionIds }));
    }

    getRank = () =>{
        // this.setState(state=>({ ranking: this.props.ranking, allRankIds: this.props.allRankIds }));
        this.setState(state=>{
            let resRankArr = this.props.ranking;
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
            if (fieldsValues['section'].length<1 && selRankIds.length<1) {
                message.warning( 'You should nominate at least one section or one rank for this access rule.' );
            } else if(!err) {
                const modifiedAccessRule ={
                    'id':this.props.selRecord.id || null,
                    ...fieldsValues,
                    'areaId':fieldsValues['areaId'] || null,
                    'description': fieldsValues['description'] || null,
                    'createdBy': sessionStorage.getItem('@userInfo.id'),
                    'inst': Array.isArray(fieldsValues['inst'])? fieldsValues['inst']:[fieldsValues['inst']],
                    'section': this.state.checkAllSection? [0]: (fieldsValues['section'] || null),
                    'rank': checkAllRank1&&checkAllRank2&&checkAllRank3? [0]: (selRankIds || null)
                };

                delete modifiedAccessRule['rank1'];
                delete modifiedAccessRule['rank2'];
                delete modifiedAccessRule['rank3'];

                // console.log('JSON for access rule modification: ', JSON.stringify(modifiedAccessRule))
                this.props.handleInfoForm(modifiedAccessRule);
            }
        });
      };
    
    onAreaIDChange=(e)=>{
        let existingInst = this.props.form.getFieldValue('inst');

        if(e.target.value!==3){
            if(Array.isArray(existingInst)){
                if(existingInst[0]===0){
                    this.props.form.setFieldsValue({'inst':[]});
                }
            }else if(existingInst===0){
                this.props.form.setFieldsValue({'inst':[]});
            }
        }

        if(e.target.value!==2){
            if(Array.isArray(existingInst)){
                if(existingInst.length>1){
                    this.props.form.setFieldsValue({'inst': existingInst[0]});
                }
            }
        }
        
    }

    render() { 
        const { Option } = Select;
        const { getFieldDecorator } = this.props.form;
        const { description, areaId } =this.props.selRecord ;
        const { ranking1, ranking2, ranking3, rankInterminate1, rankInterminate2, rankInterminate3, checkAllRank1, checkAllRank2, checkAllRank3, selRank1, selRank2, selRank3, section, sectionInterminate, checkAllSection, selSection,} = this.state;

        var sectionList = []
        section.forEach(item =>{
            sectionList.push({
                value:item.id,
                label:item.sectionName
            })
        })

        // var rankList =[]
        // ranking.forEach(item =>{
        //     rankList.push({
        //         value:item.id,
        //         label:item.rankName
        //     });
        // });

        return(
            <div>
                <Form onSubmit ={this.handleSubmit}>
                    <Form.Item label={intl.get('@GENERAL.TYPE')}>
                        {getFieldDecorator('areaId',{initialValue: areaId, rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                            <Radio.Group onChange={this.onAreaIDChange}>
                                <Radio value={1}>{intl.get('@RESOURCES_SHOWALL.K-MARKET')}</Radio>
                                <Radio value={2}>{intl.get('@RESOURCES_SHOWALL.K-SQUARE')}</Radio>
                                <Radio value={3}>{intl.get('@RESOURCES_SHOWALL.WISDOM-GALLERY')}</Radio>
                            </Radio.Group>
                            )}
                    </Form.Item> 
                    
                    <Form.Item label={intl.get('@GENERAL.DESCRIPTION')}>
                        {getFieldDecorator('description',{initialValue: description, rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(<TextArea rows={3}/>)}
                    </Form.Item>

                    <Divider orientation="left">
                            <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                            {intl.get('@ACCESS_RULE_MANAGEMENT.INST')}
                    </Divider>

                    {/* <Form.Item>
                        {getFieldDecorator('inst', {initialValue : parseInt(this.props.selRecord.instId, 10), rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                            <Select>
                                <Option disabled={this.props.form.getFieldValue('areaId')===3? false:true} key={0} value={0} label={intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}>{intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}</Option>
                                {this.props.institution.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option> ))}
                            </Select>
                        )}
                    </Form.Item> */}

                    <Form.Item>
                        {getFieldDecorator('inst', {initialValue : this.props.selRecord.instIdList, rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }]})(
                            <Select showSearch mode={this.props.form.getFieldValue('areaId')===2? 'multiple':'default'} optionFilterProp="label">
                                <Option disabled={this.props.form.getFieldValue('areaId')===3? false:true} key={0} value={0} label={intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}>{intl.get('@ACCESS_RULE_MANAGEMENT.ALL-INST')}</Option>
                                {this.props.institution.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option> ))}
                            </Select>
                        )}
                    </Form.Item>

                    {/* <Divider orientation="left">{intl.get('@ACCESS_RULE_MANAGEMENT.SECTION')}</Divider> */}
                    <Divider orientation="left">
                        <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                        {intl.get('@ACCESS_RULE_MANAGEMENT.SECTION')}
                    </Divider>

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
                        {getFieldDecorator('section', {initialValue: selSection, rules: [{ required: true, message: intl.get('@GENERAL.IS-A-MUST') }] })(
                            <Checkbox.Group onChange={this.onSectionGroupChange} style={{width: '100%'}} >
                                <Row>
                                {/* {sectionList.sort((a,b) => (a.label > b.label) ? 1 : ((b.label > a.label) ? -1 : 0)).map(item=>(<Col span={8}><Checkbox key={item.value} value={item.value}>{item.label}</Checkbox></Col>))} */}
                                {sectionList.map(item=>(<Col key={item.value} span={8}><Checkbox key={item.value} value={item.value}>{item.label}</Checkbox></Col>))}
                                </Row>
                            </Checkbox.Group>
                        )}
                    </Form.Item>

                    {/* <Divider orientation="left">{intl.get('@ACCESS_RULE_MANAGEMENT.RANK')}</Divider> */}
                    <Divider orientation="left">
                        <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label>
                        {intl.get('@ACCESS_RULE_MANAGEMENT.RANK')}
                    </Divider>

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

                    
                    <Form.Item >
                        {getFieldDecorator('rank1', {initialValue: selRank1})(
                            <Checkbox.Group style={{ width: '100%' }} onChange={(checkedList)=>this.onRankGroupChange(checkedList,1)}>
                                <Row>
                                    {ranking1.map(item=>(<Col key={item.id} span={8}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
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
                        {getFieldDecorator('rank2', {initialValue: selRank2})(
                            <Checkbox.Group onChange={(checkedList)=>this.onRankGroupChange(checkedList,2)}>
                                <Row>
                                    {ranking2.map(item=>(<Col key={item.id} span={8}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
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
                        {getFieldDecorator('rank3', {initialValue: selRank3})(
                            <Checkbox.Group onChange={(checkedList)=>this.onRankGroupChange(checkedList,3)}>
                                <Row>
                                    {ranking3.map(item=>(<Col key={item.id} span={8}><Checkbox style={{ maxWidth: '200px' }} key={item.id} value={item.id}>{item.rankName}</Checkbox></Col>))}
                                </Row>
                            </Checkbox.Group>
                        )}
                    </Form.Item>

                </Form>

                <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
                    <Button style={{ marginRight: '8px' }}  type="primary" onClick={ this.handleSubmit }>{intl.get('@GENERAL.SAVE')}</Button>
                </div>
                
            </div>
        )
    }
}

const WrappedAccUpdateForm = Form.create({name:'acc_update_form'})(AccUpdateForm);
export default WrappedAccUpdateForm;