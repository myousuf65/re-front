import React from 'react';
import { Popconfirm, Button, Form, Icon, Input, Select, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

moment.locale('zh-hk');

const { Option } = Select;
class CatForm extends React.Component{

  state ={ submitting: false, selRecord: this.props.selRecord, fileList: [], ruleOptions: [] };

  componentDidMount(){
  }

  componentWillReceiveProps(nextProps){
    // if(nextProps.submitting!==this.state.submitting){
    //   this.setState({ submitting: nextProps.submitting });
    // };
    // if(nextProps.selRecord!==this.state.selRecord){
    //   this.setState({ selRecord: nextProps.selRecord });
    // };
  }

  handleSubmit = e => {
    const { selRecord, fileList } = this.state;
    e.preventDefault();
    this.props.form.validateFields((err, fieldsValues) => {
      if (!err) {
        const values = {
            ...fieldsValues,
            'createdBy': sessionStorage.getItem('@userInfo.id'),
        };

        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/create_category/'+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                  if(res.data=="Duplicate Category Name") {
                    message.error("Category Name already exist.", 1);
                  } else {
                    message.success("Post create successfully.");
                    this.props.handleCatAdd();
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
    this.props.handleCatAdd();
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
    const titleError = getFieldError('title');
    const publishAtError = isFieldTouched('publishAt') && getFieldError('publishAt');

    return(
        <Form layout="horizontal" labelAlign="left" onSubmit={this.handleSubmit}>
            <Form.Item
            label={intl.get('@GENERAL.TITLE')}
            validateStatus={titleError ? 'error' : ''}
            help={titleError || ''}
            >
            {getFieldDecorator('title', {
                rules: [{ required: true, message: intl.get('@GENERAL.TITLE')+intl.get('@GENERAL.IS-REQUIRED') },
                { validator: this.validateWhitespace }],
            })(
                <Input style={{ lineHeight: 0, maxWidth: '400px' }} prefix={<Icon type="file-text" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder={intl.get('@GENERAL.TITLE')} allowClear />
            )}
            </Form.Item>

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
        </Form>
    )
  }
}

const elearningCatForm= Form.create({name:'quiz_form'})(CatForm);
export default elearningCatForm;