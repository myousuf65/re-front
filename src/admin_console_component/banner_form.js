import React from 'react';
import { Form, Select, Input, Button, Upload, Icon } from 'antd';
import intl from 'react-intl-universal';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

class BannerForm extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [] };

  componentDidMount(){
    authImgByName2("banner-details");
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

  onSubmit = e => {
    const { selRecord, fileList } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        var bannerValues = fieldsValues;
        if(selRecord&&selRecord.id){
          bannerValues.id = selRecord.id;
        }

        if(selRecord&&selRecord.orderby){
          bannerValues.orderby = selRecord.orderby;
        }

        if(Array.isArray(fileList)&&fileList[0]){
          bannerValues.file = fileList[0]
        };

        if(!bannerValues.name_tc){
          bannerValues.name_tc = bannerValues.name;
        }

        this.props.handleUpdate(bannerValues);
      }
    });
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { Option } = Select;
    const { submitting, selRecord, fileList, ruleOptions } = this.state;

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
          alt="banner" 
          name="banner-details"
          hidden={!selRecord.imgUrl}
          data={selRecord.imgUrl} 
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
        <Form.Item label={intl.get('@BANNERS_MANAGEMENT.NAME-ENG')}>
          {getFieldDecorator('name', {
            initialValue: selRecord&&selRecord.name? selRecord.name : '',
            rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
          })(
            <Input />
          )}
        </Form.Item>

        {/* Chinese Name */}
        <Form.Item label={intl.get('@BANNERS_MANAGEMENT.NAME-TC')}>
          {getFieldDecorator('name_tc', {
            initialValue: selRecord&&selRecord.name_tc? selRecord.name_tc : ''
          })(
            <Input />
          )}
        </Form.Item>

        {/* link to */}
        <Form.Item label={intl.get('@BANNERS_MANAGEMENT.LINK-TO')}>
          {getFieldDecorator('linkTo', {
            initialValue: selRecord&&selRecord.linkTo? selRecord.linkTo : ''
          })(
            <Input />
          )}
        </Form.Item>

        {/* access channel */}
        <Form.Item label={intl.get('@RES_DRAWER_INFO.ACCESS-CHANNEL')}>
          {getFieldDecorator('accessChannel', { 
            initialValue: (selRecord&&selRecord.accessChannel? selRecord.accessChannel:"1"),
            rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
          })(
            <Select>
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
            rules: [{required: true, message: intl.get('@GENERAL.REQUIRED')}],
          })(
            <Select placeholder="Search by Access Rule Description" onSearch={this.onSearchAccessRule} filterOption={false} optionLabelProp="label" mode="multiple" style={{ width: '100%' }} >
              {ruleOptions.length===0? null:ruleOptions.map(item=>{ return <Option key={item.id} label={item.description}>{`${item.description}(${item.id})`}</Option>})}
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

const WrappedBannerForm= Form.create({name:'banner_form'})(BannerForm);
export default WrappedBannerForm;