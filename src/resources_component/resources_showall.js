//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190515 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, List, message, Modal, Select, Icon, Input } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { MdTranslate } from "react-icons/md";

import { fetchData, getAccessMode } from '../service/HelperService';

import {checkImgsByName, throttle} from './authimg';
import ResourceShare from './resources_share';

const tempDoc = process.env.PUBLIC_URL + '/images/document.png';
const tempVideo = process.env.PUBLIC_URL + '/images/video.png';
const tempFavourite = process.env.PUBLIC_URL + '/images/icon-like.png';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';
const tempDownload = process.env.PUBLIC_URL+'/images/icon-download.png';
const Option = Select.Option;
const Search = Input.Search;

export default class ResourcesShowAll extends React.Component{

    state = { 
        area: '@RESOURCES_SHOWALL.WISDOM-GALLERY', 
        areaId: 0,
        data: [], 
        current: 1, 
        total_results: 0, 
        loading: false, 
        selRecord: {}, 
        modalVisible: false, 
        confirmLoading: false,
        selSorter: 'created_at:desc',
        searchWord: '',
        selResRecord: {},
        showModal: false,
    };

    componentWillMount(){
        let areaInfo = window.location.href.slice(window.location.href.lastIndexOf("/")+1);
        if(areaInfo==='kmarket'){
            this.setState({ area: '@RESOURCES_SHOWALL.K-MARKET', areaId: 1 });
        }else if(areaInfo==='ksquare'){
            this.setState({ area: '@RESOURCES_SHOWALL.K-SQUARE', areaId: 2 });
        }else if (areaInfo==='wisdomgallery'){
            this.setState({ area: '@RESOURCES_SHOWALL.WISDOM-GALLERY', areaId: 3 });
        };
    }

    componentDidMount(){
        this.handlePageChange(1);
        window.addEventListener('scroll', this.onScroll, false);
    }

