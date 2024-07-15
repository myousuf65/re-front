//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200114 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop } from 'antd';
import { HashRouter as Router, Switch } from 'react-router-dom';
import intl from 'react-intl-universal';
import AuthenticatedRoute from '../component/AuthenticatedRoute';

import ForumHome from './forum_home';
import ForumShowAll from './forum_cate_showall'
import ForumPostList from './forum_post_list';
import ForumPostDetails from './forum_post_details';
import ForumEditor from './forum_post_editor';
import ForumModifier from './forum_post_modifier';

export default class ForumRouter extends React.Component{
  render(){
    return(
      <div>
        <div className="knowledge-header">
          <div className="container clearfix">
              <a href="#/kc/home"><h2>{intl.get('@FORUM_GENERAL.KNOWLEDGE-COCKTAIL')}</h2></a>
          </div>
        </div>

        <div className="page-content">
          <Router basename="/kc">
            <Switch>
              <AuthenticatedRoute path="/home" render={()=><ForumHome />} />
              {/* /category/${iCate.id} */}
              <AuthenticatedRoute path="/category" render={()=><ForumShowAll />} />
              {/* /postlist/${iCate.id}/?id=${iSub.id} */}
              <AuthenticatedRoute path="/postlist" render={()=><ForumPostList />} />
              {/* /post/details?id=${iPost.id} */}
              <AuthenticatedRoute path="/post/details" render={()=><ForumPostDetails />} />
              <AuthenticatedRoute path="/post/new" render={()=><ForumEditor />} />
              <AuthenticatedRoute path="/post/modify" render={()=><ForumModifier />} />
              
              <AuthenticatedRoute exact path="/" component={null}/>
            </Switch>
          </Router>
        </div>
        
        <BackTop />
      </div>
    )
  }
}