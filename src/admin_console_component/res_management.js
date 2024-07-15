//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190530 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, DatePicker, Button, Table, Icon, message, Checkbox, Popconfirm, Drawer, TreeSelect } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import './res_management.css';
import { fetchData, getCategoryTree } from '../service/HelperService';
import WrappedRescForm from './resource_form';
import WrappedResEditForm from './res_edit_form';

export default class ResManagement extends React.Component{

  state = {
    remarks: '',
    selRecord: null,
    submitting: false,
    selectedRows: [], 
    selectedRowKeys: [],
    resultList: [], 
    res_search_id: null, 
    res_search_title: null, 
    res_search_cate: null,
    res_search_sub: 0,
    startValue: null,
    endValue: null,
    endOpen: false, 
    res_search_ln: 0,
    res_search_km: 0,
    res_search_ks: 0,
    res_search_wg: 0,
    current_params: 'no param',
    current_page: 1,
    total_results: 0,
    visiblepop: false,
    disableEditBtn: true,
    showMultiEditor: false,
    showInfoForm: false,
    categoryTree: [],
    loadingRes: false,
    cateOptions: getCategoryTree(),
    userGroupId: 1,
    groupOptions: []
  };

  componentWillMount = () => {
    // ------collect latest 50 resources from server at very beginning

    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loadingRes: true}));

    let loading_url = sessionStorage.getItem('serverPort')+'resource/search/?user='+sessionStorage.getItem('@userInfo.id');
    fetchData(loading_url,'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            loadingRes: false,
            resultList: res.data.list,
            disableEditBtn: true,
            // current_page:1 ,
            total_results: res.data.total,
          });
        } else {
          this.setState({ 
            loadingRes: false,
            resultList: [],
            disableEditBtn: true,
            // current_page:1, 
            total_results: 0,
          });
        }
      }
    });

    this.getSplUsrGroupList();
  }

  componentDidMount(){
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

  // ----Search Area----
  onIDBlur = (e) => {
    this.setState({ res_search_id: e.target.value });
    // console.log("id: ", e.target.value);
  }

  onTitleBlur = (e) => {
    this.setState({ res_search_title: e.target.value });
    // console.log("title: ", e.target.value);
  }

  handleCateChange = (value) => {
    this.setState(state=>({ res_search_cate: value!==undefined&&value!==null? value:null }));
  }

  handleSubcateChange = (e) => {
    let ifChecked = e.target.checked;
    ifChecked? ifChecked=1:ifChecked=0;
    this.setState({ res_search_sub: ifChecked });
  }

  getSplUsrGroupList = () =>{
    let getSUGrpList_url = sessionStorage.getItem('serverPort')+'splusrgrp/getAll/'+sessionStorage.getItem('@userInfo.id');
    
    fetchData(getSUGrpList_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&Array.isArray(res.data)){
          this.setState({ groupOptions: res.data.sort((a,b) => (a.groupName > b.groupName) ? 1 : ((b.groupName > a.groupName) ? -1 : 0)) });
        }else{
            this.setState({ groupOptions: [] });
        }
      }else{
        this.setState({ groupOptions: [] });
      }
    })
  }

  handleCateChildren=(cate)=>{
      let currentLang = sessionStorage.getItem('lang');
      let treedCate = {
          title: currentLang==='zh_TW'? cate.nameTc:cate.nameEn,
          value: cate.id,
          key: cate.id,
      };
      if(cate.children!==null){
          let children = cate.children.map(childCate=>{
              return this.handleCateChildren(childCate);
          });
          treedCate.children = children;
          // treedCate.disabled = true;
      }
      return treedCate;
  }

  // -------Date Range Picker
  disabledStartDate = startValue => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    };
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = endValue => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onPickerChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = value => {
    this.onPickerChange('startValue', value);
  };

  onEndChange = value => {
    this.onPickerChange('endValue', value);
  };

  handleStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = open => {
    this.setState({ endOpen: open });
  };
  // -------end of Date Range Picker

  // -------Checkbox
  onCheckChange = (e) => {
    let selCheckBox = e.target.value;
    let ifChecked = e.target.checked;
    ifChecked? ifChecked=1:ifChecked=0;
    if(selCheckBox==='LN'){
      this.setState({ res_search_ln: ifChecked });
    } else if(selCheckBox==='KM'){
      this.setState({ res_search_km: ifChecked });
    } else if(selCheckBox==='KS'){
      this.setState({ res_search_ks: ifChecked });
    } else if(selCheckBox==='WG'){
      this.setState({ res_search_wg: ifChecked });
    };
  }

