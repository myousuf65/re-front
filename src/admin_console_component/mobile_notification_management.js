
import React from 'react';
import { Layout, Input, Select, Button, message } from 'antd';

import { fetchData } from '../service/HelperService';

export default class MobileNotificationManagement extends React.Component{
  state = { 
    selDevice: "", 
    selTitle: "", 
    submitting: false,
  };

  handleDeviceType=(value)=>{
    this.setState({ selDevice: value || "" });
  }

  handleTitle=(e)=>{
    this.setState({ selTitle: e.target.value || "" });
  }

  saveVersion=()=>{
    const { selDevice, selTitle } = this.state;


    var data = {
      app: selDevice,
      Title: selTitle
    }

    this.setState({ submitting: true });
    let saveVersion_url = sessionStorage.getItem('serverPort')+'mobile/notification/'+sessionStorage.getItem('@userInfo.id');

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
              Mobile Notification Management 
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
              onChange={this.handleTitle}
              placeholder="Input Title"
             />
              <Input 
              style={{ width: '600px' }} 
              disabled={submitting}
              allowClear 
              onChange={this.handleTitle}
              placeholder="message"
              addonAfter={<Button type="primary" loading={submitting} onClick={this.saveVersion}>Save</Button>}
              />



            </InputGroup>
          </div>
        </Content>
      </div>
    )
  }
}