    onScroll=(fn)=>{
        throttle(checkImgsByName('auth-div-img'))
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll, false);
    }

    handlePageChange = page => {
        this.setState(state=>({ loading: true, current: page }));
        const { areaId, selSorter, searchWord } = this.state;
        
        // let res_url = sessionStorage.getItem('serverPort')+'resource/getByAreaId?user='+sessionStorage.getItem('@userInfo.id')+'&area_id='+area_id+'&page='+page;
        let res_url = encodeURI(sessionStorage.getItem('serverPort')+'resource/getByAreaId?user='+sessionStorage.getItem('@userInfo.id')+'&area_id='+areaId+'&searchWord='+(searchWord||'')+'&sort_by='+selSorter+'&page='+page);
        fetchData(res_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
            
              if(res.status===200&&Array.isArray(res.data)){
                this.setState({ data: res.data, total_results: res.total, loading: false });
                checkImgsByName('auth-img')
              } else {
                this.setState(state=>({ data: [], loading: false }));
              }
            }else{
              this.setState(state=>({ data: [], loading: false }));
            }
        });
    }

    handleListItemThumb = (item) => {
        var listItemThumb = (
            <a href={`#/resourcedetails/?id=${item.id}`}>
                <div className={item.type==='VIDEO'? "video":"document"} >
                    <img
                    key={item.id}
                    style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
                    name="auth-img" 
                    data-alt="0"
                    data={item.thumbnail} 
                    src={item.type==='VIDEO'? tempVideo:tempDoc} 
                    alt={item.type}
                    />
                </div>
            </a>
        )
        
        return listItemThumb;
    }

    // .resources-box .left .document {
    // /* width: auto; */
    // height: 70px;
    // width: auto;
    // /* margin-top: 9px; */
    // margin: 9px;

    handleListItemDivThumb = item => {
        var listItemThumb = (
            <a href={`#/resourcedetails/?id=${item.id}`}>
                <div className={item.type==='VIDEO'? "video":"document"} >
                    <div 
                    style={{
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        height: 'inherit',
                        width: 'auto',
                        maxHeight: '100%',
                        backgroundImage: `url('${item.type==='VIDEO'? tempVideo:tempDoc}')`
                    }}
                    name="auth-div-img"
                    data-alt="0"
                    data={item.thumbnail}
                    alt={item.type}
                    />
                </div>
            </a>
        )
        
        return listItemThumb;
    }

    handleListItemLink = (item) => {
        var listItemLink;
        if (item.type==='PDF'){
            // eslint-disable-next-line
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="download"></a>)
        } else if(item.type==='VIDEO'){
            // eslint-disable-next-line
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="view"></a>)
        } else {
            // eslint-disable-next-line
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="view"></a>)
        };
        return listItemLink;
    }

    handleShare = (selRecord) => {
        this.setState(state=>({ selRecord, modalVisible: true }));
    }

    onRefChild = (ref) => {
        this.child = ref
    }

    handleOk = () => {
        this.setState({ confirmLoading: true })
        var send2User = this.child.handleSend();
        if(send2User===null){
            message.warning("Please nominate a user through Result Table.")
            setTimeout(() => {
                this.setState({
                    confirmLoading: false,
                });
                this.child.handleIceShare(false);
            }, 2000);
        }else{
            setTimeout(() => {
                this.setState(state=>({
                    selRecord: {}, 
                    modalVisible: false,
                    confirmLoading: false,
                }));
            }, 2000);
            let shareRes_url = sessionStorage.getItem('serverPort')+'resource/share/send/'+sessionStorage.getItem('@userInfo.id')
            fetchData(shareRes_url, 'post', send2User, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                
                  if(res.status===200){
                      message.success("Resource has been shared successfully.");
                      this.setState(state=>({ selRecord: {}, modalVisible: false, confirmLoading: false }));
                  }else{
                      message.warning("Your request was rejected by server.");
                      this.setState(state=>({ confirmLoading: false }));
                  }
                }else{
                  this.setState(state=>({ confirmLoading: false }));
                }
            })
        }
    }
    
    handleDownload=(selRecord)=>{
        
        let downloadRes ={
            resourceId: selRecord.id,
            resourceNamceEn: selRecord.titleEn,
            resourceNameTc: selRecord.titleTc
        };
      
        console.log('before add into session storage',sessionStorage.getItem('@downloadResource') );

        var getList = sessionStorage.getItem('@downloadResource');
      /*  var resultTable = getList ? JSON.parse(getList) : []; // <====
            let finalResource = downloadRes;
            resultTable.push({
            resource: finalResource
            });
       */
            var resultTable = getList ? JSON.parse(getList) : [];
            resultTable.push(downloadRes);


        // finalList = JSON.parse(sessionStorage.getItem('@downloadResource'));
        console.log('get session list to finalList', resultTable);
        // finalList.push(downloadRes);
        
        sessionStorage.setItem('@downloadResource',JSON.stringify(resultTable));

        message.success(`Add [${sessionStorage.getItem('lang')==='zh_TW'? selRecord.titleTc:selRecord.titleEn}]Added to download list`);
        console.log('After add into session storage',sessionStorage.getItem('@downloadResource') );
    
    }

    handleFavor=(selRecord)=>{
        message.loading(`Add [${sessionStorage.getItem('lang')==='zh_TW'? selRecord.titleTc:selRecord.titleEn}] to My Votes`, 3)
        
        let newFavour = {
            resourceId: selRecord.id,
            userId: sessionStorage.getItem("@userInfo.id"),
        }

        let add2MyFavor_url = sessionStorage.getItem('serverPort')+'resource/favourites/add';
        fetchData(add2MyFavor_url, 'post', newFavour, response=>{
            if(response.ifSuccess){
              let res = response.result;

              if(res.status===200){
                  message.success("Voted.");
              }else{
                  message.error("Failed to Add.");
              }
            }else{
              this.setState(state=>({ confirmLoading: false }));
            }
        })

    }

    handleCancel = () => {
        this.setState(state=>({ selRecord: {}, modalVisible: false, confirmLoading: false }));
    }

    onClickCate=(urlId)=>{
        if(urlId){ this.props.handleCateShortcut(urlId);}
    }

    handleSorter=(key)=>{
        this.setState({ selSorter: key }, ()=>this.handlePageChange(1));
    }

    onSearch=(resKeyword)=>{
        this.setState({ searchWord: resKeyword }, ()=>{this.handlePageChange(1)} );
    }

    handleClose = () =>{
        this.setState({ selResRecord: {}, showModal: false });
    }

    render(){
        const { data, current, total_results, loading, selResRecord, showModal, selSorter, searchWord } = this.state;
        const accessMode = getAccessMode();
        const paginprops = {
            size: accessMode===3?"small":"",
            pageSize: 20,
            defaultCurrent: 1,
            current,
            showQuickJumper: true,
            position: 'both',
            total: total_results,
            showTotal: (total, range) => accessMode===3?`Total ${total}`:`${range[0]}-${range[1]} of ${total} records`,
            onChange: this.handlePageChange,
        }
        message.config({
            // top: '20%',
            maxCount: 5
        })

        const children = [
            <Option key="created_at:desc"><Icon type="notification" style={{ paddingRight: '4px' }} /> {sessionStorage.getItem('lang')==='zh_TW'? '最新上傳': 'Latest Upload'} </Option>,
            <Option key="hit_rate:desc"><Icon type="fire" style={{ paddingRight: '4px' }} /> {sessionStorage.getItem('lang')==='zh_TW'? '最受歡迎': 'Popularity'} </Option>,
            <Option hidden={sessionStorage.getItem('lang')==='zh_TW'} key="title_en:asc"><Icon type="sort-ascending" style={{ paddingRight: '4px' }} /> Title (Alphabetical)</Option>,
            <Option key="title_en:desc"><MdTranslate style={{ marginRight: '4px' }} /> {sessionStorage.getItem('lang')==='zh_TW'? '標題(中文優先)': 'Title (Chinese Priority)'} </Option>,
        ];

        return(
            <div className="page-content top-line">
                <div className="container page-resources">
                    <h1>{intl.get(this.state.area)}</h1>
                    <div className="full-width-header page-administration-header">
                        <div className="container clearfix">
                            <div className="search-bar">
                                <label>{intl.get('@GENERAL.SEARCH')}</label>
                                <Search 
                                disabled={loading}
                                style={{ display: 'inline' }}
                                placeholder={intl.get('@RESOURCES_SHOWALL.SEARCH-REMARKS')}
                                allowClear
                                onSearch={this.onSearch}
                                onPressEnter={e=>this.onSearch(e.target.value)}
                                />
                            </div>

                            <div className="sort-bar-advance">
                            <label>{intl.get('@MINIBLOG_HOME.SORT-BY')}</label>
                            <Select
                            disabled={loading}
                            value={selSorter}
                            style={{ width: 'calc(100% - 80px)' }}
                            onChange={this.handleSorter}
                            >
                                {children}
                            </Select>
                            </div>
                        </div>
                    </div>

                    <div className="resources-list clearfix">
                    <List
                      pagination={paginprops}
                      header={searchWord? <h5>{`${intl.get('@GENERAL.SEARCH')} "${searchWord}"`}</h5>:null}
                      bordered={searchWord}
                      itemLayout='horizontal'
                      dataSource={data}
                      loading={loading}
                      renderItem={item => (
                          <List.Item>
                              <div className="resources-box clearfix">
                                <div className="left">
                                {/* {this.handleListItemThumb(item)} */}
                                {this.handleListItemDivThumb(item)}
                                </div>
                                <div className="right">
                                <p>{moment(item.createdAt).format("YYYY-MM-DD")}</p>
                                <p className="title">
                                    <a style={{ paddingLeft: '0px' }} href={`#/resourcedetails/?id=${item.id}`}>
                                        {sessionStorage.getItem('lang')==='zh_TW'? item.titleTc:item.titleEn}
                                    </a>
                                </p>

                                {/* -------will be replaced by the following */}
                              
                                <p className="CatPath">
                                {/* eslint-disable-next-line */}
                                <a style={{ paddingLeft: '0px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={()=>this.onClickCate(item.catId[0])}>
                                {item.catpath.map(iPath=>(`*${iPath} `))}</a>
                                </p>

                                </div>
                                {/* eslint-disable-next-line */}
                                <a className="icon-download" onClick={()=>this.handleDownload(item)} ><img src={tempDownload} alt="Download" title="Download Resource" /></a>
                                {/* eslint-disable-next-line */}
                                <a className="icon-popup-admin" data-rel="lightcase" onClick={()=>this.setState({ selResRecord: item, showModal: true })} ><img src={tempShare} alt="Share" title="Share with Others" /></a>
                                {/* eslint-disable-next-line */}
                                <a className="icon-my-favourites" onClick={()=>this.handleFavor(item)}><img src={tempFavourite} alt="My votes" title="Add to my votes" /></a>
                            </div>
                          </List.Item>
                      )
                      }
                    />

                    <Modal
                        title={`${intl.get("@GENERAL.SHARE")} ${sessionStorage.getItem('lang')==='zh_TW'? selResRecord.titleTc:selResRecord.titleEn}`}
                        bodyStyle={{ maxHeight: '80vh', overflow: 'auto' }}
                        width="75vw"
                        visible={showModal}
                        destroyOnClose
                        footer={null}
                        maskClosable={false}
                        centered
                        onCancel={this.handleClose}
                    >
                        <ResourceShare resourceId={selResRecord.id} handleClose={this.handleClose} />
                    </Modal>

                    
                    </div>
                </div>
                <BackTop />
            </div>
        )
    }
}