//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200421*/
//Comments //***s=]*** 



import React from 'react';
import { BackTop, message, Button, Skeleton, Empty, Progress, Icon, Modal } from 'antd';
import intl from 'react-intl-universal';
import ReactPlayer from 'react-player';
import moment from 'moment';
import { detect } from 'detect-browser';
import { Document, Page, pdfjs } from 'react-pdf';

import { fetchData } from '../service/HelperService';
import ResourceShare from './resources_share';

import './resources_details.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import axios from 'axios';

const pdfThumb = process.env.PUBLIC_URL + '/images/pdf.png';
const videoThumb = process.env.PUBLIC_URL + '/images/video-home.png';
const tempFavourite = process.env.PUBLIC_URL + '/images/icon-like.png';
const tempShare = process.env.PUBLIC_URL + '/images/icon-sent-by.png';
pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.js';

const browser = detect();
const blockOS_arr = ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile'];

export default class ResourcesDetails extends React.Component{
    
    state = {
        loading: true,
        downloading: false,
        searchEngineRunning: true,
        data: {},
        relatedRes: [],
        relatedRes_substitue: [],
        resourceId: null,
        numPages: null,
        pageNumber: 1,
        docRotate: 0,
        pageScale: 1,
        pdfData: null,
        pageHeight: null,
        pageWidth: null,
        pageRotate: 0,
        playing: false,
        selResRecord: {},
        showModal: false,
        averageRating: 0,
        userRating: 0,
    };

    componentWillMount(){
        let hrefId = window.location.href.slice(window.location.href.lastIndexOf("?id=")+4);
        this.setState(state=>({ resourceId: hrefId }));
        this.getResource(hrefId);
    }

