import React from 'react';
import { Button, Form, Icon, Input, Select, Switch, DatePicker, InputNumber, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';


moment.locale('zh-hk');

const { Option } = Select;
class QuizForm extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [] };

  componentDidMount(){
    this.initialRuleOptions();
  }

  componentWillReceiveProps(nextProps){
    // if(nextProps.submitting!==this.state.submitting){
    //   this.setState({ submitting: nextProps.submitting });
    // };
    // if(nextProps.selRecord!==this.state.selRecord){
    //   this.setState({ selRecord: nextProps.selRecord });
    // };
  }

  initialRuleOptions=()=>{
    const { selRecord } = this.state;
    if(selRecord&&selRecord.accessRuleId){
      let selAccessRules = selRecord.accessRuleId||[];
      let getARbyId_header = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1&id=';

      selAccessRules.forEach((iReaderId)=>{
        fetchData(getARbyId_header+iReaderId, 'get', null, response=>{
          let selAR = null;
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&res.data!==undefined&&res.data[0]!==undefined){
              selAR = res.data[0];
            }else{
              selAR = {id: iReaderId, description: `Invalid ${iReaderId}`};
            }
          }else{
            selAR = {id: iReaderId, description: `Invalid ${iReaderId}`};
          };

          if(selAR){
            this.setState(state=>({ ruleOptions: [...state.ruleOptions, selAR] }));
          };
        });
      });
    }
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

  handleSubmit = e => {
    const { selRecord, fileList } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      console.log(fieldsValues)
      if (!err) {
        const values = {
            ...fieldsValues,
            'createdBy': sessionStorage.getItem('@userInfo.id'),
            'catId': 0,
            'isPublic': fieldsValues['isPublic']? 1:0,
            'result': fieldsValues['result']? 1:0,
            'publishAt': fieldsValues['isPublic']===0? null:moment(fieldsValues['publishAt']).format('YYYY-MM-DD HH:mm:ss'),
            'accessRuleId': null,
            'accessChannel': null,
        };

        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/create_quiz/'+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                  if(res.data=="Duplicate Quiz Name") {
                    message.error("Assessment Name already exist.", 1);
                  } else {
                    message.success("Post create successfully.");
                    this.props.handleQuizAdd();
                  }
                   
                }else{
                  message.error("Sorry, post update was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post creation was rejected by server.", 1);
            }
        })
      }
    });
  };

  onCancelDelete() {
    this.props.handleQuizAdd();
  }

  validateWhitespace = (_, value, callback) => {
    if (value && value.trim().length === 0) {
      callback('Input cannot consist of whitespace only');
    } else {
      callback();
    }
  };

  render(){
    const { selPost, loading, ruleOptions, mode, disableTimePicker } = this.state;
    const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;

    return(
        <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
            <Form.Item
            label={intl.get('@GENERAL.TITLE')}
            >
            {getFieldDecorator('title', {
                rules: [{ required: true, message: intl.get('@GENERAL.TITLE')+intl.get('@GENERAL.IS-REQUIRED') },{ validator: this.validateWhitespace }],
            })(
                <Input style={{ lineHeight: 0, maxWidth: '400px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.get('@GENERAL.TITLE')} allowClear />
            )}
            </Form.Item>

            {/* access channel */}
            {/* <Form.Item label={intl.get('@E_LEARNING.CATEGORY')}>
                {getFieldDecorator('catId', { 
                    rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                })(
                    <Select style={{ maxWidth: '400px' }}>
                    <Option key="1">cat1</Option>
                    </Select>
                )}
            </Form.Item> */}

            {/* access channel */}
            {/* <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
                {getFieldDecorator('accessChannel', { 
                    rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                })(
                    <Select style={{ maxWidth: '400px' }}>
                    <Option key="1">{intl.get('@BANNERS_MANAGEMENT.INTRANET-ONLY')}</Option>
                    <Option key="2">{intl.get('@BANNERS_MANAGEMENT.BOTH')}</Option>
                    <Option key="4">{intl.get('@BANNERS_MANAGEMENT.INTERNET-ONLY')}</Option>
                    </Select>
                )}
            </Form.Item> */}

            {/* access rule */}
            {/* <Form.Item label={intl.get('@RES_MANAGEMENT.ACCESS-RULE')}>
            {getFieldDecorator('accessRuleId', { 
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
            })(
                <Select style={{ maxWidth: '400px' }} placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" >
                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
                </Select>
            )}
            </Form.Item> */}

            <Form.Item label={intl.get('@E_LEARNING.LIMIT_TIME')}>
            {getFieldDecorator('limitTime', {
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
            })(
                <InputNumber min={0} max={300} defaultValue={60} placeholder="60"/>
                )}
            </Form.Item>

            <Form.Item label={intl.get('@E_LEARNING.PASS_MARK')}>
            {getFieldDecorator('passMark', {
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
            })(
                <InputNumber min={0} max={100} defaultValue={50}  placeholder="50"/>
                )}
            </Form.Item>

            <Form.Item label={intl.get('@E_LEARNING.REPEAT_TEST')}>
            {getFieldDecorator('repeat',{
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
            })(
                <InputNumber min={0} max={100} defaultValue={1}  placeholder="1"/>
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
                {/* <Form.Item
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
                </Form.Item> */}

                <Form.Item className="formButtons">
                    <Button type="primary" disabled={loading} htmlType="submit">{intl.get('@GENERAL.CREATE')}</Button>

                    {/* <Popconfirm 
                    title="Sure to leave this page? You will lose all inputs."
                    okText={intl.get('@GENERAL.CANCEL')}
                    onConfirm={this.onCancelDelete} 
                    cancelText={intl.get('@GENERAL.YES')}
                    onCancel={this.onDelete}
                    >
                        <Button type="default" title="Leave current page without saving changes">{intl.get('@GENERAL.CANCEL')}</Button>
                    </Popconfirm> */}
                </Form.Item>
            </div>
        </Form>
    )
  }
}

const elearningQuizForm= Form.create({name:'quiz_form'})(QuizForm);
export default elearningQuizForm;