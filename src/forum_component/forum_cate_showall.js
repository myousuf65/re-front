//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200310 */
//Comments //***s=]*** 


import React from 'react';
import { message, Skeleton, Icon } from 'antd';
import intl from 'react-intl-universal';
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import categoryArrow from '../images/knowledge-bg-arrow.png';
import { fetchData } from '../service/HelperService';

export default class ForumShowAll extends React.Component {
  state={ selCateId: 0, category: {}, subCateList: [], loading: true };

  componentWillMount(){
    let selCateId = window.location.href.slice(window.location.href.lastIndexOf("/category/")+10);
    this.setState(state=>({ selCateId: parseInt(selCateId, 10) }))
  }

  componentDidMount(){
    this.setState({loading: true});
    this.getSubCategory(this.state.selCateId);
  }

  getSubCategory=(selCateId)=>{
    let getSubCategory_url = sessionStorage.getItem('serverPort')+`forum/category/${sessionStorage.getItem('@userInfo.id')}/${selCateId}`;
    fetchData(getSubCategory_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ subCateList: res.data, loading: false });
        }else{
          this.setState({ subCateList: [], loading: false });
          message.error(res.msg)
        }
      }else{
        this.setState({ subCateList: [], loading: false });
      }
    })
    let getParentCate_url = sessionStorage.getItem('serverPort')+`forum/category/info/${sessionStorage.getItem('@userInfo.id')}/${selCateId}`;
    fetchData(getParentCate_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ category: res.data });
        }else{
          this.setState({ category: {} });
          message.error(res.msg)
        }
      }else{
        this.setState({ category: {} });
      }
    })
  }

  preSubCateCard=(subCate)=>{
    return (
      <div key={subCate.id} className="sub-category-box" style={subCate.showInfo===undefined||subCate.showInfo===1? null:{ background:'rgba(0, 0, 0, 0.45)' } }>
        <a href={`#/kc/postlist/${this.state.category.id}/?id=${subCate.id}`} className="icon">
        <LazyLoadImage effect="blur" src={subCate.imgUrl===undefined||subCate.imgUrl==="null"||!subCate.imgUrl? '':"images/"+subCate.imgUrl} />
        </a>
        <a href={`#/kc/postlist/${this.state.category.id}/?id=${subCate.id}`} className="name">{sessionStorage.getItem('lang')==='zh_TW'? subCate.nameTc:subCate.nameEn}</a>
        <Icon hidden={subCate.showInfo===undefined||subCate.showInfo===1} type="eye-invisible" style={{ color: '#FFF', position: 'absolute', top: 0, right: 0, padding: '10px' }} />
      </div> 
    )
  }

  onClickSubCate=(subCateId)=>{
    if(subCateId!==undefined){
      window.location.assign('#/kc/category/'+subCateId);
    }
  }

  render(){
    const {category, subCateList, loading} = this.state;
    return(
      <div>
        <div className="container knowledge-top clearfix">
            <div className="row">
            <div className="col-12">
            <div className="knowledge-left" onClick={()=>window.location.assign('#/kc/home')}>
              <h1>{intl.get('@FORUM_GENERAL.KNOWLEDGE-COCKTAIL')}</h1>
              {/* eslint-disable-next-line */}
              <img src={categoryArrow} className="knowledge-bg-arrow" />
            </div>
            <div className={`knowledge-right knowledge-header-${category.tabStyle!==undefined? category.tabStyle:"color1"}`} onClick={()=>this.onClickSubCate(category.id)}>
              {/* eslint-disable-next-line */}
              <img className="knowledge-category-bg" src={(category.imgUrl!==undefined && category.imgUrl!=='null' && category.imgUrl)? `images/${category.imgUrl}`:""} />
              <h1>{sessionStorage.getItem('lang')==='zh_TW'? category.nameTc:category.nameEn}</h1>
            </div>
            </div>
            </div>
        </div>

        <div className="container">
          <Skeleton loading={loading} title={false} active paragraph={{rows:5, width:10}} >

            <div className="row">
              <div className="col-md-12">
              <div className="knowledge-sub-category-list clearfix">
                {
                  subCateList.length>0? subCateList.map(item=>this.preSubCateCard(item)): null
                }
              </div>  
              </div>    
            </div>
          </Skeleton>
        </div>
      </div>
    )
  }

}