    getResource=(selResId)=>{
        this.setState(state=>({ loading: true, searchEngineRunning: true, relatedRes_substitue: [], relatedRes: [] }));
        
        // ----resources details
        let selres_url= sessionStorage.getItem('serverPort')+'resource/check/'+selResId+'?user='+sessionStorage.getItem('@userInfo.id');
        fetchData(selres_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status!==200){
                  message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                  setTimeout(()=> { window.location.replace('#/home') }, 2000);  
              }else{
                  if(res.data.data===null){
                      message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                      setTimeout(()=> { window.location.replace('#/home') }, 2000);
                  }else{
                    this.props.handleScoring(res.score);
                    this.setState({ 
                        pdfData: res.data.data.type==='PDF'? this.handlePDFParam(res.data.data.filepath):null,
                        data: res.data.data, 
                        // averageRating: res.data.data.averageRating||0,
                        // userRating: res.data.data.userRating||0,
                        relatedRes_substitue: res.data.list,
                        loading: false 
                    });
                  }
              }
            }else{
              let res = response.result;
              if(res.status!==401&&res.status!==440){
                  message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                  setTimeout(()=> { window.location.replace('#/home') }, 2000);
              }
            }
        }) 

        // ----related resources
        if(window.location.host==='dsp.csd.hksarg'){
            // ------cooperate with search engine
            let resourceUrl = encodeURIComponent(window.location.href);
            let getRelatedRes_url = sessionStorage.getItem('serverPort') + "search/related/" + sessionStorage.getItem('@userInfo.id') + "?resource_url=" + resourceUrl + "&return_type=resource";

            fetchData(getRelatedRes_url, 'get', null, response=>{
                if(response.ifSuccess){
                    let res = response.result;
                    if(res.status===200&&res.data!==undefined&&res.data.length>0){
                        this.setState({ relatedRes: res.data, searchEngineRunning: false });
                    }else{
                        this.setState({ relatedRes: [], searchEngineRunning: false });
                    }
                }else{
                    this.setState({ relatedRes: [], searchEngineRunning: false });
                }
            })
        }else{
            this.setState({ relatedRes: [], searchEngineRunning: false });
        }
        
    }

    handlePDFParam=(url)=>{
        const pdfParam = {
            url: sessionStorage.getItem('serverPort')+url,
            httpHeaders: {
                "accessToken": sessionStorage.getItem('accessToken'),
                "accesshost": window.location.hostname,
            }
        }
        return pdfParam;
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
              let res = response.result;
              if(res.status!==401&&res.status!==440){
                  message.warning(intl.get('@RESOURCES_DETAILS.NOT-FOUND'), 2);
                  setTimeout(()=> { window.location.replace('#/home') }, 2000);
              }
            }
        })

    }

    handleShare=(selRecord)=>{
        this.setState({ selResRecord: selRecord, showModal: true })
    }

    handleDownload=()=>{
        // https://github.com/eligrey/FileSaver.js/issues/12
        // https://github.com/eligrey/FileSaver.js/#supported-browsers

        // if(blockOS_arr.includes(browser.os)){
        //     message.warning("Sorry, this file is unavailable to download for iOS.\n抱歉，iOS暫不支持此類文件下載。", 5);
        //     return;
        // }

        this.setState({ downloading: true });
        const { resourceId, data } = this.state;
        let askDownload_url = sessionStorage.getItem('serverPort')+`resource/download/${resourceId}`;

        let request = new XMLHttpRequest();
        request.open('get', askDownload_url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);
        request.responseType = 'blob';
        
        let thisComponent = this;
        var suggestedFilename = `${resourceId}_${data.titleEn}`;
        var fileFormat = '.pdf';
        // wfilename for original download
        if(data.wfilename&&data.wfilename.lastIndexOf('.')>-1){
            fileFormat = data.wfilename.slice(data.wfilename.lastIndexOf('.'));
        }
        suggestedFilename += fileFormat;

        request.onload = function () {
            if(request.status === 200){
                let dataBlob = request.response;
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    // for IE
                    window.navigator.msSaveOrOpenBlob(dataBlob, suggestedFilename);
                }else if ('download' in document.createElement('a')){
                    // for Non-IE (chrome, firefox etc.)
                    var downloadElement = document.createElement('a');
                    var href = URL.createObjectURL(dataBlob);
                    downloadElement.href = href;
                    downloadElement.style.display = 'none';
                    downloadElement.download = suggestedFilename;
                    document.body.appendChild(downloadElement);
                    downloadElement.click();
                
                    // cleanup
                    setTimeout(()=>{
                        document.body.removeChild(downloadElement);
                        URL.revokeObjectURL(href);
                    }, 8000);
                }else{
                    message.error("Browser dose not support.");
                }
            }else{
                message.warning(`(${request.status}) `+intl.get('@RESOURCES_DETAILS.DOWNLOAD-FAILED'), 5);
            }
            setTimeout(()=>{thisComponent.setState({ downloading: false });}, 500)
        }
        
        request.send(null);
    }

    handleStreamDwnld=()=>{
        this.setState({ downloading: true });
        const { resourceId, data } = this.state;
        let askDownload_url = sessionStorage.getItem('serverPort')+`resource/download/${resourceId}`;
        let filename = `${resourceId}_${data.titleEn}`;

        var fileFormat = '.pdf';
        // wfilename for original download
        if(data.wfilename&&data.wfilename.lastIndexOf('.')>-1){
            fileFormat = data.wfilename.slice(data.wfilename.lastIndexOf('.'));
        }
        filename += fileFormat;
        
        axios.get(askDownload_url, {
            responseType: 'blob',
            headers:{
                'accessToken': sessionStorage.getItem('accessToken'),
                'accesshost': window.location.hostname,
            }
        })
        .then(res => {
            if(!res.data){
                throw new Error("Your request was rejected by server.");
            }else if(res.data.type&&res.data.type === 'text/html'){
                throw new Error("Your request was rejected by server.");
            };

            return res.data;
        })
        .then(blob => {
            let bl = new Blob([blob], {type: "application/octet-stream"});
            // var bl = blob;

            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // for IE
                window.navigator.msSaveOrOpenBlob(bl, filename);
        
            }else if ('download' in document.createElement('a')){
                // for Non-IE (chrome, firefox etc.)
                var downloadElement = document.createElement('a');
                var href = window.URL.createObjectURL(bl);
                downloadElement.href = href;
                downloadElement.style.display = 'none';
                downloadElement.download = filename;
                document.body.appendChild(downloadElement);
                downloadElement.click();
            
                // cleanup
                setTimeout(()=>{
                    document.body.removeChild(downloadElement);
                    URL.revokeObjectURL(href);
                }, 120000);
            }else{
                message.error("Browser dose not support.");
            };

            this.setState({ downloading: false });

        }).catch( err => {
            this.setState({ downloading: false });

            if(!err.repsonse){
                message.error(err.message, 5);
                return;
            }
      
            if(err.response.status!==401&&err.response.status!==440){
                message.warning(intl.get('@RESOURCES_DETAILS.DOWNLOAD-FAILED'), 5);
            }else{
                if(err.response.status===401){
                    sessionStorage.clear();
                    window.location.assign('/');
                }else if(err.response.status===440){
                    let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
                    fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
                    window.location.assign('#/failout');
                }
            }
        })
    }

    onLoadSuccess=(pdf)=>{
        this.setState({numPages: pdf.numPages});
    }

    onPageLoadSuccess=(page)=>{
        // ----rotation
        if(page.rotate){
            this.setState({ pageRotate: page.rotate });
        }else{
            this.setState({ pageRotate: 0 });
        }

        const innerWidth = window.innerWidth;

        if(innerWidth<1000){
            var pageFitWidth = innerWidth-80;
            this.setState({ pageWidth: pageFitWidth })
        }else{
            this.setState({ pageHeight: 600 });
        }
    }
    handleLink=(linkTo)=>{

        if(linkTo){
          let cateSubString = '#/resources/category/';
          let ifCategory = linkTo.indexOf(cateSubString);
          console.log('ifCategory: ', ifCategory);
      
          if(ifCategory>-1){
              let index = ifCategory+cateSubString.length;
              let selCateId = parseInt(linkTo.substring(index));
              this.props.handleCateShortcut(selCateId);
          }else{
              var thisHref = linkTo;
              var newHref = thisHref;
      
              // ---production
              let checker1 = thisHref.startsWith('https://kms.csd.gov.hk/');
              let checker2 = thisHref.startsWith('https://dsp.csd.hksarg/kms/');
              // ---uat
              let checker3 = thisHref.startsWith('https://kmst.csd.gov.hk/');
              let checker4 = thisHref.startsWith('https://dsp.csd.hksarg/kmsuat/');
              let checker5 = thisHref.startsWith('https://dsptest.csd.ccgo.hksarg/uat/');
              

              if(checker1||checker2||checker3||checker4){
                  if(checker1){
                      newHref = thisHref.replace('https://kms.csd.gov.hk/','');
                  }else if(checker2){
                      newHref = thisHref.replace('https://dsp.csd.hksarg/kms/','');
                  }else if(checker3){
                      newHref = thisHref.replace('https://kmst.csd.gov.hk/','');
                  }else if(checker4){
                      newHref = thisHref.replace('https://dsp.csd.hksarg/kmsuat/','');
                  }else if(checker5){
                    newHref = thisHref.replace('https://dsptest.csd.ccgo.hksarg/uat/','');
                }
                //  window.location.assign(newHref);
                window.open(newHref);
      
              }else{
                  if(thisHref.startsWith('https://')||thisHref.startsWith('http://')){
                    //   window.location.assign(linkTo);
                      window.open(linkTo);
                  }else{
                    //   window.location.assign('https://'+linkTo);
                    window.open('https://'+linkTo);
                  }
              }
          }
      }
    }
    handlePage=(dir)=>{
        const {numPages, pageNumber} = this.state;

        var newPageNum = pageNumber + dir;
        if(newPageNum <= numPages && newPageNum > 0){
            this.setState({ pageNumber: newPageNum });
        }
    }

    handleRotate=(angle)=>{
        const { docRotate } = this.state;
        var newdocRotate = docRotate + angle;

        if(newdocRotate===360){
            this.setState({ docRotate: 0 });
        }else if(newdocRotate === -90 ){
            this.setState({ docRotate: 270 });
        }else{
            this.setState({ docRotate: newdocRotate });
        }
    }

    handleResetRotation=()=>{
        this.setState({ docRotate: 0 })
    }

    handleZoom=(scale)=>{
        const { pageScale } = this.state;
        var newPageScale = pageScale + scale;

        if(newPageScale<3 && newPageScale>0){
            this.setState({ pageScale: newPageScale });
        }
    }

    handleResetZoom=()=>{
        this.setState({ pageScale: 1 });
    }

    handleRelated=(resId)=>{
        window.location.assign(`#/resourcedetails/?id=${resId}`);
        this.setState(state=>({ resourceId: resId }));
        this.getResource(resId);
    }
    
    handleRenderRelated=(resArray)=>{
        if(resArray.length>0){
            return resArray.map((item, index)=>{
                if (index > 3){
                    return null;
                };

                return (
                    <div key={'related-res-'+index} onClick={()=>this.handleRelated(item.id)} className="col-md-3 col-6">
                        {/* eslint-disable-next-line */}
                        <img alt={item.type} src={item.type==="VIDEO"? videoThumb : pdfThumb} />                    
                        {/* eslint-disable-next-line */}
                        <a className="title" onClick={()=>this.handleRelated(item.id)}>{sessionStorage.getItem('lang')==='zh_TW'? item.titleTc:item.titleEn}</a>
                    </div>
                )
            })
        }else{
            return <div style={{ width: '100%' }} ><Empty description={sessionStorage.getItem('lang')==='zh_TW'? '暫無相關資源':'No Related Resource'} /></div>
        }
    }

    onClickCate=(urlId)=>{
        if(urlId){
            this.props.handleCateShortcut(urlId);
        }
    }

    handleChromeAutoPlay=()=>{
        if(browser.name==='chrome'){
            if(parseInt(browser.version,10)>65){
                return true;
            }
        }
        return false;
    }

    handleOnReady=()=>{
        setTimeout(() => this.setState({ playing: true }), 100);
    }

    refCallback = element => {
        if(element){
            // ----height is wired
            var elementDimension = element.getBoundingClientRect();
            this.setState({ pdfDivWidth: elementDimension.width })
        }
    };
    
    handleClose = () =>{
        this.setState({ selResRecord: {}, showModal: false });
    }

    handleDownloadBtnDisplay=(resType)=>{
        if(resType === 'VIDEO'){
            return true;
        };

        return false;
    }

    // handleRating=value=>{
    //     if(!value){
    //         message.warning("Invalid Rating");
    //         return;
    //     }

    //     const oldRate = this.state.userRating;
    //     this.setState({ userRating: value });
    //     var updateRate = {
    //         resourceId: Number(this.state.resourceId),
    //         rating: value,
    //     }

    //     let postRate_url = sessionStorage.getItem('serverPort')+'resource/rating/'+sessionStorage.getItem('@userInfo.id');
    //     fetchData(postRate_url, 'post', updateRate, response=>{
    //         let res = response.result;
    //         if(response.ifSuccess&&res.status===200&&res.data&&Number(res.data)===res.data){
    //             this.setState({ averageRating: res.data });
    //         }else{
    //             this.setState({ userRating: oldRate });
    //             message.warning("Failed to rate. Please try it later.");
    //         }
    //     })
    // }

    render() {
        const { data, relatedRes, pdfData, pageNumber, numPages, docRotate, pageRotate, pageScale, pageHeight, 
            pageWidth, relatedRes_substitue, searchEngineRunning, loading, downloading, playing, selResRecord, showModal,
            // userRating, averageRating
        } = this.state;
        // const devicePixelRatio = window.devicePixelRatio;

        return(
            <div className="page-content top-line">
                <div className="container page-resources-details">
                    <div className="resources-area">
                    <Skeleton active paragraph={{ rows: 6 }} loading={loading}>
                    <div className="page-resources-top">
                        <h1>
                            {data? (sessionStorage.getItem('lang')==='zh_TW'? data.titleTc:data.titleEn): intl.get('@GENERAL.TITLE') }
                        </h1>
                        <p>{data===null? 'Create Date':moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss")}</p>

                        <div className="CatPath">
                            <ul>
                            {
                                data.catpath !== undefined ? 
                                data.catpath.map((iPath,index)=>(
                                    // eslint-disable-next-line
                                    <a key={index} style={{ paddingLeft: '0px' }} onClick={()=>this.onClickCate(data.catId[index])}>
                                        <li>{`*${iPath} `}</li>
                                    </a>
                                )):null
                            }
                            </ul>
                        </div>
                       
                        <p>{sessionStorage.getItem('lang')==='zh_TW'? (data===null? '描述':data.descTc) : (data===null? 'Description':data.descEn)}</p>
                        <p>{sessionStorage.getItem('lang')==='zh_TW'? (data.linkTo===null? '':<a onClick={(e)=>this.handleLink(data.linkTo)} >{data.linkTo}</a>) : (data.linkTo===null? '':<a onClick={(e)=>this.handleLink(data.linkTo)}>{data.linkTo}</a>)}</p>
                        <Button hidden={data.type==='VIDEO' || blockOS_arr.includes(browser.os)} loading={downloading} onClick={this.handleDownload} className="btn-download">
                        {/* <Button hidden={this.handleDownloadBtnDisplay(data.type)} loading={downloading} onClick={this.handleStreamDwnld} className="btn-download"> */}
                            {intl.get('@GENERAL.DOWNLOAD')}
                        </Button>
                      
                    </div>
                    {!data? null:(data.type==='VIDEO'? 
                    <div className="video-container">
                        <ReactPlayer 
                        className='react-player'
                        url={data.videoLink} 
                        onContextMenu={e => e.preventDefault()}
                        controls 
                        width='100%'
                        height='100%'
                        playing={playing}
                        // muted={this.handleChromeAutoPlay()}
                        onReady={this.handleOnReady}
                        config={{ 
                            file: { 
                                attributes: {
                                    controlsList: 'nodownload',
                                    autoPlay: true,
                                    // muted: this.handleChromeAutoPlay()
                                } 
                            } 
                        }}
                        />
                        <span style={{ color: 'lightgray', fontSize: '0.5em' }}>{browser.version||'unknown'}</span>
                    </div>:
                    
                    <div className="container text-center" >
                        <div className="customViewer" onContextMenu={(e)=>e.preventDefault()}>
                        <Document
                        className="customDoc"
                        file={pdfData}
                        externalLinkTarget="_blank" // Link target for external links rendered in annotations.
                        inputRef={this.refCallback}
                        loading={<PdfLoader filesize={data.filesize} />}
                        onLoadSuccess={this.onLoadSuccess}
                        onLoadError={(error)=>console.log('doc-err', error.message)}
                        // onSourceSuccess   //---triger when pass data to file
                        // onSourceError
                        options={{
                            cMapUrl: 'cmaps/',
                            cMapPacked: true,
                        }}
                        rotate={docRotate}
                        >
                            <Page 
                            className="customCanvas"
                            pageNumber={pageNumber}
                            width={pageWidth}
                            height={pageHeight}
                            error="Failed to load the page."
                            loading={`Rendering Page ${pageNumber}...`}
                            onLoadError={(error) => console.log('page-err', error.message)}
                            // onLoadProgress={({ loaded, total }) => console.log('Loading a document: ' + (loaded / total) * 100 + '%')}
                            // onLoadSuccess
                            renderAnnotationLayer
                            scale={pageScale}
                            onLoadSuccess={this.onPageLoadSuccess}
                            rotate={pageRotate+docRotate}
                            /> 
                        </Document>
                        </div>
                        
                        <div className="customWrapper">
                        <div className='row'>
                            <div className='col-sm-4'>
                                <Icon className="customPDFBtn" type="undo" onClick={()=>this.handleRotate(-90)} />
                                <Icon className={docRotate!==0? "customPDFBtn":"customDisabledBtn"} type="sync" onClick={this.handleResetRotation} />
                                <Icon className="customPDFBtn" type="redo" onClick={()=>this.handleRotate(90)} />
                            </div>
                            
                            <div className='col-sm-4'>
                                <Icon className={pageNumber > 1? "customPDFBtn":"customDisabledBtn"} type="left" onClick={()=>this.handlePage(-1)} />
                                <h5 style={{ display: 'inline-block', color: '#fff', marginTop: 0 }}>
                                    Page {numPages?pageNumber:"-"} / {numPages? numPages:"-"}
                                </h5>
                                <Icon className={pageNumber < numPages? "customPDFBtn":"customDisabledBtn"} type="right" onClick={()=>this.handlePage(1)} />
                            </div>
                            
                            <div className='col-sm-4'>
                                <Icon className={pageScale > 0.5? "customPDFBtn":"customDisabledBtn"} type="zoom-out" onClick={()=>this.handleZoom(-0.5)} />
                                <Icon className={pageScale !== 1? "customPDFBtn":"customDisabledBtn"} type="sync" onClick={this.handleResetZoom} />
                                <Icon className={pageScale < 2.5? "customPDFBtn":"customDisabledBtn"} type="zoom-in" onClick={()=>this.handleZoom(0.5)} />
                            </div>
                        </div>
                        </div>
                    </div>
                    
                    )}

                    <div className="resources-share-rate">
                        <div className="left">
                            <span style={{ marginRight: '1em' }} ><Icon type="eye" theme="twoTone" style={{ fontSize: 28 }} /> {data.hitRate || 0}</span>
                            <img className="resources-share-inbox" src={tempFavourite} onClick={()=>this.handleFavor(data)} alt="My Votes" />
                            <img className="resources-share-inbox" src={tempShare} onClick={()=>this.handleShare(data)} alt="Share with Others" />
                        </div>

                        {/* <div className="right">
                            <Rate onChange={this.handleRating} style={{ fontSize: "1.6em" }} value={userRating} />
                            <span>{intl.get("@RESOURCES_DETAILS.YOUR-RATING")}{userRating} | {intl.get("@RESOURCES_DETAILS.AVERAGE-RATING")}( {averageRating} / 5 )</span>
                            <span class="rate-mobile">{intl.get("@RESOURCES_DETAILS.AVERAGE-RATING-MOBILE")}{averageRating} / 5</span>
                        </div> */}
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
                    </Skeleton>
                    </div>
                </div>


                <div className="container">
                <div className="related-resources">
                <h2><span>{intl.get('@RESOURCES_DETAILS.RELATED')}</span></h2>
                <Skeleton active paragraph={{ rows: 3 }} loading={loading||searchEngineRunning}>
                <div className="related-list row">
                    {
                        (loading||searchEngineRunning)? null : this.handleRenderRelated( relatedRes.length>0? relatedRes : relatedRes_substitue )
                    }
                </div>
                </Skeleton>
                </div>
                </div>
            <BackTop />
            </div>
      )
    }
}

export class PdfLoader extends React.Component{

    state={
        successPercent: 0,
    }

    componentDidMount(){
        var filesize = this.props.filesize;
        var downloadSpeed = 1024*50;  //--- 50kb/s

        var timecost = filesize/downloadSpeed;
        var milestone = timecost/0.05;
        var perProg = 100/milestone;


        this.myinterval = setInterval(() => {
            if(this.state.successPercent+perProg<99.99){
                this.setState({ successPercent: this.state.successPercent+perProg });
            }else{
                this.setState({ successPercent: 99.99 });
                clearInterval(this.myinterval);
            }
        }, 50);
    }

    componentWillMount(){
        clearInterval(this.myinterval);
    }

    render(){
        const { successPercent } = this.state;

        return <Progress className="customLoader" strokeColor={{ from: '#108ee9', to: '#87d068' }} percent={ Math.round(successPercent*100)/100 } status="active" />;
    }
}
