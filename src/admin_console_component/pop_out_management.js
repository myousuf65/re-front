
import React from 'react';
import { Layout, Button, Table, Icon,Checkbox ,Popconfirm, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import reqwest from 'reqwest';

import WrappedBannerForm from './pop_out_form';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

export default class PopOutManagement extends React.Component{

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
    this.getPopOutList();
  }

  getPopOutList=()=>{
    this.setState({ loading: true, data: [] })
    let getPinList_url = sessionStorage.getItem('serverPort')+'popout/all/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getPinList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          // let data = res.data.sort((a,b) => (a.orderby > b.orderby) ? 1 : ((b.orderby > a.orderby) ? -1 : 0));
          let data = res.data;
          data.forEach(popOut => {
            if(popOut.accessRule){
                let ruleId_arr = popOut.accessRule.split(",");
                popOut.accessRule = ruleId_arr;
              }
          })
          this.setState({ data })
          authImgByName2('POPOUT')
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

  handleNewPopOut=()=>{
    let popOutData = { 
      id: 'NEW', 
      imageUrl: '', 
      hypryLink: '', 
      name:'',
      name_tc: '',
      accessChannel:'',
      accessRule: [],
         };
    this.setState({ selRecord: popOutData, showInfoForm: true });
  }

  onClickEdit = record =>{
    this.setState({ showInfoForm: true, selRecord: record });
  }

  onDelete=(popOut)=>{
    if(!popOut.id){
      message.warning('This Banner cannot be removed: Pop Out ID is missing...');
    }else{
      this.setState({ loading: true }, ()=>{ this.singleDelete(popOut) } );
    }
  }

  handleUpdate = (popOutValues) => {
    this.setState({ submitting: true });
    const accessRule_arr = popOutValues.accessRule
    if(accessRule_arr&&Array.isArray(accessRule_arr)){
        popOutValues.accessRule = accessRule_arr.toString();
    }else{
        popOutValues.accessRule = "";
    }

    if(popOutValues.id==='NEW'){
        popOutValues.orderby = this.state.data.length + 1;
      this.singleUpload(popOutValues);
    }else{
      if(!popOutValues.file){
        popOutValues.file = null;
      }
      this.singleUpdate(popOutValues);
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

    const relatedPopOut= data[newIndex];
    newData.splice(oldIndex, 1, relatedPopOut);
    newData.splice(newIndex, 1, record);

    if(!orderTouched){
      this.setState({ orderTouched: true });
    }

    this.setState({ data: newData });
  }



  // ---new pop out
  singleUpload = popOut => {
    let popOutCreate_url = sessionStorage.getItem('serverPort')+'popout/create/'+sessionStorage.getItem('@userInfo.id');
    const popOutForm = new FormData();
    popOutForm.append('file', popOut.file);
    popOutForm.append('hypryLink', popOut.hypryLink);
    popOutForm.append('orderBy', popOut.orderby);
    popOutForm.append('accessRule', popOut.accessRule);
    popOutForm.append('accessChannel',popOut.accessChannel);

    this.uploadFile(popOutCreate_url, popOutForm);
  }

  // --- existing popOut
  singleUpdate = popOut => {
    let popOutEdit_url = sessionStorage.getItem('serverPort')+'popout/update/'+sessionStorage.getItem('@userInfo.id');
    const popOutForm = new FormData();
    popOutForm.append('file', popOut.file||null);
    popOutForm.append('id', popOut.id);
    popOutForm.append('hypryLink', popOut.hypryLink);
    popOutForm.append('orderBy', popOut.orderby);
    popOutForm.append('accessRule', popOut.accessRule);
    popOutForm.append('accessChannel', popOut.accessChannel);

    this.uploadFile(popOutEdit_url, popOutForm);
  }

  // --- update popOut image
  uploadFile = (uploadUrl, popOutForm) => {
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
      data: popOutForm,
      success: (res) => {
        if(res.status===200){
          message.success(`Upload ${popOutForm.orderBy} successfully.`)
          this.setState({ submitting: false, showInfoForm: false });
          this.getPopOutList();
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

  // --- delete popOut
  singleDelete = (popOut) => {
    let delBanner_url = sessionStorage.getItem('serverPort')+`popout/delete/${sessionStorage.getItem('@userInfo.id')}/${popOut.id}`;
    fetchData( delBanner_url, 'post', null, response=>{
      if(response.ifSuccess){
        this.setState(state=>{ 
          state.data.splice(state.data.indexOf(popOut),1); 
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



  render(){
    const { Content } = Layout;
    const { data, loading, selRecord, showInfoForm, submitting} = this.state;

    const tblprops = [
      { key: 0, title: intl.get('@POPOUT_MANAGEMENT.ID'), dataIndex: 'id', render: (text)=><div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div> },

      { key: 1, width: '160px', title: intl.get('@BANNERS_MANAGEMENT.IMG'), dataIndex: 'imageUrl', align: 'center', render: (text)=><div style={{ width: '100%', height: 'calc(140px*155/240)', overflow: 'hidden' }}><img style={{ position: 'relative', width: 'auto', maxWidth: '140px', height: 'inherit', }} name="POPOUT" data={text} alt="POPOUT"/></div>},
      { key: 2, title: intl.get('@BANNERS_MANAGEMENT.LINK-TO'), dataIndex: 'hypryLink', render: (text)=><div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{text}</div> },
      { key: 3, title: intl.get('@BANNERS_MANAGEMENT.INTRANET'), dataIndex: 'accessChannel', align: 'center', render: (text)=><Checkbox checked={text==1||text==2? true:false} /> },
      { key: 4, title: intl.get('@BANNERS_MANAGEMENT.INTERNET'), dataIndex: 'accessChannel', align: 'center', render: (text)=><Checkbox checked={text==4||text==2? true:false} /> },
     
      { key: 5, title: intl.get('@GENERAL.EDIT'), dataIndex: 'id', align: 'center', render: (text, record)=>(        
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
              {intl.get('@POPOUT_MANAGEMENT.CORNER-TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div style={{ textAlign: 'right', margin: '16px 0' }} >
            <Button style={{ margin: '16px 0' }} type="primary" disabled={loading} onClick={this.handleNewPopOut}>{intl.get('@POPOUT_MANAGEMENT.NEW-POPOUT')}</Button>
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
