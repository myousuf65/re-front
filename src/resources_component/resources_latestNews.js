//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200422 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, List, message, Modal } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData, getAccessMode } from '../service/HelperService';

import {throttle, checkImgsByName} from './authimg.js';
import ResourceShare from './resources_share';

const tempDoc = process.env.PUBLIC_URL + '/images/document.png';
const tempVideo = process.env.PUBLIC_URL + '/images/video.png';
const tempFavourite = process.env.PUBLIC_URL + '/images/icon-like.png';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';

export default class ResourcesLatestNews extends React.Component{

    state = { 
        data: [], 
        current: 1, 
        total_results: 0, 
        loading: true,
        selResRecord: {},
        showModal: false,
    };

    componentDidMount(){
        this.getLatestNews(1);

        window.addEventListener('scroll', this.onScroll, false);
    }

    onScroll=()=>{
        throttle(checkImgsByName('auth-img'));
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll, false);
    }

    getLatestNews = page => {
        this.setState(state=>({ loading: true, current: page }));

        let res_url = sessionStorage.getItem('serverPort')+'resource/getlatest?user='+sessionStorage.getItem('@userInfo.id')+'&page='+page;
        fetchData(res_url, 'get', null, response => {
            if(response.ifSuccess){
                let res = response.result;

                if(res.status!==200){
                    this.setState({ data: [], loading: false });
                } else {
                    this.setState({ data: res.data, total_results: res.total, loading: false });
                    checkImgsByName('auth-img')
                };
            }else{
                this.setState({ data: [], total_results: 0, loading: false });
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
                    message.error("Failed to Add.")
                }
            }else{
                message.error("Failed to Add.")
            }
        })

    }

    onClickCate=(urlId)=>{
        if(urlId===undefined||urlId===null||urlId===''){

        }else{
            this.props.handleCateShortcut(urlId);
        }
    }

    handleClose = () =>{
        this.setState({ selResRecord: {}, showModal: false });
    }

    render(){
        const { data, current, total_results, loading, selResRecord, showModal } = this.state;
        const accessMode = getAccessMode();
        const paginprops = {
            size: accessMode===3?"small":"",
            pageSize: 20,
            defaultCurrent: 1,
            current,
            showQuickJumper: true,
            position: 'bottom',
            total: total_results,
            showTotal: (total, range) => accessMode===3?`Total ${total}`:`${range[0]}-${range[1]} of ${total} records`,
            onChange: this.getLatestNews,
        }
        message.config({
            // top: '20%',
            maxCount: 5
        })

        return(
            <div className="page-content top-line">
                <div className="container page-resources">
                    <h1>{intl.get('@LATEST_NEWS.LATEST-NEWS')}</h1>

                    <div className="resources-list clearfix">
                    
                    <List
                      pagination={paginprops}
                      itemLayout='horizontal'
                      dataSource={data}
                      loading={loading}
                      renderItem={item => (
                          <List.Item>
                              <div className="resources-box clearfix">
                                <div className="left">
                                {this.handleListItemThumb(item)}
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
                                <a className="icon-popup-admin" data-rel="lightcase" onClick={()=>this.setState({ selResRecord: item, showModal: true })} ><img src={tempShare} alt="Share" title="Share with Others" /></a>
                                {/* eslint-disable-next-line */}
                                <a className="icon-my-favourites" onClick={()=>this.handleFavor(item)}><img src={tempFavourite} alt="My Votes" title="Add to my Votes" /></a>
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