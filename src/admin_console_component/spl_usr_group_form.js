import React from 'react';
import { Form, Select, Input, Button } from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

class SplUsrGrpForm extends React.Component{
  // constructor(props){
  //   super(props);
  //   this.state ={ userOptions: null, submitting: false, selRecord: null };
  // }

  state ={ userOptions: null, submitting: false, selRecord: this.props.selRecord };

  componentWillReceiveProps(nextProps){
    if(nextProps.submitting!==this.state.submitting){
      this.setState({ submitting: nextProps.submitting });
    };
    if(nextProps.selRecord!==this.state.selRecord){
      this.setState({ selRecord: nextProps.selRecord });
    };
  }

  handleSpecialUser = (inputs) => {
    if(inputs){
      let getUserByStaffNo_url = sessionStorage.getItem('serverPort')+'user/getUserByStaffNo/'+sessionStorage.getItem('@userInfo.id')+'?staffNo='+inputs;
      fetchData(getUserByStaffNo_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200&&res.data){
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

  onSubmit = e => {
    const { selRecord } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        var groupValues = fieldsValues;
        if(selRecord&&selRecord.id){
          groupValues.id = selRecord.id;
        }

        this.props.handleSubmit(groupValues);
      }
    });
  };

  render(){
    const { getFieldDecorator, isFieldTouched, getFieldError } = this.props.form;
    const { Option } = Select;
    const { userOptions, submitting, selRecord } = this.state;

    const groupNameError = isFieldTouched('groupName') && getFieldError('groupName');
    const userListError = isFieldTouched('userList') && getFieldError('userList');
    return(
      <Form onSubmit={this.onSubmit}>
        <Form.Item label="Group Name" validateStatus={groupNameError? 'error':''} help={groupNameError||''}>
          {getFieldDecorator('groupName', {
            initialValue: selRecord&&selRecord.groupName? selRecord.groupName : '', 
            rules: [{ required: true, message: 'Group Name is required.' }]
          })(
            <Input />
          )}
        </Form.Item>
        <Form.Item label="User List" validateStatus={userListError? 'error':''} help={userListError||''} > 
          {getFieldDecorator('userList', {
            initialValue: selRecord&&selRecord.userList? selRecord.userList:[], 
            rules: [{ required: true, message: 'At least one user.' }]
          })(
            <Select onSearch={this.handleSpecialUser} filterOption={false} optionLabelProp="value" mode="multiple" style={{ width: '100%' }} >
              {!userOptions? null:<Option key={userOptions.staffNo}>{`${userOptions.fullname}(${userOptions.staffNo})`}</Option>}
            </Select>
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} >
            {intl.get('@GENERAL.SAVE')}
          </Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedSplUsrGrpForm= Form.create({name:'sug_form'})(SplUsrGrpForm);
export default WrappedSplUsrGrpForm;