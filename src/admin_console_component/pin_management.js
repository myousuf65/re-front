//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200409*/
//Comments //***s=]*** 



import React from 'react';
import { Layout, Button, Table, Icon, Popconfirm, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import reqwest from 'reqwest';

import WrappedPinForm from './pin_form';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

export default class PinManagement extends React.Component{

  state = { 
    fileList: [], 
    uploading: false, 
    uploaded: 0, 
    data: [], 
    loading: true, 
    showInfoForm: false,
    selRecord: null,
    delList: [],
    submitting: false,
    orderTouched: false
  };

  componentDidMount=()=>{
    this.getPinList();
  }

  getPinList=()=>{
    this.setState({ loading: true, data: [] })
    let getPinList_url = sessionStorage.getItem('serverPort')+'pin/all/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getPinList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          // let data = res.data.sort((a,b) => (a.orderby > b.orderby) ? 1 : ((b.orderby > a.orderby) ? -1 : 0));
          let data = res.data;
          data.forEach(pin => {
            if(pin.staffNo){
              let ruleId_arr = pin.staffNo.split(",");
              pin.staffNo = ruleId_arr;
            }
          })
          this.setState({ data })
          authImgByName2('PINS')
        }else{
          message.error(res.status);
        }
      }else{
        message.error(response.result.status);
      }
      this.setState({ loading: false });
    })
  }

  showInfoForm = (record) => {
    this.setState({ showInfoForm: true, selRecord: record });
  };

  onCloseInfoForm = () => {
    this.setState({ showInfoForm: false });
  }

  handleNewPin=()=>{
    let pinData = { 
      id: 'NEW', 
      imgUrl: '', 
      description: '', 
      name:'',
      nameTc: '',
      staffNo: [],
      level: '2',
      accessChannel: '1',
    };
    this.setState({ selRecord: pinData, showInfoForm: true });
  }

  onClickEdit = record =>{
    this.setState({ showInfoForm: true, selRecord: record });
  }

  onDelete=(pin)=>{
    if(!pin.id){
      message.warning('This Pin cannot be removed: Pin ID is missing...');
    }else{
      this.setState({ loading: true }, ()=>{ this.singleDelete(pin) } );
    }
  }

  handleUpdate = (pinValues) => {
    this.setState({ submitting: true });
    const staffNo_arr = pinValues.staffNo;
    if(staffNo_arr&&Array.isArray(staffNo_arr)){
      pinValues.staffNo = staffNo_arr.toString();
    }else{
      pinValues.staffNo = "";
    }

    if(pinValues.id==='NEW'){
      pinValues.orderby = this.state.data.length + 1;
      this.singleUpload(pinValues);
    }else{
      if(!pinValues.file){
        pinValues.file = null;
      }
      this.singleUpdate(pinValues);
    }
  }

  movePin = (action, index, record) => {

    const { data, orderTouched } = this.state;
    const newData = [...this.state.data];
    const oldIndex = index;
    var newIndex = -1;
    
    if(action==='prev'&&oldIndex>0){
      newIndex = index-1;
    }else if(action==='next'&&oldIndex<data.length-1){
      newIndex = index+1;
    }

    if(newIndex === -1){ return }

    const relatedPin = data[newIndex];
    newData.splice(oldIndex, 1, relatedPin);
    newData.splice(newIndex, 1, record);

    if(!orderTouched){
      this.setState({ orderTouched: true });
    }

    this.setState({ data: newData });
  }

  onSaveOrder = () => {
    const { data } = this.state;
    var newOrder_arr = data.map((pin, index)=>({ id: pin.id, orderBy: index+1 }))

    this.setState({ orderTouched: false, loading: true }, ()=> this.updateOrderBy(newOrder_arr) );
  }

  // ---new pin
  singleUpload = pin => {
    let pinCreate_url = sessionStorage.getItem('serverPort')+'pin/create/'+sessionStorage.getItem('@userInfo.id');
    const pinForm = new FormData();
    pinForm.append('file', pin.file);
    pinForm.append('description', pin.description);
    pinForm.append('orderBy', pin.orderby);
    pinForm.append('staffNo', pin.staffNo);
    pinForm.append('name', pin.name);
    pinForm.append('nameTc', pin.nameTc);
    pinForm.append('accessChannel', pin.accessChannel);
    pinForm.append('level', '2');

    this.uploadFile(pinCreate_url, pinForm);
  }

  // --- existing pin
  singleUpdate = pin => {
    let pinEdit_url = sessionStorage.getItem('serverPort')+'pin/update/'+sessionStorage.getItem('@userInfo.id');
    const pinForm = new FormData();
    pinForm.append('file', pin.file||null);
    pinForm.append('description', pin.description);
    pinForm.append('orderBy', pin.orderby);
    pinForm.append('staffNo', pin.staffNo);
    pinForm.append('name', pin.name);
    pinForm.append('nameTc', pin.nameTc);
    pinForm.append('accessChannel', pin.accessChannel);
    pinForm.append('level', '2');
    pinForm.append('id', pin.id);
    this.uploadFile(pinEdit_url, pinForm);
  }

  // --- update pin image
  uploadFile = (uploadUrl, pinForm) => {
    reqwest({
      url: uploadUrl,
      method: 'post',
      contentType: "application/json;charset=UTF-8",
      headers: {
        'accessToken': sessionStorage.getItem('accessToken'),
        'accesshost': window.location.hostname,
      },
      processData: false,
      mode: 'cors',
      data: pinForm,
      success: (res) => {
        if(res.status===200){
          message.success(`Upload ${pinForm.orderBy} successfully.`)
          this.setState({ submitting: false, showInfoForm: false });
          this.getPinList();
        }else{          
          message.error(`Got ${res.status} from Server`);
          this.setState({ submitting: false });
        }
      },
      error: (err) => {
        this.setState({ submitting: false });

        if(err.status===401){
          message.error(`Invalid Token ${err.status}`);
        }else if(err.status===440){
          message.error(`Session Timeout ${err.status}`);
        }else{
          message.error(`Got ${err.status} from Server`);
        }
      },
    })
  }

  // --- delete pin
  singleDelete = (pin) => {
    let delPin_url = sessionStorage.getItem('serverPort')+`pin/delete/${sessionStorage.getItem('@userInfo.id')}/${pin.id}`;
    fetchData( delPin_url, 'post', null, response=>{
      if(response.ifSuccess){
        this.setState(state=>{ 
          state.data.splice(state.data.indexOf(pin),1); 
          return { data: state.data };
        });
        message.success('Delete Successfully!');
        this.setState({ loading: false });
      }else{
        message.error(`Got ${response.result.status} from Server`);
        this.setState({ loading: false });
      }
    })
  }

  // --- update orderby
  // updateOrderBy = (newOrder_arr) => {
  //   let updateOrder_url = sessionStorage.getItem('serverPort')+`banner/orderupdate/${sessionStorage.getItem('@userInfo.id')}`;
  //   let newOrder = { order: newOrder_arr }
  //   fetchData(updateOrder_url, 'post', newOrder, response=>{
  //     if(!response.ifSuccess){
  //       message.error(`Got ${response.result.status} from Server`);
  //     };

  //     this.getPinList();
  //   })
  // }

  render(){
    const { Content } = Layout;
    const { data, loading, selRecord, showInfoForm, submitting, orderTouched } = this.state;

    const tblprops = [
      { key: 0, title: intl.get('@PIN_MANAGEMENT.NAME'), dataIndex: 'name', render: (text)=><div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div> },
      { key: 1, width: '160px', title: intl.get('@PIN_MANAGEMENT.ICON'), dataIndex: 'imageUrl', align: 'center', render: (text)=><div style={{ width: '100%', height: 'calc(140px*155/240)', overflow: 'hidden' }}><img style={{ position: 'relative', width: 'auto', maxWidth: '140px', height: 'inherit', }} name="PINS" data={text} alt="pin"/></div>},
      { key: 2, title: intl.get('@PIN_MANAGEMENT.DESCRIPTION'), dataIndex: 'description', render: (text)=><div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div> },
    //   { key: 5, title: intl.get('@BANNERS_MANAGEMENT.ORDER'), dataIndex: 'orderby',align: 'center', render: (text, record, index)=>(
    //     <span> 
    //       <div hidden={index===0}>
    //         <Icon type="caret-up" onClick={()=>this.moveBanner('prev', index, record)} />
    //       </div>
    //       <div hidden={index===data.length-1}>
    //         <Icon type="caret-down" onClick={()=>this.moveBanner('next', index, record)} /> 
    //       </div>
    //     </span>)
    //   },
      { key: 5, title: intl.get('@GENERAL.EDIT'), dataIndex: 'id', align: 'center', render: (text, record)=>(        
        <span>
          <div>
            <Button className="cate-admin-btn" type="primary" onClick={()=>this.onClickEdit(record)}>
              <Icon type="form" />
            </Button>
          </div>
          <div>
            <Popconfirm
            title={intl.get('@PIN_MANAGEMENT.DEL-REMARKS')}
            placement="right"
            okText={intl.get('@GENERAL.CANCEL')}
            onConfirm={()=>message.info('Cancelled!')} 
            cancelText={intl.get('@GENERAL.YES')}
            onCancel={()=>this.onDelete(record)}
            >
              <Button className="cate-admin-btn" type="danger" >
                <Icon type="delete" />
              </Button>
            </Popconfirm>
          </div>
        </span>)
      }
    ]

    return (
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@PIN_MANAGEMENT.TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div style={{ textAlign: 'right', margin: '16px 0' }} >
              {/* <Button className="res_btn" shape="round" type="primary" disabled={loading||!orderTouched} onClick={()=>this.onSaveOrder()} >{intl.get('@BANNERS_MANAGEMENT.SAVE-ORDERS')}</Button> */}
            </div>

            <Table 
              style={{ paddingTop: '16px' }}
              loading={ loading }
              rowKey={record=>record.id}
              bordered
              pagination={false}
              columns={tblprops}
              dataSource={data}
            />

            <Button style={{ margin: '16px 0' }} type="primary" disabled={loading} onClick={this.handleNewPin}>{intl.get('@PIN_MANAGEMENT.NEW-ICON')}</Button>

            <Modal
            title={intl.get('@GENERAL.EDIT')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='500px'
            visible={showInfoForm}
            footer={null}
            onCancel={e=>this.setState({ showInfoForm: false })}
            >
              <WrappedPinForm
              handleUpdate={this.handleUpdate} 
              selRecord={selRecord} 
              submitting={submitting}
              />
            </Modal>

          </div>
        </Content>
      </div>
    )
  }

}
