//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Descriptions } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Layout, DatePicker,Form, Input, Button, Checkbox, message, Select, Tabs, TreeSelect, Divider, Tooltip, Icon, Modal } from 'antd';
import { fetchData } from '../service/HelperService';

const confirm = Modal.confirm;
const { Option } = Select;
class ElearningManagementCandidate extends React.Component{
  
  state={  
    loading: false,
    
  };
  componentDidMount(){
    

  }

  componentWillMount = () => {
    this.loadReport();
  }

  onClickView(record){
    window.location.href="#/adminconsole/elearning/detail?quizConductCode="+record.quizConductCode;
  }

  loadReport = ()=> {
    let url = window.location.href;
    const regex = /quizId=(\d+)/;
    const match = regex.exec(url);
    const quizId = match && match[1];

    const regex2 = /courseId=(\d+)/;
    const match2 = regex2.exec(url);
    let courseId = match2 && match2[1];
    if(courseId==null) { courseId = 0; }
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getReportList/'+sessionStorage.getItem('@userInfo.id')+'?page=1&quizId='+quizId+'&courseId='+courseId;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            loading: false,
            resultList:res.data,
            quizTitle:res.data[0].title
          });
        } else {
          this.setState({ 
            loading: false
          });
        }
      }
    });
  }

  goBack = () => {
    window.history.back();
  };

  render(){
    const { quizTitle, resultList } = this.state;
    const { Content } = Layout;
    const tblprops = [
        { key: 1, width: '160px', title: intl.get('@E_LEARNING_STAFF_NO'), dataIndex: 'staffNo' , align: 'center', render: (text)=>text},
        { key: 2, title: intl.get('@E_LEARNING_CANDIDATE_NAME'), dataIndex: 'fullname', align: 'left', render: (text)=>text},
        { key: 3, title: intl.get('@E_LEARNING_CANDIDATE_SCORE'), dataIndex: 'scorePercentage', align: 'center', render: (text,record)=>(parseInt(text)<record.passMark)?<span style={{color:'Red'}}>{text}</span>:<span style={{color:'green'}}>{text}</span>},
        { key: 4, title: intl.get('@E_LEARNING_CANDIDATE_VIEW') , align: 'center', render: (text,record)=>(
            <Button className="cate-admin-btn" type="primary" onClick={()=>this.onClickView(record)}>
                <Icon type="form" />
            </Button>
        )},
        
        ];

    return(
        <div className="clearfix" style={{ width:'100%' }}>
          <Content className="cms-content">
            <h1>{quizTitle}
            </h1>
            <div>
                <Table 
                    style={{ paddingTop: '16px' }}
                    rowKey={record=>record.id}
                    bordered
                    pagination={false}
                    columns={tblprops}
                    dataSource={resultList}
                    />
            </div>
            
          </Content>
        </div>
    )
  }
}

export default Form.create()(ElearningManagementCandidate);