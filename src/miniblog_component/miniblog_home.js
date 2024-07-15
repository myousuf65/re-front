//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190608 */
//Comments //***s=]*** 



import React from 'react';
import { BackTop, Icon, List, Tag, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { throttle, checkImgsByName } from '../resources_component/authimg.js';

import { fetchData, getAccessMode } from '../service/HelperService';

import PostsFilter from './posts_filter';
import PostsSorter from './posts_sorter';
import MiniblogTopPosts from './posts_top6';
// import postCover from '../images/latest-blog01.png';

// import OwlCarousel from 'react-owl-carousel';

// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';

// class LatestPosts extends React.Component{
//   state = { postList: [], catesList: [] }

//   componentWillMount(){
//     // var intl_url =sessionStorage.getItem('serverPort')+'blog/getLatest/'+sessionStorage.getItem('@userInfo.id')+'/1';  //---1 for create log in backend; 0 for not;
    
//     // fetchData(intl_url, 'get', null, response=>{
//         // if(response.ifSuccess){
//         //     let res = response.result;
//         //     console.log(res);
//         //     this.handleRes(res);
//         //     if(res.status===200){
//         //         this.setState({
//         //           postList: res.data.list,
//         //           catesList: require('../temp_json/blog_cates.json')
//         //         });
//         //         console.log('res.data.list', res.data.list);
//         //         console.log('temp', require('../temp_json/blog_resPosts.json'));
//         //     } else {
//         //         message.warning('Response from server: ', res.status);
//                  var posts = require('../temp_json/blog_resPosts.json');
//                  this.setState({ postList: posts.slice(0,6), catesList: require('../temp_json/blog_cates.json') });
//         //     };
//         // }
//     // });
//     // this.setState({ postList: require('../temp_json/blog_resPosts.json').slice(0,6), catesList: require('../temp_json/blog_cates.json') });

//   }

//   handleRes = (res) => {
//     if(res.status===200){
//         this.setState({
//           postList: res.data.list,
//           catesList: require('../temp_json/blog_cates.json')
//         });
//         console.log('res.data.list', res.data.list);
//         console.log('temp', require('../temp_json/blog_resPosts.json'));
//     } else {
//         message.warning('Response from server: ', res.status);
//          var posts = require('../temp_json/blog_resPosts.json');
//          this.setState({ postList: posts.slice(0,6), catesList: require('../temp_json/blog_cates.json') });
//     };
//   }
  
//   render() {
//     return(
//       <OwlCarousel
//         className="owl-carousel owl-theme"
//         loop
//         nav
//         margin={40}
//         responsiveClass
//         responsive={{
//           0:{
//             items:1,
//             margin:0
//           },
//           768:{
//             items:2,
//             margin:20
//           },
//           1200:{
//             items:3,
//             margin:40,
//             loop:false
//           }
//         }}
        
//       >
        
//         {this.state.postList.map(item=>{
//             // console.log(item.postTitle)
//             return(
//                 <div key={item.id} className="latest-blog-item">
//                 <h3>{item.postTitle}</h3>
//                 <div className="latest-blog-box">
//                   <div className="latest-blog-photo" style={{ backgroundImage: 'url(../images/latest-blog01.png)' }} >
//                       <a href={`#/miniblog/details/?id=${item.id}`}><span>{moment(item.publishAt).format('YYYY-MM-DD')}</span></a>
//                   </div>
//                   <a href={`#/miniblog/details/?id=${item.id}`} className="blog-desc"><div dangerouslySetInnerHTML={{ __html: item.content }} /></a>
//                   <p className="blog-type">
//                     { sessionStorage.getItem('lang') === 'zh_TW'?
//                         this.state.catesList.filter(cate => {return cate.id === item.categoryId; })[0].categoryC
//                         :this.state.catesList.filter(cate => {return cate.id === item.categoryId; })[0].category }
//                   </p>
//                 </div>
//                 </div>
//             )
//             })
//         }
//       </OwlCarousel>
//       )
//     }
// }

class BottomPostList extends React.Component{

    state = { 
        currentPage: 1,
        totalPosts: 0, 
        postList: [],
        selCateId: 0, 
        selSorter: 'publish_at:desc',
        loading: false,
    };

    componentDidMount(){
        this.setState(state=>({ loading: true }));
        let intl_url = sessionStorage.getItem('serverPort')+'blog/search/?user='+sessionStorage.getItem('@userInfo.id')+'&CateId=0&selSorter=publish_at:desc&page=1';
        fetchData(intl_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState(state=>({
                        postList: res.data.list,
                        totalPosts: res.total || res.data.total,
                        loading: false,
                    }));
                } else {
                    message.warning(res.status+': '+ res.msg);
                    this.setState({ postList: [], totalPosts: 0, loading: false });
                };
            }else{
              this.setState(state=>({ loading: false }));
            }
        });

    }

    handlePageChange = page => {
        this.setState({ currentPage: page, loading: true });

        let pagin_url = sessionStorage.getItem('serverPort')+"blog/search/?user="+sessionStorage.getItem('@userInfo.id');

        pagin_url += '&CateId='+this.state.selCateId;

        if(this.state.selSorter !== null) {
            pagin_url += '&selSorter='+this.state.selSorter;
        };

        pagin_url += '&page='+page;

        fetchData(pagin_url,'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  this.setState({ 
                      postList: res.data.list, 
                      totalPosts: res.data.total, 
                      loading: false,
                  });
                //   authDivImgByName('auth-div-img-bottom');
              } else {
                  message.warning(res.status+': '+ res.msg);
                  this.setState({ postList: [], totalPosts: 0, loading: false });
              }
            }else{
              this.setState(state=>({ loading: false }));
            }
        })
    }

    handleFilterChange = (cateId) => {
        this.setState({ selCateId: cateId, loading: true });
        let filter_url = sessionStorage.getItem('serverPort')+"blog/search/?user="+sessionStorage.getItem('@userInfo.id');
        
        filter_url += '&CateId=' + cateId;

        if(this.state.selSorter !== null) {
            filter_url += '&selSorter=' + this.state.selSorter;
        };

        filter_url += '&page='+ this.state.currentPage;

        fetchData(filter_url,'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  this.setState({ postList: res.data.list, totalPosts: res.data.total, loading: false });
              } else {
                  message.warning(res.status+': '+ res.msg);
                  this.setState({ postList: [], totalPosts: 0, loading: false });
              }
            }else{
              this.setState(state=>({ loading: false }));
            }
        })
    }

    handleSorterChange = (selSorter) => {
        this.setState({ selSorter, loading: true });
        let sorter_url = sessionStorage.getItem('serverPort')+"blog/search/?user="+sessionStorage.getItem('@userInfo.id');
        
        sorter_url += '&CateId=' + this.state.selCateId;

        if(this.state.selSorter !== null) {
            sorter_url += '&selSorter=' + selSorter;
        };

        sorter_url += '&page='+ this.state.currentPage;

        fetchData(sorter_url,'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState({ postList: res.data.list, totalPosts: res.data.total, loading: false });
                } else {
                    message.warning(res.status+': '+ res.msg);
                    this.setState({ postList: [], totalPosts: 0, loading: false });
                }
            }else{
                this.setState(state=>({ loading: false }));
            }
        })
    }

    stripHtml=(description)=>{
        description = description.replace(/(\n)/g, "");  
        description = description.replace(/(\t)/g, "");  
        description = description.replace(/(\r)/g, "");  
        description = description.replace(/<\/?[^>]*>/g, "");  
        // description = description.replace(/\s*/g, "");
        if(description.length>50){
            description = description.slice(0,50) + '...';
        }
        return description;
    }
    
    render() {
        const { currentPage, totalPosts, postList, loading } = this.state;
        const accessMode = getAccessMode();
        const paginprops = {
            size: accessMode===3? "small":"",
            defaultCurrent: 1,
            current: currentPage,
            showQuickJumper: true,
            position: 'both',
            pageSize: 20,
            total: totalPosts,
            showTotal: (total, range) => accessMode===3? `Total ${total}`:`${range[0]}-${range[1]} of ${total} posts`,
            onChange: this.handlePageChange,
        }

        const spinProp = {
            spinning: loading,
            delay: 500,
            tip: 'Loading...'
        }

        const IconText = ({ type, text }) => (
            <span>
              <Icon type={type} style={{ marginRight: 8 }} />
              {text}
            </span>
          );

        return(
            <div>
                <div className="mini-blog-header mini-blog-select">
                <div className="container clearfix select-blog-bar">
                    <div className="row" style={{marginTop: '15px'}}>
                        <div className="col-sm-6"><PostsFilter filterPosts={this.handleFilterChange.bind(this)} /></div>
                        <div className="col-sm-6 clearfix blog-sort" ><label className="blog-sort-label">{intl.get('@MINIBLOG_HOME.SORT-BY')}</label><PostsSorter sortPosts={this.handleSorterChange.bind(this)} /></div>
                    </div>
                </div>
                </div>

                {/* <div className="page-content"> */}
                <div className="container blog-list">
                    <List
                    itemLayout="vertical"
                    size="middle"
                    loading={spinProp}
                    pagination={paginprops}
                    dataSource={postList}
                    renderItem={item => (
                        <div className="blog-post clearfix">
                        <List.Item
                            key={item.blog.id}
                            actions={[<IconText type="eye-o" text={item.blog.hit} />, <IconText type="like-o" text={item.likes}/>, <IconText type="message" text={item.comments} />]}
                            extra={
                            <div 
                            className="blog-cover" 
                            style={{   
                                backgroundPosition: 'center',
                                backgroundSize: 'cover',
                                backgroundRepeat: 'no-repeat',
                                height: '150px',
                                width: '272px' 
                            }} 
                            name='auth-div-img'
                            data-alt="0"
                            data={typeof(item.blog)==='undefined'? null:item.blog.thumbnail}
                            alt="POSTS"
                            />
                            }
                        >
                            <List.Item.Meta
                            title={<a href={`#/miniblog/details/?id=${item.blog.id}`}>{item.blog.postTitle} </a>}
                            description={
                            <label>
                                {
                                    item.blog.showAsAlias===1? 
                                    (item.blog.alias || 'Unknown') 
                                    : 
                                    (item.blog.originalCreator.fullname||'Unkown')
                                } | <span> 
                                {
                                    moment(item.blog.publishAt).format('YYYY-MM-DD')
                                }
                                </span>
                            </label>}
                            />
                            <div dangerouslySetInnerHTML={{ __html: typeof(item.blog)==='undefined'? '':this.stripHtml(item.blog.content) }} />
                            <div style={{ paddingTop:'10px' }}><Tag style={{ fontSize:14 }} color="geekblue">
                                { sessionStorage.getItem('lang') === 'zh_TW'?
                                this.props.catesList.filter(cate => {return cate.id === item.blog.categoryId; })[0].categoryC
                                :this.props.catesList.filter(cate => {return cate.id === item.blog.categoryId; })[0].category }
                            </Tag></div>
                        </List.Item>
                        </div>
                        )}
                    />
                </div>
                {/* </div> */}

            </div>

        )
    };
}

