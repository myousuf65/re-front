//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190808 */
//Comments //***s=]*** 

import React from 'react';
import { Layout, Tabs, Table } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';

import { fetchData } from '../service/HelperService';

import './user_profile.css';
import WrappedUserProfileForm from './user_profile_form';

export default class userProfile extends React.Component{

  state={ defaultActiveKey: "1" }

  componentWillMount(){
    let winHref = window.location.href;
    let keyUrl = '#/adminconsole/user/profile?';
    let selKey = winHref.indexOf(keyUrl);
    let defaultActiveKey = "";
    if(selKey>-1){
      defaultActiveKey = winHref.slice(selKey+keyUrl.length);
      if(defaultActiveKey==="2"){
        this.setState({ defaultActiveKey })
      }
      window.location.assign('#/adminconsole/user/profile')
    }

  }

  render(){
    const { Content } = Layout;
    const { TabPane } = Tabs;
    const { defaultActiveKey } = this.state;

    return(
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@USER_PROFILE.TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">

            <Tabs type="card" defaultActiveKey={defaultActiveKey} >

              <TabPane key={1} tab={intl.get('@USER_PROFILE.PROFILE')}>
                <WrappedUserProfileForm />
              </TabPane>

              <TabPane key={2} tab={intl.get('@USER_PROFILE.MY-K-REWARDS')}>
                <p style={{ color: '#007bff' }}>* {intl.get('@USER_PROFILE.K-REWARDS-REMARKS')}</p>
                <MyKRewards />
              </TabPane>
              
            </Tabs>
          </div>
        </Content>
      </div>
    )
  }
};

export class MyKRewards extends React.Component{
  state={
    loading: true,
    dataSource: [],
    kRewards: {}, 
  }

  componentDidMount(){
    this.setState({ loading: true });
    let getScore_url = sessionStorage.getItem('serverPort')+'user/getUserScore/'+sessionStorage.getItem('@userInfo.id');
    let scorePeriod = {
      startDate: moment().subtract(6,'months'),
      endDate: moment(),
    }
    fetchData(getScore_url, 'post', scorePeriod, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200){
          this.setState(state=>({
            dataSource: res.data.sort((a,b) => (a.createdAt < b.createdAt) ? 1 : ((b.createdAt < a.createdAt) ? -1 : 0)),
            kRewards: Array.isArray(res.data2)&&res.data2[0]?res.data2[0]:{},
            loading: false,
          }));
        }else{
          this.setState(state=>({
            dataSource: [],
            kRewards: {},
            loading: false,
          }));
        }
      }else{
        this.setState(state=>({ dataSource: [], kRewards: {}, loading: false }));
      }
    })
  }

  getSumScore = () => {
    const { kRewards } = this.state;
    // var footer = <span>{intl.get('@USER_PROFILE.TOTAL')} K-Rewards (KMS v2.0): {kRewards["K-Reward2"]||0}<br/>{intl.get('@USER_PROFILE.TOTAL')} K-Rewards (KMS v1.0): {kRewards["K-Reward1"]||0}</span>
    
    var footer = (<div>
      <br/>
      {intl.get('@USER_PROFILE.TOTAL')} K-Rewards 2.0:&nbsp;&nbsp;&nbsp;{kRewards["K-Reward2"]||0}
      <br/><br/>
      {intl.get('@USER_PROFILE.TOTAL')} K-Rewards 1.0:&nbsp;&nbsp;&nbsp;{kRewards["K-Reward1"]||0}
      <br/><br/>
      {intl.get('@MAIN_LAYOUT.ACCUMULATED-LOGIN')}&nbsp;&nbsp;&nbsp;{kRewards["login"]||"N/A"}
      <br/>
      </div>)

    return footer;
  }

  render(){
    const { loading, dataSource } = this.state;
    return(
      <Table
      style={{ maxWidth: '400px' }}
      rowKey={(record, index)=>index}
      pagination={false}
      loading={loading}
      bordered
      footer={(dataSource=>this.getSumScore())}
      columns={[
        { key: 1, title: intl.get('@USER_PROFILE.DATE'), width: '50%', dataIndex: 'createdAt', align: 'left', render:(text)=>moment(text).format('YYYY-MM-DD')},
        { key: 2, title: 'K-Rewards', dataIndex: 'score', align: 'left' },
      ]}
      scroll={{ y: '500px' }}
      dataSource={dataSource}
      />
    )
  }

}