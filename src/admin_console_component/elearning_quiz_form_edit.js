import React from 'react';
import { Popconfirm, Button, Form, Icon, Input, Select, Spin, Switch, DatePicker, InputNumber, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

moment.locale('zh-hk');

const { Option } = Select;
class QuizFormEdit extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [] , selPost: null};
  componentDidMount(){
    this.initialRuleOptions();
  }

  componentWillReceiveProps(nextProps){
    
    if(nextProps.submitting!==this.state.submitting){
      this.setState({ submitting: nextProps.submitting });
    };
    if(nextProps.selRecord!==this.state.selRecord){
      this.setState({ selRecord: nextProps.selRecord });
    };
  }

  initialRuleOptions=()=>{
    const { selRecord } = this.state;
    if(selRecord&&selRecord.accessRuleId){
      let selAccessRules = selRecord.accessRuleId||[];
      let getARbyId_header = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1&id=';
      if(selAccessRules) {
        selAccessRules=selAccessRules.split(",");
      }
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
      if (!err) {
        const values = {
            ...fieldsValues,
            'modifiedBy': sessionStorage.getItem('@userInfo.id'),
            'isPublic': fieldsValues['isPublic']? 1:0,
            'result': fieldsValues['result']? 1:0,
            'publishAt': moment(fieldsValues['publishAt']).format('YYYY-MM-DD HH:mm:ss'),
            'accessRuleId': fieldsValues['accessRuleId'] || null,
            'accessChannel': fieldsValues['accessChannel'] || null,
        };

        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/update_quiz/'+selRecord.id+'?user='+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                  if(res.data=="Duplicate Quiz Name") {
                    message.error("Assessment Name already exist.", 1);
                  } else {
                    const { selRecord } = this.state;
                    const updatedRecord = {
                      ...selRecord,
                      title: fieldsValues['title'], // 更新title属性
                    };
                    message.success("Post Update successfully.");
                    this.props.handleQuizEdit(updatedRecord);
                  }
                    
                }else{
                  message.error("Sorry, post Update was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post Update was rejected by server.", 1);
            }
        })
      }
    });
  };

  onCancelDelete() {
    this.props.handleQuizEdit();
  }

  validateWhitespace = (_, value, callback) => {
    if (value && value.trim().length === 0) {
      callback('Input cannot consist of whitespace only');
    } else {
      callback();
    }
  };

  render(){
    const { selRecord, loading, ruleOptions } = this.state;
    const { getFieldDecorator, getFieldError } = this.props.form;
    const titleError = getFieldError('postTitle');
    return(
        <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
            <Form.Item
            label={intl.get('@GENERAL.TITLE')}
            >
            {getFieldDecorator('title', {
                rules: [{ required: true, message: intl.get('@GENERAL.TITLE')+intl.get('@GENERAL.IS-REQUIRED') },{ validator: this.validateWhitespace }],
                initialValue: selRecord.title
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
                    initialValue: (selRecord.accessChannel)
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
                initialValue: (selRecord.accessRuleId)
            })(
                <Select style={{ maxWidth: '400px' }} placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" >
                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
                </Select>
            )}
            </Form.Item> */}

            <Form.Item label={intl.get('@E_LEARNING.LIMIT_TIME')}>
            {getFieldDecorator('limitTime', {
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                initialValue: selRecord.limitTime
            })(
                <InputNumber min={0} max={300} defaultValue={60} placeholder="60"/>
                )}
            </Form.Item>

            <Form.Item label={intl.get('@E_LEARNING.PASS_MARK')}>
            {getFieldDecorator('passMark', {
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                initialValue: selRecord.passMark
            })(
                <InputNumber min={0} max={100} defaultValue={50}  placeholder="50"/>
                )}
            </Form.Item>

            <Form.Item label={intl.get('@E_LEARNING.REPEAT_TEST')}>
            {getFieldDecorator('repeat',{
                rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
                initialValue: selRecord.repeatTime
            })(
                <InputNumber min={0} max={100} defaultValue={1}  placeholder="1"/>
            )}
            </Form.Item>

            <Form.Item label={intl.get('@E_LEARNING.SHOW_RESULT')}>
            {getFieldDecorator('result', { initialValue: selRecord.result, valuePropName: 'checked' })(
                <Switch size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
            )}
            </Form.Item>

            

            <div>
                <Form.Item
                className="if_published"
                label={intl.get('@MINI_BLOG.GO-PUBLIC')}
                >
                {getFieldDecorator('isPublic', { initialValue: selRecord.isPublic, valuePropName: 'checked' })(
                    <Switch onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                )}
                </Form.Item>

                {/* ***s=]*** Blog Publish Date */}
                {/* <Form.Item
                className="if_published"
                label={intl.get('@MINI_BLOG.PUBLISH-DATE')}
                help={publishAtError || ''}
                >
                {getFieldDecorator('publishAt',{initialValue: (selRecord===undefined? moment() : moment(selRecord.publishAt)),valueProName:'moment'})(
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
                    <Button type="primary" disabled={loading} htmlType="submit">{intl.get('@GENERAL.UPDATE')}</Button>

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

const ElearningQuizFormEdit= Form.create({name:'quiz_form'})(QuizFormEdit);
export default ElearningQuizFormEdit;