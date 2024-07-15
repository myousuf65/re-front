import React,{ useState , Component } from 'react';
import { Button, Icon, Table } from 'antd';
import intl from 'react-intl-universal';

export default class ElearningResultList extends Component{
    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          resultList: [],
          quizTitle: "Quiz#1"
        };
      }

    componentDidMount() {
        const resultListData = [
          {
            id: 1,
            staffNumber: "11554",
            name: "Chan Siu Ming",
            score: "60",
            candidateId: "1"
          },
          {
            id: 2,
            staffNumber: "11524",
            name: "Chan Tai Ming",
            score: "70",
            candidateId: "2"
          },
          {
            id: 3,
            staffNumber: "12554",
            name: "Cheung Chi Kin",
            score: "30",
            candidateId: "3"
          },
          {
            id: 4,
            staffNumber: "11314",
            name: "Lee Kin Ming",
            score: "10",
            candidateId: "4"
          },
        ];
    
        this.setState({ resultList: resultListData });
    }

    onClickView(record){
        window.location.href="#/elearning/candidate_result_view/"+record.candidateId;
      }

    render(){

        const { quizTitle, resultList, loading } = this.state;
        const tblprops = [
            { key: 1, width: '160px', title: intl.get('@E_LEARNING_STAFF_NO'), dataIndex: 'staffNumber' , align: 'center', render: (text)=>text},
            { key: 2, title: intl.get('@E_LEARNING_CANDIDATE_NAME'), dataIndex: 'name', align: 'left', render: (text)=>text},
            { key: 3, title: intl.get('@E_LEARNING_CANDIDATE_SCORE'), dataIndex: 'score', align: 'center', render: (text)=>(parseInt(text)<50)?<span style={{color:'Red'}}>{text}</span>:<span style={{color:'green'}}>{text}</span>},
            { key: 4, title: intl.get('@E_LEARNING_CANDIDATE_VIEW') , align: 'center', render: (text,record)=>(
                <Button className="cate-admin-btn" type="primary" onClick={()=>this.onClickView(record)}>
                    <Icon type="form" />
                </Button>
            )},
            
            ];
      
        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 510px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        <a href="#/elearning/home" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.MY_E_LEARNING')}</a>
                        <a href="#/elearning/admin" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.ADMIN')}</a>
                        <a href="#/elearning/create_quiz" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.CREATE_QUIZ')}</a>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="create-post-main">
                                    <h3>{quizTitle}</h3>
                                    <Table 
                                        style={{ paddingTop: '16px' }}
                                        loading={ loading }
                                        rowKey={record=>record.id}
                                        bordered
                                        pagination={false}
                                        columns={tblprops}
                                        dataSource={resultList}
                                        />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
}