// -------collect searching criteria for further action
  prepSearchParams = () => {
    const { res_search_id, res_search_title, res_search_cate, res_search_sub, startValue, endValue, res_search_ln, res_search_km, res_search_ks, res_search_wg } = this.state;

    var urlParams = '';
    if( res_search_id !== null&&res_search_id !== '' ){
      urlParams += '&id=' + res_search_id;
    };
    if( res_search_title !==null&&res_search_title !=='' ){
      urlParams += '&title=' + res_search_title;
    };
    if( res_search_cate !==null&&res_search_cate > 0 ){
      urlParams += '&category=' + res_search_cate;
    };
    if( res_search_cate !==null&&res_search_sub ){
      urlParams += '&subcategory=1';
    };
    if( startValue !== null ){
      urlParams += '&startdate=' + startValue;
    };
    if( endValue !== null ){
      urlParams += '&enddate=' + endValue;
    };

    if( res_search_ln !== 0){
      urlParams += '&ln=' + res_search_ln;
    }
    if( res_search_km !== 0 ){
      urlParams += '&km=' + res_search_km;
    }
    if( res_search_ks !== 0){
      urlParams += '&ks=' + res_search_ks;
    }
    if( res_search_wg !== 0){
      urlParams += '&wg=' + res_search_wg;
    }

    return urlParams;
  }

// -------get results with given criteria, including first 20, total
// -------to be modified
  onSearch = () => {
    let url_res_search = sessionStorage.getItem('serverPort') + 'resource/search/?user='+sessionStorage.getItem('@userInfo.id');
    let searchParams = this.prepSearchParams();
    this.setState({ current_params: searchParams, loadingRes: true });
    if(searchParams !== null && searchParams !== ''){

      //----to be modified based on server's responce
      url_res_search += searchParams;
      console.log('url_res_search: ', url_res_search)
      fetchData( url_res_search, 'get', null, response => {
        if(response.ifSuccess){
          let res = response.result;
          if(res.status === 200){
            this.setState({
              remarks: '',
              resultList: res.data.list,
              disableEditBtn: true,
              total_results: res.data.total,
              loadingRes: false,
              // current_page: 1,
            })
          } else if (res.status === 555) {
            this.setState({
              remarks: '',
              resultList: [],
              disableEditBtn: true,
              total_results: 0,
              loadingRes: false,
              // current_page: 1,
            })
          }
        }
      });
    } else {
      this.componentWillMount();
    }
  }

  handlePageChange = page => {
    this.setState({ current_page: page, loadingRes: true });

    const searchParams = this.state.current_params;
    // eslint-disable-next-line
    let pagin_url = sessionStorage.getItem('serverPort')+'resource/search/?user='+sessionStorage.getItem('@userInfo.id');
    if(searchParams !== null&&searchParams !== 'no param'){
      pagin_url += searchParams+'&page='+page;
    } else {
      pagin_url += '&page='+page;
    };

    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            remarks: '',
            resultList: res.data.list,
            total_results: res.data.total,
            loadingRes: false,
          })
        } else if (res.status === 555) {
          this.setState({
            remarks: '',
            resultList: [],
            total_results: 0,
            loadingRes: false,
          })
        }
      }
    });

  }

