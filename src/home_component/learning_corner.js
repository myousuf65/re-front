//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 0507 */
//Comments //***s=]*** 



import React from 'react';
import { Spin } from 'antd';
import intl from 'react-intl-universal';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { fetchData } from '../service/HelperService';

const iconLearning = sessionStorage.getItem('photo')+ 'icon-self-learning.png';


export default class LearningCorner extends React.Component{

    state = { data: [], loading: true, bannerList: [], tries: 0 };

    componentDidMount(){
        this.setState({ loading: true }, ()=>this.getBanners());
    }

    getBanners=()=>{
        let getBanners_url = sessionStorage.getItem('serverPort')+'resource/homepage/banner/'+sessionStorage.getItem('@userInfo.id');
        fetchData(getBanners_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&Array.isArray(res.data)){
                    let data = res.data;
                    data = data.sort((a,b) => (a.orderBy > b.orderBy) ? 1 : ((b.orderBy > a.orderBy) ? -1 : 0));
                    this.setState({ data, loading: false },()=>data.forEach(banner=>this.handleBlob(banner)) );
                }else{
                    this.setState({ loading: false });
                }
            }else{
                let httpCode = response.result.status;
                if(httpCode===401 || httpCode===409 || httpCode===423 || httpCode===440){
                    this.setState({ loading: false });
                }else if(this.state.tries<2){
                    console.log(`(OUT${response.result.status})refresh lc`)
                    this.setState(state=>({ tries: state.tries+1 }), ()=>this.getBanners());
                }else{
                    console.log(`(OUT${response.result.status})leave lc`)
                    this.setState({ loading: false });
                }
            //   this.setState({ loading: false });
            }
        })
    }

    handleBlob=(banner)=>{
        let url = sessionStorage.getItem('serverPort')+banner.imgUrl;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);
        request.onloadstart = function () { request.responseType = 'blob'; }
        
        var that = this;
        request.onreadystatechange = function () {
            if(request.readyState === 4){
                if (request.status === 200) {
                    var blobUrl = URL.createObjectURL(request.response);

                    banner.blobUrl = blobUrl;
                    that.setState(state=>({ bannerList: [...state.bannerList, banner] }));
                }
            };
        }
        request.send(null);
    }

    handleLink=(linkTo)=>{

        if(linkTo){
          let cateSubString = '#/resources/category/';
          let ifCategory = linkTo.indexOf(cateSubString);
      
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
              let checker5 = thisHref.startsWith('https://dsptest.csd.ccgo.hksarg/uat/')
      
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
                    if(thisHref==='https://dsp.csd.hksarg/elearnps/login.jsp?sn=MTIyNDA='){
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('authenticatedUser');
                    } 
                    window.location.assign(linkTo);
                    //window.open(linkTo, '_blank');
                }else{
                    window.location.assign('https://'+linkTo);
                    //window.open('https://'+linkTo, '_blank');
                }
              }
          }
      }
    }

    render() {
        const { loading, bannerList } = this.state;
        const blobList = bannerList.sort((a,b) => (a.orderBy > b.orderBy) ? 1 : ((b.orderBy > a.orderBy) ? -1 : 0));

        return(
            <div>
            <div className="home-section" style={{ marginBottom:'40px' }}>
                <div className="container">
                <div className="full-width-header">
                    <div className="container clearfix">
                        <LazyLoadImage className="header-icon" alt="Self-learning Corner" src={iconLearning} />                         
                        <h2 style={{width:'100%', textOverflow: 'ellipsis'}}>{intl.get('@LEARNING_CORNER.LEARNING-CORNER')}</h2>
                    </div>
                </div>
                </div>
            </div>
            <div className="self-learning-type container">
                <Spin spinning={loading}>
                <div className="row">
                    {
                        blobList.map(item=>(
                            // <div key={`self-learning-${item.id}`} className="col-md-3 col-6">
                            <div className="col-md-3 col-6">
                            <div className="self-learning-box">
                                {/* eslint-disable-next-line */}
                                <a onClick={()=>this.handleLink(item.targetUrl)}>
                                    {/* <img alt='corner_banner' src={!item? '' : item.blobUrl} /> */}
                                    <div 
                                    style={{   
                                        backgroundPosition: 'center',
                                        backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        height: '150px',
                                        width: 'auto',
                                        backgroundImage: `url('${!item? '' : item.blobUrl}')`
                                    }}
                                    alt='corner_banner'
                                    />
                                </a>
                                <span>{!item? '': (sessionStorage.getItem('lang')==='zh_TW'? item.targetTc:item.target)}</span>
                            </div>
                            </div>
                        ))
                    }
                </div>
                </Spin>
            </div>
        </div>
        )
    }
}