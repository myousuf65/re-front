import React,{ useState , Component } from 'react';
import { Button, Icon, Table } from 'antd';
import intl from 'react-intl-universal';

export default class ElearningResultView extends Component{
    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          questionList: [],
          quizTitle:"Quiz#1"
        };
      }

    componentDidMount() {
        const questionListData = [
        {
            id:1,
            question:'Question#1',
            answer:'Answer#1B',
            correctionAns: 'Answer#1B',
        },
        {
            id:2,
            question:'Question#2',
            answer:'Answer#2A',
            correctionAns: 'Answer#2B',
        },
        {
            id:3,
            question:'Question#3',
            answer:'Answer#3C',
            correctionAns: 'Answer#3B',
        },
        {
            id:4,
            question:'Question#4',
            answer:'Answer#4A',
            correctionAns: 'Answer#4A',
        },
        {
            id:5,
            question:'Question#5',
            answer:'Answer#5D',
            correctionAns: 'Answer#5A',
        }
        ];
    
        this.setState({ questionList: questionListData });
    }

    onClickView(record){
        window.location.href="#/elearning/candidate_result_view/"+record.candidateId;
      }

    render(){

        const { quizTitle, questionList, loading } = this.state;
        
      
        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 510px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        <a href="#/elearning/home" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.MY_E_LEARNING')}</a>
                        <a href="#/elearning/admin" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.ADMIN')}</a>
                        <a onClick={() => { window.history.back() }} className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.PREVIOUS')}</a>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="create-post-main">
                                    <h3>{quizTitle}</h3>
                                    <div className="quiz-div">
                                        {this.state.questionList.map((question, index) => (
                                        <div key={question.id} className="question-div">
                                            <p>{`Question ${index + 1}: ${question.question}`}</p>
                                            <label className="ans">
                                            {intl.get('@E_LEARNING.CANDIDATE_ANSWER')}: {question.answer==question.correctionAnswer?<span style={{color:'green'}}>{question.answer}</span>:<span style={{color:'red'}}>{question.answer}</span>}
                                            </label>
                                            <label className="ans">
                                            {intl.get('@E_LEARNING.CORRECT_ANSWER')}: {question.answer==question.correctionAnswer?<span style={{color:'green'}}>{question.answer}</span>:<span style={{color:'red'}}>{question.answer}</span>}
                                            </label>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
}