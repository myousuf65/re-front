//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20191031 */
//Comments //***s=]*** 



import React from 'react';
import { List } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';
import iconNewsCorner from '../images/icon-latest-news.png';

export default class NewsCorner extends React.Component{

    state={ data: [], list: [], loading: true, tries: 0 };

    componentDidMount(){
        this.setState({ loading: true }, ()=>this.getNewsCornerData());
    }

    getNewsCornerData=()=>{
        let getData_url = sessionStorage.getItem('serverPort')+'resource/homepage/newscorner2/'+sessionStorage.getItem('@userInfo.id');

        fetchData(getData_url, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&res.data!==undefined){
                    if(Array.isArray(res.data.newsCorner2)){
                        let resData = res.data.newsCorner2;
                        this.setState(state=>({
                            data: resData,
                            list: resData.length < 4? resData:resData.slice(0,3),
                            loading: false,
                        }))
                    }else{
                        this.setState(state=>({ loading: false, data: [], list: [] }))
                    }
                }else{
                    if(this.state.tries<2){
                        console.log(`(IN${res.status})refresh mb`)
                        this.setState(state=>({ tries: state.tries+1 }), ()=>this.getNewsCornerData());
                    }else{
                        console.log(`(IN${res.status})leave mb`)
                        this.setState(state=>({ loading: false, data: [], list: [] }));
                    }
                    // this.setState(state=>({ loading: false, data: [], list: [] }))
                }
            }else{
                let httpCode = response.result.status;
                if(httpCode===401 || httpCode===409 || httpCode===423 || httpCode===440){
                    this.setState(state=>({ loading: false }));
                }else if(this.state.tries<2){
                    console.log(`(OUT${response.result.status})refresh mb`)
                    this.setState(state=>({ tries: state.tries+1 }), ()=>this.getNewsCornerData());
                }else{
                    console.log(`(OUT${response.result.status})leave mb`)
                    this.setState(state=>({ loading: false, data: [], list: [] }));
                }
            //   this.setState(state=>({ loading: false }));
            }
        })
    }

    handleShowAll=()=>{
        window.location.assign('#/newscorner/home');
    }

    render() {
        const { list, loading } = this.state;

        return(
            <div>
                <List 
                header={<div className="header-with-icon">
                        <img className="header-icon" alt="" src={iconNewsCorner} /> <h2>{intl.get('@NEWS_CORNER.NEWS-CORNER')}</h2>
                        {/* eslint-disable-next-line */}
                        <a onClick={this.handleShowAll} className="btn-show-all">{intl.get('@GENERAL.SHOW-ALL')}</a>
                        </div>
                        }
                loading={loading}
                bordered
                size="large"
                dataSource = {list}
                renderItem = {item => (
                    <List.Item key={item.id} style={{ minHeight:'102.8px' }}>
                    <div className="latest-news-list" ><p className="date" style={{backgroundColor:'transparent'}} >{moment(item.publishAt).format("YYYY-MM-DD")}</p>
                        <List.Item.Meta
                        className="title"
                        title={<a href={`${item.link}`} target="_blank"><b>{item.postTitle}</b></a>}
                        />
                    </div>
                    </List.Item>
                )}
                />
            </div>
        )
    }
}