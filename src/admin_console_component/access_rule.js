//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190530 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Input, DatePicker, Button, Table, Icon, message, Checkbox, Popconfirm, Drawer } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
import WrappedAccUpdateForm from './acc_update_form';
import './res_management.css';

export default class AccessEditForm extends React.Component{

  state = {
    accessRule: [],
    selRecord: null,
    selectedRows: [], 
    selectedRowKeys: [],
    resultList: [], 
    res_search_id: null,
    res_search_desc: null,
    startValue: null,
    endValue: null,
    endOpen: false, 
    res_search_km: 0,
    res_search_ks: 0,
    res_search_wg: 0,
    current_params: null,
    current_page: 1,
    total_results: 0,
    visiblepop: false,
    disableEditBtn: true,
    showMultiEditor: false,
    showInfoForm: false,
    institution: null,
    section: [],
    ranking: [],
    allSectionIds: [],
    allRankIds: [],
    loading:false,
  };

  
  componentWillMount = () => {

    this.getInstitutions();
    this.getSections();
    this.getRank();
    // ------collect latest 20 resources from server at very beginning
    let loading_url = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1';
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            resultList: res.data,
            disableEditBtn: true,
            current_page:1 ,
            total_results: res.total,
            loading: false
          });
        } else {
          this.setState({ 
            resultList: [],
            disableEditBtn: true,
            current_page:1, 
            total_results: 0,
            loading: false
          });
        }
      }
    });
  }

  // ----Search Area----
  onIDBlur = (e) => {
    this.setState({ res_search_id: e.target.value });
  }

  onDescBlur = (e) => {
    this.setState({ res_search_desc: e.target.value });
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
    var selCheckBox = e.target.value;
    var ifChecked = e.target.checked;
    ifChecked? ifChecked=1:ifChecked=0;
    if(selCheckBox==='KM'){
      this.setState({ res_search_km: ifChecked });
    } else if(selCheckBox==='KS'){
      this.setState({ res_search_ks: ifChecked });
    } else if(selCheckBox==='WG'){
      this.setState({ res_search_wg: ifChecked });
    };
  }

