//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190717 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, Button, Table, message, Drawer, Select } from 'antd';
import intl from 'react-intl-universal';
import WrappedUserMntForm from './user_management_form';

import { fetchData } from '../service/HelperService';

import './user_management.css';

export default class userManagement extends React.Component{

  state={ 
    loading: false,
    current_page: 1, 
    total_results: 0, 
    resultList: [], 
    userGroupOptions: [],
    showInfoForm: false,
    disableEditBtn: true,
    current_params: 'no param',
    user_staff_no: null,
    user_fullname: '',
    user_group_name: '',
    user_inst: '',
    user_rank: '',
    user_section: '',
    user_blogger: null,
    selUserId: -1,
    selUser: {},
    userGroupId: 1
  };

  componentDidMount(){
    this.getGroupOptions();
    this.getUserGroup();
    this.setState({loading:true})

    let loading_url = sessionStorage.getItem('serverPort')+'user/search/'+sessionStorage.getItem('@userInfo.id')+'/?page=1';
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState(state=>({ 
            resultList: res.data,
            disableEditBtn: true,
            loading:false,
            current_page: 1,
            total_results: res.total
          }));
        } else {
          this.setState({ 
            resultList: [],
            disableEditBtn: true,
            loading:false,
            // current_page:1, 
            total_results: 0
          });
        }
      }
    })
  }

  getUserGroup(){
    let getUserGroup = sessionStorage.getItem('serverPort')+'user/get/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getUserGroup, 'get', null, response=>{
        if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&res.data.groupId){
              this.setState({ userGroupId: res.data.groupId })
            }else{
              this.setState({ userGroupId: 1 })
            }
        }else{
            this.setState({ userGroupId: 1 })
        }
    })
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
  
  // ----Search Area----
  onStaffNoBlur = (e) => {
    this.setState({ user_staff_no: e.target.value });
  }
  
  onFullnameBlur = (e) => {
    this.setState({ user_fullname: e.target.value });
  }

  onUserGroupChange = (value) => {
    this.setState({ user_group_name: value });
  }

  onInstBlur = (e) => {
    this.setState({ user_inst: e.target.value });
  }

  onRankBlur = (e) => {
    this.setState({ user_rank: e.target.value });
  }

  onSectionBlur = (e) => {
    this.setState({ user_section: e.target.value });
  }

  onBloggerChange = (value) => {
    this.setState({ user_blogger: value });
  }

  prepSearchParams=()=>{
    const { user_staff_no, user_fullname, user_group_name, user_inst, user_rank, user_section, user_blogger } = this.state;
    
    var urlParams = '';
    if( user_staff_no !== null&&user_staff_no !== ''&&user_staff_no !==undefined ){
      urlParams += '&staffNo=' + user_staff_no;
    };
    if( user_fullname !== null&&user_fullname !== ''&&user_fullname !==undefined ){
      urlParams += '&fullname=' + user_fullname;
    };
    if( user_group_name !== null&&user_group_name !== ''&&user_group_name !== undefined ){
      urlParams += '&userGroup=' + user_group_name;
    };
    if( user_inst !== null&&user_inst !== ''&&user_inst !==undefined ){
      urlParams += '&institution=' + user_inst;
    };
    if( user_rank !== null&&user_rank !== ''&&user_rank !==undefined ){
      urlParams += '&rank=' + user_rank;
    };
    if( user_section !== null&&user_section !== ''&&user_section !==undefined ){
      urlParams += '&section=' + user_section;
    };
    if( user_blogger !== null&&user_blogger !== ''&&user_blogger !== undefined ){
      urlParams += '&isBlogger=' + user_blogger;
    };
    console.log('state: ', user_blogger)

    return urlParams;
  }

  // -------get results with given criteria, including first 20, total
  onSearch = () => {
    var url_user_search = sessionStorage.getItem('serverPort')+'user/search/'+sessionStorage.getItem('@userInfo.id')+'/?page=1';
    var searchParams = this.prepSearchParams();
    this.setState({ current_params: searchParams, loading: true });
    console.log('prepSearchParams', searchParams);
    if(searchParams !== null && searchParams !== ''){

      //----to be modified based on server's responce
      url_user_search += searchParams;
      fetchData( url_user_search, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status === 200){
            this.setState({
              resultList: res.data,
              disableEditBtn: true,
              total_results: res.total,
              loading: false,
              current_page: 1,
            })
          } else {
            this.setState({
              resultList: [],
              disableEditBtn: true,
              total_results: 0,
              loading: false,
              current_page: 0,
            })
          }
        }else{
          this.setState({
            resultList: [],
            disableEditBtn: true,
            total_results: 0,
            loading: false,
            current_page: 0,
          })
        }
      });
    } else {
      this.componentDidMount();
    }
  }

  handlePageChange=(page)=>{
    this.setState({ current_page: page, loading: true });

    const searchParams = this.state.current_params;
    // eslint-disable-next-line
    let pagin_url = sessionStorage.getItem('serverPort')+'user/search/'+sessionStorage.getItem('@userInfo.id')+'/?page='+page;
    console.log('searchParams', searchParams)
    if(searchParams !== null&&searchParams !== 'no param'){
      pagin_url += searchParams;
    }

    fetchData( pagin_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            resultList: res.data,
            total_results: res.total,
            loading: false
          })
        } else {
          this.setState({
            resultList: [],
            total_results: 0,
            loading: false
          })
        }
      }else{
        this.setState({
          resultList: [],
          total_results: 0,
          loading: false
        })
      }
    });
  }

  onClickEdit=(userId, user)=>{
    this.setState(state=>({ selUserId: userId, selUser: user, showInfoForm: true }));
  }

  handleInfoForm=(updates)=>{
    let updateUser_url = sessionStorage.getItem('serverPort')+'user/update';
    fetchData(updateUser_url, 'post', updates, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success("Update successfully for current record.")
          this.setState(state=>({ showInfoForm: false, selUserId: -1 }));
  
          this.setState(state=>{
            var selUser_new = state.selUser;
            var resultList_new = state.resultList;
            selUser_new.usergroup = updates.userGroup;
            selUser_new.isBlogger = updates.isBlogger;
      
            resultList_new.splice(resultList_new.indexOf(state.selUser), 1, selUser_new);
      
            return { resultList: resultList_new, showInfoForm: false, selUserId: -1, selUser: {} }
          });
  
          // this.handlePageChange(this.state.current_page || 1);
  
        } else {
          message.warning("Your request was denied by server.");
        };
      }
    })
  }

  onCloseInfoForm=()=>{
    this.setState({ showInfoForm: false, selUserId: null, selUser: {} });
  }

  render(){
    const { Content } = Layout;
    const { loading, current_page, total_results, resultList, showInfoForm, userGroupOptions, userGroupId } = this.state;
    const table_column = [{key: 1, title: intl.get('@USER_MANAGEMENT.STAFF-NO'), dataIndex: 'staffNo'},
                          {key: 2, title: intl.get('@USER_MANAGEMENT.FULLNAME'), dataIndex: 'fullname'},
                          {key: 3, 
                            title: intl.get('@USER_MANAGEMENT.USER-GROUP'), 
                            dataIndex: 'usergroup',
                            // eslint-disable-next-line
                            render: (text)=>{ let userGroup_desc = this.state.userGroupOptions.filter(item=>item.id==text); return userGroup_desc.length? userGroup_desc[0].name: null},
                          },
                          {key: 4, title: intl.get('@USER_MANAGEMENT.INSTITUTION'), dataIndex: 'institution'},
                          {key: 5, title: intl.get('@USER_MANAGEMENT.SECTION'), dataIndex: 'section'},
                          {key: 6, title: intl.get('@USER_MANAGEMENT.RANK'), dataIndex: 'rank'},
                          {key: 7, title: intl.get('@USER_MANAGEMENT.IS-BLOGGER'), align: 'center', dataIndex: 'isBlogger', render: (text)=>text===1? intl.get('@GENERAL.YES'):intl.get('@GENERAL.NO')},
                          {key: 8, 
                            // title: sessionStorage.getItem('@userInfo.id')===3? intl.get('@USER_MANAGEMENT.ADMIN'):intl.get('@USER_MANAGEMENT.GENERAL'), 
                            title: intl.get('@USER_MANAGEMENT.ADMIN'), 
                            align: 'center', 
                            render: (text, record)=>(
                            <span>
                              <Button type="primary" onClick={()=>this.onClickEdit(record.id, record)}>
                                {intl.get('@USER_MANAGEMENT.EDIT')}
                              </Button>
                            </span>) },
                          ];
    const tbl_col_simple = [{key: 1, title: intl.get('@USER_MANAGEMENT.STAFF-NO'), dataIndex: 'staffNo'},
                          {key: 2, title: intl.get('@USER_MANAGEMENT.FULLNAME'), dataIndex: 'fullname', render: (text, record)=>(
                            <span>
                              {text} 
                              <p style={{ margin: 0 }}>( {record.institution}, {record.section}, {record.rank} )</p>
                            </span>
                          )},
                          {key: 8, 
                            title: intl.get('@USER_MANAGEMENT.ADMIN'), 
                            align: 'center', 
                            render: (text, record)=>(
                            <span>
                              <Button type="primary" onClick={()=>this.onClickEdit(record.id, record)}>
                                {intl.get(userGroupId<5||sessionStorage.getItem('accessChannel')!=="1"?'@USER_MANAGEMENT.VIEW':'@USER_MANAGEMENT.EDIT')}
                                {/* {sessionStorage.getItem('accessChannel')!=="1"?} */}
                                {/* {intl.get('@USER_MANAGEMENT.EDIT')} */}
                              </Button>
                            </span>) },
                          ];
    const paginprops = {
      simple: window.innerWidth<992,
      defaultCurrent: 1,
      current: current_page,
      pageSize: 20,
      total: total_results,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
      onChange: this.handlePageChange,
    }
    return(
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@USER_MANAGEMENT.USER-MANAGEMENT')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div className="res_search">
              <h5>{intl.get('@USER_MANAGEMENT.SEARCH')}</h5>

              <div className="row">
                <div className="col-lg-6"><Input className="res-search-input" allowClear onBlur={this.onStaffNoBlur} placeholder={intl.get('@USER_MANAGEMENT.STAFF-NO')} /></div>
                <div className="col-lg-6"><Input className="res-search-input" allowClear onBlur={this.onFullnameBlur} placeholder={intl.get('@USER_MANAGEMENT.FULLNAME')} /></div>
              </div>

              <div className="row">
                <div className="col-lg-6" ><Input className="res-search-input" allowClear onBlur={this.onInstBlur} placeholder={intl.get('@USER_MANAGEMENT.INSTITUTION')} /></div>
                <div className="col-lg-6" ><Input className="res-search-input" allowClear onBlur={this.onRankBlur} placeholder={intl.get('@USER_MANAGEMENT.RANK')} /></div>
                <div className="col-lg-6" ><Input className="res-search-input" allowClear onBlur={this.onSectionBlur} placeholder={intl.get('@USER_MANAGEMENT.SECTION')} /></div>
              </div>

              <div className="row">
                <div className="col-lg-6">
                  <Select style={{ margin: '8px 0' }} allowClear onChange={this.onUserGroupChange} placeholder={intl.get('@USER_MANAGEMENT.USER-GROUP')}>
                    {userGroupOptions.length>0? userGroupOptions.map(option=>(<Select.Option key={option.id} value={option.id}>{option.name}</Select.Option>)):null}
                  </Select>
                </div>

                <div className="col-lg-6">
                  <Select style={{ margin: '8px 0' }}  allowClear onChange={this.onBloggerChange} placeholder={intl.get('@USER_MANAGEMENT.IS-BLOGGER')}>
                    <Select.Option key={1} value={1}>{intl.get('@GENERAL.YES')}</Select.Option>
                    <Select.Option key={0} value={0}>{intl.get('@GENERAL.NO')}</Select.Option>
                  </Select>
                </div>

              </div>

              <div style={{ textAlign: 'right', margin: '8px 0' }} >
               <Button className="res_btn" shape="round" type="primary" onClick={this.onSearch} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
              </div>
            
            </div>

            <div style={{ padding: '4px' }}>
              <h5>{intl.get('@USER_MANAGEMENT.RESULTS')}</h5>
              <Table 
                style={{ paddingTop: '16px' }}
                loading={ loading }
                rowKey={record=>record.id}
                rowClassName={(record,index)=>{return record===this.state.selUser? "user-row-selected" : "user-row"}}
                pagination={paginprops}
                columns={window.innerWidth<992? tbl_col_simple:table_column}
                dataSource={resultList}
              />
            </div>

            <Drawer
            id="drawer-indiv-info"
            title={intl.get('@USER_DRAWER_INFO.USER-EDITOR')}
            width={window.innerWidth<992? '80%':'40%'}
            onClose={this.onCloseInfoForm}
            destroyOnClose={true}
            visible={showInfoForm}
            >
              <WrappedUserMntForm 
              handleInfoForm={this.handleInfoForm} 
              selUserId={this.state.selUserId} 
              generalUser={userGroupId<5||sessionStorage.getItem('accessChannel')!=="1"} 
              />
            </Drawer>

          </div>

        </Content>
      </div>
    )
  }
}