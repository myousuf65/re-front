import React from 'react';
import { BackTop, Spin, Result } from 'antd';
import intl from 'react-intl-universal';
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';
import { detect } from 'detect-browser';
import { fetchData } from '../service/HelperService';
import HomeResource from './home_resource';
import LearningCorner from './learning_corner';

import { throttle, checkImgsByName, authImgByName2 } from '../resources_component/authimg';

const HeroBanner = React.lazy(() => 
  import(/* webpackChunkName: 'HeroBanner' */ "./hero_banner")
);
const LatestNews = React.lazy(() => 
  import(/* webpackChunkName: 'LatestNews' */ "./latest_news")
);
const Miniblog = React.lazy(() => 
  import(/* webpackChunkName: 'Miniblog' */ "./mini_blog")
);

const NewsCorner = React.lazy(() => 
  import(/* webpackChunkName: 'NewsCorner' */ "./news_corner")
);

const SpecialCollection = React.lazy(() => 
  import(/* webpackChunkName: 'NewsCorner' */ "./specialCollection")
);

const hotLinks = require('../temp_json/hotLinks.json');
// const kcBeta_userList = require('../temp_json/beta_kcUserList.json');
const mobileUserList = require('../temp_json/mobileAdminConsole.json');


const browser = detect();
const blockOS_arr = ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile'];

export default class Home_Layout extends React.Component{

    state={ 
        popOut_img: null,
        latestnews_data: [],
        miniblog_data: [],
        wisdomgallery_data: [],
        ksquare_data: [],
        kmarket_data: [],
        showMobileAdmin: false,
        loadingRes: true,
        tries: 0
    };

    componentDidMount(){
        this.setState({ loadingRes: true }, ()=>{
            this.getHomepageData();
            this.handleMobileAdminConsole();

            // 1202 testing
            // this.showPopOut();
        });

        window.addEventListener('scroll', this.onScroll, false);
    }

