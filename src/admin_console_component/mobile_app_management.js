//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20201123 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, Select, Button, message } from 'antd';

import { fetchData } from '../service/HelperService';

export default class MobileAppManagement extends React.Component{
  state = { 
    selDevice: "", 
    selVersionNo: "", 
    submitting: false,
  };

  handleDeviceType=(value)=>{
    this.setState({ selDevice: value || "" });
  }

  handleVersionNo=(e)=>{
    this.setState({ selVersionNo: e.target.value || "" });
  }

  saveVersion=()=>{
    const { selDevice, selVersionNo } = this.state;

    if(!selDevice || !selVersionNo){
      message.warning("Please provide device type/version number.", 5);
      return;
    }else if(selVersionNo.indexOf(".")>-1){
      message.warning("Incorrect version format: Please replace dot(.) with underscore(_)", 5);
      return;
    }

    var data = {
      app: selDevice,
      version: selVersionNo
    }

    this.setState({ submitting: true });
    let saveVersion_url = sessionStorage.getItem('serverPort')+'mobile/create/'+sessionStorage.getItem('@userInfo.id');

    fetchData(saveVersion_url, 'post', data, response=>{
      let res = response.result;

      if(response.ifSuccess&&res.status===200){
        message.success("Updated successfully!");
      }else{
        message.error(`Failed to save (ERR: ${res.status})`);
      }

      this.setState({ submitting: false });

    })
  }

  render(){
    const { Content } = Layout;
    const InputGroup = Input.Group;
    const { Option } = Select;
    const { submitting } = this.state;
    
    return (
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              Mobile App Management - Version Info.
            </div>
          </h1>

          <div className="cms-white-box">
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
