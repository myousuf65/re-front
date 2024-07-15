//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190517 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Menu, BackTop, message, Result, Spin } from 'antd';
import { HashRouter as Router, Switch } from 'react-router-dom';

import AuthenticatedRoute from '../component/AuthenticatedRoute';
import { fetchData } from '../service/HelperService';

import ResCreation from './res_creation';
import ResManagement from './res_management';
import AccessEditForm from './access_rule';
import ResEditForm from './acc_edit_form_v2';
import CategoryForm from './category_v1';
import CatCreation from './category_create_form';
import AclForm from './acl_table';
import UserManagement from './user_management';
import BlogAssitManagement from './blog_assist_management';
import BlogCateManagement from './blog_cate_management';
import UserProfile from './user_profile';
import SplUsrGrpManagement from './spl_usr_grp_management';
import PinManagement from './pin_management';
import FaqCateManagement from './faq_cate_management';
import FaqNewCateForm from './faq_cate_creation';

// const ResCreation = React.lazy(() => 
//   import(/* webpackChunkName: 'ResCreation' */ "./res_creation")
// );
// const ResManagement = React.lazy(() => 
//   import(/* webpackChunkName: 'ResManagement' */ "./res_management")
// );
// const AccessEditForm = React.lazy(() => 
//   import(/* webpackChunkName: 'AccessEditForm' */ "./access_rule")
// );
// const ResEditForm = React.lazy(() => 
//   import(/* webpackChunkName: 'ResEditForm' */ "./acc_edit_form_v2")
// );
// const CategoryForm = React.lazy(() => 
//   import(/* webpackChunkName: 'CategoryForm' */ "./category_v1")
// );
// const CatCreation = React.lazy(() => 
//   import(/* webpackChunkName: 'CatCreation' */ "./category_create_form")
// );
// const AclForm = React.lazy(() => 
//   import(/* webpackChunkName: 'AclForm' */ "./acl_table")
// );
// const UserManagement = React.lazy(() => 
//   import(/* webpackChunkName: 'UserManagement' */ "./user_management")
// );
// const BlogAssitManagement = React.lazy(() => 
//   import(/* webpackChunkName: 'BlogAssitManagement' */ "./blog_assist_management")
// );
// const BlogCateManagement = React.lazy(() => 
//   import(/* webpackChunkName: 'BlogCateManagement' */ "./blog_cate_management")
// );
// const UserProfile = React.lazy(() => 
//   import(/* webpackChunkName: 'UserProfile' */ "./user_profile")
// );
const ReportsManagement = React.lazy(() => 
  import(/* webpackChunkName: 'ReportsManagement' */ "./reports_management")
);
const ForumCateManagement = React.lazy(() => 
  import(/* webpackChunkName: 'ForumCateManagement' */ "./forum_cate_management")
);
const ForumNewCateForm = React.lazy(() => 
  import(/* webpackChunkName: 'ForumNewCateForm' */ "./forum_cate_creation")
);
const BannerManagement = React.lazy(() => 
  import(/* webpackChunkName: 'BannerManagement' */ "./banner_management")
);
const TopBannerManagement = React.lazy(() => 
  import(/* webpackChunkName: 'TopBannerManagement' */ "./banner_top_management")
);
const MobileAppManagement = React.lazy(() => 
  import(/* webpackChunkName: 'MobileAppManagement' */ "./mobile_app_management")
);

const MobileNotificationManagement = React.lazy(() =>
    import(/* webpackChunkName: 'MobileNotificationManagement' */ "./mobile_notification_management")
);
const PopOutManagement = React.lazy(() => 
  import(/* webpackChunkName: 'PopOutManagement' */ "./pop_out_management")
);
const ElearningManagement = React.lazy(() => 
  import(/* webpackChunkName: 'PopOutManagement' */ "./elearning_management")
);
const ElearningManagementCandidate = React.lazy(() => 
  import(/* webpackChunkName: 'PopOutManagement' */ "./elearning_management_candidate")
);
const ElearningManagementDetail = React.lazy(() => 
  import(/* webpackChunkName: 'PopOutManagement' */ "./elearning_management_detail")
);

// import CategoryEditForm from './category';

export default class AdminConsole_Layout extends React.Component{
    constructor(props){
        super(props);
        this.state={ 
            navitems: [],
            selMenuKey: [],
            loading: false,
            collapsed: false,
        };
    }

    // componentWillMount(){
    //     this.setState(state=>({ categoryTree: JSON.parse(sessionStorage.getItem('@cateList')) }));
    // }

