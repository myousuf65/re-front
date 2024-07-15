//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190515 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, List, message, Breadcrumb, Icon, Input, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';
import { throttle, checkImgsByName } from './authimg';
import ResourceShare from './resources_share';

const tempDoc = process.env.PUBLIC_URL + '/images/document.png';
const tempVideo = process.env.PUBLIC_URL + '/images/video.png';
const tempFavourite = process.env.PUBLIC_URL + '/images/icon-like.png';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';
const tempDownload = process.env.PUBLIC_URL+'/images/icon-download.png';
export default class ResourcesCate extends React.Component {

    state = { 
        homeCate: [], 
        selCate: this.props.selCate, 
        routes: [], 
        subCate: [], 
        data: [], 
        current: 1, 
        total_results: 0, 
        loadingCateRoute: false, 
        loadingCateResource: false, 
        searchMode: false, 
        searchWord: null ,
        selResRecord: {},
        showModal: false,
    };

    componentWillMount() {
        let winHref = window.location.href;
        let selCateId = parseInt(winHref.slice(winHref.lastIndexOf("resources/category/")+19),10);

        if(selCateId > 0 && this.props.selCate !== selCateId){
            // this.props.handleCateShortcut(selCateId);
            this.loadCatedRes(selCateId);
        }else{
            this.loadCatedRes(this.props.selCate);
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selCate !== null && nextProps.selCate !== undefined && nextProps.selCate !== this.state.selCate) {
            this.setState(state => ({
                selCate: nextProps.selCate,
                searchWord: null,
                current: 1,
            }));

            this.loadCatedRes(nextProps.selCate);
        }
    }

    componentDidMount() {
        checkImgsByName('auth-img');
        window.addEventListener('scroll', this.onScroll, false);
    }

