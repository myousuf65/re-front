import React,{ useState , Component } from 'react';
import intl from 'react-intl-universal';
import { List, message } from 'antd';
import { fetchData } from '../service/HelperService';
import moment from 'moment';
import './elearning_home.css';

export default class ElearningHome extends Component{
    constructor(props) {
        super(props);
        this.state = {
          selectedCategory: null,
          loading: false,
          current_page:0,
          total_results:0,
        };
      }

    handleCategoryClick = (category) => {
        this.setState(state=>({ selectedCategory: category }));
        
    }

    componentDidMount() {
        this.loadQuiz();
    }

    loadQuiz= ()=> {
      let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchCourseAccess/'+sessionStorage.getItem('@userInfo.id')+'?page=1&cat=0';
      this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
      fetchData(loading_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.data !== undefined&&res.status===200){
            this.setState({ 
              resultList: res.data,
              current_page:1 ,
              total_results: res.total,
              loading: false
            });
          } else {
            message.warning(res.status+': '+ res.msg);
            //setTimeout(()=> { window.location.replace('#/miniblog/home') }, 2000);
          }
        }
      });
    }

    handlePageChange= page=>{
      this.setState(state=>({ current_page: page, loading: true }))
      let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchCourseAccess/'+sessionStorage.getItem('@userInfo.id')+'?page='+page;
      let searchParams = this.state.current_params;
      // if(searchParams !== null && searchParams !== ''){
      //   pagin_url += searchParams;
      // }
      fetchData( pagin_url, 'get', null, response => {
        if(response.ifSuccess){
          let res = response.result;
          if(res.status === 200){
            this.setState({
              resultList: res.data,
              total_results: res.total,
              loading: false,
            })
          } else if (res.status === 555) {
            this.setState({
              resultList: [],
              total_results: 0,
              loading: false,
            })
          }
        }
      });
    }

    handleRunQuizList = (courseId) => {
        // 透過 quizId 執行適當的操作，例如重定向到指定的連結
        window.location.href = `#/elearning/quiz_list/?courseId=${courseId}`; // 替換為你想要的連結格式
    };

    render(){

        const { resultList,current_page,total_results } = this.state;

        const paginprops = {
            position: 'both',
            defaultCurrent: 1,
            current: current_page,
            // hideOnSinglePage: true,
            pageSize: 10,
            total: total_results,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
            onChange: this.handlePageChange,
          }

        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 170px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        {/* <a href="#/elearning/admin" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.ADMIN')}</a> */}
                    </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="create-post-main">
                                    <h3>{intl.get('@E_LEARNING.COURSE')}</h3>
                                    <List
                                      itemLayout="vertical"
                                      size="middle"
                                      pagination={paginprops}
                                      dataSource={resultList}
                                      renderItem={item => (

                                        <List.Item
                                          key={item.id}
                                          extra={
                                            <div>
                                              <button
                                              className={`btn-run`}
                                              onClick={() => this.handleRunQuizList(item.id)}
                                            >
                                              {sessionStorage.getItem('lang')==='zh_TW'? '測試列表':'Assessment List'}
                                              
                                            </button>
                                          </div>
                                          }

                                      >
                                        <List.Item.Meta
                                          title={<div>{item.courseName}</div>}
                                          description={
                                            <div>
                                            </div>}
                                        >
                                        </List.Item.Meta>
                                      </List.Item>
                                    )}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
}