// -------collect searching criteria for further action
  prepSearchParams = () => {
    const { res_search_id, res_search_desc, startValue, endValue, res_search_km, res_search_ks, res_search_wg } = this.state;

    let urlParams = '';
    if( res_search_id !== null&&res_search_id !== '' ){
      urlParams += '&id=' + res_search_id;
    };
    if( res_search_desc !== null&&res_search_desc !== '' ){
      urlParams += '&description=' + res_search_desc;
    };
    if( startValue !== null ){
      urlParams += '&startdate=' + startValue;
    };
    if( endValue !== null ){
      urlParams += '&enddate=' + endValue;
    };

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

  onSearch = () => {
    this.setState(state=>({ loading: true }))
    let url_res_search = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page=1';
  
    let searchParams = this.prepSearchParams();
    this.setState({ current_params: searchParams });
    if(searchParams !== null && searchParams !== ''){

      //----to be modified based on server's responce
      url_res_search += searchParams;
      fetchData( url_res_search, 'get', null, response => {
        if(response.ifSuccess){
          let res = response.result;
          if(res.status === 200){
            this.setState({
              resultList: res.data,
              disableEditBtn: true,
              current_page: 1,
              total_results: res.total,
              loading: false
            })
          } else if (res.status === 555) {
            this.setState({
              remarks: '',
              resultList: [],
              disableEditBtn: true,
              total_results: 0,
              loading: false
            })
          }
        }
        
      });
    } else {
      this.componentWillMount();
    }
  }

  handlePageChange= page=>{
    this.setState(state=>({ current_page: page, loading: true }))
    let pagin_url = sessionStorage.getItem('serverPort') + 'access_rule/search/'+sessionStorage.getItem('@userInfo.id')+'?page='+page;
    let searchParams = this.state.current_params;
    if(searchParams !== null && searchParams !== ''){
      pagin_url += searchParams;
    }

    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
          let res = response.result;
          if(res.status === 200){
            this.setState({
              resultList: res.data,
              disableEditBtn: true,
              total_results: res.total,
              loading: false
            })
        
          } else if (res.status === 555) {
            this.setState({
              resultList: [],
              disableEditBtn: true,
              total_results: 0,
              loading: false
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

    // ---------waiting for api
    let delete_url = sessionStorage.getItem('serverPort')+'access_rule/delete';

    let delRecords = {
      id: this.state.selectedRowKeys, //---will be an array of IDs
      deletedBy: sessionStorage.getItem('@userInfo.id')
    };
  
    fetchData(delete_url,'post', delRecords, response => { 
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          if(res.total===null){
            this.setState(state=>{
              let newResultList = state.resultList;
              state.selectedRows.forEach(item=>{ 
                let index = newResultList.indexOf(item);
                if (index > -1) {
                  newResultList.splice(index,1);
                }
              })
              return { resultList: newResultList, selectedRows: [], selectedRowKeys: [], disableEditBtn: true }
            });
            message.success("Delete successfully");
          }else{
            message.warning("Failed to delete. Please ensure no resource has been assigned with selected Access Rule.");
          }
          // this.handlePageChange(this.state.current_page);
        } else {
          message.error("Delete request denied");
        };
      }
      
    });
  }

  onCancelDelete = () => {
    message.warning("Delete request cancelled");
  }

  // -------Update individual resource
  showInfoForm = (record) => {
    this.setState(state=>({ showInfoForm: true, selRecord: record }));
  };

  onCloseInfoForm = () => {
    this.setState({ showInfoForm: false });
  }

  handleInfoForm = (updates) => {
    let single_url = sessionStorage.getItem('serverPort')+'access_rule/update';
    
    fetchData(single_url,'post',updates,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          // console.log(" see the form data - ",form_data);
          let newRecord = this.state.selRecord;
          newRecord.description = updates.description;
          newRecord.areaId = updates.areaId;
          newRecord.instId = updates.inst;
          newRecord.instIdList = updates.inst;
          newRecord.sectionIdList = updates.section;
          newRecord.rankIdList = updates.rank;
          newRecord.modifiedAt = res.data.modifiedAt;
  
          this.setState(state=>{ 
            let newResultList = state.resultList; 
            newResultList.splice(newResultList.indexOf(state.selRecord),1,newRecord);
            return { resultList: newResultList, selRecord: newRecord }
          })
  
          message.success("Success Update ");
          // this.handlePageChange(this.state.current_page);
        } else {
          message.warning("Fail to update");
        };
  
        this.setState({ showInfoForm: false });
      }
    });
  };

  getInstitutions =()=>{
    let institutions_url =sessionStorage.getItem('serverPort')+'institutions/all';
    fetchData(institutions_url,'get',null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({ institution: res.data.sort((a,b) => (a.instName > b.instName) ? 1 : ((b.instName > a.instName) ? -1 : 0)) }));
        }
      }
    });
  }  

  getSections = () =>{
      let sections_url =sessionStorage.getItem('serverPort')+'sections/all';
      fetchData(sections_url,'get',null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
            this.setState(state=>({ section: res.data.sort((a,b) => (a.sectionName > b.sectionName) ? 1 : ((b.sectionName > a.sectionName) ? -1 : 0)), allSectionIds: res.data.map(item=>{ return item.id }) }));
          }
        }
      });
  }

  getRank = () =>{
      let rank_url = sessionStorage.getItem('serverPort')+'ranks/all';
      fetchData(rank_url,'get',null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.status===200){
              this.setState(state=>({ ranking: res.data.sort((a,b) => (a.rankName > b.rankName) ? 1 : ((b.rankName > a.rankName) ? -1 : 0)), allRankIds: res.data.map(item=>{ return item.id }) }));
          }
        }
      });
  }

 
  render(){
    const { Content } = Layout;
    const { resultList, startValue, endValue, endOpen, disableEditBtn, visiblepop, showInfoForm, current_page, total_results, selectedRowKeys, selectedRows } = this.state;
    const table_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:intl.get('@GENERAL.TYPE'), 
                          dataIndex: 'areaId', 
                          render: (text) => text===1? (intl.get('@RESOURCES_SHOWALL.K-MARKET')): (text===2? (intl.get('@RESOURCES_SHOWALL.K-SQUARE')): (text===3? (intl.get('@RESOURCES_SHOWALL.WISDOM-GALLERY')):'Unknown') ) }, 
                          {key: 3, title:intl.get('@GENERAL.DESCRIPTION'),dataIndex:'description'},
                          {key: 4, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '編輯日期':'Modified Date'), 
                          dataIndex: 'modifiedAt',          
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},
                          // {key: 4, 
                          // title:(sessionStorage.getItem('lang')==='zh_TW'? '編輯日期':'Modified Date'), 
                          // dataIndex: 'modifiedAt',          
                          // render: (text) => moment(text).format("YYYY-MM-DD")},
                          // {key: 5, 
                          // title:(sessionStorage.getItem('lang')==='zh_TW'? '創建日期':'Created Date'), 
                          // dataIndex: 'createdAt',          
                          // render: (text) => moment(text).format("YYYY-MM-DD")},      
                          ];
    const rowSelection = {
      selectedRowKeys,
      selectedRows,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedRowKeys,  selectedRows});
        selectedRows.length > 0 ? this.setState({ disableEditBtn: false }) : this.setState({ disableEditBtn: true });
      },
    };
  
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
              {intl.get('@ACCESS_RULE_MANAGEMENT.TITLE')}
            </div>
            <div style={{ display: 'inline-block', width: '35%', textAlign: 'right' }}>
              <Button shape="round" type="primary" href="#/adminconsole/accessrule/edit" ><Icon type="plus" /> {intl.get('@ACCESS_RULE_MANAGEMENT.NEW')}</Button>
            </div>
          </h1>
          <div className="cms-white-box">
              <div className="res_search">
              <h5>{intl.get('@RES_MANAGEMENT.SEARCH')}</h5>
              <div style={{ width:'50%' }}><Input className="res-search-input" allowClear placeholder="ID" onBlur={this.onIDBlur} /></div>
              <div style={{ width:'50%' }}><Input className="res-search-input" allowClear placeholder={sessionStorage.getItem('lang')==="zh_TW"? "描述":"Description"} onBlur={this.onDescBlur} /></div>
             
              <div style={{ margin: '8px 0' }}>
                <DatePicker
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD"
                  value={startValue}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "起始":"Start"}
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
                <span> ~ </span>
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  value={endValue}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "結束":"End"}
                  onChange={this.onEndChange}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              </div>

              <div style={{ margin: '8px 0' }}>
              <Checkbox className="res_chkbx" value="KM" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
              <Checkbox className="res_chkbx" value="KS" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-SQUARE')}</Checkbox>
              <Checkbox className="res_chkbx" value="WG" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
              </div>

              <div style={{ textAlign: 'right', margin: '8px 0' }} >
               
                <Button className="res_btn" shape="round" type="primary" onClick={this.onSearch}>{intl.get('@RES_MANAGEMENT.SEARCH')}</Button>
              </div>
            </div>

            <div style={{ padding: '4px' }}>
              <h5>{intl.get('@RES_MANAGEMENT.RESULTS')}</h5>
              <Table 
              style={{ paddingTop: '16px' }}
              loading={this.state.loading}
              rowKey={record=>record.id}
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
                  <Button className="res_btn" shape="round" disabled={disableEditBtn} type="danger">{intl.get('@GENERAL.DELETE')}</Button>
                </Popconfirm>
                 {/* ----Updated on 20190603 */}
                 {/* <Button className="res_btn" shape="round" disabled={disableEditBtn} type="primary" onClick={this.onClickRecords}>{intl.get('@RES_MANAGEMENT.EDIT')}</Button> */}
                </div>
            </div>

            <Drawer
              id = "drawer-indiv-info"
              title={intl.get('@ACCESS_RULE_MANAGEMENT.DETAILS')}
              width='45%'
              onClose={this.onCloseInfoForm}
              destroyOnClose={true}
              visible={showInfoForm}
            >
              <WrappedAccUpdateForm 
              handleInfoForm={this.handleInfoForm} 
              selRecord={this.state.selRecord} 
              institution={this.state.institution}
              section={this.state.section}
              ranking={this.state.ranking}
              allSectionIds={this.state.allSectionIds}
              allRankIds={this.state.allRankIds}
              />
            </Drawer>

          </div>
        </Content>
      </div>
    )
  }
}