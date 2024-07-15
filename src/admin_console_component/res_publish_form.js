//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190517 */
//Comments //***s=]*** 



import React from 'react';
import { Icon, Form, DatePicker, Radio, Button, Switch, TreeSelect, Divider } from 'antd';
import RadioGroup from 'antd/lib/radio/group';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import moment from 'moment';
import intl from 'react-intl-universal';

class ResPublishForm extends React.Component{
    constructor(props){
        super(props);
        this.state={ mode: 'time', disableTimePicker: true, disableDownloadType: false, cateOptions: this.props.cateOptions, selCate: [], userGroupId: this.props.userGroupId }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.cateOptions!==this.state.cateOptions){
            this.setState({ cateOptions: nextProps.cateOptions })
        };

        if(nextProps.userGroupId!==this.state.userGroupId){
            this.setState({ userGroupId: nextProps.userGroupId })
        };
    }

    componentDidMount(){
        // this.getCategoryOptions();
    }

    getCategoryOptions=()=>{
        if(this.props.categoryTree!==undefined){
            let pre_cateList = this.props.categoryTree.map(iCate=>{
                return this.handleCateChildren(iCate);
            });
            this.setState(state=>({ cateOptions: pre_cateList }));
        }else{
            this.setState(state=>({ cateOptions: [] }));
        }
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

    handleRuleArray = (rules) => {
        return rules;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err,fieldsValues)=>{
            if(!err){
                const values = {
                ...fieldsValues,
                // 'resCate': this.state.selCate,
                'latestNews': fieldsValues['latestNews']===true? 1 : 0,
                'latestNewsExpiry': fieldsValues['latestNews']===true? fieldsValues['latestNewsExpiry'].format('YYYY-MM-DD HH:mm:ss') : null,
                'accessChannel': fieldsValues['accessChannel']!=null? (fieldsValues['accessChannel']==="Internet"? ["Intranet","Internet"]:["Intranet"]): ["Intranet"], 
                // 'accessChannel': fieldsValues['accessChannel']!=null? [fieldsValues['accessChannel']] : [],

            };

            this.props.handlePublishSettings(values);

            }
        });
    };

    render(){
        const { getFieldDecorator } = this.props.form;

        const { disableTimePicker, mode, userGroupId, disableDownloadType } = this.state;

        return(
            <div>

            <Form layout="vertical" labelAlign="left" >

                {/* -------category */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.CATEGORY')} help="please assign at least one category">
                {getFieldDecorator('resCate', {initialValue: []})(
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

                {/* -------original download */}
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
                        <RadioGroup  disabled={userGroupId<5}>
                            <Radio value="Intranet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTRANET')}</Radio>
                            <Radio value="Internet">{intl.get('@RES_DRAWER_INFO.ACCESS-INTERNET')}</Radio>
                        </RadioGroup>
                    )}
                </Form.Item>
            
                {/* -------latest news */}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.LATEST-NEWS')}>
                    {getFieldDecorator('latestNews')(
                        <Switch  disabled={userGroupId<5} onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                    )}
                </Form.Item>

                {/* -------latest news expiry date*/}
                <Form.Item label={intl.get('@RES_DRAWER_INFO.EXPIRY-DATE')}>
                    {getFieldDecorator('latestNewsExpiry', {initialValue: moment().add(1,'days')})(
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
            
            </Form>

            <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
                <Button style={{ marginRight: '8px' }} type="primary" onClick={ this.handleSubmit }>{intl.get('@RES_DRAWER_INFO.SAVE')}</Button>
                {/* <Button style={{ marginRight: '8px' }} type="primary" onClick={ this.handleSubmit }>Submit</Button> */}
            </div>

            </div>
        )
    }
}

const WrappedResPublishForm = Form.create({ name: 'res_publish_form' })(ResPublishForm);

export default WrappedResPublishForm;