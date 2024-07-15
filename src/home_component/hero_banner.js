//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20191025 */
//Comments //***s=]*** 



import React from 'react';
import Slider from 'react-slick';

import './hero_banner.css';
import { fetchData } from '../service/HelperService';

export default class Hero_Banner extends React.Component{
    state = { data: [], bannerList: [], tries: 0 }

    componentWillMount(){
        this.getTopBanner();
    }

    getTopBanner=()=>{
        let getTopBanner_url = sessionStorage.getItem('serverPort')+`banner/all/top/${sessionStorage.getItem('@userInfo.id')}`;
        fetchData(getTopBanner_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&Array.isArray(res.data)){
                    let data = res.data.length<21? res.data: res.data.slice(0,19);
                    data = data.sort((a,b) => (a.orderby > b.orderby) ? 1 : ((b.orderby > a.orderby) ? -1 : 0))
                    let bannerList = data.map(item=>({ id: item.id, orderby: item.orderby, imgUrl: item.imgUrl, linkTo: item.linkTo, blobUrl: null }));
                    this.setState({ data },()=>bannerList.forEach(banner=>this.handleBlob(banner)) );
                    
                }else{
                    this.setState({ data: [], bannerList: [] });
                }
            }else{
                let httpCode = response.result.status;
                if(httpCode===401 || httpCode===409 || httpCode===423 || httpCode===440){
                    this.setState({ data: [], bannerList: [] });
                }else if(this.state.tries<2){
                    console.log(`(OUT${response.result.status})refresh hb`)
                    this.setState(state=>({ tries: state.tries+1 }), ()=>this.getTopBanner());
                }else{
                    console.log(`(OUT${response.result.status})leave hb`)
                    this.setState(state=>({ data: [], bannerList: [] }));
                }
                // this.setState({ data: [], bannerList: [] });
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
                    //window.location.assign(linkTo);
                    window.open(linkTo, '_blank');
                }else{
                    //window.location.assign('https://'+linkTo);
                    window.open(linkTo, '_blank');
                }
              }
          }
      }
    }

    render() {
        const images_arr = this.state.bannerList.sort((a,b) => (a.orderby > b.orderby) ? 1 : ((b.orderby > a.orderby) ? -1 : 0));
        const slider_settings = {
            customPaging: function(i){
                return(
                    // eslint-disable-next-line
                    <a key={images_arr[i].id}><div style={{ backgroundImage: "url("+images_arr[i].blobUrl+")" }} /></a>
                    );
            },
            dots: true,
            dotsClass: "slick-dots slick-thumb",
            // fade: 1,
            className: "center",
            centerMode: true,
            centerPadding: "10%",
            infinite: true,
            autoplay: true,
            // adaptiveHeight: true,
            speed: 1000,
            autoplaySpeed: 5000,
            cssEase: "linear",
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            swipe: false,
            responsive: [
                {
                    breakpoint: 767,
                    settings: {
                        // dots: false,
                        dotsClass: "slick-dots slick-mobiledots",
                        customPaging: i=><button>{i+1}</button>,
                        swipe: true,
                    }
                }
            ]
        };

        return(
            <Slider {...slider_settings}>
                {/* eslint-disable-next-line */}
                {images_arr.map(imgItem=><div key={imgItem.id} ><a onClick={(e)=>this.handleLink(imgItem.linkTo)}><img src={imgItem.blobUrl} alt="hero_banner" /></a></div>)}
            </Slider>
        )
    }
}
