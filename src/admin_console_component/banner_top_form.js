import React from 'react';
import { Form, Select, Input, Button, Upload, Icon } from 'antd';
import intl from 'react-intl-universal';
import { authImgByName2 } from '../resources_component/authimg';

class TopBannerForm extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [] };

  componentDidMount(){
    authImgByName2("banner-details");
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.submitting!==this.state.submitting){
      this.setState({ submitting: nextProps.submitting });
    };
    if(nextProps.selRecord!==this.state.selRecord){
      this.setState({ selRecord: nextProps.selRecord });
    };
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

        this.props.handleUpdate(bannerValues);
      }
    });
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { Option } = Select;
    const { submitting, selRecord, fileList } = this.state;

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
          {getFieldDecorator('accessChannel', { initialValue: (selRecord&&selRecord.accessChannel? selRecord.accessChannel:"1") })(
            <Select>
              <Option key="1">{intl.get('@BANNERS_MANAGEMENT.INTRANET-ONLY')}</Option>
              <Option key="2">{intl.get('@BANNERS_MANAGEMENT.BOTH')}</Option>
              <Option key="4">{intl.get('@BANNERS_MANAGEMENT.INTERNET-ONLY')}</Option>
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

const WrappedTopBannerForm= Form.create({name:'top_banner_form'})(TopBannerForm);
export default WrappedTopBannerForm;