    onScroll = (fn) => {
        throttle(checkImgsByName('auth-img'));
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll, false);
    }

    loadCatedRes = (selCate) => {
        if (selCate === 1) {
            this.setState(state => ({
                selCate: 1,
                current: 1
            }));
            window.location.assign(`#/resources/category`);

            let cateList = JSON.parse(sessionStorage.getItem('@cateList')) || [];
            let firstLevelCate = cateList.map(icate => {
                let cateObj = { id: icate.id, nameEn: icate.nameEn, nameTc: icate.nameTc };
                return cateObj;
            });
            this.setState({
                data: [],
                total_results: 0,
                routes: [],
                subCate: firstLevelCate,
            });
        } else {
            this.getCateRoute(selCate);
            this.getCatedResource(selCate);
        }
    }

    getCateRoute = (selCate) => {
        // ---------get sub-category list & path based on category
        this.setState(state => ({ loadingCateRoute: true }));
        let res_url = sessionStorage.getItem('serverPort') + 'category/search?categoryId=' + selCate + '&userId=' + sessionStorage.getItem('@userInfo.id')
        fetchData(res_url, 'get', null, response => {
            if (response.ifSuccess) {
                let res = response.result;
                if (res.status === 200 && Array.isArray(res.pathObject)) {
                    let subCate_arr = [];

                    //   if (res.data === {}){
                    //   } else if (res.data.children===null){
                    //   } else {
                    //       subCate_arr = res.data.children;
                    //   }

                    if (Array.isArray(res.data.children)) {
                        subCate_arr = res.data.children;
                    }

                    this.setState({
                        routes: res.pathObject,
                        subCate: subCate_arr,
                        loadingCateRoute: false
                    });
                } else {
                    message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                    setTimeout(() => { window.location.replace('#/home') }, 2000);
                };
            }
        });
    }

    getCatedResource = (selCate) => {
        // ---------get resources list based on category
        this.setState(state => ({ data: [], loadingCateResource: true }));
        let catedRes_url = sessionStorage.getItem('serverPort') + 'resource/getByCategoryId?user=' + sessionStorage.getItem('@userInfo.id') + '&categoryId=' + selCate + '&page=' + this.state.current;
        fetchData(catedRes_url, 'get', null, response => {
            if (response.ifSuccess) {
                let res = response.result;
                if (res.status !== 200) {
                    message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                    setTimeout(() => { window.location.replace('#/home') }, 2000);
                } else {
                    this.setState({ data: res.data, total_results: res.total, loadingCateResource: false });
                };
            }
        });
    }

    handleBreadcrumbRoutes = (cate) => {
        let currentLang = sessionStorage.getItem('lang');
        let route = (
            <Breadcrumb.Item key={cate.id} onClick={(e) => { this.handleBreadcrumbClick(e, cate.id) }}>
                {/* eslint-disable-next-line */}
                <a style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{currentLang === 'zh_TW' ? cate.nameTc : cate.nameEn}</a>
            </Breadcrumb.Item>
        )
        return route;
    }

    handleBreadcrumbClick = (e, cateId) => {
        this.props.handleCateShortcut(cateId);
    }

    handleBreadcrumbHome = () => {
        this.props.handleCateShortcut(1);
    }

    handlePageChange = page => {
        if (this.state.searchWord) {
            this.handleSearchPageChange(page);
        } else {
            this.handleListPageChange(page);
        };
    };

    handleListItemThumb = (item) => {
        var listItemThumb = (
            <a href={`#/resourcedetails/?id=${item.id}`}>
                <div className={item.type === 'VIDEO' ? "video" : "document"} >
                    <img
                        key={item.id}
                        style={{ width: '100%', height: 'auto', maxHeight: '100%' }}
                        name="auth-img"
                        data-alt="0"
                        data={item.thumbnail}
                        src={item.type === 'VIDEO' ? tempVideo : tempDoc}
                        alt={item.type}
                    />
                </div>
            </a>
        )

        return listItemThumb;
    }

    handleListItemLink = (item) => {
        var listItemLink;
        if (item.type === 'PDF') {
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="download">{intl.get('@GENERAL.DOWNLOAD')}</a>)
        } else if (item.type === 'VIDEO') {
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="view">{intl.get('@GENERAL.VIEW')}</a>)
        } else {
            listItemLink = (<a href={`#/resourcedetails/?id=${item.id}`} className="view">{intl.get('@GENERAL.VIEW')}</a>)
        };
        return listItemLink;
    }

    onClickCate = (urlId) => {
        if (!urlId) {

        } else {
            this.props.handleCateShortcut(urlId);
        }
    }

    handleFavor = (selRecord) => {
        message.loading(`Add [${sessionStorage.getItem('lang') === 'zh_TW' ? selRecord.titleTc : selRecord.titleEn}] to My Votes`, 3)

        let newFavour = {
            resourceId: selRecord.id,
            userId: sessionStorage.getItem("@userInfo.id"),
        }

        let add2MyFavor_url = sessionStorage.getItem('serverPort') + 'resource/favourites/add';
        fetchData(add2MyFavor_url, 'post', newFavour, response => {
            if (response.ifSuccess) {
                let res = response.result;
                if (res.status === 200) {
                    message.success("Voted.");
                } else {
                    message.error("Failed to Add.")
                }
            }
        })
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
    // ----20200604
    onSearch = (resKeyword) => {
        this.setState({ searchWord: resKeyword }, () => {
            if (!resKeyword) {
                this.loadCatedRes(this.props.selCate);
            } else {
                this.handleSearchPageChange(1);
            }
        });
    }

    handleSearchPageChange = page => {
        this.setState({ current: page, data: [], loadingCateResource: true });

        let cateSearch_url = encodeURI(`${sessionStorage.getItem('serverPort')}resource/searchByName?user=${sessionStorage.getItem('@userInfo.id')}&categoryId=${this.props.selCate}&searchWord=${this.state.searchWord}&page=${page}`);

        fetchData(cateSearch_url, 'get', null, response => {
            if (response.ifSuccess) {
                let res = response.result;

                if (res.status === 200 && Array.isArray(res.data)) {
                    this.setState({ data: res.data, total_results: res.total, loadingCateResource: false });
                    checkImgsByName('auth-img')
                } else {
                    this.setState(state => ({ loadingCateResource: false }));
                    if (res.status !== 200) { message.warning(`(${res.status}) ${res.msg}`); } else { this.setState({ total_results: 0 }) }
                };

            } else {
                this.setState(state => ({ loadingCateResource: false }));
                message.error(response.result.status);
            }
        })
    }

    handleListPageChange = page => {
        // ---------get resources list based on category
        this.setState(state => ({ loadingCateResource: true }));
        let catedRes_url = sessionStorage.getItem('serverPort') + 'resource/getByCategoryId?user=' + sessionStorage.getItem('@userInfo.id') + '&categoryId=' + this.state.selCate + '&page=' + page;
        fetchData(catedRes_url, 'get', null, response => {
            if (response.ifSuccess) {
                let res = response.result;
                if (res.status !== 200) {
                    message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                    setTimeout(() => { window.location.replace('#/home') }, 2000);
                } else {
                    this.setState({ data: res.data, total_results: res.total, current: page, loadingCateResource: false });
                };
            }
        });
    }

    handleClose = () =>{
        this.setState({ selResRecord: {}, showModal: false });
    }

    render() {
        const { data, subCate, total_results, current, routes, loadingCateResource, loadingCateRoute, searchWord, selResRecord, showModal } = this.state;
        const accessMode = getAccessMode();
        const selCate = routes.slice(-1).pop();
        const paginprops = {
            size: accessMode === 3 ? "small" : "",
            pageSize: 20,
            defaultCurrent: 1,
            current,
            position: 'bottom',
            total: total_results,
            showTotal: (total, range) => accessMode === 3 ? `Total ${total}` : `${range[0]}-${range[1]} of ${total} records`,
            onChange: this.handlePageChange,
        }

        return (
            <div className="page-content top-line">
                <div className="container page-resources">
                    <h1>
                        <Breadcrumb>
                            <Breadcrumb.Item key={0} onClick={() => { this.handleBreadcrumbHome() }}>
                                {/* eslint-disable-next-line */}
                                <a style={{ color: 'rgba(0, 0, 0, 0.65)' }}>{sessionStorage.getItem('lang') === 'zh_TW' ? '主 頁' : 'Home'}</a>
                            </Breadcrumb.Item>
                            {routes.map(iCate => { return this.handleBreadcrumbRoutes(iCate) })}
                        </Breadcrumb>
                    </h1>

                    <div className="resources-list clearfix">

                        <div hidden={this.props.selCate === 1} className="full-width-header" style={{ marginBottom: '1em' }} >
                            <div className="container clearfix">
                                <div className="search-bar">
                                    <label>{intl.get('@GENERAL.SEARCH')}</label>
                                    <Input.Search
                                        disabled={this.props.selCate === 1 || loadingCateRoute || loadingCateResource}
                                        style={{ display: 'inline' }}
                                        placeholder={intl.get('@RESOURCES_CATEGORY.SEARCH-REMARKS') + (selCate ? (sessionStorage.getItem('lang') === 'zh_TW' ? selCate.nameTc : selCate.nameEn) : '')}
                                        allowClear
                                        onSearch={this.onSearch}
                                        onPressEnter={e => this.onSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div hidden={searchWord ? true : (subCate.length > 0 ? false : true)}>
                            <List
                                key="subCate"
                                loading={loadingCateRoute || loadingCateResource}
                                itemLayout='horizontal'
                                dataSource={subCate}
                                renderItem={item => (
                                    <List.Item key={item.id} onClick={(e) => { this.handleBreadcrumbClick(e, item.id) }} >
                                        {/* eslint-disable-next-line */}
                                        <a style={{ color: 'rgba(0, 0, 0, 0.65)' }}><Icon style={{ fontSize: '20px', paddingRight: '5px' }} type="folder-open" theme="twoTone" /> {sessionStorage.getItem('lang') === 'zh_TW' ? item.nameTc : item.nameEn}</a>
                                    </List.Item>
                                )
                                }
                            />
                        </div>

                        <div hidden={data.length > 0 || searchWord ? false : (subCate.length > 0 ? true : false)}>
                            <List
                                key="catedRes"
                                header={searchWord ? <h5>{`${intl.get('@GENERAL.SEARCH')} "${searchWord}"`}</h5> : null}
                                bordered={searchWord}
                                loading={loadingCateRoute || loadingCateResource}
                                pagination={paginprops}
                                itemLayout='horizontal'
                                dataSource={data}
                                locale={{ emptyText: intl.get('@RESOURCES_CATEGORY.NO-ACCESS-RIGHT') }}
                                renderItem={item => (
                                    <List.Item>
                                        <div className="resources-box clearfix">
                                            <div className="left">
                                                {this.handleListItemThumb(item)}
                                            </div>
                                            <div className="right">
                                                <p>{moment(item.createdAt).format("YYYY-MM-DD")}</p>

                                                <p className="title">{sessionStorage.getItem('lang') === 'zh_TW' ? item.titleTc : item.titleEn}</p>
                                                <p className="CatPath">
                                                    {/* eslint-disable-next-line */}
                                                    <a style={{ paddingLeft: '0px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => this.onClickCate(item.catId[0])}>
                                                        {item.catpath.map(iPath => (`*${iPath} `))}
                                                    </a>
                                                </p>


                                                {/* {this.handleListItemLink(item)} */}
                                            </div>
                                            {/* eslint-disable-next-line */}
                                            <a className="icon-download" onClick={()=>this.handleDownload(item)} ><img src={tempDownload} alt="Download" title="Download Resource" /></a>
                                            {/* eslint-disable-next-line */}
                                            <a className="icon-popup-admin" data-rel="lightcase" onClick={()=>this.setState({ selResRecord: item, showModal: true })} ><img src={tempShare} alt="Share" title="Share with Others" /></a>
                                            {/* eslint-disable-next-line */}
                                            <a className="icon-my-favourites" onClick={() => this.handleFavor(item)}><img src={tempFavourite} alt="My-Vote" title="Add to My Votes" /></a>
                                        </div>
                                    </List.Item>
                                )
                                }
                            />
                        </div>

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