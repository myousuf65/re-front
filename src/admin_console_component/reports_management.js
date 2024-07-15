//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190826 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, DatePicker, Input, Button, Checkbox, message, Select, Tabs, TreeSelect, Divider, Tooltip, Icon } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';

import ReportSummaryInst from './reports_summary_inst.js';
import ReportSummaryRank from './reports_summary_rank.js';
import ReportSummaryStaff from './reports_summary_staff.js';
import ReportSummaryBlog from './reports_summary_blog.js';
import ReportSummaryRes from './reports_summary_res.js';
import ReportSummaryScore from './reports_summary_score.js';
import ReportSummaryMangement from './reports_summary_management.js';

const instGroup = require('../temp_json/report_instGroup.json');

export default class reportsManagement extends React.Component{
  state={ 
    startDate: moment().subtract(1,'months'),
    endDate: moment(),
    endOpen: false, 
    startDateK: null,
    endDateK: moment(),
    endOpenK: false, 
    instList: [],
    rankList: [],
    blogCateList: [],
    resCateList: [],
    paramInst1: null,
    paramInst2: null,
    paramInst3: null,
    paramRank: null,
    paramFullname: null,
    paramStaffNo: null,
    paramBlogCate: null,
    paramResCate: null,
    paramSubCates: 0,
    paramKM: 0,
    paramKS: 0,
    paramWG: 0,
    paramResIds: [],
    userGroupInfo: {},
    // paramSixMth: true,
  }

  componentDidMount(){
    this.getInstitutions();
    this.getRank();
    this.getBlogCate();
    this.getResCate();
  }

