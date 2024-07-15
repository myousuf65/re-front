//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200705 */
//Comments //***s=]*** 



import React from 'react';
import { Button, Input, Table, Icon, Tooltip, message } from 'antd';
import intl from 'react-intl-universal';

import { fetchData, getAccessMode } from '../service/HelperService';

import "./resources_share.css";

const adminAccount = [{
  id: 0,
  fullname: 'KMS Admin',
  institution: 'STI',
  section: '',
  rank: '',
}];

export default class ResourceShare extends React.Component{

  state = { 
    loading: false,
    searchResults: [],
    totalResults: 0,
    userList: [],
    currentPage: 1, 
    inputName: "",
    searchName: "",
  };

  // ----Search Area----

  onSearch=(value)=>{
    let upperValue = value.toUpperCase();
    if(upperValue.includes('KMS')||(upperValue.includes('ADMIN'))){
      this.setState({ searchResults: adminAccount, totalResults: 1, currentPage: 1 });
      return;
    }

    this.setState({ searchName: value }, ()=>this.getUserList(1));
  }

  getUserList=(currentPage)=>{
    const { searchName} =this.state;
    if( !searchName ){ this.setState({ searchResults: [], totalResults: 0, currentPage: 0 }); return };

    this.setState({ loading: true, currentPage });

    let getUsers_url = sessionStorage.getItem('serverPort')+'user/searchByName/'+sessionStorage.getItem('@userInfo.id')+'/?page='+currentPage+'&fullname=' + searchName;
    fetchData(getUsers_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data){
          this.setState({ searchResults: res.data, totalResults: res.total, loading: false });
        }else{
          this.setState({ searchResults: [], totalResults: 0, loading: false });
        }
      }else{
        this.setState({ loading: false });
      }
    });
  }

  onClickRecord=(record)=>{
    if(!this.state.loading){
      let userList = this.state.userList;
      let index = userList.indexOf(record);
      if(index===-1){
        userList.push(record);
      }else{
        userList.splice(index, 1);
      }
      this.setState({ userList });
    }
  }

  handleSharing=(ifAccess, record)=>{
    // --- 20200705 v1 hard code ifAccess=1 as version 1
    // --- considering timecost on access rule checking
    let shareIcon = {};
    if(ifAccess>0){
      let userList = this.state.userList;
      let index = userList.indexOf(record);

      if(index===-1){
        shareIcon = {
          screenTip: "Add to Share List",
          iconType: <Icon type="plus-circle" theme="twoTone" twoToneColor="#52c41a" onClick={()=>this.onClickRecord(record)} />
        }
      }else{
        shareIcon = {
          screenTip: "Remove from Share List",
          iconType: <Icon type="minus-circle" theme="twoTone" twoToneColor="#eb2f96" onClick={()=>this.onClickRecord(record)} />
        }
      }

    }else{
      shareIcon = {
        screenTip: "Resource is NOT available to this user.",
        iconType: <Icon type="eye-invisible" theme="twoTone" twoToneColor="#595959" />
      }
    }

    return <Tooltip placement="left" title={shareIcon.screenTip}>{shareIcon.iconType}</Tooltip>;
  }

  handleSend=()=>{
    const { userList } = this.state;
    var sendList = null;
    var shareResource_url = sessionStorage.getItem('serverPort')+'resource/share/'+sessionStorage.getItem('@userInfo.id');

    if(Array.isArray(userList)&&userList.length>0){
      sendList = {
        resourceId: this.props.resourceId,
        userIds: userList.map(iUser=>(iUser.id))
      }
    }

    if(!sendList){ return };

    if(this.props.resourceType&&this.props.resourceType==="MiniBlog"){
      shareResource_url = sessionStorage.getItem('serverPort')+'blog/share/'+sessionStorage.getItem('@userInfo.id');
      delete sendList.resourceId;
      sendList.blogId = this.props.resourceId;
    }

    if(this.props.resourceType&&this.props.resourceType==="KnowledgeCocktail"){
      shareResource_url = sessionStorage.getItem('serverPort')+'forum/share/'+sessionStorage.getItem('@userInfo.id');
      delete sendList.resourceId;
      delete sendList.blogId;
      sendList.cocktailId = this.props.resourceId;
    }
    
    this.setState({ loading: true });

    fetchData( shareResource_url, 'post', sendList, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success('Shared', 5);
        }else{
          message.error(`Get ${res.status} from Server.`)
        }
      }else{
        message.error(`Get ${response.result.status} from Server.`)
      }
      this.setState({ loading: false }, ()=>response.result.status===200? this.props.handleClose():null)
    })
  }

  render(){
    const { currentPage, loading, userList, searchResults, totalResults } = this.state;

    const accessMode = getAccessMode();

    const paginprops = {
      simple: window.innerWidth<992,
      size: accessMode===3?"small":"",
      current: currentPage,
      pageSize: 20,
      total: totalResults,
      showTotal: (total, range) => accessMode===3?`Total ${total}`:`${range[0]}-${range[1]} of ${total} records`,
      onChange: this.getUserList,
    }

    const paginpropsList = {
      simple: window.innerWidth<992,
      size: "small",
      pageSize: 10,
      showTotal: (total) => `Total ${total}`,
    }

    const tblColumns = [
      {key: 1, title: intl.get('@USER_MANAGEMENT.FULLNAME'), dataIndex: 'fullname'},
      {key: 2, title: intl.get('@USER_MANAGEMENT.INSTITUTION'), dataIndex: 'institution'},
      {key: 3, title: intl.get('@USER_MANAGEMENT.SECTION'), dataIndex: 'section'},
      {key: 4, title: intl.get('@USER_MANAGEMENT.RANK'), dataIndex: 'rank'},
      {key: 5, title: intl.get('@GENERAL.SHARE'), align: 'center', render:(text,record)=>this.handleSharing(1,record)}
    ];

    const tblColumns_simple = [
      {key: 1, title: intl.get('@USER_MANAGEMENT.FULLNAME'), dataIndex: 'fullname', render: (text, record)=>(
        <span>
          {text} 
          <p style={{ margin: 0 }}>( {record.institution}, {record.section}, {record.rank} )</p>
        </span>
      )},
      {key: 5, title: intl.get('@GENERAL.SHARE'), align: 'center', render:(text,record)=>this.handleSharing(1,record)}
    ];

    return(
      <div>
      <div style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="share-search">
          <Input.Search 
          disabled={loading}
          allowClear 
          onPressEnter={(e)=>this.onSearch(e.target.value)} 
          onSearch={this.onSearch} 
          placeholder={intl.get('@USER_MANAGEMENT.FULLNAME')} 
          enterButton={<Icon type="search" />} 
          />
        </div>

        <div className="row">
          <div 
          className="col-lg-8 share-col"
          >
            <h5><b>{intl.get('@USER_MANAGEMENT.RESULTS')}</b></h5>
            <div className="steps-content">
            <Table 
            loading={ loading }
            size="small"
            rowKey={record=>record.id}
            pagination={paginprops}
            columns={window.innerWidth<992? tblColumns_simple:tblColumns}
            dataSource={searchResults}
            />
            </div>
          </div>

          <div 
          className="col-lg-4 share-col"
          >
            <h5><b>{intl.get('@GENERAL.SHARE')}</b></h5>
            <div className="steps-content">
            <Table 
            size="small"
            loading={ loading }
            rowKey={record=>record.id}
            pagination={paginpropsList}
            columns={[
              {key: 1, title: intl.get('@USER_MANAGEMENT.FULLNAME'), dataIndex: 'fullname'},
              {key: 2, title: intl.get('@GENERAL.REMOVE'), align: 'center', render:(text,record)=><Icon type="minus-circle" theme="twoTone" twoToneColor="#eb2f96" onClick={()=>this.onClickRecord(record)} />}
            ]}
            dataSource={userList}
            />
            </div>
          </div>
        </div>

        <div className="share-send">
          <Button className="share-btn" disabled={userList.length===0||loading} type="primary" onClick={this.handleSend}>{intl.get("@GENERAL.SHARE")}</Button>
        </div>
      </div>
      </div>
    )
  }
}