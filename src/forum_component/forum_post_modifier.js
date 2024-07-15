//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200213 */
//Comments //***s=]*** 



import React from 'react';
import intl from 'react-intl-universal';
import WrappedForumPostEditForm from './forum_post_edit_form';

export default class ForumModifier extends React.Component{
  render(){
    return(
      <div>
        <div className="page-content">
                <div className="container create-post">
                    <div className="row">
                    {/* <div className="col-lg-9"> */}
                        <div className="create-post-main">
                            <h3 style={{ borderBottom: '3px solid #15664c' }}>{intl.get('@FORUM_GENERAL.EDIT-POST')}</h3>
                            <WrappedForumPostEditForm />
                        </div>
                    {/* </div> */}
                    </div>
                </div>
            </div>
      </div>
    )
  }
}