import React from 'react';
import { Form, Select, Input, Button, Upload, Icon } from 'antd';
import intl from 'react-intl-universal';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

class PinForm extends React.Component{

  state ={ userOptions: null,submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [] };

  componentDidMount(){
    authImgByName2("pin-details");
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
    const { selRecord, fileList } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        var pinValues = fieldsValues;
        if(selRecord&&selRecord.id){
          pinValues.id = selRecord.id;
        }

        if(selRecord&&selRecord.orderby){
          pinValues.orderby = selRecord.orderby;
        }

        if(Array.isArray(fileList)&&fileList[0]){
          pinValues.file = fileList[0]
        };

        if(!pinValues.name_tc){
          pinValues.name_tc = pinValues.name;
        }

        this.props.handleUpdate(pinValues);
      }
    });
  };

  render(){
    const { getFieldDecorator, isFieldTouched, getFieldError } = this.props.form;
    const { Option } = Select;
    const { userOptions,submitting, selRecord, fileList, ruleOptions } = this.state;
    const userListError = isFieldTouched('userList') && getFieldError('userList');

    const uploadProps = {
      listType: 'text',
      accept: 'image/*',
      multiple: false,
      onRemove: file => {
        this.setState({ fileList: [] });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [file],
        }));
        return false;
      },
      fileList,
    };

    return(
      <Form onSubmit={this.onSubmit}>
        <Form.Item>
          <img 
          style={{ display: 'block', height:'20vh', width: 'auto', maxWidth: '400px', margin: '0 auto', paddingBottom: '5%' }} 
          alt="pin" 
          name="pin-details"
          hidden={!selRecord.imageUrl}
          data={selRecord.imageUrl} 
          // src={selRecord.imgUrl} 
          />
        </Form.Item>

        <div style={{ padding: '0 0 5%' }}>
          <Upload {...uploadProps}>
            <Button>
              <Icon type="upload" /> {intl.get('@GENERAL.REPLACE-BUTTON')}
            </Button>
          </Upload>
        </div>

        {/* English Name */}
        <Form.Item label={intl.get('@PIN_MANAGEMENT.NAME-ENG')}>
          {getFieldDecorator('name', {
            initialValue: selRecord&&selRecord.name? selRecord.name : '',
            rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
          })(
            <Input />
          )}
        </Form.Item>

        {/* Chinese Name */}
        <Form.Item label={intl.get('@PIN_MANAGEMENT.NAME-TC')}>
          {getFieldDecorator('nameTc', {
            initialValue: selRecord&&selRecord.nameTc? selRecord.nameTc : ''
          })(
            <Input />
          )}
        </Form.Item>

        {/* link to */}
        <Form.Item label={intl.get('@PIN_MANAGEMENT.DESCRIPTION')}>
          {getFieldDecorator('description', {
            initialValue: selRecord&&selRecord.description? selRecord.description : ''
          })(
            <Input />
          )}
        </Form.Item>

 
        {/* access rule */}
        {/* <Form.Item label={intl.get('@RES_MANAGEMENT.ACCESS-RULE')}>
          {getFieldDecorator('accessRuleId', { 
            initialValue: (selRecord&&selRecord.accessRuleId? selRecord.accessRuleId:[]),
            rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
          })(
            <Select placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
              {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
            </Select>
          )}
        </Form.Item> */}


        {/* user list */}
        <Form.Item label="User List" validateStatus={userListError? 'error':''} help={userListError||''} > 
            {getFieldDecorator('staffNo', {
                initialValue: selRecord&&selRecord.staffNo? selRecord.staffNo:[], 
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

const WrappedPinForm= Form.create({name:'pin_form'})(PinForm);
export default WrappedPinForm; 