    onScroll=(fn)=>{
        throttle(checkImgsByName('auth-div-img') );
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll, false);
    }
    
      // Attention for password policy


    // // Show Main Page Pop up 
    // showPopOut=()=>{
    //     let get_pop_url = sessionStorage.getItem('serverPort')+'resource/homepage/popout/'+sessionStorage.getItem('@userInfo.id');
    //     fetchData(get_pop_url, 'get', null, response=>{
    //         if(response.ifSuccess){
    //             let res = response.result;
    //             if(res.status===200&&!!res.data.imageUrl){
    //                 this.handleBlob(res.data.imageUrl,res.data.hypryLink);
    //             };
    //         };
    //     })
    // }


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
                  window.location.assign(newHref);
      
              }else{
                  if(thisHref.startsWith('https://')||thisHref.startsWith('http://')){
                    //   window.location.assign(linkTo);
                    window.open(linkTo);
                  }else{
                        // window.location.assign('https://'+linkTo);

                        window.open('https://'+linkTo);
                  }
              }
          }
      }
    }


    // handleBlob=(imageUrl,hypryLink)=>{
    //     let url = sessionStorage.getItem('serverPort')+imageUrl;
    //     let request = new XMLHttpRequest();
    //     request.open('get', url, true);
    //     request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
    //     request.setRequestHeader('accesshost', window.location.hostname);
    //     request.onloadstart = function () { request.responseType = 'blob'; }
        
    //     var that = this;
    //     request.onreadystatechange = function () {
    //         if(request.readyState === 4){
    //             if (request.status === 200) {
    //                 var blobUrl = URL.createObjectURL(request.response);
    //                 console.log('blob: '+hypryLink);
                   
    //                 that.preparePopOutModal(blobUrl,hypryLink);
    //             }
    //         };
    //     }
    //     request.send(null);
    // }

    // preparePopOutModal=(imageUrl,hypryLink)=>{

    //     const tooltipTrigger = blockOS_arr.includes(browser.os)? true:false;
    //     // const { popOut_img } = this.state;

    //     if (tooltipTrigger ===true ){
    //         Modal.info({
    //             // centered: true,
    //             style:{top: '20%' },
    //             bodyStyle: { maxWidth: '250px' },
    //             icon: null,
    //             // width: 'inherit',
    //             width: '90%',
              
    //             //   onOk: true,
    //             content: (
    //                 // <a href="https://www.elections.gov.hk/legco2021/chi/index.html" target="_blank">
    //                 // <a href={(e)=>this.handleLink(hypryLink)} target="_blank">
    //                 <a onClick={(e)=>this.handleLink(hypryLink)}>
    //                     <img src={imageUrl} style={{ width: '100%', maxWidth: '500px', height:'auto', margin:'0px 0px'}} alt="Notice"/>
    //                 </a>
    //             ),
    //             okText: "Close 關閉"
    //         });


    //     } else {
    //         Modal.info({
    //             centered: true,
    //             bodyStyle: { maxWidth: '500px' },
    //             icon: null,
    //             width: 'inherit',
    //             // width: '30%',
              
    //             //   onOk: true,
    //             content: (
    //                 // <a href="https://www.elections.gov.hk/legco2021/chi/index.html" target="_blank">
    //                 // <a href={(e)=>this.handleLink(hypryLink)} target="_blank"> 
    //                 <a onClick={(e)=>this.handleLink(hypryLink)}>
    //                 <img src={imageUrl} style={{ width: '100%', maxWidth: '400px', height:'auto', }} alt="Notice"/>
    //                 </a>
    //             ),
    //             okText: "Close 關閉"
    //         });
    //     }
       
    // }
    

    getHomepageData=()=>{
        let get_res_url = sessionStorage.getItem('serverPort')+'resource/homepage/resource/'+sessionStorage.getItem('@userInfo.id');
        
        fetchData(get_res_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if (res.status === 200&&res.data){
                  this.setState(state=>({ 
                      // latestnews_data: res.data.latest,
                      // miniblog_data: res.data.miniblog,
                      wisdomgallery_data: res.data.wisdomgallery,
                      ksquare_data: res.data.ksquare,
                      kmarket_data: res.data.kmarket,
                      loadingRes: false,
                  }));
              }else{
                  this.setState(state=>({ loadingRes: false }));
              }
            }else{
                let httpCode = response.result.status;
                let httpCodeChecker = [ 401, 409, 423, 440 ];
                if(httpCodeChecker.includes(httpCode)){
                    this.setState(state=>({ loadingRes: false }));
                }else if(this.state.tries<2){
                    console.log(`(OUT${response.result.status})refresh 3t`)
                    this.setState(state=>({ tries: state.tries+1 }), ()=>this.getHomepageData());
                }else{
                    console.log(`(OUT${response.result.status})leave 3t`)
                    this.setState(state=>({ loadingRes: false }));
                };
                // this.setState(state=>({ loadingRes: false }));
            }
        });
    }

    // ---function for super admin & specific users to 
    // -----access admin console > user management through mobile
    handleMobileAdminConsole=()=>{
        var isUserList = mobileUserList.includes(sessionStorage.getItem('@userInfo.id'));
        var isSuperAdmin = false;

        let getUserGroup_url = sessionStorage.getItem('serverPort')+'user/get/'+sessionStorage.getItem('@userInfo.id');
        fetchData(getUserGroup_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&res.data.groupId&&res.data.groupId===5){
                    isSuperAdmin = true;
                };
            };

            this.setState({ showMobileAdmin: isUserList || isSuperAdmin });
        })
    }

    handleHotlink=()=>{
        var links_results = null;
        if(sessionStorage.getItem('accessChannel') === '1'){
            // eslint-disable-next-line
            links_results=hotLinks.map((item,index,array)=>(index<array.length-1? <span key={item.id}><a className="hot-link-href" href={item.url} target={item.id === 7 ? "" : "_blank"}>{sessionStorage.getItem('lang')==="zh_TW"? item.nameTc:item.nameEn}</a> / </span> : <a key={item.id} className="hot-link-href" href={item.url} target={item.id === 7 ? "" : "_blank"}>{sessionStorage.getItem('lang')==="zh_TW"? item.nameTc:item.nameEn}</a>))
        }else{
            // eslint-disable-next-line
            links_results=hotLinks.map((item,index,array)=>(!item.url2? null:(index<array.length-1? <span key={item.id}><a className="hot-link-href" href={item.url2} target={item.id === 7 ? "" : "_blank"}>{sessionStorage.getItem('lang')==="zh_TW"? item.nameTc:item.nameEn}</a> / </span> : <a key={item.id} className="hot-link-href" href={item.url2} target={item.id === 7 ? "" : "_blank"}>{sessionStorage.getItem('lang')==="zh_TW"? item.nameTc:item.nameEn}</a>)))
        }
        
        return links_results;
    }

    render() {

        const { loadingRes, kmarket_data, ksquare_data, wisdomgallery_data, showMobileAdmin } = this.state;
        const lazyLoading = (  
            <Result
            icon={<Spin />}
            />
            )

        return(
            <div>
            <div className="home-section">
                <div className="container">
                <React.Suspense fallback={lazyLoading}>
                    <div className="hero-banner"  >
                        <HeroBanner handleCateShortcut={this.props.handleCateShortcut} />
                    </div>
                </React.Suspense>
                </div>
            </div>

            <div className="home-section">
                <div className="container">
                    <div className="row" style={{ paddingTop:0,paddingRight:0,paddingBottom:40,paddingLeft:0}}>
                        <div className="col-lg-6 latest-news">
                        <React.Suspense fallback={lazyLoading}>
                            <LatestNews handleScoring={this.props.handleScoring} />
                        </React.Suspense>
                        </div>
                        <div className="col-lg-6 mini-blog">
                        <React.Suspense fallback={lazyLoading}>
                            <Miniblog />
                        </React.Suspense>
                        </div>
                    </div>
                    <div className="row" style={{ padding:0 }}>
                        <div className="col-lg-6 latest-news">
                        <React.Suspense fallback={lazyLoading}>
                            <NewsCorner />
                        </React.Suspense>
                        </div>
                        <div className="col-lg-6 latest-news">
                        <React.Suspense fallback={lazyLoading}>
                            <SpecialCollection />
                        </React.Suspense>
                        </div>
                    </div>
                </div>
            </div>

            <div className="home-section">
                <div className="container">
                <div className="header-without-icon clearfix">
                    <h2><p className="wisdom-gallery">{intl.get('@WISDOM_GALLERY.WISDOM-GALLERY')}</p></h2>
                    <a href="#/resources/wisdomgallery" className="btn-show-all">{intl.get('@GENERAL.SHOW-ALL')}</a>
                </div>
                <Spin spinning={loadingRes}>
                    <HomeResource loadingRes={loadingRes} resourceData={wisdomgallery_data} />
                </Spin>

                </div>
            </div>

            <div className="home-section">
            <div className="container">
                <div className="header-without-icon clearfix">
                    <h2><p className="k-square">{intl.get('@K_SQUARE.K-SQUARE')}</p></h2>
                    <a href="#/resources/ksquare" className="btn-show-all">{intl.get('@GENERAL.SHOW-ALL')}</a>
                </div>
                <Spin spinning={loadingRes}>
                    <HomeResource loadingRes={loadingRes} resourceData={ksquare_data} />
                </Spin>

                </div>
            </div>

            <div className="home-section">
                <div className="container">
                <div className="header-without-icon clearfix">
                    <h2><p className="k-market">{intl.get('@K_MARKET.K-MARKET')}</p></h2>
                    <a href="#/resources/kmarket" className="btn-show-all">{intl.get('@GENERAL.SHOW-ALL')}</a>
                </div>
                <Spin spinning={loadingRes}>
                    <HomeResource loadingRes={loadingRes} resourceData={kmarket_data} />
                </Spin>
                </div>
            </div>

            <LearningCorner handleCateShortcut={this.props.handleCateShortcut} />

            <div className="home-section">
            <div className="container">
            <div className="row home-bottom-row">
                <div className="col-lg-6">
                <div className="weekly-topic">
                {/* eslint-disable-next-line */}
                <a onClick={()=>this.props.handleCateShortcut(10776)}>
                    {/* <img src="images/weekly-selflearning.jpg" alt="weekly topic" /> */}
                    <LazyLoadImage effect="black-and-white" src="images/weekly-selflearning.jpg" alt="weekly topic" />
                    <div className="weekly-topic-words">
                        <h2>{intl.get('@LEARNING_TOPIC.WEEKLY')}</h2>
                        <p>{intl.get('@LEARNING_TOPIC.TOPICS')}</p>
                    </div>
                </a>
                </div>
                </div>
                {/* {kcBeta_userList.indexOf(sessionStorage.getItem('@userInfo.id'))<0?null:( */}
                    <div className="col-lg-6">
                    <div className="weekly-topic">
                    <a href="#/kc/home">
                    {/* <img src="images/knowledge-cocktail.png" alt="knowledge cocktail" /> */}
                    <LazyLoadImage effect="black-and-white"  src="images/knowledge-cocktail.jpg" alt="knowledge cocktail" />
                    <div className="knowledge-cocktail-words">
                        <h2>{intl.get('@FORUM_HOME.KNOWLEDGE')}<br/>{intl.get('@FORUM_HOME.COCKTAIL')}</h2>
                    </div>
                    </a>
                    </div>
                    </div>
                {/* )} */}
            </div>
            </div>
            </div>



            <div className="home-section">
                <div className="container">
                    <div className="weekly-topic">
                    <div className="header-without-icon clearfix">
                        <h2><p className="hot-links">{sessionStorage.getItem('lang')==="zh_TW"? "最新熱點":"Hot Links"}</p></h2>
                    </div>
                        <p>

                            {this.handleHotlink()}

                            {
                                // eslint-disable-next-line
                                !showMobileAdmin? null: (<span className="hot-link-href-admin"> / <a className="hot-link-href" onClick={()=>window.location.assign('#/adminconsole/user/management')}>{intl.get('@MAIN_LAYOUT.ADMIN-CONSOLE')}</a></span>)
                            }
                            {
                                // eslint-disable-next-line
                                (<span> / <a className="hot-link-href" onClick={()=>window.location.assign('#/faq')}>{intl.get('@MAIN_LAYOUT.FAQ')}</a></span>)
                            }
                            
                        </p>
                    </div>
                </div>
            </div>

            <BackTop style={{ marginRight: '20px' }} />

            </div>
        )
    }
}