//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190726 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Button, Table, message, Icon, Input, Divider, Tooltip } from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';

export default class blogAssitManagement extends React.Component{
  state={
    selBlogger: {},
    relatedAssistant: [],
    loadingAdd: false,
    loadingDel: false,
    isSuportAdmin: false,
  };

  componentDidMount(){
    this.getUserGroup();
    this.onSearch(sessionStorage.getItem('@userInfo.staffNo'));
  }

  getUserGroup=()=>{
    let getUserGroup_url = sessionStorage.getItem('serverPort')+'user/get/'+sessionStorage.getItem('@userInfo.id');
    fetchData(getUserGroup_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status&&res.data&&res.data.groupId===5){
          this.setState({ isSuportAdmin: true });
        }else{
          this.setState({ isSuportAdmin: false });
        }
      }else{
        this.setState({ isSuportAdmin: false });
      }
    })
  }

  onSearch=(staffNo)=>{
    let getBlogAssist_url = sessionStorage.getItem('serverPort')+'blog/assistant/getBlogger/'+sessionStorage.getItem('@userInfo.id')+'?staffNo='+(staffNo || sessionStorage.getItem('@userInfo.staffNo'));
    // console.log(getBlogAssist_url);
    fetchData(getBlogAssist_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.status===200&&res.data !== null&&res.data !== undefined){
          this.setState(state=>({ 
            selBlogger: res.data,
            relatedAssistant: res.data.assistant || [],
          }));
        } else {
          this.setState({ 
            selBlogger: {},
            relatedAssistant: [],
          });
        }
      }else{
        let serverRes = response.result.response;
        if(serverRes.status===500){
          message.error(serverRes.msg);
        }else{
          message.error('fetchData: Oops, please check console');
        }
        this.setState(state=>({ loadingAdd: false, loadingDel: false }));
      }
    });
  }

  onAdd=(staffNo, e)=>{
    if(staffNo!==null&&staffNo!==undefined&&staffNo.length>0){
      this.setState(state=>({ loadingAdd: true }));

      // eslint-disable-next-line
      let matchList = this.state.relatedAssistant.filter(item=>(item.staffNo==staffNo));
      if(matchList.length===0){
        let newAssist = { 
          bloggerStaffNo: this.state.selBlogger.staffNo,
          assistantStaffNo: staffNo,
          // createdBy: sessionStorage.getItem('@userInfo.staffNo')
        }
        let addAssist_url = sessionStorage.getItem('serverPort')+'blog/assistant/create/'+sessionStorage.getItem('@userInfo.id');
        
        fetchData(addAssist_url, 'post', newAssist, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&res.data !== undefined){
              this.setState(state=>({ 
                relatedAssistant: [...state.relatedAssistant, res.data],
                loadingAdd: false,
              }));
              message.success('Create successfully!');
            } else {
              message.error('Your request was rejected due to: '+res.msg);
              this.setState(state=>({ loadingAdd: false }));            
            }
          }else{
            let serverRes = response.result.response;
            if(serverRes.status===500){
              message.error(serverRes.msg);
            }else{
              message.error('fetchData: Oops, please check console');
            }
            this.setState(state=>({ loadingAdd: false, loadingDel: false }));
          }
        });
      }else{
        message.warning('This user is already in current assistant list.');
        this.setState(state=>({ loadingAdd: false }));
      }
    }
  }

  onRemove=(e, record)=>{
    this.setState(state=>({ loadingDel: true }));
    let delAssist = {
      bloggerStaffNo: this.state.selBlogger.staffNo,
      assistantStaffNo: record.staffNo,
    }
    let delAssist_url = sessionStorage.getItem('serverPort')+'blog/assistant/delete/'+sessionStorage.getItem('@userInfo.id');
    fetchData(delAssist_url,'post',delAssist,response=>{
      if(response.ifSuccess){
        // let res = response.result;
        // if(res.status===200){
          this.setState(state=>{
            let newRelatedAssist = state.relatedAssistant;
            newRelatedAssist.splice(newRelatedAssist.indexOf(record),1);
            return { relatedAssistant: newRelatedAssist, loadingDel: false };
          })
          message.success('Delete successfully!');
        // }else{
        //   this.setState(state=>({ loadingDel: false }));
        //   message.error('Your request was denied by server: ' + res.msg);
        // }
      }else{
        let serverRes = response.result.response;
        if(serverRes.status===500){
          message.error(serverRes.msg);
        }else{
          message.error('fetchData: Oops, please check console');
        }
        this.setState(state=>({ loadingAdd: false, loadingDel: false }));
      }
    })
  }

  render(){
    const { Content } = Layout;
    const maxAssist = 5;
    // const Panel = Collapse.Panel;
    const { selBlogger, relatedAssistant, isSuportAdmin } = this.state;
    const mainTable_column = [{key: 1, title: intl.get('@BLOG_ASSIST_MANAGEMENT.STAFF-NO'), dataIndex: 'staffNo' },
                              {key: 2, title: intl.get('@BLOG_ASSIST_MANAGEMENT.NAME-EN'), dataIndex: 'fullname' },
                              {key: 3, title: intl.get('@USER_MANAGEMENT.INSTITUTION'), dataIndex: 'institution' },
                              {key: 4, title: intl.get('@USER_MANAGEMENT.SECTION'), dataIndex: 'section' },
                              {key: 5, title: intl.get('@USER_MANAGEMENT.RANK'), dataIndex: 'rank' }
                            ];
    const subTable_column = [{key: 1, title: intl.get('@BLOG_ASSIST_MANAGEMENT.STAFF-NO'), dataIndex: 'staffNo' },
                            {key: 2, title: intl.get('@BLOG_ASSIST_MANAGEMENT.NAME-EN'), dataIndex: 'fullname', render:(text,record)=><Tooltip placement="right" title={`I:${record.institution || ""} S:${record.section || ""} R:${record.rank || ""}`}>{text}</Tooltip> },
                            // {key: 3, title: intl.get('@BLOG_ASSIST_MANAGEMENT.NAME-TC'), dataIndex: 'nameTc' },
                            // {key: 4, title: intl.get('@BLOG_ASSIST_MANAGEMENT.CREATED-BY'), dataIndex: 'createdBy' },
                            // {key: 4, title: intl.get('@BLOG_ASSIST_MANAGEMENT.CREATED-AT'), dataIndex: 'createdAt' },
                            {key: 5, title: intl.get('@BLOG_ASSIST_MANAGEMENT.MANAGEMENT'), 
                              render: (text, record)=>(
                                <span>
                                  <Button className="cate-admin-btn" type="danger" onClick={(e)=>this.onRemove(e, record)} >
                                    {intl.get('@BLOG_CATE_MANAGEMENT.DELETE')}
                                  </Button>
                                </span>
                              ) 
                            }];
    return (
      <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content" >
          <h1>
            <div style={{ display: 'inline-block', width: '65%' }}>
              {intl.get('@BLOG_ASSIST_MANAGEMENT.TITLE')}
            </div>
          </h1>

          <div className="cms-white-box">
            <div className="res_search" hidden={!isSuportAdmin} >
              <Input.Search 
              style={{ maxWidth: '400px' }} 
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,0.25)' }} />} 
              allowClear 
              onSearch={(value, event)=>{this.onSearch(value); event.target.value=null}} 
              placeholder={intl.get('@BLOG_ASSIST_MANAGEMENT.STAFF-NO')} 
              />
              {/* <p style={{ color: 'red', fontSize: '0.9em' }}>{intl.get('@BLOG_ASSIST_MANAGEMENT.TOP-TIPS')}</p> */}
            </div>

            <Table 
              style={{ paddingTop: '8px' }}
              rowKey={(record,index)=>index}
              pagination={false}
              columns={mainTable_column}
              dataSource={selBlogger===null? []:[selBlogger]}
            />

            <div style={{ padding: '16px' }}>
              <Divider orientation="left">{intl.get('@BLOG_ASSIST_MANAGEMENT.MY-ASSISTANT')}</Divider>
              <Input.Search 
                disabled={relatedAssistant!==null&&relatedAssistant.length>maxAssist-1}
                style={{ maxWidth: '400px', margin: '8px 0' }} 
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,0.25)' }} />} 
                enterButton={intl.get('@GENERAL.ADD')}
                onSearch={this.onAdd}
                onPressEnter={e=>e.target.value=null}
                placeholder={relatedAssistant!==null&&relatedAssistant.length>maxAssist-1? intl.get('@BLOG_ASSIST_MANAGEMENT.MAX-ASSISTANT', {maxAssist: maxAssist}):intl.get('@BLOG_ASSIST_MANAGEMENT.STAFF-NO')}
                allowClear
              />
              {/* <p style={{ color: 'red', fontSize: '0.9em' }}>{intl.get('@BLOG_ASSIST_MANAGEMENT.BOTTOM-TIPS', {selBlogger: selBlogger.fullname})}</p> */}
              <Table 
                style={{ paddingTop: '8px' }}
                rowKey={record=>record.staffNo}
                pagination={false}
                columns={subTable_column}
                dataSource={relatedAssistant || []}
              />
            </div>



          </div>
        </Content>
      </div>
    )
  }
}