    componentDidMount(){
        // this.setState(state=>({ loading: true }));
        let getSiteFunc_url = sessionStorage.getItem('serverPort')+'acl/sitebar?id='+sessionStorage.getItem('@userInfo.id');
        fetchData(getSiteFunc_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&res.data){
                    this.setState({ navitems: res.data });
                }else{
                    message.warning('Sorry, no function available for current account. We will back to Home Page.', 2);
                    setTimeout(()=> { window.location.replace('#/home') }, 2000);
                }
            }else{
                this.setState(state=>({ loading: false }));
            }
            
        })
        let winHref = window.location.href;
        let loadedPath = winHref.slice(winHref.lastIndexOf("/adminconsole")+13);
        switch(loadedPath){
            case '/resources/creation':
            case '/resources/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===3).length===0? { selMenuKey: [] }:{ selMenuKey: ['3'] }));
                break;
            case '/accessrule/edit':
            case '/accessrule':
                this.setState(state=>( state.navitems.filter(item=>item.id===1).length===0? { selMenuKey: [] }:{ selMenuKey: ['1'] }));
                break;
            case '/acl':
                this.setState(state=>( state.navitems.filter(item=>item.id===4).length===0? { selMenuKey: [] }:{ selMenuKey: ['4'] }));
                break;
            case '/reports':
                this.setState(state=>( state.navitems.filter(item=>item.id===8).length===0? { selMenuKey: [] }:{ selMenuKey: ['8'] }));
                break;
            case '/category/creation':
            case '/category':
                this.setState(state=>( state.navitems.filter(item=>item.id===2).length===0? { selMenuKey: [] }:{ selMenuKey: ['2'] }));
                break;
            case '/user/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===6).length===0? { selMenuKey: [] }:{ selMenuKey: ['6'] }));
                break;
            case '/user/profile':
                this.setState(state=>( state.navitems.filter(item=>item.id===10).length===0? { selMenuKey: [] }:{ selMenuKey: ['10'] }));
                break;
            case '/miniblog/assistant/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===11).length===0? { selMenuKey: [] }:{ selMenuKey: ['11'] }));
                break;
            case '/miniblog/category/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===12).length===0? { selMenuKey: [] }:{ selMenuKey: ['12'] }));
                break;
            case '/kc/category/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===14).length===0? { selMenuKey: [] }:{ selMenuKey: ['14'] }));
                break;
            case '/kc/category/creation':
                this.setState(state=>( state.navitems.filter(item=>item.id===14).length===0? { selMenuKey: [] }:{ selMenuKey: ['14'] }));
                break;
            case '/sugrp/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===13).length===0? { selMenuKey: [] }:{ selMenuKey: ['13'] }));
                break;
            case '/banner/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===5).length===0? { selMenuKey: [] }:{ selMenuKey: ['5'] }));
                break;
            case '/topbanner/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===15).length===0? { selMenuKey: [] }:{ selMenuKey: ['15'] }));
                break;
            case '/mobileapp/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===7).length===0? { selMenuKey: [] }:{ selMenuKey: ['7'] }));
                break;
            case '/mobilenotification/management':
                this.setState(state=>( state.navitems.filter(item=>item.id==22).length===0? { selMenuKey: [] }:{ selMenuKey: ['22'] }));
                break;
            case '/pin/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===19).length===0? { selMenuKey: [] }:{ selMenuKey: ['19'] }));
                break;
            case '/faq/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===20).length===0? { selMenuKey: [] }:{ selMenuKey: ['20'] }));
                break;
            case '/faq/category/creation':
                this.setState(state=>( state.navitems.filter(item=>item.id===20).length===0? { selMenuKey: [] }:{ selMenuKey: ['20'] }));
                break;
            
            case '/elearning/candidate':
            case '/elearning/detail':
            case '/elearning/management':
                this.setState(state=>( state.navitems.filter(item=>item.id===23).length===0? { selMenuKey: [] }:{ selMenuKey: ['23'] }));
                break;
                
            default:
                this.setState(state=>({ selMenuKey: [] }));
        };
    }

    onMenuClick = e => {
        this.setState(state=>({ selMenuKey: e.keyPath }));
        if(e.key==='3'){
            window.location.replace(`#/adminconsole/resources/management`)
        } else if (e.key==='1'){
            window.location.replace(`#/adminconsole/accessrule`)
        } else if (e.key==='4'){
            window.location.replace(`#/adminconsole/acl`) 
        } else if (e.key==='2'){
            window.location.replace('#/adminconsole/category')
        } else if (e.key==='6'){
            window.location.replace('#/adminconsole/user/management')
        } else if (e.key==='8'){
            window.location.replace('#/adminconsole/reports')
        } else if (e.key==='10'){
            window.location.replace('#/adminconsole/user/profile')
        } else if (e.key==='11'){
            window.location.replace('#/adminconsole/miniblog/assistant/management')
        } else if (e.key==='12'){
            window.location.replace('#/adminconsole/miniblog/category/management')
        } else if (e.key==='14'){
            window.location.replace('#/adminconsole/kc/category/management')
        } else if (e.key==='13'){
            window.location.replace('#/adminconsole/sugrp/management')
        } else if (e.key==='5'){
            window.location.replace('#/adminconsole/banner/management')
        } else if (e.key==='15'){
            window.location.replace('#/adminconsole/topbanner/management')
        } else if (e.key==='7'){
            window.location.replace('#/adminconsole/mobileapp/management')
        } else if (e.key==='19'){
            window.location.replace('#/adminconsole/pin/management')
        } else if (e.key==='20'){
            window.location.replace('#/adminconsole/faq/management')
        } else if (e.key =='21'){
            window.location.replace('#/adminconsole/popout/management')
        } else if (e.key =='22'){
            window.location.replace('#/adminconsole/mobilenotification/management')
        } else if (e.key =='23'){
            window.location.replace('#/adminconsole/elearning/management')
        }
        else {
            window.location.replace(`#/adminconsole/`);
        }
    }

    toggle=()=>{
        this.setState(state=>({ collapsed: !state.collapsed }));
    }

    render() {
        const { Sider } = Layout;
        const { navitems, selMenuKey, collapsed } = this.state;
        const menuitems = (
            // <Menu id="sidebar-wrapper" mode="inline" style={{ height: '100%', borderRight:0 }}>
            <Menu 
            onClick={this.onMenuClick}
            defaultSelectedKeys={selMenuKey}
            selectedKeys={selMenuKey}
            inlineCollapsed={collapsed}
            mode="inline" 
            style={{ color:'#FFF', background: '#449868', fontSize: '16px' }}
            // overflowedIndicator={
            //     <Icon type="ellipsis" />
            // }
            >
                {navitems.map(item => {
                    return <Menu.Item key={item.id}>{sessionStorage.getItem('lang')==="zh_TW"? item.funcNameC:item.funcName}</Menu.Item>;
                })}
            </Menu>);
        const lazyLoading = (<Result icon={<Spin />} />)

        return(
            // <div className="page-content top-line"></div>
            
            <Layout className="cms-main top-line">
                <div id="wrapper">
                    <Sider 
                    breakpoint="lg"
                    collapsedWidth={0}
                    // collapsed={collapsed}
                    // collapsible
                    trigger={null}
                    >
                        {menuitems}
                    </Sider>
                </div>

                {/* <React.Suspense fallback={lazyLoading}> */}
                <Router basename="/adminconsole">
                    <Switch>
                        {/* -----resource management */}
                        <AuthenticatedRoute path="/resources/management" render={()=>navitems.filter(item=>item.id===3).length===0? null:<ResManagement />} />
                        <AuthenticatedRoute path="/resources/creation" render={()=>navitems.filter(item=>item.id===3).length===0? null:<ResCreation />} />
                        {/* -----access rule management */}
                        <AuthenticatedRoute path="/accessrule/edit" render={()=>navitems.filter(item=>item.id===1).length===0? null:<ResEditForm />} />
                        <AuthenticatedRoute path="/accessrule" render={()=>navitems.filter(item=>item.id===1).length===0? null:<AccessEditForm />} />
                        {/* -----ACL */}
                        <AuthenticatedRoute path="/acl" render={()=>navitems.filter(item=>item.id===4).length===0? null:<AclForm />} />
                        {/* -----category management */}
                        <AuthenticatedRoute path="/category/creation" render={()=>navitems.filter(item=>item.id===2).length===0? null:<CatCreation />} />
                        <AuthenticatedRoute path="/category" render={()=>navitems.filter(item=>item.id===2).length===0? null:<CategoryForm />} />
                        {/* -----User management */}
                        <AuthenticatedRoute path="/user/management" render={()=>navitems.filter(item=>item.id===6).length===0? null:<UserManagement />} />
                        {/* -----User Profile */}
                        {/* <AuthenticatedRoute path="/user/profile" render={()=>navitems.filter(item=>item.id===10).length===0? null:<React.Suspense fallback={lazyLoading}><UserProfile /></React.Suspense>} /> */}
                        <AuthenticatedRoute path="/user/profile" render={()=>navitems.filter(item=>item.id===10).length===0? null:<UserProfile />} />
                        {/* -----reports */}
                        <AuthenticatedRoute path="/reports" render={()=>navitems.filter(item=>item.id===8).length===0? null:<React.Suspense fallback={lazyLoading}><ReportsManagement /></React.Suspense>} />
                        {/* -----miniblog category management */}
                        <AuthenticatedRoute path="/miniblog/category/management" render={()=>navitems.filter(item=>item.id===12).length===0? null:<BlogCateManagement />} />
                        {/* -----miniblog assistant management */}
                        <AuthenticatedRoute path="/miniblog/assistant/management" render={()=>navitems.filter(item=>item.id===11).length===0? null:<BlogAssitManagement />} />
                        {/* -----forum category management */}
                        <AuthenticatedRoute path="/kc/category/management" render={()=>navitems.filter(item=>item.id===14).length===0? null:<React.Suspense fallback={lazyLoading}><ForumCateManagement /></React.Suspense>} />
                        <AuthenticatedRoute path="/kc/category/creation" render={()=>navitems.filter(item=>item.id===14).length===0? null:<React.Suspense fallback={lazyLoading}><ForumNewCateForm /></React.Suspense>} />
                        {/* -----special user management */}
                        <AuthenticatedRoute path="/sugrp/management" render={()=>navitems.filter(item=>item.id===13).length===0? null:<React.Suspense fallback={lazyLoading}><SplUsrGrpManagement /></React.Suspense>} />
                        {/* -----banner management */}
                        <AuthenticatedRoute path="/banner/management" render={()=>navitems.filter(item=>item.id===5).length===0? null:<React.Suspense fallback={lazyLoading}><BannerManagement /></React.Suspense>} />
                        {/* -----top banner management */}17
                        <AuthenticatedRoute path="/topbanner/management" render={()=>navitems.filter(item=>item.id===15).length===0? null:<React.Suspense fallback={lazyLoading}><TopBannerManagement /></React.Suspense>} />
                        {/* -----mobile app version management */}
                        <AuthenticatedRoute path="/mobileapp/management" render={()=>navitems.filter(item=>item.id===7).length===0? null:<React.Suspense fallback={lazyLoading}><MobileAppManagement /></React.Suspense>} />
                        {/* -----mobile notification management */}
                        <AuthenticatedRoute path="/mobilenotification/management" render={()=>navitems.filter(item=>item.id==22).length===0? null:<React.Suspense fallback={lazyLoading}><MobileNotificationManagement /></React.Suspense>} />
                        {/* -----pin management */}
                        <AuthenticatedRoute path="/pin/management" render={()=>navitems.filter(item=>item.id===19).length===0? null:<React.Suspense fallback={lazyLoading}><PinManagement /></React.Suspense>} />
                        {/* -----faq management */}
                        <AuthenticatedRoute path="/faq/management" render={()=>navitems.filter(item=>item.id===20).length===0? null:<React.Suspense fallback={lazyLoading}><FaqCateManagement /></React.Suspense>} />
                        <AuthenticatedRoute path="/faq/category/creation" render={()=>navitems.filter(item=>item.id===20).length===0? null:<React.Suspense fallback={lazyLoading}><FaqNewCateForm /></React.Suspense>} />
                        {/* ----pop out management */}
                        <AuthenticatedRoute path="/popout/management" render={()=>navitems.filter(item=>item.id===21).length===0?null:<React.Suspense fallback={lazyLoading}><PopOutManagement /></React.Suspense>}/>
                        <AuthenticatedRoute path="/elearning/management" render={()=>navitems.filter(item=>item.id===23).length===0?null:<React.Suspense fallback={lazyLoading}><ElearningManagement /></React.Suspense>}/>
                        <AuthenticatedRoute path="/elearning/candidate" render={()=>navitems.filter(item=>item.id===23).length===0?null:<React.Suspense fallback={lazyLoading}><ElearningManagementCandidate /></React.Suspense>}/>
                        <AuthenticatedRoute path="/elearning/detail" render={()=>navitems.filter(item=>item.id===23).length===0?null:<React.Suspense fallback={lazyLoading}><ElearningManagementDetail /></React.Suspense>}/>
                        <AuthenticatedRoute exact path="/" component={null}/>
                        {/* <Redirect to="/" /> */}
                    </Switch>

                </Router>
                {/* </React.Suspense> */}
                <BackTop />
                
            </Layout>
        )
    }
}