// -------settings of Delete btn
  handleVisibleChange = visible => {
    if (!visible) {
      this.setState({ visiblepop: visible });
      return;
    };

    if(this.state.disableEditBtn){
      message.success("confirmed");
    }else{
      this.setState({ visiblepop: visible });
    }
  }

  onDelete = () => {
    var selRecordIDs = this.state.selectedRowKeys;
    var delete_url = sessionStorage.getItem('serverPort')+'resource/delete/'+sessionStorage.getItem('@userInfo.id');

    // -------to be modified
    fetchData(delete_url,'post', {id:selRecordIDs}, response => { 
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          message.success("Delete request accept");
          this.setState({ selectedRows: [], selectedRowKeys: [], disableEditBtn: true });
          this.handlePageChange(this.state.current_page || 1);
        } else {
          message.error("Delete request denied");
        };
      }
    });
    this.handlePageChange(this.state.current_page || 1);
  }

  onCancelDelete = () => {
    message.error("Delete request cancelled")
  }

  // -------show diff editor based on current seletion
  onClickRecords = () => {
    if(this.state.selectedRowKeys.length>1){
      this.showMultiEditor();
    } else if(this.state.selectedRowKeys.length===1){
      this.setState(state=>({ selRecord: state.selectedRows[0] }));
      this.showInfoForm(this.state.selectedRows[0]);
    } else {
      message.warning('please select at least one record...');
    }
  }

  // -------Update individual resource
  showInfoForm = (record) => {
    this.setState({ showInfoForm: true, selRecord: record });
  };

  onCloseInfoForm = () => {
    this.setState({ showInfoForm: false });
  }

  handleInfoForm = (updates) => {
    this.setState({submitting: true});
    var titleReady = false;
    var descReady = false;
    var accessRuleReady = false;
    var cateReady = false;
    var accessRule_arr = updates.k_market.concat(updates.k_square, updates.wisdom_gallery);
    // console.log(accessRule_arr)

    if(updates.titleEn!=="" || updates.titleTc!==""){
        titleReady = true;
        if(updates.titleEn!=="" && updates.titleTc===""){
          updates.titleTc = updates.titleEn;
        }else if(updates.titleEn==="" && updates.titleTc!==""){
          updates.titleEn = updates.titleTc;
        }
    } 
    if(updates.descEn!=="" || updates.descTc!==""){
        descReady = true;
        if(updates.descEn!=="" && updates.descTc===""){
          updates.descTc = updates.descEn;
        }else if(updates.descEn==="" && updates.descTc!==""){
          updates.descEn = updates.descTc;
        }
    }
    if(accessRule_arr.length>0){
        accessRuleReady = true;
    }
            
    if(updates.resCate.length>0){
      cateReady = true;
    }

    if (titleReady&&descReady&&accessRuleReady&&cateReady){
      let single_url = sessionStorage.getItem('serverPort')+'resource/update/?user='+sessionStorage.getItem('@userInfo.id');
      let form_data = {
        id: this.state.selRecord.resource.id,
        updates: updates,
      };
      fetchData(single_url,'post',form_data,response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            message.success("Update successfully for current record.");
                      // this.setState(state=>({ showInfoForm: false }));
            this.setState(state=>({ showInfoForm: false, selectedRowKeys: [], selectedRows: [], disableEditBtn: true, submitting: false }));
            this.handlePageChange(this.state.current_page || 1);
          } else {
            message.warning("Your request was denied by server.");
            this.setState({ submitting: false });
          };
        }
      });
    }else{
      this.setState({ submitting: false });
      message.info("Please ensure each record has at least one title, one description, one category and one access rule.")
    }
  };

  // -------Update resources in batch
  showMultiEditor = () => {
    this.setState({ showMultiEditor: true });
  };

  onCloseMultiEditor = () => {
    this.setState({ showMultiEditor: false });
  };

  handleMultiEditor = (settings) => {
    const selRecordIDs = this.state.selectedRowKeys;
    let accessRule_arr = settings.k_market.concat(settings.k_square, settings.wisdom_gallery);

    let updateTag = settings.updateTag;
    let updateCate = settings.updateCate;  //---true or false
    let resCate = settings.resCate;  //---category array

    if (updateTag&&settings.descEn==="") {
      message.info("Please provide at least one tag (EN or 中文).");
    } else if (updateCate&&resCate.length<1) {
      message.info("Please nominate at least one category.");
    }else if (accessRule_arr.length>0){
      var res_edit_url = sessionStorage.getItem('serverPort')+'resource/multiple_update/?user='+sessionStorage.getItem('@userInfo.id');
      var form_data = {
        selIds: selRecordIDs,
        updates: settings,
      };

      fetchData(res_edit_url,'post',form_data,response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            message.success("Update successfully");
            this.setState({ disableEditBtn: true, showMultiEditor: false, selectedRowKeys: [], selectedRows: [] });
            this.handlePageChange(this.state.current_page || 1);
          } else {
            message.warning("Failed to update");
            this.setState({ showMultiEditor: false });
          }
        }
      });

    }else{
      message.info("Please nominate at least one access rule (special user excepted).")
    }
  }
  //--------end of Drawer

  render(){
    const { Content } = Layout;
    const { resultList, cateOptions, startValue, endValue, endOpen, disableEditBtn, visiblepop, showMultiEditor, showInfoForm, current_page, total_results, selectedRowKeys, selectedRows, loadingRes, submitting, userGroupId, groupOptions } = this.state;
    const table_column = [ {key: 1, title:'ID', dataIndex: 'resource.id'},
                           {key: 2, title:(sessionStorage.getItem('lang')==='zh_TW'? '標題':'Title'), dataIndex: sessionStorage.getItem('lang')==='zh_TW'? 'resource.titleTc':'resource.titleEn', render: (text, record) => (<div style={{ wordWrap: 'break-word', wordBreak: 'break-word', display: 'table-cell' }}>{text}</div>)  }, 
                           {key: 3, title:(sessionStorage.getItem('lang')==='zh_TW'? '類別':'Category'), dataIndex: 'categoryId', render: (text, record) => text.length<1? null : <TreeSelect style={{ maxWidth: '200px' }} dropdownMatchSelectWidth={true} treeData={cateOptions} value={text} multiple disabled showSearch={false} /> }, 
                           {key: 4, width: '120px', title:(sessionStorage.getItem('lang')==='zh_TW'? '創建日期':'Create Date'), dataIndex: 'resource.createdAt', render: (text) => moment(text).format("YYYY-MM-DD")},
                           {key: 5, width: '120px', title:(sessionStorage.getItem('lang')==='zh_TW'? '編輯日期':'Modify Date'), dataIndex: 'resource.modifiedAt', render: (text) => text? moment(text).format("YYYY-MM-DD"):'--'}   
                          ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys, selectedRows });
        selectedRowKeys.length > 0 ? this.setState({ disableEditBtn: false }) : this.setState({ disableEditBtn: true });
      },
      getCheckboxProps: record => ({
          // disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
      }),
    };
    const spinProp = {
      spinning: loadingRes,
      delay: 500,
      tip: 'Loading...'
    }
    const paginprops = {
      position: 'both',
      defaultCurrent: 1,
      current: current_page,
      // hideOnSinglePage: true,
      pageSize: 50,
      total: total_results,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
      onChange: this.handlePageChange,
    }
    return(
      <div className="clearfix" style={{ width:'100%' }} >
        <Content className="cms-content" >
          
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@RES_MANAGEMENT.RESOURCES-MANAGEMENT')}
            </div>
            <div style={{ display: 'inline-block', width: '35%', textAlign: 'right' }}>
              <Button shape="round" type="primary" href="#/adminconsole/resources/creation" ><Icon type="plus" /> {intl.get('@RES_MANAGEMENT.NEW-RESOURCE')}</Button>
            </div>
          </h1>
          <div className="cms-white-box">
              <div className="res_search">
              <h5>{intl.get('@RES_MANAGEMENT.SEARCH')}</h5>
              <div><Input className="res-search-input" allowClear placeholder="ID" onBlur={this.onIDBlur} /></div>
              {/* <Row>
                <Col span={12}> */}
                <div>
                  <Input className="res-search-input" allowClear placeholder={sessionStorage.getItem('lang')==="zh_TW"? "標題":"Title"} onBlur={this.onTitleBlur} />
                </div>
                {/* </Col>
                <Col span={12}> */}
                <div>
                  {/* <Row>
                  <Col span={12}> */}
                  <TreeSelect 
                  className="res-search-input"
                  dropdownStyle={{ maxHeight: '300px', overflow: 'auto' }}
                  dropdownMatchSelectWidth={true}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "類別":"Category"}
                  allowClear={true}
                  showSearch={false}
                  treeData={this.state.cateOptions}
                  onChange={this.handleCateChange}
                  // multiple={true}
                  showCheckedStrategy={TreeSelect.SHOW_CHILD}
                  />
                  {/* </Col>
                  <Col span={12}> */}
                  <Checkbox style={{ maxWidth: '200px', marginLeft: '8px'}} disabled={!this.state.res_search_cate} value="SubCate" onChange={this.handleSubcateChange} >
                    {intl.get('@RES_MANAGEMENT.SUBCATEGORIES')}
                  </Checkbox>
                  {/* </Col>
                  </Row> */}
                </div>
                {/* </Col>
              </Row> */}
              
              
              {/* <div style={{ width:'50%' }}></div> */}
              <div style={{ margin: '8px 0px' }}>
                <DatePicker
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD"
                  value={startValue}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "創建日期: 起始":"Create Date: Start"}
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
                <span> ~ </span>
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  value={endValue}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "創建日期: 結束":"Create Date: End"}
                  onChange={this.onEndChange}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              </div>

              <div style={{ margin: '8px 0' }}>
              <Checkbox className="res_chkbx" value="LN" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.LATEST-NEWS')}</Checkbox>
              <Checkbox className="res_chkbx" value="KM" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
              <Checkbox className="res_chkbx" value="KS" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-SQUARE')}</Checkbox>
              <Checkbox className="res_chkbx" value="WG" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
              </div>

              <div style={{ textAlign: 'right', margin: '8px 0' }} >
                {/* <Button className="res_btn" shape="round" type="default" onClick={this.onClear}>Clear</Button> */}
                <Button className="res_btn" disabled={loadingRes} shape="round" type="primary" onClick={this.onSearch}>{intl.get('@RES_MANAGEMENT.SEARCH')}</Button>
              </div>
            </div>

            <div style={{ padding: '4px' }}>
              {/* <h5>{intl.get('@RES_MANAGEMENT.RESULTS')} {remarks} </h5> */}
              <h5>{intl.get('@RES_MANAGEMENT.RESULTS')}</h5>
              <Table 
              style={{ paddingTop: '16px' }}
              loading={spinProp}
              locale={{emptyText: intl.get('@GENERAL.NO-RECORD-IS-FOUND')}}
              rowKey={record=>record.resource.id}
              rowClassName={record=>(record===this.state.selRecord&&showInfoForm? "res-row-selected":"res-row")}
              rowSelection={rowSelection}
              pagination={paginprops}
              columns={table_column}
              dataSource={resultList}
              onRow={record => { 
                  return {
                      // ----Updated on 20190603
                      onClick: event => { 
                                          // this.onClickRecords();
                                          this.showInfoForm(record);
                                        }
                  };}}
              />
              <div style={{ textAlign: 'right', margin: '8px 0' }} >
                <Popconfirm 
                  title="All selected records will be deleted, continue?" 
                  visible={visiblepop} 
                  onVisibleChange={this.handleVisibleChange} 
                  okText="Cancel"
                  onConfirm={this.onCancelDelete} 
                  cancelText="Yes"
                  onCancel={this.onDelete}>
                  <Button className="res_btn" shape="round" disabled={disableEditBtn} type="danger">{intl.get('@RES_MANAGEMENT.DELETE')}</Button>
                </Popconfirm>
                 {/* ----Updated on 20190603 */}
                <Button className="res_btn" shape="round" disabled={disableEditBtn} type="primary" onClick={this.onClickRecords}>{intl.get('@RES_MANAGEMENT.EDIT')}</Button>
              </div>
            </div>

            <Drawer
              id = "drawer-indiv-info"
              title={intl.get('@RES_MANAGEMENT.DETAILS')}
              width='45%'
              onClose={this.onCloseInfoForm}
              destroyOnClose={true}
              visible={showInfoForm}
            >
              <WrappedRescForm handleInfoForm={this.handleInfoForm} submitting={submitting} selRecord={this.state.selRecord} cateOptions={cateOptions} userGroupId={userGroupId} groupOptions={groupOptions} />
            </Drawer>

            <Drawer
              id = "drawer-multi-editor"
              title={intl.get('@RES_MANAGEMENT.SELECTION')}
              width='35%'
              onClose={this.onCloseMultiEditor}
              destroyOnClose={true}
              visible={showMultiEditor}
            >
              <WrappedResEditForm handleMultiEditor={this.handleMultiEditor} cateOptions={cateOptions} userGroupId={userGroupId} groupOptions={groupOptions} />
            </Drawer>

          </div>
        </Content>
      </div>
    )
  }
}