export default class MiniblogHome extends React.Component{

    state = { postList: [], catesList: [], loading: false };

    componentDidMount(){
        this.setState({ catesList: require('../temp_json/blog_cates.json'), loading: true });
        let intl_url = sessionStorage.getItem('serverPort')+'blog/getLatest/'+sessionStorage.getItem('@userInfo.id')+'/1';  //---1 for create log in backend; 0 for not;

        fetchData(intl_url, 'get', null, response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  this.setState({
                    postList: res.data.list,
                    loading: false,
                  });
                  checkImgsByName('auth-div-img');
                  this.props.handleScoring(res.score);
              } else {
                  this.setState({
                      postList: [],
                      loading: false,
                  });
              };
            }else{
              this.setState(state=>({ loading: false }));
            }
        })
        window.addEventListener('scroll', this.onScroll, false);
    }

    onScroll=()=>{
        throttle(checkImgsByName('auth-div-img') );
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll, false);
    }

    render() {
        const { postList, catesList, loading } = this.state;

        return(
            <div>
                <div className="mini-blog-header">
                <div className="container clearfix">
                    <a href="#/miniblog/home"><h2>{intl.get('@MINI_BLOG.MINI-BLOG')}</h2></a>
                    <a href="#/miniblog/myblog" className="btn-my-blog">{intl.get('@MINIBLOG_HOME.MY-BLOG')}</a>
                </div>
                </div>

                {/* -----------Carousel for latest 6 posts */}
                {/* <div className="page-content"> */}
                <div className="container latest-blog">
                    <div className="row" style={{ height: 'auto' }}>
                        <div className="col-lg-3 col-md-4">
                            <h2 className="latest-blog-circle">{intl.get('@MINIBLOG_HOME.LATEST-BLOG1')}<br/>{intl.get('@MINIBLOG_HOME.LATEST-BLOG2')}</h2>
                        </div>
                        
                        <div className="col-lg-9 col-md-8">
                            {/* <LatestPosts /> */}
                            <div style={{ height: '400px' }}>
                                <MiniblogTopPosts posts_latest_arr={postList} loading={loading} />
                            </div>
                        </div>
                        
                    </div>
                </div>
                {/* </div> */}


                <BottomPostList catesList={catesList} />

                <BackTop />
            </div>
        )
    }
}