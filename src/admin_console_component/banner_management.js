
import React from 'react';
import { Layout, Button, Table, Icon, Popconfirm, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import reqwest from 'reqwest';

import WrappedBannerForm from './banner_form';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

export default class BannerManagement extends React.Component{

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
    this.getBannerList();
  }

  getBannerList=()=>{
    this.setState({ loading: true, data: [] })
    let getBannerList_url = sessionStorage.getItem('serverPort')+'banner/all/'+sessionStorage.getItem('@userInfo.id')+'/2';
    fetchData(getBannerList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          let data = res.data.sort((a,b) => (a.orderby > b.orderby) ? 1 : ((b.orderby > a.orderby) ? -1 : 0));
          data.forEach(banner => {
            if(banner.accessRuleId){
              let ruleId_arr = banner.accessRuleId.split(",");
              banner.accessRuleId = ruleId_arr;
            }
          })
          this.setState({ data })
          authImgByName2('BANNERS')
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

  handleNewBanner=()=>{
    let bannerData = { 
      id: 'NEW', 
      imgUrl: '', 
      linkTo: '', 
      name:'',
      name_tc: '',
      accessRuleId: [],
      level: '2',
      accessChannel: '1',
    };
    this.setState({ selRecord: bannerData, showInfoForm: true });
  }

  onClickEdit = record =>{
    this.setState({ showInfoForm: true, selRecord: record });
  }

  onDelete=(banner)=>{
    if(!banner.id){
      message.warning('This Banner cannot be removed: Banner ID is missing...');
    }else{
      this.setState({ loading: true }, ()=>{ this.singleDelete(banner) } );
    }
  }

  handleUpdate = (bannerValues) => {
    this.setState({ submitting: true });
    const accessRule_arr = bannerValues.accessRuleId
    if(accessRule_arr&&Array.isArray(accessRule_arr)){
      bannerValues.accessRuleId = accessRule_arr.toString();
    }else{
      bannerValues.accessRuleId = "";
    }

    if(bannerValues.id==='NEW'){
      bannerValues.orderby = this.state.data.length + 1;
      this.singleUpload(bannerValues);
    }else{
      if(!bannerValues.file){
        bannerValues.file = null;
      }
      this.singleUpdate(bannerValues);
    }
  }

  moveBanner = (action, index, record) => {

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

    const relatedBanner = data[newIndex];
    newData.splice(oldIndex, 1, relatedBanner);
    newData.splice(newIndex, 1, record);

    if(!orderTouched){
      this.setState({ orderTouched: true });
    }

    this.setState({ data: newData });
  }

  onSaveOrder = () => {
    const { data } = this.state;
    var newOrder_arr = data.map((banner, index)=>({ id: banner.id, orderBy: index+1 }))

    this.setState({ orderTouched: false, loading: true }, ()=> this.updateOrderBy(newOrder_arr) );
  }

  // ---new banner
  singleUpload = banner => {
    let bannerCreate_url = sessionStorage.getItem('serverPort')+'banner/create/'+sessionStorage.getItem('@userInfo.id');
    const bannerForm = new FormData();
    bannerForm.append('file', banner.file);
    bannerForm.append('categoryId', banner.linkTo);
    bannerForm.append('orderBy', banner.orderby);
    bannerForm.append('accessRule', banner.accessRuleId);
    bannerForm.append('name', banner.name);
    bannerForm.append('nameTc', banner.name_tc);
    bannerForm.append('accessChannel', banner.accessChannel);
    bannerForm.append('level', '2');

    this.uploadFile(bannerCreate_url, bannerForm);
  }

  // --- existing banner
  singleUpdate = banner => {
    let bannerEdit_url = sessionStorage.getItem('serverPort')+'banner/update/'+sessionStorage.getItem('@userInfo.id');
    const bannerForm = new FormData();
    bannerForm.append('file', banner.file||null);
    bannerForm.append('id', banner.id);
    bannerForm.append('categoryId', banner.linkTo);
    bannerForm.append('orderBy', banner.orderby);
    bannerForm.append('accessRule', banner.accessRuleId);
    bannerForm.append('name', banner.name);
    bannerForm.append('nameTc', banner.name_tc);
    bannerForm.append('accessChannel', banner.accessChannel);
    bannerForm.append('level', '2');

    this.uploadFile(bannerEdit_url, bannerForm);
  }

  // --- update banner image
  uploadFile = (uploadUrl, bannerForm) => {
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
      data: bannerForm,
      success: (res) => {
        if(res.status===200){
          message.success(`Upload ${bannerForm.orderBy} successfully.`)
          this.setState({ submitting: false, showInfoForm: false });
          this.getBannerList();
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

  // --- delete banner
  singleDelete = (banner) => {
    let delBanner_url = sessionStorage.getItem('serverPort')+`banner/delete/${sessionStorage.getItem('@userInfo.id')}/${banner.id}`;
    fetchData( delBanner_url, 'post', null, response=>{
      if(response.ifSuccess){
        this.setState(state=>{ 
          state.data.splice(state.data.indexOf(banner),1); 
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
  updateOrderBy = (newOrder_arr) => {
    let updateOrder_url = sessionStorage.getItem('serverPort')+`banner/orderupdate/${sessionStorage.getItem('@userInfo.id')}`;
    let newOrder = { order: newOrder_arr }
    fetchData(updateOrder_url, 'post', newOrder, response=>{
      if(!response.ifSuccess){
        message.error(`Got ${response.result.status} from Server`);
      };

      this.getBannerList();
    })
  }

  render(){
    const { Content } = Layout;
    const { data, loading, selRecord, showInfoForm, submitting, orderTouched } = this.state;

    const tblprops = [
      { key: 0, title: intl.get('@BANNERS_MANAGEMENT.INDEX'), render: (text, record, index)=>index+1},
      { key: 1, width: '160px', title: intl.get('@BANNERS_MANAGEMENT.IMG'), dataIndex: 'imgUrl', align: 'center', render: (text)=><div style={{ width: '100%', height: 'calc(140px*155/240)', overflow: 'hidden' }}><img style={{ position: 'relative', width: 'auto', maxWidth: '140px', height: 'inherit', }} name="BANNERS" data={text} alt="banner"/></div>},
      { key: 2, title: intl.get('@BANNERS_MANAGEMENT.LINK-TO'), dataIndex: 'linkTo', render: (text)=><div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div> },
      { key: 5, title: intl.get('@BANNERS_MANAGEMENT.ORDER'), dataIndex: 'orderby',align: 'center', render: (text, record, index)=>(
        <span> 
          <div hidden={index===0}>
            <Icon type="caret-up" onClick={()=>this.moveBanner('prev', index, record)} />
          </div>
          <div hidden={index===data.length-1}>
            <Icon type="caret-down" onClick={()=>this.moveBanner('next', index, record)} /> 
          </div>
        </span>)
      },
      { key: 6, title: intl.get('@GENERAL.EDIT'), dataIndex: 'id', align: 'center', render: (text, record)=>(        
        <span>
          <div>
            <Button className="cate-admin-btn" type="primary" onClick={()=>this.onClickEdit(record)}>
              <Icon type="form" />
            </Button>
          </div>
          <div>
            <Popconfirm
            title={intl.get('@BANNERS_MANAGEMENT.DEL-REMARKS')}
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
              {intl.get('@BANNERS_MANAGEMENT.CORNER-TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div style={{ textAlign: 'right', margin: '16px 0' }} >
              <Button className="res_btn" shape="round" type="primary" disabled={loading||!orderTouched} onClick={()=>this.onSaveOrder()} >{intl.get('@BANNERS_MANAGEMENT.SAVE-ORDERS')}</Button>
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

            <Button style={{ margin: '16px 0' }} type="primary" disabled={loading} onClick={this.handleNewBanner}>{intl.get('@BANNERS_MANAGEMENT.NEW-BANNERS')}</Button>

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
              <WrappedBannerForm
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
