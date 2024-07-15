//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date:  */
//Comments //***s=]*** 



import React from 'react';
import { Collapse, BackTop } from 'antd';
import intl from 'react-intl-universal';

import PostsSpecialCollection from './posts_specialCollection';

export default class SpecialCollectionMySpecialCollection extends React.Component{

  render() {
    const Panel = Collapse.Panel;

    return(
      <div>
        <div className="mini-blog-header">
          <div className="container clearfix">
            <a href="#/specialCollection/home"><h2>{intl.get('@SPECIAL_COLLECTION.SPECIAL_COLLECTION')}</h2></a>
            <a hidden={sessionStorage.getItem('@userInfo.isBlogger')>0? false:true} href="#/specialCollection/post/new" className="btn-my-blog">{intl.get('@MY_BLOG.POST-CREATION')}</a>
          </div>
        </div>

        
        <div className="page-content">
          <div className="container blog-details">
          <Collapse className="row" style={{ background: 'none' }} defaultActiveKey={['1', '2']}>
            <Panel style={{width:'100%'}} header={intl.get('@MY_BLOG.MY-POSTS')} key="1">
              <PostsSpecialCollection />
            </Panel>
            {/*
            <Panel style={{width:'100%'}} header={intl.get('@MY_BLOG.MY-BOOKMARKS')} key="2">
              <PostsSpecialCollections />
            </Panel>
            */}
          </Collapse>
          </div>
        </div>

        <BackTop />
      </div>
    )
  }
}
