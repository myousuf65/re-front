//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Layout, Form, Button, Select, Modal } from 'antd';
import { fetchData } from '../service/HelperService';
import {authPostImg} from '../resources_component/authimg.js';
import './elearning_management_detail.css';

const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
class ElearningManagementdetail extends React.Component{
  
  state={  
    loading: false,
    resultList: [],
    quizTitle: ""
  };
  componentDidMount(){
    

  }

  componentWillMount = () => {
    const questionListData = [
      {
          id:1,
          question:'Question#1',
          answer:'Answer#1B',
          correctionAns: 'Answer#1B',
      }]
    this.setState({ questionList: questionListData });
    this.loadReport();
  }

  loadReport = ()=> {
    let url = window.location.href;
    const regex = /quizConductCode=(\d+_\d+)/;
    const match = regex.exec(url);
    const quizConductCode = match && match[1];
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getReportDetail/'+sessionStorage.getItem('@userInfo.id')+'?page=1&quizConductCode='+quizConductCode;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            loading: false,
            questionList:this.addNameAttributeToImages(res.data.report),
            quizTitle:res.data.reportQuizRecord[0].title
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
        } else {
          this.setState({ 
            loading: false
          });
        }
      }
    });
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

  goBack = () => {
    window.history.back();
  };

  render(){
    const { quizTitle, questionList, loading } = this.state;
    const { Content } = Layout;
    return(
        <div className="clearfix" style={{ width:'100%' }}>
          <Content className="cms-content">
            <h3>{quizTitle}</h3>
            <div className="quiz-div">
                {questionList.map((question, index) => (
                <div key={question.id} className="question-div">
                    <div style={{paddingBottom:'10px'}}>{`Question ${index + 1}:`}</div>
                    {question.postVideoLink !== "" && (
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
                    <div className="elearning-question" dangerouslySetInnerHTML={{ __html:question.questionTitle}}></div>
                                                
                    <label className="ans">
                    {intl.get('@E_LEARNING.CANDIDATE_ANSWER')}: {question.userAnswer===question.correctAnswer?<span style={{color:'green'}}>{question[`answer`].split(";,;")[question.userAnswer-1]}</span>:<span style={{color:'red'}}>{question[`answer`].split(";,;")[question.userAnswer-1]}</span>}
                    </label>
                    <label className="ans">
                    {intl.get('@E_LEARNING.CORRECT_ANSWER')}: {question.userAnswer===question.correctAnswer?<span style={{color:'green'}}>{question[`answer`].split(";,;")[question.correctAnswer-1]}</span>:<span style={{color:'red'}}>{question[`answer`].split(";,;")[question.correctAnswer-1]}</span>}
                    </label>
                </div>
                ))}
                <Button onClick={this.goBack} style={{marginTop:'10px'}}>Back</Button>
            </div>
          </Content>
        </div>
    )
  }
}

export default Form.create()(ElearningManagementdetail);