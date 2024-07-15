//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190809 */
//Comments //***s=]*** 



import React from 'react';
import { Form, Input, Button, message, Upload, Icon, Divider, Select } from 'antd';
// import ImgCrop from 'antd-img-crop';
import intl from 'react-intl-universal';
import { fetchData } from '../service/HelperService';

import './user_profile.css';
import { userLevelIcons, getCurrentIconName } from '../service/common';

const petsOption = [ "A", "B", "C", "D" ];
const promptTextOptions = [
  {type:"A", nameEn:"German Shepherd Dog", nameTc:"德國牧羊犬", en:["Guard", "Patrol", "Tracking", "Crowd Control"], en1:["Well-muscled", 'Devotion', 'Strong obedient', "Intelligent"], tc:["警衛", "保安巡邏", "追蹤", "人群控制"], tc1:["體格健壯", "性格忠誠", "服從性高", "天資聰明"] },
  {type:"B", nameEn:"Kunming Dog", nameTc:"昆明犬", en:["Guard", "Patrol", "Tracking", "Crowd Control"], en1:["Highly flexibility", 'With keen nose', "Strong obedient", "Agile"], tc:["警衛", "保安巡邏", "追蹤", "人群控制"], tc1:["適應力強", "嗅覺靈敏", "性格忠誠", "機警靈活"] },
  {type:"C", nameEn:"Springer Spaniel", nameTc:"史賓格犬", en:["Detecting Dangerous Drugs, Hand-made alcoholic substances, Cigarette, Cell phone, Explosives"], en1:["Energetic", "Tough", "With keen sense of smell", "Initiative"], tc:["嗅查危險藥物、私釀橙酒、香煙、手提電話、爆炸物品"], tc1:["精力充沛", "聰明勇敢", "嗅覺靈敏", "主動性強"] },
  {type:"D", nameEn:"Labrador Retriever", nameTc:"拉布拉多尋回犬", en:["Detecting Dangerous Drugs (Screening Person)"], en1:["Even-tempered", "Tenacious", "With keen sense of smell", "active"], tc:["嗅查危險藥物、人物"], tc1:["個性溫馴", "堅毅不屈", "嗅覺靈敏", "活潑好動"] },
]

class userProfileForm extends React.Component{
  constructor(props){
    super(props);
    this.state={
      selUser: {},
      profilePhoto: null,
      aliasPhoto: null,
      loading_profile: false,
      loading_alias: false,
      iconOptions: [],
      allowUpload: false,
      profilePhotoIsPending: true,
      aliasPhotoIsPending: true,
      myPet: 'A',
      dogOptions: ['A']
    };
  }

