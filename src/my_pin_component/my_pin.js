import React from 'react';
import { message} from 'antd';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

export default class MyPin extends React.Component{
  state = {
    loading: true,
    data: [],
  };

  componentDidMount=()=>{
    this.getPinList();
  } 

  getPinList=()=>{
    this.setState({ loading: true })
    let getPinList_url = sessionStorage.getItem('serverPort')+'pin/check/'+sessionStorage.getItem('@userInfo.id');
  
    fetchData(getPinList_url, 'get', null, response=>{
      let data = [];
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200 && Array.isArray(res.data)){
          data = res.data;
        }else{
          message.error(res.status);
        }
      }else{
        message.error(response.result.status);
      }
      this.setState({ loading: false, data }, () => authImgByName2('PINS'));
    })
  }

  handlePinAlt=(pin)=>{
    let pinNameEn = pin.name||"my pin";
    if(!pin.nameTc){
      return pinNameEn;
    }

    return sessionStorage.getItem('lang')==="zh_TW"? pin.nameTc:pinNameEn;
  }

  renderPinList=(pinData)=>{

    return pinData
            .filter(item => !!item)
            .map(iPin => (
            
              <img style={{ maxWidth: '60px', height: '60px',  marginRight: '2px',display: 'inline-block' }}  name="PINS" data={iPin.imageUrl} alt={this.handlePinAlt(iPin)} />
              
              // <div style={{ width: '68px'}}>
              // <div style={{ margin: 'auto'}}>
              // {/* <div style={{ width: '30px', height: '30px', marginBottom: '0.5em', display: 'block' }} >*/}
              //  <div style={{ width: '50px', height: '30px', marginBottom: '0.5em'}} > 
              //   <div style={{ position:'relative', right: '50%', textAlign: 'center'}}>
              //     <img style={{ maxWidth: '30px', height: '30px', marginRight: '-100%', display: 'inline-block' }}  name="PINS" data={iPin.imageUrl} alt={this.handlePinAlt(iPin)} />
              //   </div>
              // </div>
              // </div>
              // </div>
            ))
  }

  render(){
    const { loading, data } = this.state;

    return(
      // <div className="pin-container">
      <div style={{ position: 'absolute', top: '15px'}}>
      { loading? null: this.renderPinList(data) }
      </div>
    )
  }
}


