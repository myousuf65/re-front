import React,{ Component } from 'react';
import { Popconfirm, Button, Form, Icon, Input, Select, Spin, Switch, DatePicker, InputNumber, message } from 'antd';
import intl from 'react-intl-universal';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import moment from 'moment';
import { fetchData, keywordsScanner } from '../service/HelperService';

moment.locale('zh-hk');

const { Option } = Select;
export default Form.create()(class ElearningCreateQuiz extends Component{
    constructor(props) {
        super(props);
        this.state = {
            disableTimePicker:true,
            mode: 'time',
            selPost:{},
            loading:false,
            ruleOptions: []
        };
      }
    
    componentDidMount() {
        // 在此處獲取分數、考試狀態和考試持續時間
        const { score, examStatus, duration } = this.state;
        this.setState({ score, examStatus, duration });
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

    onSearchAccessRule=(inputs)=>{
        if(!inputs){
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

      handleSubmit = (e) => {
        //let getEData = this.customHandler();
        let getEData ="";
        const { radioInput } = this.state;
        // ---- wrap content & alias for further scan
        let scanTarget = getEData;

        if(this.props.form.getFieldValue('postTitle')){
            scanTarget = this.props.form.getFieldValue('postTitle');
        }

        if(this.props.form.getFieldValue('nominatedAuthor')==='alias'&&radioInput){
            scanTarget += ',';
            scanTarget += radioInput;
        }

        let scanResult = keywordsScanner(scanTarget);
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err,fieldsValues)=>{
            if(fieldsValues['nominatedAuthor']==='alias'&&!radioInput){
                message.error('Alias should not be empty', 7);
            } else if(!err&&scanResult){
                this.setState({ loading:true });

                const values = {
                    ...fieldsValues,
                    'createdBy': sessionStorage.getItem('@userInfo.id'),
                    'isPublic': fieldsValues['isPublic']? 1:0,
                    'publishAt': fieldsValues['isPublic']===0? null:moment(fieldsValues['publishAt']).format('YYYY-MM-DD HH:mm:ss'),
                    'showAsAlias': fieldsValues['nominatedAuthor']==='alias'? 1:0,
                    'alias': fieldsValues['nominatedAuthor']==='alias'? radioInput : null,
                    'originalCreator': fieldsValues['nominatedAuthor']==='others'? radioInput : sessionStorage.getItem('@userInfo.id'),
                    'link': fieldsValues['link'] || null,
                    'accessRuleId': fieldsValues['accessRuleId'] || null,
                    'accessChannel': fieldsValues['accessChannel'] || null,
                };

                let createPost_url = sessionStorage.getItem('serverPort')+'specialCollection/create/'+sessionStorage.getItem('@userInfo.id');
                fetchData(createPost_url, 'post', values, response=>{
                    this.setState({ loading: false });
                    if(response.ifSuccess){
                      let res = response.result;
                      if(res.status===200){
                          message.success("Post create successfully.");
                          setTimeout(()=> { window.location.replace(`#/specialCollection/myspecialCollection`) }, 1000);
                      }else{
                          message.error("Sorry, post creation was rejected by server.", 1);
                      }
                    }else{
                        message.error("Sorry, post creation was rejected by server.", 1);
                    }
                })
            }
        });

    };

    onCancelDelete = () => {
    }

    onDelete = () => {
        window.location.assign('#/elearning/admin');
    }

    render(){
        const { selPost, loading, ruleOptions, mode, disableTimePicker } = this.state;
        const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
        const titleError = getFieldError('postTitle');
        const publishAtError = isFieldTouched('publishAt') && getFieldError('publishAt');
        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 510px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        <a href="#/elearning/home" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.MY_E_LEARNING')}</a>
                        <a href="#/elearning/admin" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.ADMIN')}</a>
                        <a href="#/elearning/create_quiz" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.CREATE_QUIZ')}</a>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="create-post-main">
                                    <h3>{intl.get('@E_LEARNING.QUIZ_RESULT')}</h3>
                                    <Spin spinning={loading}>
                                        <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
                                            <Form.Item
                                            label={intl.get('@GENERAL.TITLE')}
                                            validateStatus={titleError ? 'error' : ''}
                                            help={titleError || ''}
                                            >
                                            {getFieldDecorator('postTitle', {
                                                rules: [{ required: true, message: intl.get('@GENERAL.TITLE')+intl.get('@GENERAL.IS-REQUIRED') }],
                                            })(
                                                <Input style={{ lineHeight: 0, maxWidth: '400px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.get('@GENERAL.TITLE')} allowClear />
                                            )}
                                            </Form.Item>

                                            {/* access channel */}
                                            <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
                                                {getFieldDecorator('accessChannel', { 
                                                    rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                                                })(
                                                    <Select style={{ maxWidth: '400px' }}>
                                                    <Option key="1">{intl.get('@BANNERS_MANAGEMENT.INTRANET-ONLY')}</Option>
                                                    <Option key="2">{intl.get('@BANNERS_MANAGEMENT.BOTH')}</Option>
                                                    <Option key="4">{intl.get('@BANNERS_MANAGEMENT.INTERNET-ONLY')}</Option>
                                                    </Select>
                                                )}
                                            </Form.Item>

                                            {/* access rule */}
                                            <Form.Item label={intl.get('@RES_MANAGEMENT.ACCESS-RULE')}>
                                            {getFieldDecorator('accessRuleId', { 
                                                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                                            })(
                                                <Select style={{ maxWidth: '400px' }} placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" >
                                                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
                                                </Select>
                                            )}
                                            </Form.Item>

                                            <Form.Item label={intl.get('@E_LEARNING.LIMIT_TIME')}>
                                            {getFieldDecorator('timeLimit', {
                                                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                                            })(
                                                <InputNumber min={1} max={300} defaultValue={60} placeholder="60"/>
                                                )}
                                            </Form.Item>

                                            <Form.Item label={intl.get('@E_LEARNING.PASS_MARK')}>
                                            {getFieldDecorator('passMark', {
                                                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                                            })(
                                                <InputNumber min={1} max={100} defaultValue={50}  placeholder="50"/>
                                                )}
                                            </Form.Item>

                                            <Form.Item label={intl.get('@E_LEARNING.REPEAT_TEST')}>
                                            {getFieldDecorator('repeat',{
                                                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                                            })(
                                                <InputNumber min={1} max={100} defaultValue={1}  placeholder="1"/>
                                            )}
                                            </Form.Item>

                                            <Form.Item label={intl.get('@E_LEARNING.SHOW_RESULT')}>
                                            {getFieldDecorator('result')(
                                                <Switch size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                                            )}
                                            </Form.Item>

                                            

                                            <div>
                                                <Form.Item
                                                className="if_published"
                                                label={intl.get('@MINI_BLOG.GO-PUBLIC')}
                                                >
                                                {getFieldDecorator('isPublic')(
                                                    <Switch onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                                                )}
                                                </Form.Item>

                                                {/* ***s=]*** Blog Publish Date */}
                                                <Form.Item
                                                className="if_published"
                                                label={intl.get('@MINI_BLOG.PUBLISH-DATE')}
                                                help={publishAtError || ''}
                                                >
                                                {getFieldDecorator('publishAt',{initialValue: moment(), valueProName:'moment'})(
                                                    <DatePicker 
                                                    locale={locale}
                                                    format="YYYY/MM/DD HH:mm:ss"
                                                    mode={mode}
                                                    disabled={disableTimePicker}
                                                    disabledDate={(current)=>{return current<moment().startOf('day')}}
                                                    showTime
                                                    onOpenChange={this.handlePickerOpenChange} 
                                                    onPanelChange={this.handlePickerPanelChange} 
                                                    />
                                                )}
                                                </Form.Item>

                                                <Form.Item className="formButtons">
                                                    <Button type="primary" disabled={loading} htmlType="submit">{intl.get('@GENERAL.CREATE')}</Button>

                                                    <Popconfirm 
                                                    title="Sure to leave this page? You will lose all inputs."
                                                    okText={intl.get('@GENERAL.CANCEL')}
                                                    onConfirm={this.onCancelDelete} 
                                                    cancelText={intl.get('@GENERAL.YES')}
                                                    onCancel={this.onDelete}
                                                    >
                                                        <Button type="default" title="Leave current page without saving changes">{intl.get('@GENERAL.CANCEL')}</Button>
                                                    </Popconfirm>
                                                </Form.Item>
                                            </div>
                                        </Form>
                                    </Spin>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
})