  getInstitutions=()=>{
    let institutions_url =sessionStorage.getItem('serverPort')+'institutions/report/all';
    fetchData(institutions_url,'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          var inst_arr = res.data.sort((a,b) => (a.instName > b.instName) ? 1 : ((b.instName > a.instName) ? -1 : 0));
          // ---update inst_arr with instGroup for inst Admin (20200422)
          inst_arr = inst_arr.map(inst=>(instGroup.find(o => o.id === inst.id) || inst));
          
          // ----get user group
          let getUserGroup_url = sessionStorage.getItem('serverPort')+'user/get/'+sessionStorage.getItem('@userInfo.id');
          fetchData(getUserGroup_url,'get', null, response1=>{
            let instList = [];
            let userGroupInfo = {};

            if(response1.ifSuccess){
              let res1 = response1.result;
              if(res1.status===200&&res1.data.groupId){
                userGroupInfo = res1.data;

                switch(res1.data.groupId){
                  case 3:
                    instList = inst_arr.filter(item=>item.id===res1.data.instId);
                    break;

                  case 5:
                    instList = inst_arr;
                    break;

                  default:
                    instList = [];
                };
              }
            }
            
            this.setState({ instList, userGroupInfo });
            
          });
        }
      }
    });
  }

  getRank=()=>{
    this.setState(state=>({ loadingRank: true }));
    let rank_url = sessionStorage.getItem('serverPort')+'ranks/all';
    fetchData(rank_url,'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({ rankList: res.data.sort((a,b) => (a.rankName > b.rankName) ? 1 : ((b.rankName > a.rankName) ? -1 : 0)) }));
        }
      }
    });
  }

  getBlogCate=()=>{
    this.setState(state=>({blogCateList: require('../temp_json/blog_allcates.json')}))
  }

  getResCate=()=>{
    let categoryTree = JSON.parse(sessionStorage.getItem('@cateList')) || [];
    if(categoryTree!==[]){
      let pre_cateList = categoryTree.map(iCate=>{
          return this.handleCateChildren(iCate);
      });
      this.setState(state=>({ resCateList: pre_cateList }));
    }else{
      this.setState(state=>({ resCateList: [] }));
    }
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
  disabledStartDate = startDate => {
    const endDate = this.state.endDate;
    if (!startDate || !endDate) {
      return false;
    };
    return startDate.valueOf() > endDate.valueOf();
  };

  disabledEndDate = endDate => {
    const startDate = this.state.startDate;
    if (!endDate || !startDate) {
      return false;
    }
    return endDate.valueOf() <= startDate.valueOf();
  };

  onPickerChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (value) => {
    this.onPickerChange('startDate', value);
  };

  onEndChange = value => {
    this.onPickerChange('endDate', value);
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


  // -------K-Rewards Date Range Picker
  disabledKStartDate = startDate => {
    const endDateK = this.state.endDateK;
    if (!startDate || !endDateK) {
      return false;
    };
    return startDate.valueOf() > endDateK.valueOf();
  };

  disabledKEndDate = endDate => {
    const startDateK = this.state.startDateK;
    if (!endDate || !startDateK) {
      return false;
    }
    return endDate.valueOf() <= startDateK.valueOf();
  };

  onKPickerChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onKStartChange = value => {
    this.onPickerChange('startDateK', value);
  };

  onKEndChange = value => {
    this.onPickerChange('endDateK', value);
  };

  handleKStartOpenChange = open => {
    if (!open) {
      this.setState({ endOpenK: true });
    }
  };

  handleKEndOpenChange = open => {
    this.setState({ endOpenK: open });
  };
  // -------end of K-Rewards Date Range Picker

  // -------Search Area
  onChangeInst1=(option)=>{
    
    this.setState(state=>({ paramInst1: option }));
   
    const { startDate, endDate} = this.state;
    if(startDate !== null && endDate !== null){
      if(option === null || option === undefined){
        let instList = this.state.instList;
        let defaultInst = {};

        if(instList.length>1){
          defaultInst = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
        }else if(instList.length===1){
          defaultInst = {
            key: this.state.instList[0].id,
            label: this.state.instList[0].instName
          }
        }

        if(defaultInst !== {}){
          this.setState(state=>({ option: defaultInst }))
          this.childInst.preByInstSummary(startDate, endDate, defaultInst);
        }else{
          message.warning('Please select an institution.', 2);
        }
      }else{
        this.childInst.preByInstSummary(startDate, endDate, option);
      }
    }else{
      message.warning('Please select report period.', 2);
    }




  }

  onChangeInst2=(option)=>{
    this.setState(state=>({ paramInst2: option }));
  }

  onChangeInst3=(option)=>{
    this.setState(state=>({ paramInst3: option }));
  }


  onChangeInst4=(option)=>{
    this.setState(state=>({ paramInst4: option }));
  }

  onChangeRank=(option)=>{
    this.setState(state=>({ paramRank: option }));
  }

  onFullnameBlur = (e) => {
    this.setState({ paramFullname: e.target.value });
  }

  onStaffNoBlur = (e) => {
    this.setState({ paramStaffNo: e.target.value });
  }

  onChangeBlogCate=(option)=>{
    this.setState(state=>({ paramBlogCate: option }));
  }

  handleCateChange = (value) => {
    this.setState(state=>({ paramResCate: value!==undefined&&value!==null? value:null }));
  }

  handleSubcateChange = (e) => {
    let ifChecked = e.target.checked;
    ifChecked? ifChecked=1:ifChecked=0;
    this.setState({ paramSubCates: ifChecked });
  }

  // -------Checkbox
  onCheckChange = (e) => {
    let selCheckBox = e.target.value;
    let ifChecked = e.target.checked;
    ifChecked? ifChecked=1:ifChecked=0;
    if(selCheckBox==='KM'){
      this.setState({ paramKM: ifChecked });
    } else if(selCheckBox==='KS'){
      this.setState({ paramKS: ifChecked });
    } else if(selCheckBox==='WG'){
      this.setState({ paramWG: ifChecked });
    };
  }

  onRefChildInst = (ref) => {
    this.childInst=ref;
  }

  onRefChildRank = (ref) => {
    this.childRank=ref;
  }

  onRefChildStaff = (ref) => {
    this.childStaff=ref;
  }

  onRefChildBlog = (ref) => {
    this.childBlog=ref;
  }

  onRefChildRes = (ref) => {
    this.childRes=ref;
  }

  onRefChildScore = (ref) => {
    this.childScore=ref;
  }

  onSearchInst=(e)=>{
    e.preventDefault();
    const { startDate, endDate, paramInst1 } = this.state;
    if(startDate !== null && endDate !== null){
      if(paramInst1 === null || paramInst1 === undefined){
        let instList = this.state.instList;
        let defaultInst = {};

        if(instList.length>1){
          defaultInst = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
        }else if(instList.length===1){
          defaultInst = {
            key: this.state.instList[0].id,
            label: this.state.instList[0].instName
          }
        }

        if(defaultInst !== {}){
          this.setState(state=>({ paramInst1: defaultInst }))
          this.childInst.preByInstSummary(startDate, endDate, defaultInst);
        }else{
          message.warning('Please select an institution.', 2);
        }
      }else{
        this.childInst.preByInstSummary(startDate, endDate, paramInst1);
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchRank=(e)=>{
    const { startDate, endDate, paramInst2, paramRank } = this.state;

    if(startDate !== null && endDate !== null){
      if(paramInst2 !== null && paramRank !== null){
        this.childRank.preByRankSummary(startDate, endDate, paramInst2, paramRank);
      }else{
        let defaultInst = {};
        let defaultRank = paramRank;

        if(paramInst2 === null || paramInst2 === undefined){
          let instList = this.state.instList;
  
          if(instList.length>1){
            defaultInst = {
              key: 0,
              label: intl.get('@GENERAL.ALL')
            }
          }else if(instList.length===1){
            defaultInst = {
              key: instList[0].id,
              label: instList[0].instName
            }
          }
          this.setState(state=>({ paramInst2: defaultInst }));
        }else{
          defaultInst = paramInst2;
        }

        if(defaultRank === null || defaultRank === undefined){
          defaultRank = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
          this.setState(state=>({ paramRank: defaultRank }));
        }

        if(defaultInst !== {}){
          // this.setState(state=>({ paramInst2: defaultInst }))
          this.childRank.preByRankSummary(startDate, endDate, defaultInst, defaultRank);
        }else{
          message.warning('Please select an institution.', 2);
        }
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchStaff=(e)=>{
    const { startDate, endDate, paramFullname, paramStaffNo } = this.state;

    if(startDate !== null && endDate !== null){
      if((paramFullname===null || paramFullname==="")&&(paramStaffNo===null || paramStaffNo==="")){
        message.warning('Please provide some staff information.', 2);
      }else{
        this.childStaff.preByStaffSummary(startDate, endDate, paramFullname, paramStaffNo);
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchBlog=(e)=>{
    const { startDate, endDate, paramBlogCate } = this.state;

    if(startDate !== null && endDate !== null){
      if(paramBlogCate === null || paramBlogCate === undefined){
        let defaultCate = {
          key: 0,
          label: intl.get('@GENERAL.ALL')
        }
        this.setState(state=>({ paramBlogCate: defaultCate }))
        this.childBlog.preByBlogSummary(startDate, endDate, defaultCate);
      }else{
        this.childBlog.preByBlogSummary(startDate, endDate, paramBlogCate);
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchRes=(e)=>{
    const { startDate, endDate, paramResCate, paramSubCates, paramKM, paramKS, paramWG, paramResIds } = this.state;
    
    if(startDate !== null && endDate !== null){
      if(!paramResCate&&paramResIds.length<1){
      // if(!paramResCate){
        // message.warning('Please nominate a category for resource.', 3);
        message.warning('Please nominate a category or resource id for resource.', 3);
      }else{
        
        // this.childRes.preByResSummary(startDate, endDate, paramResCate, paramSubCates, paramKM, paramKS, paramWG );
        this.childRes.preByResSummary(startDate, endDate, paramResCate, paramSubCates, paramKM, paramKS, paramWG, paramResIds );
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchMan=(e)=>{
   
    const { startDate, endDate, paramInst1 } = this.state;
    if(startDate !== null && endDate !== null){
      if(paramInst1 === null || paramInst1 === undefined){
        let instList = this.state.instList;
        let defaultInst = {};

        if(instList.length>1){
          defaultInst = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
        }else if(instList.length===1){
          defaultInst = {
            key: this.state.instList[0].id,
            label: this.state.instList[0].instName
          }
        }

        if(defaultInst !== {}){
          this.setState(state=>({ paramInst1: defaultInst }))
          this.childInst.preByInstSummary(startDate, endDate, defaultInst);
        }else{
          message.warning('Please select an institution.', 2);
        }
      }else{
        this.childInst.preByInstSummary(startDate, endDate, paramInst1);
      }
    }else{
      message.warning('Please select report period.', 2);
    }
  }

  onSearchScore=(e)=>{
    const { startDateK, endDateK, paramInst3 } = this.state;

    if(startDateK===null||startDateK===undefined){
      if(endDateK===null||endDateK===undefined){
        message.warning('Please select K-Rewards Report period.', 2);
      }else{
        let startDateK_preset = moment(endDateK).subtract(6,'months').subtract(-1,'days');
        if(paramInst3 === null || paramInst3 === undefined){
          let defaultInst = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
          this.setState(state=>({ paramInst3: defaultInst }));
          this.childScore.preByScoreSummary(startDateK_preset, endDateK, defaultInst);
        }else{
          this.childScore.preByScoreSummary(startDateK_preset, endDateK, paramInst3);
        }
      }
    }else{
        // ---collect inst info
        let selInst = paramInst3;
        if(paramInst3 === null || paramInst3 === undefined){
          let defaultInst = {
            key: 0,
            label: intl.get('@GENERAL.ALL')
          }
          this.setState(state=>({ paramInst3: defaultInst }));
          selInst = defaultInst;
        };

        if(endDateK===null||endDateK===undefined){
          message.warning('Please select K-Rewards Report period.', 2);
        }else{
        // check if duration is within 6 months
        let startDate_mile = moment(endDateK).subtract(6,'months').subtract(-1,'days');
        if( moment(startDateK).format('YYYY-MM-DD') < moment(startDate_mile).format('YYYY-MM-DD')){
          message.warning('Report period should NOT over 6 months.', 3);
        }else{
          this.childScore.preByScoreSummary(startDateK, endDateK, selInst);
        };
      }
    }
  }

  render(){
    const { Content } = Layout;
    const { TabPane } = Tabs;
    const { Option } = Select;
    const { startDate, endDate, endOpen, startDateK, endDateK, endOpenK, instList, rankList, blogCateList, resCateList, paramInst1, paramInst2, paramInst3, paramRank, paramFullname, paramStaffNo, paramBlogCate, paramResCate, userGroupInfo } = this.state;

    return(
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content">
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@REPORTS_MANAGEMENT.TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div className="res_search">
            <div style={{ margin: '8px 0px' }}>
                <DatePicker
                  disabledDate={this.disabledStartDate}
                  format="YYYY-MM-DD"
                  value={startDate}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "起始":"Start"}
                  onChange={this.onStartChange}
                  onOpenChange={this.handleStartOpenChange}
                />
                <span> ~ </span>
                <DatePicker
                  disabledDate={this.disabledEndDate}
                  format="YYYY-MM-DD"
                  value={endDate}
                  placeholder={sessionStorage.getItem('lang')==="zh_TW"? "結束":"End"}
                  onChange={this.onEndChange}
                  open={endOpen}
                  onOpenChange={this.handleEndOpenChange}
                />
              </div>
              {/* <Radio.Group></Radio.Group> */}
              <Tabs type="card" defaultActiveKey="1" >
                <TabPane key={1} tab="By Institution(s)">
                  <Select 
                  className="res-search-input"
                  placeholder={intl.get('@USER_MANAGEMENT.INSTITUTION')}
                  showSearch 
                  optionFilterProp="label"
                  labelInValue 
                  onChange={(option)=>this.onChangeInst1(option)}
                  >
                    {instList.length>1? <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>:null}
                    {instList.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option>))}
                  </Select>

                  <div style={{ textAlign: 'right', margin: '16px 0' }} >
                    <Button className="res_btn" shape="round" type="primary" disabled={instList.length===0} onClick={this.onSearchInst} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <ReportSummaryInst key="instSum" onRefChildInst={this.onRefChildInst} paramInst={paramInst1} userGroupInfo={userGroupInfo} />
                  </div>

                </TabPane>


                <TabPane key={2} tab="By Rank(s)">
                  <Select 
                  className="res-search-input"
                  style={{ maxWidth: '200px', marginRight: '8px' }}
                  placeholder={intl.get('@USER_MANAGEMENT.INSTITUTION')}
                  showSearch 
                  optionFilterProp="label" 
                  labelInValue 
                  onChange={(option)=>this.onChangeInst2(option)}
                  >
                    {instList.length>1? <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>:null}
                    {instList.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option>))}
                  </Select>
                  <Select 
                  className="res-search-input"
                  style={{ maxWidth: '200px' }}
                  placeholder={intl.get('@USER_MANAGEMENT.RANK')}
                  showSearch 
                  optionFilterProp="label" 
                  labelInValue 
                  onChange={(option)=>this.onChangeRank(option)}
                  >
                    <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>
                    {rankList.map(item=>(<Option key={item.id} value={item.id} label={item.rankName}>{item.rankName}</Option>))}
                  </Select>

                  <div style={{ textAlign: 'right', margin: '16px 0' }} >
                    <Button className="res_btn" shape="round" type="primary" disabled={instList.length===0} onClick={this.onSearchRank} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <ReportSummaryRank key="rankSum" onRefChildRank={this.onRefChildRank} paramFrom={startDate} paramTo={endDate} paramInst={paramInst2} paramRank={paramRank} />
                  </div>
                </TabPane>

                <TabPane key={3} tab="By Staff(s)">
                  <Input className="res-search-input" style={{ marginRight: '8px' }} allowClear placeholder={intl.get('@USER_MANAGEMENT.FULLNAME')} onBlur={this.onFullnameBlur} />
                  <Input className="res-search-input" allowClear placeholder={intl.get('@USER_MANAGEMENT.STAFF-NO')} onBlur={this.onStaffNoBlur} />
                  
                  <div style={{ textAlign: 'right', margin: '16px 0' }} >
                    <Button className="res_btn" shape="round" type="primary" onClick={this.onSearchStaff} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <ReportSummaryStaff key="staffSum" onRefChildStaff={this.onRefChildStaff} paramFrom={startDate} paramTo={endDate} paramFullname={paramFullname} paramStaffNo={paramStaffNo} userGroupInfo={instList.length===1? instList[0]:{}} />
                  </div>
                </TabPane>

                {instList.length<2? null:
                  <TabPane key={4} tab="Mini Blog">
                    <Select 
                    className="res-search-input"
                    placeholder={intl.get('@MINI_BLOG.CATEGORY')}
                    showSearch 
                    optionFilterProp="label" 
                    labelInValue 
                    onChange={(option)=>this.onChangeBlogCate(option)}
                    >
                      <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>
                      {blogCateList.map(icate=>{return <Option key={icate.id} label={sessionStorage.getItem('lang')==='zh_TW'? icate.category_c : icate.category}>{sessionStorage.getItem('lang')==='zh_TW'? icate.category_c : icate.category}</Option>})}                    
                    </Select>
                                      
                    <div style={{ textAlign: 'right', margin: '16px 0' }} >
                      <Button className="res_btn" shape="round" type="primary" onClick={this.onSearchBlog} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                    </div>

                    <div style={{ padding: '4px' }}>
                      <ReportSummaryBlog key="blogSum" onRefChildBlog={this.onRefChildBlog} paramFrom={startDate} paramTo={endDate} paramBlogCate={paramBlogCate} />
                    </div>
                  </TabPane>
                }
                {instList.length<2? null:
                  <TabPane key={5} tab="Resources">
                  <div>
                    <Select disabled={paramResCate} style={{ margin: '8px 0' }} allowClear mode="tags" onBlur={(value)=>this.setState({ paramResIds: value })} placeholder={sessionStorage.getItem('lang')==='zh_TW'? '資源ID (e.g., 11111,22222,...)':'Resource ID(s) (e.g., 11111,22222,...)'} tokenSeparators={[',']} />
                  </div>

                  <Divider dashed />

                  <div>
                    {/* <label style={{ marginRight: '4px', color: '#f5222d', fontFamily: 'SimSun, sans-serif', fontSize: '14px', lineHeight: '1px' }}>*</label> */}
                    <TreeSelect 
                    disabled={this.state.paramResIds.length>0}
                    className="res-search-input"
                    placeholder={intl.get('@GENERAL.CATEGORY')}
                    dropdownStyle={{ maxHeight: '400px', overflow: 'auto' }}
                    dropdownMatchSelectWidth={true}
                    allowClear={true}
                    showSearch={false}
                    treeData={resCateList}
                    onChange={this.handleCateChange}
                    // multiple={true}
                    showCheckedStrategy={TreeSelect.SHOW_CHILD}
                    />
                    <Checkbox style={{ maxWidth: '200px', marginLeft: '8px'}} disabled={!paramResCate||this.state.paramResIds.length>0} value="SubCate" onChange={this.handleSubcateChange} >
                      {intl.get('@RES_MANAGEMENT.SUBCATEGORIES')}
                    </Checkbox>
                  </div>
                  <div style={{ margin: '8px 0' }}>
                    <Checkbox className="res_chkbx" disabled={this.state.paramResIds.length>0} value="KM" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-MARKET')}</Checkbox>
                    <Checkbox className="res_chkbx" disabled={this.state.paramResIds.length>0} value="KS" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.K-SQUARE')}</Checkbox>
                    <Checkbox className="res_chkbx" disabled={this.state.paramResIds.length>0} value="WG" onClick={this.onCheckChange}>{intl.get('@RES_MANAGEMENT.WISDOM-GALLERY')}</Checkbox>
                  </div>
                                                      
                  <div style={{ textAlign: 'right', margin: '16px 0' }} >
                    <Button className="res_btn" shape="round" type="primary" onClick={this.onSearchRes} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                  </div>

                  <div style={{ padding: '4px' }}>
                    <ReportSummaryRes key="resSum" onRefChildRes={this.onRefChildRes} paramFrom={startDate} paramTo={endDate} paramResCate={paramResCate} />
                  </div>
                </TabPane>
                }

                {instList.length<2? null:
                  <TabPane key={6} tab="K-Rewards">
                    <Select 
                    className="res-search-input"
                    placeholder={intl.get('@USER_MANAGEMENT.INSTITUTION')}
                    showSearch 
                    optionFilterProp="label"
                    labelInValue 
                    onChange={(option)=>this.onChangeInst3(option)}
                    >
                      {instList.length>1? <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>:null}
                      {instList.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option>))}
                    </Select>

                    <div style={{ margin: '8px 0' }}>
                      K-Rewards Period:&nbsp;
                      <Tooltip title="for K-Rewards Report Only">
                        <Icon type="question-circle-o" /> &nbsp;
                      </Tooltip>
                      <DatePicker
                        disabledDate={this.disabledKStartDate}
                        format="YYYY-MM-DD"
                        value={startDateK}
                        placeholder={(sessionStorage.getItem('lang')==="zh_TW"? "起始: ":"Start ")+(endDateK? moment(endDateK).subtract(6,'months').subtract(-1,'days').format("YYYY-MM-DD"):'')}
                        onChange={this.onKStartChange}
                        onOpenChange={this.handleKStartOpenChange}
                      />
                      <span> ~ </span>
                      <DatePicker
                        disabledDate={this.disabledKEndDate}
                        format="YYYY-MM-DD"
                        value={endDateK}
                        placeholder={sessionStorage.getItem('lang')==="zh_TW"? "結束":"End"}
                        onChange={this.onKEndChange}
                        open={endOpenK}
                        onOpenChange={this.handleKEndOpenChange}
                      />
                    </div>

                    <div style={{ textAlign: 'right', margin: '16px 0' }} >
                      <Button className="res_btn" shape="round" type="primary" disabled={instList.length===0} onClick={this.onSearchScore} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                    </div>

                    <div style={{ padding: '4px' }}>
                      <ReportSummaryScore key="scoreSum" onRefChildScore={this.onRefChildScore} paramInst={paramInst3} />
                    </div>

                  </TabPane>

                  
                }
                {

                    <TabPane key={7} tab="Management">
                    <Select 
                    className="res-search-input"
                    placeholder={intl.get('@USER_MANAGEMENT.INSTITUTION')}
                    showSearch 
                    optionFilterProp="label"
                    labelInValue 
                    onChange={(option)=>this.onChangeInst1(option)}
                    >
                      {instList.length>1? <Option key={0} value={0} label={intl.get('@GENERAL.ALL')}>{intl.get('@GENERAL.ALL')}</Option>:null}
                      {instList.map(item=>(<Option key={item.id} value={item.id} label={item.instName}>{item.instName}</Option>))}
                    </Select>
                    <div style={{ textAlign: 'right', margin: '16px 0' }} >
                      <Button className="res_btn" shape="round" type="primary" disabled={instList.length===0} onClick={this.onSearchMan} >{intl.get('@USER_MANAGEMENT.SEARCH')}</Button>
                    </div>
                    <div style={{ padding: '4px' }}>
                    <ReportSummaryMangement key="instSum" onRefChildInst={this.onRefChildInst} paramInst={paramInst1} userGroupInfo={userGroupInfo} />
                    
                    </div>

                    </TabPane>

                }

              </Tabs>
              <Divider />
            </div>

            <div style={{ padding: '4px' }}>
            </div>
          </div>

        </Content>
      </div>
    )
  }
}