import React,{ Component } from 'react';
import intl from 'react-intl-universal';
import { fetchData } from '../service/HelperService.js';

export default class ElearningQuiz extends Component{
    constructor(props) {
        super(props);
        this.state = {
          score: 0,
          examStatus: '',
          duration_min: '',
          duration_sec: '',
          reportQuizReocrd:[],
          report:[]
        };
      }
    
    componentDidMount() {
        // 在此處獲取分數、考試狀態和考試持續時間
        const { score, examStatus, duration } = this.state;
        this.setState({ score, examStatus, duration });
        this.loadReport();
    }

    loadReport= ()=> {
        let url = window.location.href;
        const regex = /quizId=(\d+)/;
        const match = regex.exec(url);
        const id = match && match[1];
        let examStatus;
        let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getReport/'+sessionStorage.getItem('@userInfo.id')+'?clientId='+sessionStorage.getItem('@userInfo.id')+'&quizId='+id;
        fetchData(loading_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.total>0) {
                if(res.data !== undefined&&res.status===200){
                if(res.data.reportQuizRecord[0].scorePercentage>=res.data.reportQuizRecord[0].passMark) { examStatus="Pass"; } else { examStatus="fail"; }
                this.setState({ 
                    score:res.data.reportQuizRecord[0].score,
                    total_score:res.data.reportQuizRecord[0].totalScore,
                    score_percentage:res.data.reportQuizRecord[0].scorePercentage,
                    examStatus:examStatus
                });
                this.timeConvert(res.data.reportQuizRecord[0].timeUse);
                this.timer = setInterval(this.updateTimeRemaining, 1000); // 每秒更新剩餘時間
                } else {
                //   this.setState({ 
                //     reportQuizReocrd:[],
                //     report:[]
                //   });
                }
            } else {
                
                var h2 = document.querySelector('.create-post-main h2');
                h2.textContent = sessionStorage.getItem('lang')==='zh_TW'? '考試完結':'Exam Ended';
                var resultPage = document.querySelector('.quiz-result-page');
                resultPage.style.display="none";
            }
            var pageView = document.querySelector('.create-post-main');
            pageView.style.display="block";
          }
        });
      }

    timeConvert(timeRemaining) {
        if (timeRemaining >= 0) {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            this.setState({ duration_min:minutes, duration_sec:seconds});
        } else {
            this.timeoutQuizEnd(); // 時間到期，終止測驗
        }
    }

    render(){
        const { score_percentage, examStatus, duration_min, duration_sec } = this.state;
        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 165px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        <a href="#/elearning/home" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.MY_E_LEARNING')}</a>
                        </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="create-post-main" style={{display:"none"}}>
                                    <h2>{intl.get('@E_LEARNING.QUIZ_RESULT')}</h2>
                                    <div className="quiz-result-page">
                                        <div className="result-container">
                                            <div className="score">
                                                <h2>{intl.get('@E_LEARNING.SCORE')}</h2>
                                                <p>{score_percentage}</p>
                                            </div>
                                            <div className="exam-status">
                                                <p>{intl.get('@E_LEARNING.EXAM_STATUS')}: {examStatus}</p>
                                            </div>
                                            <div className="duration">
                                                <p>{intl.get('@E_LEARNING.DURATION')}: {duration_min} {intl.get('@E_LEARNING.MINS')} {duration_sec} {intl.get('@E_LEARNING.SECONDS')}</p>
                                            </div>
                                        </div>
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