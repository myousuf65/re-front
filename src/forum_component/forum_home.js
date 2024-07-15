//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200310 */
//Comments //***s=]*** 



import React from 'react';
import { Skeleton, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';

moment.locale(sessionStorage.getItem('lang')==='zh_TW'? 'zh-hk':'' );

export default class ForumHome extends React.Component{
  state = {hotTopicList: [], categoryList: [], loadingTopic: true, loadingCate: true};

  componentDidMount(){
    this.setState(state=>({loadingTopic: true, loadingCate: true}))

    let getTopicList_url = sessionStorage.getItem('serverPort')+'forum/homepage/hotTopic/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getTopicList_url,'get',null,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data!==null&&res.data!==undefined){
          this.setState({ hotTopicList: res.data, loadingTopic: false });
        }else{
          this.setState({ hotTopicList: [], loadingTopic: false });
        }
      }else{
        let res = JSON.parse(response.result.response);
        this.setState({ hotTopicList: [], loadingTopic: false });
        message.info("Hot Topic: "+res.msg, 2);
      }
    })

    let getCateList = sessionStorage.getItem('serverPort')+'forum/homepage/category/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getCateList,'get',null,response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState({ categoryList: res.data, loadingCate: false });
        }else{
          this.setState({ categoryList: [], loadingCate: false });
        }
      }else{
        let res = JSON.parse(response.result.response);
        this.setState({ categoryList: [], loadingCate: false });
        message.info("Category List: "+res.msg, 2);
      }
    })
  }

  preTopicCard=(topic)=>{
    return(
      <div className="hot-topic-item clearfix">
        {/* eslint-disable-next-line */}
        <a href={`#/kc/post/details?id=${topic.id}`}>[{sessionStorage.getItem('lang')==='zh_TW'? topic.subCate.nameTc:topic.subCate.nameEn}] <b>{topic.postTitle}</b></a>
        <span>{moment(topic.createdAt).fromNow()}</span>
      </div>
    )
  }

  preTopicSpin=()=>{
    return(
      <div>
        <div style={{ padding: '4px 0' }}><Skeleton active paragraph={false}/></div>
        <div style={{ padding: '4px 0' }}><Skeleton active paragraph={false}/></div>
        <div style={{ padding: '4px 0' }}><Skeleton active paragraph={false}/></div>
        <div style={{ padding: '4px 0' }}><Skeleton active paragraph={false}/></div>
      </div>
    )
  }

  preCateCard=(iCate)=>{
    return(
      <div className="knowledge-category">
        <h3 className={ iCate.tabStyle?  `h3-${iCate.tabStyle}`:`h3-color1`}><span style={iCate.imgUrl===undefined||iCate.imgUrl==null||iCate.imgUrl===''? null:{ backgroundImage: `url(images/${iCate.imgUrl})` }}>{sessionStorage.getItem('lang')==='zh_TW'? iCate.nameTc:iCate.nameEn}</span></h3>
        <ul className="knowledge-sub-category">
          {iCate.subCate.map((iSub,index)=>(
            index<3?
            // eslint-disable-next-line
            <li key={iSub.id}><a href={`#/kc/postlist/${iCate.id}/?id=${iSub.id}`} className="sub-category" style={iSub.imgUrl===undefined||iSub.imgUrl==null||iSub.imgUrl===''? null:{ backgroundImage: `url(images/${iSub.imgUrl})` }}>
              {sessionStorage.getItem('lang')==='zh_TW'? iSub.nameTc:iSub.nameEn}
            </a></li>
            :null
          ))}
          {/* eslint-disable-next-line */}
          <li><a href={`#/kc/category/${iCate.id}`} className="btn-show-all">{intl.get('@GENERAL.SHOW-ALL')}</a></li>
        </ul>
      </div>
    )
  }

  preCateSpin=()=>{
    return(
      <div className="knowledge-category" >
        <div style={{ margin: '5%' }}>
          <Skeleton active paragraph={{rows:4}} />
        </div>
      </div>
    )
  }

  render(){
    const { hotTopicList, categoryList, loadingTopic, loadingCate } = this.state;
    return(
      <div>
          <div className="container knowledge-top">
          <div className="row">
            <div className="col-md-4">
              <div className="knowledge-hot-topic">
                <div className="img-hot-topic">
                  <h2>{intl.get('@FORUM_HOME.HOT-TOPICS')}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-8 hot-topic-list">
              {
                loadingTopic? this.preTopicSpin() : hotTopicList.map(item=>this.preTopicCard(item))
              }
            </div>
          </div>
          </div>
              
          <div className="container knowledge-category-area">
          <div className="knowledge-category-list clearfix">
            { 
              loadingCate? this.preCateSpin():(categoryList.map(iCate=>iCate.subCate.length>0? this.preCateCard(iCate):null))
            }
          </div>
          </div>
          
          <div className="container">
            <div className="row">
              <a href={`#/elearning/home`} className="btn-show-all">E-learning</a>
            </div>
          </div>
      </div>
    )
  }
}
