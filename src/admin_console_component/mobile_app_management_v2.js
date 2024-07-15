//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20201123 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, Select, Button, message, Upload, Icon } from 'antd';

import reqwest from 'reqwest';
import { fetchData } from '../service/HelperService';

export default class MobileAppManagement extends React.Component{
  state = { 
    selDevice: "", 
    selVersionNo: "", 
    apkFile: null, 
    ipaFile: null, 
    plistFile: null, 
    submitting: false,
    fileList: [],
  };

  handleDeviceType=(value)=>{
    this.setState({ selDevice: value || "" });
  }

  handleVersionNo=(e)=>{
    this.setState({ selVersionNo: e.target.value || "" });
  }

  saveVersion=()=>{
    const { selDevice, selVersionNo, apkFile, plistFile, ipaFile } = this.state;

    if(!selDevice || !selVersionNo){
      message.warning("Please provide device type/version number.", 5);
      return;
    }else if(selVersionNo.indexOf(".")>-1){
      message.warning("Incorrect version format: Please replace dot(.) with underscore(_)", 5);
      return;
    }

    const formData = new FormData()
    formData.append('app', selDevice);
    formData.append('version', selVersionNo);

    switch(selDevice){
      case "android":
        if(!apkFile){
          message.warning("Please provide the APK package file", 5);
          return;
        };
        formData.file1 = apkFile;
        formData.append('file1', apkFile);
        break;
      case "ios":
        if(!plistFile||!ipaFile){
          message.warning("Please provide the PLIST and IPA package file", 5);
          return;
        }
        formData.append('file1', plistFile);
        formData.append('file2', ipaFile);
        break;
      default:
        message.warning("Please provide package/device type.", 5);
        return;
    }

    this.setState({ submitting: true });
    let saveVersion_url = sessionStorage.getItem('serverPort')+'mobile/create/'+sessionStorage.getItem('@userInfo.id');

    reqwest({
      url: saveVersion_url,
      method: 'post',
      contentType: "application/json;charset=UTF-8",
      headers: {
        'accessToken': sessionStorage.getItem('accessToken'),
        'accesshost': window.location.hostname,
      },
      processData: false,
      mode: 'cors',
      data: formData,
      timeout: 300000,
      success: (res) => {
        if(res.status===200){
          message.success("Updated successfully!");
        }else{
          message.error(`Failed to save (ERR: ${res.status}).`);
        }
        this.setState({ submitting: false });
      },
      error: (err) => {
        this.setState({ submitting: false });

        if(err.status===401){
          message.error(`Invalid Token ${err.status}`);
          sessionStorage.clear();
          window.location.assign('/');
        }else if(err.status===440){
          message.error(`Session Timeout ${err.status}`);
          let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
          fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
        }else{
          message.error(`Failed to save (ERR: ${err.status})`);
        }
      },
    })

  }

  archiveUploadFile=(file)=>{
    var re = /(?:\.([^.]+))?$/;
    var fileFormat = re.exec(file.name)[1];
    var acceptExt_arr = [ 'apk', 'plist', 'ipa' ]

    if(fileFormat&&acceptExt_arr.includes(fileFormat.toLowerCase())){
      return fileFormat.toLowerCase();
    }else{
      return undefined;
    }
  }

  beforeUpload=(file)=>{
    var type = this.archiveUploadFile(file);
    if(!type){
      file.status = 'error';
      file.response = 'Incorrect File';
      this.setState(state => ({
        fileList: [...state.fileList, file],
      }));
    }else{
      switch(type){
        case 'apk':
          if(this.state.apkFile){
            this.setState(state => {
              const index = state.fileList.indexOf(state.apkFile);
              const newFileList = state.fileList.slice();
              newFileList.splice(index, 1, file);
              return {
                fileList: newFileList,
                apkFile: file
              };
            });
          }else{
            this.setState(state => ({
              fileList: [...state.fileList, file],
              apkFile: file
            }));
          }
          break;
        case 'plist':
          if(this.state.plistFile){
            this.setState(state => {
              const index = state.fileList.indexOf(state.plistFile);
              const newFileList = state.fileList.slice();
              newFileList.splice(index, 1, file);
              return {
                fileList: newFileList,
                plistFile: file
              };
            });
          }else{
            this.setState(state => ({
              fileList: [...state.fileList, file],
              plistFile: file
            }));
          }
          break;
        case 'ipa':
          if(this.state.ipaFile){
            this.setState(state => {
              const index = state.fileList.indexOf(state.ipaFile);
              const newFileList = state.fileList.slice();
              newFileList.splice(index, 1, file);
              return {
                fileList: newFileList,
                ipaFile: file
              };
            });
          }else{
            this.setState(state => ({
              fileList: [...state.fileList, file],
              ipaFile: file
            }));
          }
          break;
        default:
          break;
      }
    }
    return false;
  }

  handleRemove=(file)=>{
    if(file === this.state.apkFile){
      this.setState({ apkFile: null });
    }else if(file === this.state.plistFile){
      this.setState({ plistFile: null });
    }else if(file === this.state.ipaFile){
      this.setState({ ipaFile: null });
    }

    this.setState(state => {
      const index = state.fileList.indexOf(file);
      const newFileList = state.fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList,
      };
    });
  }

  render(){
    const { Content } = Layout;
    const InputGroup = Input.Group;
    const { Option } = Select;
    const { fileList, submitting } = this.state;
    const uploaderProps = {
      accept: ".apk,.plist,.ipa",
      beforeUpload: this.beforeUpload,
      onRemove: this.handleRemove,
      fileList
    }
    
    return (
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              Mobile App Management - Version Info.
            </div>
          </h1>

          <div className="cms-white-box">
            <Upload {...uploaderProps}>
              <Button><Icon type="upload" /> Select Package File</Button>
            </Upload>
            <InputGroup style={{ marginTop: '16px' }} compact>
              <Select style={{ width: '150px' }} defaultValue="" disabled={submitting} onChange={this.handleDeviceType}>
                <Option value="">--Please Select--</Option>
                <Option value="android">Android</Option>
                <Option value="ios">iOS</Option>
              </Select>
              <Input 
              style={{ width: '300px' }} 
              disabled={submitting}
              allowClear 
              onChange={this.handleVersionNo}
              placeholder="version no. format: 1_3_21"
              addonAfter={<Button type="primary" loading={submitting} onClick={this.saveVersion}>Save</Button>}
              />
            </InputGroup>
          </div>
        </Content>
      </div>
    )
  }
}
