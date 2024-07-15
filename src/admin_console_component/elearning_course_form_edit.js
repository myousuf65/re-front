import React from 'react';
import { Popconfirm, Button, Form, Icon, Input, Select, Spin, Switch, DatePicker, InputNumber, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';


moment.locale('zh-hk');

const { Option } = Select;
class CourseFormEdit extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [],startDate: null, endDate: null };

  componentDidMount(){
    const { selRecord } = this.state;
    this.setState({ startDate:moment(selRecord.startDate), endDate:moment(selRecord.endDate)});
    // if(selRecord.accessRuleId) {
    //   selRecord.accessRuleId=selRecord.accessRuleId.split(",");
    // }
    // this.initialRuleOptions(selRecord);
    setTimeout(() => {
      if (selRecord.accessRuleId && selRecord.accessRuleId !== "") {
        selRecord.accessRuleId = selRecord.accessRuleId.split(",");
      }

      this.initialRuleOptions(selRecord);
    }, 500); 
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.submitting!==this.state.submitting){
      this.setState({ submitting: nextProps.submitting });
    };
    if(nextProps.selRecord!==this.state.selRecord){
      this.setState({ selRecord: nextProps.selRecord });
     
      const { selRecord } = this.state;
      this.setState({
        startDate: moment(selRecord.startDate),
        endDate: moment(selRecord.endDate)
      });

      setTimeout(() => {
        if (selRecord.accessRuleId && selRecord.accessRuleId !== "") {
          selRecord.accessRuleId = selRecord.accessRuleId.split(",");
        }
  
        this.initialRuleOptions(selRecord);
      }, 500);
    };
  }

  handleStartDateChange = (date) => {
    this.setState({ startDate: date });
  };

  handleEndDateChange = (date) => {
    this.setState({ endDate: date });
  };

  initialRuleOptions=(selPost)=>{
    if(selPost&&selPost.accessRuleId){
      let selAccessRules = selPost.accessRuleId||[];
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
    const { startDate, endDate, selRecord } = this.state;
    console.log("handleSubmit")
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        const values = {
            ...fieldsValues,
            'modifiedBy': sessionStorage.getItem('@userInfo.id'),
            'createdBy': sessionStorage.getItem('@userInfo.id'),
            'isPublish': fieldsValues['isPublish']? 1:0,
            'startDate': startDate.format('YYYY-MM-DD HH:mm:ss'),
            'endDate': endDate.format('YYYY-MM-DD HH:mm:ss'),
            'accessRuleId': fieldsValues['accessRuleId'] || null,
        };

        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/update_course/'+selRecord.id+'?user='+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                  if(res.data=="Duplicate Course Name") {
                    message.error("Course Name already exist.", 1);
                  } else {
                    
                    message.success("Post update successfully.");
                    this.props.handleCourseEdit();
                  }
                    
                }else{
                  message.error("Sorry, post update was rejected by server.", 1); 
                }
            }else{
                message.error("Sorry, post update was rejected by server.", 1);
            }
        })
      }
    });
  };

  handlePickerOpenChange = (open) => {
    // 在日期範圍選擇器打開或關閉時執行相應的操作
    console.log("Picker open:", open);
    // 可以根據需要在此處執行其他邏輯
  };
  
  handlePickerPanelChange = (value, mode) => {
    // 在日期範圍選擇器面板變化時執行相應的操作
    console.log("Picker panel change:", value, mode);
    // 可以根據需要在此處執行其他邏輯
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
    const { loading, startDate, endDate, selRecord, ruleOptions } = this.state;
    const { getFieldDecorator, getFieldError, isFieldTouched  } = this.props.form;
    const courseNameError = getFieldError('courseName');
    const publishAtError = getFieldError('publishAt');
    const staffNoListError = getFieldError('staffNoList');

    return(
        <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
            <Form.Item
            label={intl.get('@E_LEARNING.COURSE_NAME')}
            validateStatus={courseNameError ? 'error' : ''}
            help={courseNameError || ''}
            >
            {getFieldDecorator('courseName', {
                initialValue: selRecord.courseName,
                rules: [{ required: true, message: intl.get('@E_LEARNING.COURSE_NAME')+intl.get('@GENERAL.IS-REQUIRED') },
                        { validator: this.validateWhitespace }],
                
            })(
                <Input style={{ lineHeight: 0, maxWidth: '400px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.get('@E_LEARNING.COURSE_NAME')} allowClear />
            )}
            </Form.Item>

            {/* access channel */}
            <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
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
            </Form.Item>

            {/* access rule */}
            <Form.Item label={intl.get('@RES_MANAGEMENT.ACCESS-RULE')}>
            {getFieldDecorator('accessRuleId', { 
                initialValue: (selRecord&&selRecord.accessRuleId? selRecord.accessRuleId:[]),
            })(
                <Select style={{ maxWidth: '400px' }} placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" >
                {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
                </Select>
            )}
            </Form.Item>

            <Form.Item
                label={intl.get('@E_LEARNING.STAFF_NO_List')}
                validateStatus={staffNoListError ? 'error' : ''}
                help={staffNoListError || ''}
                >
                {getFieldDecorator('staffNoList', {
                    initialValue: selRecord.staffNoList,
                   })(
                    <Input.TextArea
                    style={{ maxWidth: '400px' }}
                    prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />}
                    placeholder={intl.get('@E_LEARNING.STAFF_NO_List')}
                    allowClear
                    rows={4}
                    />
                )}
            </Form.Item>

            

            

            <div>
                <Form.Item
                className="if_published"
                label={intl.get('@E_LEARNING.IS_PUBLISH')}
                >
                {getFieldDecorator('isPublish',{
                    initialValue: selRecord.isPublish,
                    valuePropName: 'checked'
                })(
                    <Switch onClick={this.onSwitchClick} size="default" checkedChildren={<Icon type="check" />} unCheckedChildren={<Icon type="close" />} />
                )}
                </Form.Item>

                {/* ***s=]*** Blog Publish Date */}
                <Form.Item
                    className="if_published"
                    label={intl.get('@MINI_BLOG.PUBLISH-DATE')}
                    validateStatus={publishAtError ? 'error' : ''}
                    help={publishAtError || ''}
                >
                {getFieldDecorator('startDate', {
                    initialValue: (startDate===undefined? moment() : startDate), // 设置默认值为 startDate 和 endDate，如果它们都不为空
                    valueProName: 'moment'
                    
                /*
                rules: [{ required: true, message: intl.get('@MINI_BLOG.PUBLISH-DATE') + intl.get('@GENERAL.IS-REQUIRED') }],
                {getFieldDecorator('publishAt',{initialValue: (selRecord===undefined? moment() : moment(selRecord.publishAt)),valueProName:'moment'})(
                */
                
                })(
                    <DatePicker
                        locale={locale}
                        format="YYYY/MM/DD HH:mm:ss"
                        placeholder="Start Date"
                        onChange={this.handleStartDateChange}
                        onOpenChange={this.handlePickerOpenChange}
                        onPanelChange={this.handlePickerPanelChange}
                        /> 
                )} to
                {getFieldDecorator('endDate', {
                    initialValue: (endDate===undefined? moment() : endDate), // 设置默认值为 startDate 和 endDate，如果它们都不为空
                    valueProName: 'moment',
                    rules: [{ required: true, message: intl.get('@MINI_BLOG.PUBLISH-DATE') + intl.get('@GENERAL.IS-REQUIRED') }],
                })(
                     
                    <DatePicker
                        locale={locale}
                        format="YYYY/MM/DD HH:mm:ss"
                        placeholder="End Date"
                        onChange={this.handleEndDateChange}
                        onOpenChange={this.handlePickerOpenChange}
                        onPanelChange={this.handlePickerPanelChange}
                        />
                        )}
                </Form.Item>

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

const ElearningCourseFormEdit= Form.create({name:'course_form'})(CourseFormEdit);
export default ElearningCourseFormEdit;