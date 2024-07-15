import React,{ Component } from 'react';
import { Popconfirm, Button, Form, message } from 'antd';
import { fetchData } from '../service/HelperService.js';
import intl from 'react-intl-universal';
import {authPostImg} from '../resources_component/authimg.js';
import './elearning_quiz.css';

const loadingImg = process.env.PUBLIC_URL + '/images/elearning-img-loading.jpeg';
const brokenImg = process.env.PUBLIC_URL + '/images/elearning-img-broken.jpeg';
export default class ElearningQuiz extends Component{
    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          questionList: [],
          questionList2: [],
          timeUse:0,
          timeLimit: 600, // 設置時間限制為 600 秒 (10 分鐘)
          timeRemaining: 600, // 剩餘時間初始值為 600 秒
          quizId: null,
          timeRemaining_min:0,
          timeRemaining_sec:0,
          quizTitle:'',
          fileList: [],
          photoGallery:[],
          playedVideos: [],
            setPlayedVideos: (videoIds) => {
                this.setState({ playedVideos: videoIds });
            }
        };
      }
    
    componentDidMount() {
        
        this.loadQuiz();
    }

    shuffleArray = (array)=> {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    loadQuiz= ()=> {
        let url = window.location.href;
        const regex = /id=(\d+)/;
        const match = regex.exec(url);
        const id = match && match[1];

        const regex2 = /courseId=(\d+)/;
        const match2 = regex2.exec(url);
        const courseId = match2 && match2[1];

        let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getQuizQuestion/'+sessionStorage.getItem('@userInfo.id')+'?id='+id+'&courseId='+courseId;
        fetchData(loading_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){
                //this.setState({ photoGallery: res.fileList });
                let randQuestions = this.shuffleArray(this.addNameAttributeToImages(res.data.questions));
                console.log(randQuestions)
                this.setState({ 
                    questionList2: randQuestions,
                    quiz:res.data.quiz,
                    quizTitle:res.data.quiz.title,
                    timeRemaining:res.data.quiz.limitTime*60,
                    quizId:id
                });
                
                let randAnswerAndQuestion = this.generateRandomAnswers(randQuestions);
                this.setState({ 
                  questionList : randAnswerAndQuestion,
              });
                if(res.fileList&&res.msg!=='Gallery Created'){
                    let fileListManager = [];
                    res.fileList.forEach(item => {
                        fileListManager.push(item);
                        fetchData(sessionStorage.getItem('serverPort')+item.ofilename, 'get', null, response=>{})
                    })
                    this.setState({ photoGallery: fileListManager });
                    authPostImg();
                }
                this.state.questionList.forEach(question => {
                    this.handleContentImg(question);
                    //this.handleGalleryList(question);
                });
                this.generateRandomAnswers();
                // this.setState({ 
                //     questionList: this.shuffleArray(res.data.questions),
                //     quiz:res.data.quiz,
                //     quizTitle:res.data.quiz.title,
                //     timeRemaining:res.data.quiz.limitTime*60,
                //     quizId:id
                // });
                if(res.data.quiz.limitTime==0) {
                    // 获取 timeLimit 元素
                    var timeLimitElement = document.querySelector('.timeLimit');

                    // 更改内容为 "无限时间"
                    timeLimitElement.textContent = sessionStorage.getItem('lang')==='zh_TW'? '無限時間':'Infinite Time';
                } else {
                    this.timer = setInterval(this.updateTimeRemaining, 1000); // 每秒更新剩餘時間
                }
                } else {
                this.setState({ 
                    resultList: [],
                });
                message.warning(intl.get('@E_LEARNING.NOT-FOUND'), 2);
                setTimeout(()=> { window.location.replace('#/elearning/home') }, 2000);
                }
          }
        });
      }

    componentWillUnmount() {
        clearInterval(this.timer); // 卸載組件時清除計時器
    }
    
    handleContentImg = (selPost) => {
        var blogContent = document.createElement('div');
        blogContent.innerHTML = selPost.questionTitle;
        var imgArr = blogContent.querySelectorAll( 'img' );

        if(imgArr.length<1){
            //this.props.form.setFieldsValue({ content: selPost.questionTitle });
            this.setState({ loading: false });
            return;
        }

        imgArr.forEach((img)=>{

            var imgOriginSrc = img.src;
            var imgOriginAlt = img.alt;
            if(!imgOriginAlt.startsWith('resources/')&&imgOriginSrc){
                if(imgOriginSrc.startsWith('https://dsp.csd.hksarg/kms/api/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('kms/api/')+8));
                }else if(imgOriginSrc.startsWith('https://kms.csd.gov.hk/api/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('hk/api/')+7));
                }else if(imgOriginSrc.startsWith('api/resources/')){
                    img.setAttribute('alt', imgOriginSrc.slice(imgOriginSrc.indexOf('api/')+4));
                }else if(imgOriginSrc&&imgOriginSrc.startsWith('https://dsp.csd.hksarg/csdkms3/kms2/filestore2/forum/')){
                    // handle those content img linking to old kms3
                    let imgId = imgOriginSrc.lastIndexOf("/");
                    if(imgId>-1){
                        let newKMSImg = `resources/${selPost.createdby}/${selPost.id}/${imgOriginSrc.slice(imgId+1)}`;
                        img.setAttribute('alt', newKMSImg);
                    };
                }
            }

            img.src = loadingImg;
        });

        var innerHTML_v1 = blogContent.innerHTML
        //this.props.form.setFieldsValue({ content: innerHTML_v1 });

        const questionIndex = this.state.questionList.findIndex(question => question.id === selPost.id);
        if (questionIndex !== -1) {
        // 在 questionList 中找到了對應的 selPost
        selPost.questionTitle = innerHTML_v1;
        
        this.setState(prevState => ({
            questionList: prevState.questionList.map((question, index) => {
            if (index === questionIndex) {
                return selPost; // 修改對應的 selPost
            } else {
                return question; // 其他的 question 不變
            }
            })
        }));

        } 

        //console.log(this.state.fileList);
        // console.log('----start');
        this.handleGalleryList(selPost);
        // console.log('----finish');
        var countLoadedImg = 0;
        var thisForm = this.props.form;
        var thisComponent = this;
        imgArr.forEach((img)=>{
            let url = img.getAttribute('alt');

            if(url===null||url===undefined){
              img.src = brokenImg;
              img.alt = "invalid image";
              countLoadedImg += 1;
              if(countLoadedImg===imgArr.length){
                var innerHTML_v2 = blogContent.innerHTML
                thisForm.setFieldsValue({ content: innerHTML_v2 });
                thisComponent.setState({ loading: false });
              }
            }else{
              url = sessionStorage.getItem('serverPort')+url;
              let request = new XMLHttpRequest();
              request.open('get', url, true);
              request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
              request.setRequestHeader('accesshost', window.location.hostname);
      
              request.onloadstart = function () {
                request.responseType = 'blob';
              }

              request.onloadend = function () {
                countLoadedImg += 1;
                if(countLoadedImg===imgArr.length){
                  var innerHTML_v2 = blogContent.innerHTML;
                  selPost.questionTitle = innerHTML_v2;
                  // 找到 selPost 在 questionList 中的索引
                  const questionIndex = thisComponent.state.questionList.findIndex(question => question.id === selPost.id);
                  if (questionIndex !== -1) {
                    // 在 questionList 中找到了對應的 selPost
                    selPost.questionTitle = innerHTML_v2;
                    thisComponent.setState(prevState => ({
                      questionList: prevState.questionList.map((question, index) => {
                        if (index === questionIndex) {
                          return selPost; // 修改對應的 selPost
                        } else {
                          return question; // 其他的 question 不變
                        }
                      })
                    }));
                    thisComponent.setState({ loading: false });
                  } else {
                    // 在 questionList 中沒有找到對應的 selPost
                    console.log("找不到對應的 selPost");
                  }
                 // thisForm.setFieldsValue({ question: innerHTML_v2 });
                  thisComponent.setState({ loading: false });
                  
                }
              }
      
              request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                  let blobUrl = URL.createObjectURL(request.response);
                  img.src = blobUrl;
                  console.log("img.src="+img.src)
                  // img.onload = function () {
                  //   URL.revokeObjectURL(img.src);
                  // };
                }else if (request.readyState ===4 && request.status !== 200) {
                  img.src = brokenImg;
                }
      
              };

              request.send(null);
            }
        });
        
    }

    handleGalleryList = (selPost) => {
        const { photoGallery} = this.state;
        var blog = document.createElement('div');
        blog.innerHTML = selPost.questionTitle;
        var imgArr = blog.querySelectorAll( 'img' );
        const thisFunction = this;
        console.log(photoGallery)
        // imgArr.forEach(img=>{
        //     let match = photoGallery.find(iBlob=>iBlob.ofilename===img.getAttribute('alt'));
        //     if(match){
        //         img.src = match.src;
        //     }
        // })

        const questionIndex = this.state.questionList.findIndex(question => question.id === selPost.id);
        if (questionIndex !== -1) {
            // 在 questionList 中找到了對應的 selPost
            selPost.questionTitle = blog.innerHTML;
            
            this.setState(prevState => ({
              questionList: prevState.questionList.map((question, index) => {
                if (index === questionIndex) {
                  return selPost; // 修改對應的 selPost
                } else {
                  return question; // 其他的 question 不變
                }
              })
            }));
          }
        //this.setState({ loading: false });

        //this.setState({ selPost, loading: false });
    }

    addNameAttributeToImages(questions) {
        const regex = /<img([^>]+)>/g;
        const updatedQuestions = questions.map((question) => {
          const updatedQuestionTitle = question.questionTitle.replace(regex, (match) => {
            const imgTag = match.replace(/(\/?>)$/, ' name="auth-post-img"$1');
            return imgTag;
          });
      
          return {
            ...question,
            questionTitle: updatedQuestionTitle
          };
        });
      
        return updatedQuestions;
      }

    timeoutQuizEnd = () => {
        // 在此處執行終止測驗的相關操作
        // 例如顯示成績、提交答案等
        const { quiz } = this.state;
        clearInterval(this.timer); // 清除計時器
        this.handleTimeUpSubmit();
        alert("Time Up");
        window.location.href="#/elearning/quiz_result/?quizId="+quiz.id;
    };

    updateTimeRemaining = () => {
        const { timeRemaining,timeUse} = this.state;
        if (timeRemaining >= 0) {
            const minutes = Math.floor(timeRemaining/60);
            const seconds = timeRemaining%60;
            this.setState({ timeRemaining: timeRemaining - 1,timeUse:timeUse+1, timeRemaining_min:minutes, timeRemaining_sec:seconds});
        } else {
            this.timeoutQuizEnd(); // 時間到期，終止測驗
        }
    };

    handleOptionChange = (event) => {
        const { name, value } = event.target;
        this.setState(prevState => ({
            selectedOptions: {
            ...prevState.selectedOptions,
            [name]: value // 记录选项值到相应问题的名称属性中
            }
        }));
    }

    handleSubmit = (event) => {
    //handleSubmit = (event) => {
        event.preventDefault(); // 防止表單預設的提交行為
      
        // 獲取使用者的答案
        const { questionList2,quiz,timeUse } = this.state;

        let url = window.location.href;
        const regex = /courseId=(\d+)/;
        const match = regex.exec(url);
        const courseId = match && match[1];

        const userAnswers = [];
        let score = 0;
        let totalScore = questionList2.length;
        questionList2.forEach((question) => {
          const answer = document.querySelector(`input[name="answer_${question.id}"]:checked`);
          userAnswers.push({
            questionId: question.id,
            answer: answer ? answer.value : 0
          });
        });
        const values = {
            userAnswers:userAnswers,
            quiz:quiz,
            questions:questionList2,
            timeUse:timeUse
        }
        //console.log(userAnswers);
        //window.location.href="#/elearning/quiz_result";
      
        let createPost_url = sessionStorage.getItem('serverPort')+'elearning/submit_answers/'+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id+'&courseId='+courseId;
        fetchData(createPost_url, 'post', values, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    message.success("Answer(s) submit successfully.");
                    //setTimeout(()=> { window.location.replace("#/elearning/quiz_result/"+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id) }, 2000);
                    window.location.replace("#/elearning/quiz_result/?quizId="+quiz.id+'&courseId='+courseId)
                    //this.props.handleQuizEdit();
                }else{
                    message.error("Sorry, post Update was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post Update was rejected by server.", 1);
            }
        });
        let buttons = document.getElementsByTagName('button');
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }

        // 禁用所有單選按鈕
        let radioButtons = document.querySelectorAll('input[type="radio"]');
        for (let i = 0; i < radioButtons.length; i++) {
            radioButtons[i].disabled = true;
        }
        this.setState({ questionList: [] });
        clearInterval(this.timer);
      };
    
      handleTimeUpSubmit = () => {
        
        // 獲取使用者的答案
        const { questionList2,quiz,timeUse } = this.state;

        let url = window.location.href;
        const regex = /courseId=(\d+)/;
        const match = regex.exec(url);
        const courseId = match && match[1];
        
        const userAnswers = [];
        questionList2.forEach((question) => {
          const answer = document.querySelector(`input[name="answer_${question.id}"]:checked`);
          userAnswers.push({
            questionId: question.id,
            answer: answer ? answer.value : 0
          });
        });
        const values = {
            userAnswers:userAnswers,
            quiz:quiz,
            questions:questionList2,
            timeUse:timeUse
        }
            //console.log(userAnswers);
            //window.location.href="#/elearning/quiz_result";
          
            let createPost_url = sessionStorage.getItem('serverPort')+'elearning/submit_answers/'+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id+'&courseId='+courseId;
            fetchData(createPost_url, 'post', values, response=>{
                this.setState({ loading: false });
                if(response.ifSuccess){
                    let res = response.result;
                    if(res.status===200){
                        message.success("Answer(s) submit successfully.");
                        //setTimeout(()=> { window.location.replace("#/elearning/quiz_result/"+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id) }, 2000);
                        window.location.replace("#/elearning/quiz_result/"+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id+'&courseId='+courseId)
                        //this.props.handleQuizEdit();
                    }else{
                        message.error("Sorry, post Update was rejected by server.", 1);
                    }
                }else{
                    message.error("Sorry, post Update was rejected by server.", 1);
                }
            })
          
          
            // 清空選擇的答案
            // const radioInputs = document.querySelectorAll('input[type="radio"]');
            // radioInputs.forEach((input) => {
            //   input.checked = false;
            // });

            let buttons = document.getElementsByTagName('button');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].disabled = true;
            }

            // 禁用所有單選按鈕
            let radioButtons = document.querySelectorAll('input[type="radio"]');
            for (let i = 0; i < radioButtons.length; i++) {
                radioButtons[i].disabled = true;
            }
            this.setState({ questionList: [] });
            clearInterval(this.timer);
          };

    // 生成随机答案
    generateRandomAnswers = (questionList3) => {
      const { questionList2 } = this.state;
      const updatedQuestionList = questionList2.map((question) => {
        const answers = question.answer.split(';,;');
        let randomizedAnswers = null;
        if (question.randomSetting === 1) {
          randomizedAnswers = answers.map((option, optionIndex) => ({
            index: optionIndex + 1,
            content: option
          })).sort(() => Math.random() - 0.5);
        } else {
          randomizedAnswers = answers.map((option, optionIndex) => ({
            index: optionIndex + 1,
            content: option
          }));
        }
        return {
          ...question,
          randomAnswer: randomizedAnswers,
          randomAnswerIndex: null // 初始化随机答案的索引
        };
      });
      return updatedQuestionList;
      //this.setState({ questionList: updatedQuestionList });
    }

    render(){
        const { timeRemaining_min, timeRemaining_sec, quizTitle, playedVideos } = this.state;
        
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
                                <div className="create-post-main">
                                    <h2>{quizTitle}</h2>
                                    <div className="timeLimit">{intl.get('@E_LEARNING.TIME_REMAIN')}: {timeRemaining_min} {intl.get('@E_LEARNING.MINS')} {timeRemaining_sec} {intl.get('@E_LEARNING.SECONDS')}</div>
                                    <Form onSubmit={this.handleSubmit}>
                                        <div className="quiz-div">
                                        {this.state.questionList.map((question, index) => (
                                            <div key={question.id} className="question-div">
                                                <div style={{ paddingBottom: '10px' }}>{`Question ${index + 1}:`}</div>
                                                {question.postVideoLink && question.postVideoLink.trim() !== '' && (
                                                <video
                                                    width="560"
                                                    height="315"
                                                    controls
                                                    poster={process.env.PUBLIC_URL + '/images/videoPost.png'}
                                                    controlsList="nodownload"
                                                >
                                                    <source src={question.postVideoLink} type="video/mp4" />
                                                </video>
                                                )}
                                                <div className="elearning-question" dangerouslySetInnerHTML={{ __html: question.questionTitle }}></div>
                                                {/* {question.answer.split(';,;').map((option, optionIndex) => (
                                                <label className="ans" key={optionIndex}>
                                                    <input
                                                    type="radio"
                                                    name={`answer_${question.id}`}
                                                    value={optionIndex + 1}
                                                    onChange={this.handleOptionChange}
                                                    />
                                                    {option}
                                                </label>
                                                ))} */}
                                                {question.randomAnswer.map((option) => (
                                                  <label className="ans" key={option.index}>
                                                    <input
                                                      type="radio"
                                                      name={`answer_${question.id}`}
                                                      value={option.index}
                                                      onChange={this.handleOptionChange}
                                                    />
                                                    {option.content}
                                                  </label>
                                                ))}
                                            </div>
                                        ))}
                                        </div>
                                        <Form.Item className="formButtons">
                                            
                                            <Popconfirm 
                                                title="Are you sure to submit the inputs?"
                                                okText={intl.get('@GENERAL.YES')}
                                                onConfirm={this.handleSubmit}
                                                cancelText={intl.get('@GENERAL.CANCEL')}
                                                onCancel={this.onDelete}
                                                >
                                                    <Button type="primary" htmlType="submit">{intl.get('@MINI_BLOG.SUBMIT')}</Button>
                                                </Popconfirm>
                                        </Form.Item>
                                        
                                    </Form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
}