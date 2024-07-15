//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190717 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Input, Button, Select, message, Upload, Icon, Divider, Spin } from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

import './user_management_form.css';
import { authImgByName } from '../resources_component/authimg';
import { userLevelIcons } from '../service/common';

const { Option } = Select;
const uploadButton = (loading) => (
  <div>
    <Icon type={loading ? 'loading' : 'plus'} />
    <div className="ant-upload-text">{intl.get('@GENERAL.UPLOAD')}</div>
  </div>
);

class userMntForm extends React.Component{
  constructor(props){
    super(props);
    this.state={
      selUser: {},
      userGroupOptions: [],
      ruleOptions: [],
      k_market: [],
      k_square: [],
      wisdom_gallery: [],
      imageUrl_profile: null,
      imagePath_profile: null,
      imageUrl_alias: null,
      imagePath_alias: null,
      loading_profile: false,
      loading_alias: false,
      loading: true,
    };
  }

  componentDidMount(){
    this.getGroupOptions();
    this.getAccessRuleOptions();
    let getDetails_url = sessionStorage.getItem('serverPort')+'user/getDetails?userId='+this.props.selUserId;
    fetchData(getDetails_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data!==undefined){
          this.setState({ 
            selUser: res.data,
            profilePhotoIsPending: !!res.data.profilePhotoIsPending, 
            aliasPhotoIsPending: !!res.data.aliasPhotoIsPending,
            imageUrl_profile: sessionStorage.getItem('serverPort')+res.data.profilePhoto,
            imagePath_profile: res.data.profilePhoto,
            imageUrl_alias: sessionStorage.getItem('serverPort')+res.data.aliasPhoto,
            imagePath_alias: res.data.aliasPhoto,
            loading: false
          });
          this.getAccessRule(res.data);
        }else{
          this.setState({loading: false});
        }
      }else{
        this.setState({loading: false});
      }
    })
  }

  // ------designed for detailed func
  getAccessRule=(selUser)=>{
    let accessRule_url = sessionStorage.getItem('serverPort')+'access_rule/all';
    fetchData(accessRule_url,'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          var kmList = [];
          res.data.filter(item=>{return item.areaId===1}).forEach(ikm=>{
            kmList.push(ikm.id);
          });
          var ksList = [];
          res.data.filter(item=>{return item.areaId===2}).forEach(iks=>{
            ksList.push(iks.id);
          });
          const wgList  = [];
          res.data.filter(item=>{return item.areaId===3}).forEach(iwg=>{
            wgList.push(iwg.id);
          });
  
          let recordRules = selUser.accessRuleList.map(v => parseInt(v, 10));
          let k_market = recordRules.filter(item=> kmList.includes(item));
          let k_square = recordRules.filter(item=> ksList.includes(item));
          let wisdom_gallery = recordRules.filter(item=> wgList.includes(item));
  
          this.setState(state=>({ 
            ruleOptions: res.data, 
            k_market: k_market, 
            k_square: k_square, 
            wisdom_gallery: wisdom_gallery,
          }));
        }else{
          this.setState(state=>({ ruleOptions: [] }));                
        }
      }
    });
  }

  getGroupOptions=()=>{
    let getGroupOptions_url = sessionStorage.getItem('serverPort')+'user/getGroup';
    fetchData(getGroupOptions_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data!==undefined){
          this.setState({ userGroupOptions: res.data });
        }
      }
    })
  }

  getAccessRuleOptions=()=>{
    let accessRule_url=sessionStorage.getItem('serverPort')+'access_rule/all';
    fetchData(accessRule_url,'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({ ruleOptions: res.data }));
        }else{
          this.setState(state=>({ ruleOptions: [] }));                
        }
      }
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err,fieldsValues)=>{
      if(!err){
        const values = {
        ...fieldsValues,
        'accessRuleList': fieldsValues['k_market'].concat(fieldsValues['k_square'],fieldsValues['wisdom_gallery']),
        'language': fieldsValues['language'] || 'en',
        'id': this.state.selUser.id
        // 'special_user': fieldsValues['if_su']===true? fieldsValues['special_user'] : [],
        };

        this.props.handleInfoForm(values);

      }
    });
  };

  beforeUpload=(file)=>{
    const isJPG = file.type === 'image/jpeg';
    if (!isJPG) {
      message.error('You can only upload JPG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJPG && isLt2M;
  }

  getBase64=(img, callback)=>{
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  handleUploadChange = info => {
    let res = info.file.response;

    if (info.file.status === 'uploading') {
      this.setState({ loading_profile: true });
      return;
    }

    if (info.file.status === 'error') {
      this.setState({ loading_profile: false });
      if(res.status===401){
          message.error("Your Login Session is expired.");
          sessionStorage.clear();
          window.location.assign('/');
      }else if(res.status===440){
        let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
        fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
        window.location.assign('#/failout');
      }else if(res.msg !== undefined && res.msg !== null){
        message.error("Failed to upload: " + res.msg);
      }else{
        message.error("Failed to upload.");
      }
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      if (info.file.response.status===200){
        this.getBase64(info.file.originFileObj, imageUrl =>
          this.setState({
            imageUrl_profile: imageUrl,
            imagePath_profile: info.file.response.data,
            loading_profile: false,
          }),
        );
      } else {
        message.error('Upload was reject by server: '+ info.file.response.msg )
        this.setState({
          loading_profile: true,
        });
      }

    }
  };

  handleAliasUploadChange = info => {
    let res = info.file.response;

    if (info.file.status === 'uploading') {
      this.setState({ loading_alias: true });
      return;
    }

    if (info.file.status === 'error') {
      this.setState({ loading_alias: false });
      if(res.status===401){
          message.error("Your Login Session is expired.");
          sessionStorage.clear();
          window.location.assign('/');
      }else if(res.status===440){
        let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
        fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
      }else if(res.msg !== undefined && res.msg !== null){
          message.error("Failed to upload: " + res.msg);
      }else{
          message.error("Failed to upload.");
      }
      return;
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      if (info.file.response.status===200){
        this.getBase64(info.file.originFileObj, imageUrl =>
          this.setState({
            imageUrl_alias: imageUrl,
            imagePath_alias: info.file.response.data,
            loading_alias: false,
          }),
        );
      } else {
        message.error('Upload was reject by server: '+ info.file.response.msg )
        this.setState({
          loading_alias: true,
        });
      }
    }
  };

  checkLoginTries = (rule, value, callback) => {
    const number = parseInt(value || 0, 10);
    if (!isNaN(number) && number > -1) {
      return callback();
    }
    callback('Please input a non-negative number.');
  };

  handleAvatarApprove = (type, approve) => {
    let data = {
      user: this.props.selUserId,
      type: type, // profile = 1, alias = 2
      approve: approve, // false = 0, true = 1
    }

    let pendingType = type===1? "profilePhotoIsPending":"aliasPhotoIsPending";
    let loadingType = type===1? "loading_profile":"loading_alias";
    this.setState({ [loadingType]: true });
    let approve_url = sessionStorage.getItem('serverPort') + "user/approve/" + sessionStorage.getItem('@userInfo.id');
    fetchData(approve_url, 'post', data, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({ [pendingType]: false }));
        }
      }

      this.setState({ [loadingType]: false });

    });
  }



  render(){
    const { getFieldDecorator } = this.props.form;
    const { ruleOptions, k_market, k_square, wisdom_gallery, imageUrl_profile, imageUrl_alias, loading_profile, loading_alias, profilePhotoIsPending, aliasPhotoIsPending } =this.state;
    const { id, staffNo, username, fullname, usergroup, lang, substantiveRank, activeRank, chineseName, instT,
    sectionT, dutiesT, instX, sectionX, dutiesX, sex, notesAccount, rank, institution, section, alias, isBlogger, loginTries,  } = this.state.selUser;

    const uploadButton = (loading) => (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{intl.get('@GENERAL.UPLOAD')}</div>
      </div>
    );

    const approveCustomAvatar = (type, loading) => {
      if(this.props.generalUser){
        return null;
      }

      if(type === 1 && !profilePhotoIsPending){
        return <Button.Group style={{ textAlign: 'center', width: '100%', marginTop: '1.5rem' }}>
        <Button type="primary" disabled >{intl.get('@GENERAL.APPROVE')}</Button>
        <Button type="danger" disabled >{intl.get('@GENERAL.REJECT')}</Button>
      </Button.Group>
      }

      if(type === 2 && !aliasPhotoIsPending){
        return <Button.Group style={{ textAlign: 'center', width: '100%', marginTop: '1.5rem' }}>
        <Button type="primary" disabled >{intl.get('@GENERAL.APPROVE')}</Button>
        <Button type="danger" disabled >{intl.get('@GENERAL.REJECT')}</Button>
      </Button.Group>
      }

      return <Button.Group style={{ textAlign: 'center', width: '100%', marginTop: '1.5rem' }}>
        <Button type="primary" loading={loading} onClick={(e)=>this.handleAvatarApprove(type, 1)} >{intl.get('@GENERAL.APPROVE')}</Button>
        <Button type="danger" loading={loading} onClick={(e)=>this.handleAvatarApprove(type, 0)} >{intl.get('@GENERAL.REJECT')}</Button>
      </Button.Group>
    }

    return(
      <Spin spinning={this.state.loading}>
      <div>
        <div className="user-photo">
          <Upload
          disabled={this.props.generalUser}
          name="file"
          accept="image/jpeg"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action={`${sessionStorage.getItem('serverPort')}user/upload/${this.props.selUserId}?type=profile`}
          headers={{'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,}}
          beforeUpload={this.beforeUpload}
          onChange={this.handleUploadChange}
          >
            {imageUrl_profile ? <img src={imageUrl_profile} className="user-photo-uploaded" alt="profile" /> : uploadProfileButton}
            {/* {imageUrl_profile ? <img is="auth-img" authSrc={imageUrl_profile} className="user-photo-uploaded" alt="profile" /> : uploadButton(loading_profile)} */}
          </Upload>
          {approveCustomAvatar(1, loading_profile)}
        </div>

        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left" >

          {/* ------- Profile Photo */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.PROFILE-PHOTO')}>
            {getFieldDecorator('profilePhoto', {initialValue: this.state.imagePath_profile })(
                <Input disabled />
            )}
          </Form.Item>

          {/* ------- ID */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.ID')}>
            <Input value={id} disabled />
          </Form.Item>
          
          {/* ------- Username */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.USERNAME')}>
            <Input value={username} disabled />
          </Form.Item>
          
          {/* ------- Staff No. */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.STAFF-NO')}>
            <Input value={staffNo} disabled />
          </Form.Item>

          {/* ------- Fullname */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.FULLNAME')}>
            <Input value={fullname} disabled />
          </Form.Item>

          {/* ------- Chinese Name */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.CHINESE-NAME')}>
            <Input value={chineseName} disabled />
          </Form.Item>

          {/* ------- Gender */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.GENDER')}>
              <Select value={sex} disabled>
                <Option key="F" value="F">{intl.get('@USER_DRAWER_INFO.GENDER-F')}</Option>
                <Option key="M" value="M">{intl.get('@USER_DRAWER_INFO.GENDER-M')}</Option>
              </Select>
          </Form.Item>

          {/* ------- Language */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.LANG')}>
            {getFieldDecorator('language', {initialValue: lang})(
                <Select disabled={this.props.generalUser}>
                  <Option key='en' value='en'>{intl.get('@USER_DRAWER_INFO.LANG-EN')}</Option>
                  <Option key='tc' value='tc'>{intl.get('@USER_DRAWER_INFO.LANG-TC')}</Option>
                </Select>
            )}
          </Form.Item>

          {/* ------- User Group */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.USER-GROUP')}>
            {getFieldDecorator('userGroup', {initialValue: usergroup})(
                <Select disabled={this.props.generalUser}>
                  {this.state.userGroupOptions.map(option=>(<Option key={option.id} value={option.id}>{option.name}</Option>))}
                </Select>
            )}
          </Form.Item>

          {/* ------- Login Tries */}
          <Form.Item label="Login Tries">
            {getFieldDecorator('loginTries', {
              initialValue: loginTries || 0,
              rules: [{ validator: this.checkLoginTries }],
            })(
                <Input disabled={this.props.generalUser} />
            )}
          </Form.Item>

          <Divider orientation="left">{intl.get('@RES_MANAGEMENT.ACCESS-RULE')}</Divider>

          {/* ------- Access Rule - K-Market */}
          <Form.Item label={intl.get('@RES_MANAGEMENT.K-MARKET')}>
            {getFieldDecorator('k_market', {initialValue: k_market })(
                <Select optionFilterProp="label" mode="multiple" disabled={this.props.generalUser}>
                  {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===1}).map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                </Select>
            )}
          </Form.Item>

          {/* ------- Access Rule - K-Square */}
          <Form.Item label={intl.get('@RES_MANAGEMENT.K-SQUARE')}>
            {getFieldDecorator('k_square', {initialValue: k_square })(
                <Select optionFilterProp="label" mode="multiple" disabled={this.props.generalUser}>
                  {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===2}).map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                </Select>
            )}
          </Form.Item>

          {/* ------- Access Rule - Wisdom Gallery */}
          <Form.Item label={intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}>
            {getFieldDecorator('wisdom_gallery', {initialValue: wisdom_gallery })(
                <Select optionFilterProp="label" mode="multiple" disabled={this.props.generalUser}>
                  {ruleOptions.length===0? null:ruleOptions.filter(item=>{return item.areaId===3}).map(item=>{ return <Option key={item.id} value={item.id} label={item.description}>{item.description}</Option>})}
                </Select>
            )}
          </Form.Item>

          <Divider />

          {/* ------- Notes Account */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.NOTES-ACCOUNT')}>
            <Input value={notesAccount} disabled />
          </Form.Item>

          {/* ------- Substantive Rank */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.SUBSTANTIVE-RANK')}>
            <Input value={substantiveRank} disabled />
          </Form.Item>

          {/* ------- Active Rank */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.ACTIVE-RANK')}>
            <Input value={activeRank} disabled />
          </Form.Item>
          
          <Divider dashed />

          {/* ------- Inst T */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.INST-T')}>
            <Input value={instT} disabled />
          </Form.Item>

          {/* ------- Section T */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.SECTION-T')}>
            <Input value={sectionT} disabled />
          </Form.Item>

          {/* ------- Duties T */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.DUTIES-T')}>
            <Input value={dutiesT} disabled />
          </Form.Item>

          <Divider dashed />

          {/* ------- Inst X */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.INST-X')}>
            <Input value={instX} disabled />
          </Form.Item>

          {/* ------- Section X */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.SECTION-X')}>
            <Input value={sectionX} disabled />
          </Form.Item>

          {/* ------- Duties X */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.DUTIES-X')}>
            <Input value={dutiesX} disabled />
          </Form.Item>

          <Divider dashed />

          {/* ------- Institution ID */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.INST-ID')}>
            <Input value={institution} disabled />
          </Form.Item>
          {/* ------- Section ID */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.SECTION-ID')}>
              <Input value={section} disabled />
          </Form.Item>
          {/* ------- Rank ID */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.RANK-ID')}>
             <Input value={rank} disabled />
          </Form.Item>

          <Divider />

          {/* ------- Alias Photo */}
          <div className="user-photo" style={{ marginBottom: '12px' }}>
            <Upload
            disabled={this.props.generalUser}
            name="file"
            accept="image/jpeg"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action={`${sessionStorage.getItem('serverPort')}user/upload/${this.props.selUserId}?type=alias`}
            headers={{'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,}}
            beforeUpload={this.beforeUpload}
            onChange={this.handleAliasUploadChange}
            >
              {imageUrl_alias ? <img src={imageUrl_alias} className="user-photo-uploaded" alt="alias" /> : uploadAliasButton}
              {/* {imageUrl_alias ? <img is="auth-img" authSrc={imageUrl_alias} className="user-photo-uploaded" alt="alias" /> : uploadButton(loading_alias)} */}
            </Upload>
            {approveCustomAvatar(2, loading_alias)}
          </div>


          {/* ------- Alias Photo */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.ALIAS-PHOTO')}>
            {getFieldDecorator('aliasPhoto', {initialValue: this.state.imagePath_alias })(
                <Input disabled />
            )}
          </Form.Item>

          {/* ------- Alias */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.ALIAS')}>
            {getFieldDecorator('alias', {initialValue: alias })(
                <Input disabled={this.props.generalUser} />
            )}
          </Form.Item>

          {/* ------- is Blogger */}
          <Form.Item label={intl.get('@USER_DRAWER_INFO.IS-BLOGGER')} style={{ marginBottom: '50px' }}>
            {getFieldDecorator('isBlogger', {initialValue: isBlogger, })(
                <Select disabled={this.props.generalUser}>
                  <Option key={1} value={1}>{intl.get('@GENERAL.YES')}</Option>
                  <Option key={0} value={0}>{intl.get('@GENERAL.NO')}</Option>
                </Select>
            )}
          </Form.Item>
        </Form>

        <div className="user-edit-save" hidden={this.props.generalUser}>
          <Button style={{ marginRight: '8px' }} disabled={this.props.generalUser} type="primary" onClick={ this.handleSubmit }>{intl.get('@GENERAL.SAVE')}</Button>
        </div>
      </div>
      </Spin>
    )
  }
}

const WrappedUserMntForm = Form.create({ name: 'user_mnt_form' })(userMntForm);

export default WrappedUserMntForm;