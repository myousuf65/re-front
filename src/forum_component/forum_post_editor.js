//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200115 */
//Comments //***s=]*** 



import React from 'react';
import intl from 'react-intl-universal';
import WrappedForumPostForm from './forum_post_form';

export default class ForumEditor extends React.Component{
  render(){
    return(
      <div>
        <div className="page-content">
                <div className="container create-post">
                    <div className="row">
                        <div className="create-post-main">
                            <h3 style={{ borderBottom: '3px solid #15664c' }}>{intl.get('@FORUM_GENERAL.NEW-POST')}</h3>
                            <WrappedForumPostForm />
                        </div>
                    </div>
                </div>
            </div>
      </div>
    )
  }
}