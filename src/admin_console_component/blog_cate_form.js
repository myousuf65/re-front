//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190724 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Input, Button, Select } from 'antd';
import intl from 'react-intl-universal';

const { Option } = Select;

class cateInfoForm extends React.Component{
  constructor(props){
    super(props);
    this.state={
    };
  }

  componentDidMount(){
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err,fieldsValues)=>{
      if(!err){
        const values = {
        ...fieldsValues,
        'id': this.props.isNewCate? null : fieldsValues['id'],
        };



        this.props.handleInfoForm(this.props.isNewCate, values);

      }
    });
  };

  render(){
    const { getFieldDecorator } = this.props.form;
    const { id, category, categoryC, ordering, allowComment, admin } = this.props.cateInfo;
    const YN_Selector = (
      <Select>
        <Option key={1} value={1}>{intl.get('@GENERAL.YES')}</Option>
        <Option key={0} value={0}>{intl.get('@GENERAL.NO')}</Option>
      </Select>
    )

    
    return (
      <div>
        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left" >
          {/* ------- ID */}
          <Form.Item label={intl.get('@BLOG_CATE_MANAGEMENT.ID')}>
            {getFieldDecorator('id', {initialValue: id })(
                <Input disabled />
            )}
          </Form.Item>
          
          {/* ------- Category Name (En) */}
          <Form.Item 
          label={intl.get('@BLOG_CATE_MANAGEMENT.CATE-EN')}
          >
            {getFieldDecorator('category', {initialValue: category, rules: [{required: true, message: intl.get('@GENERAL.IS-A-MUST')}]})(
                <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>
          
          {/* ------- Category Name (Tc) */}
          <Form.Item 
          label={intl.get('@BLOG_CATE_MANAGEMENT.CATE-TC')}
          >
            {getFieldDecorator('categoryC', {initialValue: categoryC, rules: [{required: true, message: intl.get('@GENERAL.IS-A-MUST')}]})(
                <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>
          
          {/* ------- Ordering */}
          <Form.Item label={intl.get('@BLOG_CATE_MANAGEMENT.ORDERING')}>
            {getFieldDecorator('ordering', {initialValue: ordering, rules: [{required: true, message: intl.get('@GENERAL.IS-A-MUST')}]})(
                <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>

          {/* ------- Go Public */}
          <Form.Item label={intl.get('@BLOG_CATE_MANAGEMENT.GO-PUBLIC')}>
            {getFieldDecorator('public', {initialValue: this.props.cateInfo.public, })(
                YN_Selector
            )}
          </Form.Item>

          {/* ------- Allow User Left Comment */}
          <Form.Item label={intl.get('@BLOG_CATE_MANAGEMENT.ALLOW-COMMENT')}>
            {getFieldDecorator('allowComment', {initialValue: allowComment, })(
                YN_Selector
            )}
          </Form.Item>
          
          {/* ------- Category Administrator */}
          <Form.Item label={intl.get('@BLOG_CATE_MANAGEMENT.ADMIN')}>
            {getFieldDecorator('admin', {initialValue: admin})(
                <Input style={{ maxWidth: '400px' }} allowClear />
            )}
          </Form.Item>
        </Form>

        <div className="user-edit-save">
          <Button style={{ marginRight: '8px' }} type="primary" onClick={ this.handleSubmit }>{this.props.isNewCate? intl.get('@GENERAL.CREATE'):intl.get('@GENERAL.SAVE')}</Button>
        </div>
      </div>
    )
  }
}

const WrappedCateInfoForm = Form.create({ name: 'cate_info_form' })(cateInfoForm);

export default WrappedCateInfoForm;