  componentDidMount(){
    let getDetails_url = sessionStorage.getItem('serverPort')+'user/getDetails?userId='+sessionStorage.getItem('@userInfo.id');
    fetchData(getDetails_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&!!res.data){
          this.setState({ 
            selUser: res.data,
            profilePhoto: this.extractFilename(res.data.profilePhoto),
            aliasPhoto: this.extractFilename(res.data.aliasPhoto),
            allowUpload: this.handleStrInt(res.data.allowUpload),    // 0 => yes, 1 => no
            profilePhotoIsPending: this.handleStrInt(res.data.profilePhotoIsPending),
            aliasPhotoIsPending: this.handleStrInt(res.data.aliasPhotoIsPending),
            iconOptions: this.prepareIconOptions(res.data.profilePhoto, res.data.aliasPhoto)
          }, this.handleRemoteImg);

          this.getDogOptions();
        }
      }
    })
  }

  handleStrInt = (value) => {
    if(typeof value === 'number'){
      return !!value;
    }

    if(typeof value !== 'string'){
      return false;
    }

    return !isNaN(value) && !isNaN(parseInt(value)) && !!parseInt(value);
  }

  getDogOptions = () => {
    let getDogOptions_url = sessionStorage.getItem('serverPort')+'user/dogs/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getDogOptions_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({
            myPet: res.data&&res.data.dog? res.data.dog:'A',
            dogOptions: res.data2&&res.data2.abledog? petsOption.filter(value => res.data2.abledog.includes(value)):['A']
          })
        }
      }
    })
  }

  prepareIconOptions = (profilePhoto, aliasPhoto) => {
    let optionArr = [];
    if(Array.isArray(userLevelIcons)){
      userLevelIcons.forEach(filename => {
        if(filename){
          let optionItem = {
            name: filename,
            url: `images\\profile\\${filename}.png`,
            type: 'default',
            file: null,
          };

           optionArr.push(optionItem);
        }
      })
    };

    if(!!profilePhoto&&profilePhoto!=="null"&&!optionArr.some(o => o.name === this.extractFilename(profilePhoto))){
      let optionItem = {
        name: this.extractFilename(profilePhoto),
        url: profilePhoto,
        type: 'custom',
        file: null,
      }
      optionArr.push(optionItem);
    }

    if(!!aliasPhoto&&aliasPhoto!=="null"&&!optionArr.some(o => o.name === this.extractFilename(aliasPhoto))){
      let optionItem = {
        name: this.extractFilename(aliasPhoto),
        url: aliasPhoto,
        type: 'custom',
        file: null,
      }
      optionArr.push(optionItem);
    }

    return optionArr;
  }

  handleRemoteImg = () => {
    const iconOptions = this.state.iconOptions;
    var remoteCount = iconOptions.filter(item=>item.type==='custom').length;

    iconOptions.forEach((item, index) => {
      if(item.type !== 'custom'){
        return;
      }

      let url = item.url;
      let self = this;

      if(item.url && !item.file){
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }

        request.onreadystatechange = function () {
          if (request.readyState ===4 && request.status === 200) {
            item.url = URL.createObjectURL(request.response);
            remoteCount = remoteCount - 1;
            self.updateIconOptions(remoteCount, iconOptions);

            // img.onload = function () {
            //   URL.revokeObjectURL(img.src);
            // };
          }else if (request.readyState ===4 && request.status !== 200) {
            remoteCount = remoteCount - 1;
            self.updateIconOptions(remoteCount, iconOptions);
          }
        };

        request.send(null);
      }else{
        remoteCount = remoteCount - 1;
        self.updateIconOptions(remoteCount, iconOptions);
      }
    })
  }

  updateIconOptions = (count, iconOptions) => {
    if(count === 0){
      this.setState({ iconOptions });
    }
  }

  onPhotoChange=(value, type)=>{
    this.setState({ [type]: value||null })
  }

  extractFilename = filepath => {
    // let filename = (typeof filepath !== "string")? null:filepath.replace(/^.*\/|\.[^.]*$/g, '')
    let filename = (filepath === "null" || typeof filepath !== "string")? "default":filepath.replace(/^.*\/|\.[^.]*$/g, '')
    return filename;
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err,fieldsValues)=>{
      if(!err){
        const values = {
          'id': sessionStorage.getItem('@userInfo.id'),
          'is_profilo': 1,
          ...fieldsValues,
        };

        this.handlePet({userdog: values.myPet});
        this.handleForm(values);
      }
    });
  };

  handleForm=(updates)=>{
    let updateUser_url = sessionStorage.getItem('serverPort')+'user/update';
    fetchData(updateUser_url, 'post', updates, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success("Update successfully.")
        } else {
          message.warning("Your request was denied by server.");
        };
      }
    })
  }

  handlePet=(updates)=>{
    let updateDog_url = sessionStorage.getItem('serverPort')+'user/dogs/update/'+sessionStorage.getItem('@userInfo.id');
    fetchData(updateDog_url, 'post', updates, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success("New pet is ready for you.")
        } else {
          message.warning("Your request was denied by server.");
        };
      }
    })
  }

  handleUploadChange = (info, type) => {
    let loadingType = (type === "profilePhoto"? "loading_profile":"loading_alias");
    let res = info.file.response;

    if (info.file.status === 'uploading') {
      this.setState({ [loadingType]: true });
      return;
    }

    if (info.file.status === 'error') {
      this.setState({ [loadingType]: false });
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
        let reader = new FileReader();
        reader.readAsDataURL(info.file.originFileObj);

        reader.onloadend = function () {
          let custom = {
            name: info.file.response.data,
            url: reader.result,
            type: 'upload',
            file: info.file.originFileObj
          }
          this.setState(state => ({ 
            [type]: custom.name,
            iconOptions: [...state.iconOptions, custom],
            [loadingType]: false,
          }))

          this.props.form.setFieldsValue( { [type]: custom.name} );
        }.bind(this);

      } else {
        message.error('Upload was reject by server: '+ info.file.response.msg )
        this.setState({
          [loadingType]: false,
        });
      }

    }
  };

  getPetName=(type)=>{
    let match = promptTextOptions.find(x=>x.type===type);
    if(!match||match.length<1){
      return type||"-";
    }

    return sessionStorage.getItem('lang')==='zh_TW'? match.nameTc:match.nameEn;
  }

  handlePetSelector = () =>{
    // console.log('--load guard');
    let score = parseInt(sessionStorage.getItem('@userInfo.score'),10);

    if(score<500){
      // console.log('--basic Y')
      return true;
    }

    // console.log('-- >basic N')

    return false;
  }
  

  render(){
    const { getFieldDecorator } = this.props.form;
    // const { iconOptions, profilePhoto, aliasPhoto, loading_profile, loading_alias, myPet, dogOptions } =this.state;
    const { iconOptions, profilePhoto, aliasPhoto, loading_profile, loading_alias, myPet, dogOptions, allowUpload, profilePhotoIsPending, aliasPhotoIsPending } =this.state;
    const { staffNo, fullname, chineseName, alias } = this.state.selUser;

    const { Option } = Select;

    const optionImgStyle = { marginTop: '-5px', height: '20px', width: 'auto' };

    const uploadButton = loading => (
      <div>
        <Icon type={loading? 'loading' : 'plus'} />
        <div className="ant-upload-text">{intl.get('@GENERAL.UPLOAD')}</div>
      </div>
    );

    const avatarOptions = iconOptions.map(item => {
      return (
        <Option key={item.name} value={item.name}><span><img style={optionImgStyle} src={item.url} alt={item.name} /></span> {getCurrentIconName(item.name)}</Option>
      )
    })

    const myPetOptions = dogOptions.map(item => {
      return (
        <Option key={item} value={item}><span><img style={optionImgStyle} src={`images/profile/pets/${item}.png`} alt={item} /></span> {this.getPetName(item)}</Option>
      )
    })

    const imgCropProps = {
      grid: true
    }
    console.log('Allow upload  = ', allowUpload);

    return(
      <div>
        <Form layout="vertical" labelCol={{ xs:{span:64}, sm:{span:6} }} wrapperCol={{ xs:{span:24}, sm:{span:18} }} labelAlign="left" >
          <div className="row">
            <div className="col-md-5">
              <div className="user-photo" style={{ marginBottom: '12px' }}>
              {/* <ImgCrop {...imgCropProps}>
                <Upload
                
                disabled={allowUpload}
                // disabled={true}
                name="file"
                accept="image/*"
                listType="picture-card"
                className="profile-avatar-uploader"
                showUploadList={false}
                action={`${sessionStorage.getItem('serverPort')}user/upload/${sessionStorage.getItem('@userInfo.id')}?type=profile`}
                headers={{'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,}}
                onChange={(info)=>this.handleUploadChange(info, "profilePhoto")}
                // beforeUpload={(file) => this.beforeUpload(file, "profilePhoto")}
                >
                  {profilePhoto&&profilePhoto!=="null"? <img src={iconOptions.find(p => p.name === profilePhoto).url} className="user-photo-uploaded" alt="profile" /> : uploadButton(loading_profile)}
                </Upload>
              </ImgCrop> */}
            </div>
              <p>{allowUpload? intl.get('@USER_PROFILE.UPLOAD-REMARKS') : null}</p>
              <p>{profilePhotoIsPending? intl.get('@USER_PROFILE.PHOTO-PENDING-FOR-APPROVAL') : null}</p>

              {/* ------- Profile Photo */}
              <Form.Item label={intl.get('@USER_DRAWER_INFO.PROFILE-PHOTO')}>
                {getFieldDecorator('profilePhoto', {initialValue: profilePhoto })(
                  <Select allowClear mode="single" style={{ width: '100%' }} onChange={(value)=>this.onPhotoChange(value, 'profilePhoto')}>
                    {avatarOptions}
                  </Select>
                )}
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
            </div>
            <div class="col-md-1">
              <Divider type="vertical" style={{ height: '100%'}} />
            </div>
            <div className="col-md-5">
              {/* ------- Alias Photo */}
              <div className="user-photo" style={{ marginBottom: '12px' }}>
                {/* <ImgCrop {...imgCropProps}>
                  <Upload
                  disabled = {allowUpload}
                  // disabled={true}
                  name="file"
                  accept="image/*"
                  listType="picture-card"
                  className="profile-avatar-uploader"
                  showUploadList={false}
                  action={`${sessionStorage.getItem('serverPort')}user/upload/${sessionStorage.getItem('@userInfo.id')}?type=alias`}
                  headers={{'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname,}}
                  onChange={(info)=>this.handleUploadChange(info, "aliasPhoto")}
                  // beforeUpload={(file) => this.beforeUpload(file, "aliasPhoto")}
                  >
                    {aliasPhoto&&aliasPhoto!=="null"? <img src={iconOptions.find(p => p.name === aliasPhoto).url} className="user-photo-uploaded" alt="alias" /> : uploadButton(loading_alias)}
                  </Upload>
                </ImgCrop> */}

              </div>
                <p>{allowUpload? intl.get('@USER_PROFILE.UPLOAD-REMARKS') : null}</p>
                <p>{aliasPhotoIsPending? intl.get('@USER_PROFILE.PHOTO-PENDING-FOR-APPROVAL') : null}</p>

              {/* ------- Alias Photo */}
              <Form.Item label={intl.get('@USER_DRAWER_INFO.ALIAS-PHOTO')}>
                {getFieldDecorator('aliasPhoto', {initialValue: aliasPhoto })(
                  <Select allowClear mode="single" style={{ width: '100%' }} onChange={(value)=>this.onPhotoChange(value, 'aliasPhoto')}>
                    {avatarOptions}
                  </Select>
                )}
              </Form.Item>

              {/* ------- Alias */}
              <Form.Item label={intl.get('@USER_DRAWER_INFO.ALIAS')}>
                {getFieldDecorator('alias', {initialValue: alias })(
                  <Input style={{ maxWidth: '400px'}} allowClear />
                )}
              </Form.Item>

              <Divider />

              <Form.Item label={intl.get('@USER_PROFILE.MY-PET')}>
                {getFieldDecorator('myPet', {initialValue: myPet })(
                  <Select mode="single" disabled={this.handlePetSelector()} style={{ width: '100%' }}>
                    {myPetOptions}
                  </Select>
                )}
              </Form.Item>
            </div>
          </div>
        </Form>

        <Divider />

        <Button style={{ float: 'right' }} type="primary" onClick={ this.handleSubmit }>{intl.get('@GENERAL.SAVE')}</Button>

      </div>
    )
  }
}

const WrappedUserProfileForm = Form.create({ name: 'user_profile_form' })(userProfileForm);

export default WrappedUserProfileForm;