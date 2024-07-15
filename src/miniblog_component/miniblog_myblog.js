//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date:  */
//Comments //***s=]*** 



import React from 'react';
import { Collapse, BackTop } from 'antd';
import intl from 'react-intl-universal';

import PostsMyBlog from './posts_myblog';
import PostsBookmarks from './posts_bookmarks';

export default class MiniblogMyBlog extends React.Component{

  render() {
    const Panel = Collapse.Panel;

    return(
      <div>
        <div className="mini-blog-header">
          <div className="container clearfix">
            <a href="#/miniblog/home"><h2>{intl.get('@MINI_BLOG.MINI-BLOG')}</h2></a>
            <a hidden={sessionStorage.getItem('@userInfo.isBlogger')>0? false:true} href="#/miniblog/post/new" className="btn-my-blog">{intl.get('@MY_BLOG.POST-CREATION')}</a>
          </div>
        </div>

        
        <div className="page-content">
          <div className="container blog-details">
          <Collapse className="row" style={{ background: 'none' }} defaultActiveKey={['1', '2']}>
            <Panel style={{width:'100%'}} header={intl.get('@MY_BLOG.MY-POSTS')} key="1">
              <PostsMyBlog />
            </Panel>
            <Panel style={{width:'100%'}} header={intl.get('@MY_BLOG.MY-BOOKMARKS')} key="2">
              <PostsBookmarks />
            </Panel>
          </Collapse>
          </div>
        </div>

        <BackTop />
      </div>
    )
  }
}
