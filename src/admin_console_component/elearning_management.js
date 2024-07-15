//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190828 */
//Comments //***s=]*** 



import React from 'react';
import { Table, Descriptions } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import { Layout, Form, message, Select, Tabs, Modal, Button } from 'antd';
import * as XLSX from 'xlsx';
import ElearningQuizForm from './elearning_quiz_form';
import ElearningQuizFormEdit from './elearning_quiz_form_edit';
import ElearningCatForm from './elearning_cat_form';
import ElearningQuestionForm from './elearning_question_form';
import ElearningQuestionFormEdit from './elearning_question_form_edit';
import ElearningQuizQuestionManage from './elearning_quiz_question_manage';
import ElearningCourseForm from './elearning_course_form';
import ElearningCourseFormEdit from './elearning_course_form_edit';
import ElearningCourseQuizManage from './elearning_course_quiz_manage';
import ElearningCatFormEdit from './elearning_cat_form_edit';
import { fetchData } from '../service/HelperService';
import './elearning_management.css';

const confirm = Modal.confirm;
const { Option } = Select;
class ElearningManagement extends React.Component{
  
  state={  
    loading: false,
    isButtonDisabled: false,
    accessRule: [],
    searchCourseQuery: "",
    searchQuizQuery: "",
    searchQuestionQuery: "",
    searchCategoryQuery: "",
    selRecord: null,
    selectedRows: [], 
    selectedRowKeys: [],
    coursList:null,
    resultList:null,
    quizcurrent_page:1,
    catcurrent_page:1,
    questioncurrent_page:1,
    coursecurrent_page:1,
    quiztotal_results:0,
    cattotal_results:0,
    coursetotal_results:0,
    questiontotal_results:0,
    addQuizForm:false,
    editQuizForm:false,
    addCatForm:false,
    addQuestionForm:false,
    editQuestionForm:false,
    courseQuizManageForm:false,
    addCourseForm:false,
    editCourseForm:false,
    editCatForm:false,
    submitting: false,
    selPost:null,
    catList:[],
    catAllList:[],
    courseCatAllList:[],
    catId:0,
    courseCatId:0,
    categorySelect:0,
    courseCatSelect:0,
    quiz:null,
    course:null,
    cat:null,
    selectedQuizRecord:null,
    delQuiz:null,
    selectedQuestionRecord:null,
    delQuestion:null,
    selectedFile: null,
    importedData: null,
    isImportedLogVisible: false,
    report:null,
  };
  componentDidMount(){
    

  }

  componentWillMount = () => {
    this.loadQuiz();
    this.loadCourse();
    this.loadCategory();
    this.loadAllCategory();
    this.loadAllCourseCategory();
  }

  loadQuiz= ()=> {
    const { courseCatSelect, searchQuizQuery } = this.state
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/search_quiz/'+sessionStorage.getItem('@userInfo.id')+'?page=1&catId='+courseCatSelect+'&search='+searchQuizQuery;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            quizList: res.data,
            quizcurrent_page:1 ,
            quiztotal_results: res.total,
            loading: false
          });
        } else {
          this.setState({ 
            quizList: [],
            quizcurrent_page:1, 
            quiztotal_results: 0,
            loading: false
          });
          message.warning(res.status+': '+ res.msg);
        }
      }
    });
  }

  loadCourse = ()=> {
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchCourse/'+sessionStorage.getItem('@userInfo.id')+'?page=1&search='+this.state.searchCourseQuery;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            courseList: res.data,
            coursecurrent_page:1 ,
            coursetotal_results: res.total,
            loading: false
          });
        } else {
          this.setState({ 
            courseList: [],
            coursecurrent_page:1, 
            coursetotal_results: 0,
            loading: false
          });
          message.warning(res.status+': '+ res.msg);
        }
      }
    });
  }

  loadCategory = ()=> {
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchCategory/'+sessionStorage.getItem('@userInfo.id')+'?page=1&cat=0&search='+this.state.searchCategoryQuery;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            catList: res.data,
            catcurrent_page:1 ,
            cattotal_results: res.total,
            loading: false
          });
        } else {
          this.setState({ 
            catList: [],
            catcurrent_page:1, 
            cattotal_results: 0,
            loading: false
          });
          message.warning(res.status+': '+ res.msg);
        }
      }
    });
  }

  loadAllCategory = ()=> {
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchAllCategory/'+sessionStorage.getItem('@userInfo.id');
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            catAllList: res.data,
          });
          this.loadQuestion();
        } else {
          this.setState({ 
            catAllList: [],
          });
          message.warning(res.status+': '+ res.msg);
        }
      }
    });
  }

  loadAllCourseCategory = ()=> {
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchAllCourseCat/'+sessionStorage.getItem('@userInfo.id');
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true}));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          this.setState({ 
            courseCatAllList: res.data,
          });
          this.loadQuestion();
        } else {
          this.setState({ 
            courseCatAllList: [],
          });
          message.warning(res.status+': '+ res.msg);
        }
      }
    });
  }

  loadQuestion = ()=> {
    const { categorySelect, searchQuestionQuery } = this.state;
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuestion/'+sessionStorage.getItem('@userInfo.id')+'?page=1&catId='+categorySelect+'&search='+searchQuestionQuery;
    this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
    fetchData(loading_url, 'get', null, response=>{
      if(response.ifSuccess){
        let res = response.result;
        if(res.data !== undefined&&res.status===200){
          // 獲取類別列表
          const catAllList = this.state.catAllList;

          // 遍歷問題列表
          const updatedQuestionList = res.data.map(question => {
            // 根據catId查找對應的類別標題
            const cat = catAllList.find(cat => cat.id === question.catId);
            const catTitle = cat ? cat.title : '';

            // 返回更新後的問題對象
            return { ...question, catTitle: catTitle };
          });

          this.setState({
            questionList: updatedQuestionList,
            questioncurrent_page: 1,
            questiontotal_results: res.total,
            loading: false
          });
        } else {
          this.setState({ 
            questionList: [],
            questioncurrent_page:1, 
            questiontotal_results: 0,
            loading: false
          });
        }
      }
    });
  }

  

  handleRunQuiz = (quizId) => {
    // 透過 quizId 執行適當的操作，例如重定向到指定的連結
    window.location.href = `#/elearning/quiz/${quizId}`; // 替換為你想要的連結格式
  };

  handleRunEdit = (quizId) => {
      // 透過 quizId 執行適當的操作，例如重定向到指定的連結
      window.location.href = `#/elearning/question_manage/${quizId}`; // 替換為你想要的連結格式
  }
    
  handleRunResult = (quizId) => {
      // 透過 quizId 執行適當的操作，例如重定向到指定的連結
      window.location.href = `#/adminconsole/elearning/candidate?quizId=${quizId}`; // 替換為你想要的連結格式
  };

  handleRunResult_2 = (quizId,courseId) => {
      const url = `#/adminconsole/elearning/candidate?quizId=${quizId}&courseId=${courseId}`;
      const newTab = window.open(url, '_blank');
      newTab.focus();
  }

  handleQuizPageChange= page=>{
    const { courseCatSelect, searchQuizQuery } = this.state;
    this.setState(state=>({ quizcurrent_page: page, loading: true }))
    let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/search_quiz/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+"&cat="+courseCatSelect+'&search='+searchQuizQuery;
    // let searchParams = this.state.current_params;
    // if(searchParams !== null && searchParams !== ''){
    //   pagin_url += searchParams;
    // }
    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            quizList: res.data,
            total_results: res.data.total,
            loading: false,
          })
        } else if (res.status === 555) {
          this.setState({
            quizList: [],
            total_results: 0,
            loading: false,
          })
        }
      }
    });
  }

  handleCoursePageChange= page=>{
    const { courseCatSelect, searchCourseQuery } = this.state;
    this.setState(state=>({ coursecurrent_page: page, loading: true }))
    let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchCourse/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+"&cat="+courseCatSelect+'&search='+searchCourseQuery;
    // let searchParams = this.state.current_params;
    // if(searchParams !== null && searchParams !== ''){
    //   pagin_url += searchParams;
    // }

    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            courseList: res.data,
            total_results: res.total,
            loading: false,
          })
        } else if (res.status === 555) {
          this.setState({
            courseList: [],
            total_results: 0,
            loading: false,
          })
        }
      }
    });
  }

  handleCatPageChange = page=> {
    const { categorySelect, searchCategoryQuery } = this.state;
    this.setState(state=>({ catcurrent_page: page, loading: false }))
    let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchCategory/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&search='+searchCategoryQuery;
    // let searchParams = this.state.current_params;
    // if(searchParams !== null && searchParams !== ''){
    //   pagin_url += searchParams;
    // }
    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            catList: res.data,
            total_results: res.total,
            loading: false,
          })
        } else if (res.status === 555) {
          this.setState({
            catList: [],
            total_results: 0,
            loading: false,
          })
        }
      }
    });
  }

  handleQuestPageChange = page=> {
    const { categorySelect, searchQuestionQuery } = this.state;
    this.setState(state=>({ questioncurrent_page: page, loading: true }))
    let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuestion/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&catId='+categorySelect+'&search='+searchQuestionQuery;
    // let searchParams = this.state.current_params;
    // if(searchParams !== null && searchParams !== ''){
    //   pagin_url += searchParams;
    // }
    fetchData( pagin_url, 'get', null, response => {
      if(response.ifSuccess){
        let res = response.result;
        if(res.status === 200){
          this.setState({
            questionList: res.data,
            total_results: res.total,
            loading: false,
          })
        } else if (res.status === 555) {
          this.setState({
            questionList: [],
            total_results: 0,
            loading: false,
          })
        }
      }
    });
  }

  addQuiz = ()=>{
    this.setState(state=>({ addQuizForm:true }))
  }

  editQuiz = (quiz)=>{
    this.setState(state=>({ editQuizForm:true, selRecord:quiz }))
  }

  quizQuestionManage = (quiz) =>{
    this.setState(state=>({ quizQuestionManageForm:true, quiz:quiz }))
  }

  courseQuizManage = (course) =>{
    this.setState(state=>({ courseQuizManageForm:true, course:course }))
  }

  courseDuplicate(course) {
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '確定複製?':'Are you sure to duplicate?',
    //   content: 'You will delete this post and cannot get it back, continue?',
      okText: sessionStorage.getItem('lang')==='zh_TW'? '確定':'Confirm',
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: ()=> {
        let loading_url = sessionStorage.getItem('serverPort') + 'elearning/copyCourse/'+sessionStorage.getItem('@userInfo.id')+'?courseId='+course.id;
        this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
        fetchData(loading_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){
              message.success("Post Duplicate successfully.");
              this.loadQuiz();
              this.loadCourse();
              this.loadCategory();
              this.setState({
                loading: false
              });
            } else {
              message.error("Sorry, post Duplicate was rejected by server.", 1);
              this.setState({
                loading: false
              });
            }
          } else {
            message.error("Sorry, post Update was rejected by server.", 1);
            this.setState({
              loading: false
            });
          }
        });

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
    
  }

  addCat = ()=>{
    this.setState(state=>({ addCatForm:true }))
  }

  editCat = (cat)=>{
    this.setState(state=>({ editCatForm:true, cat:cat }))
  }

  addQuestion = ()=>{
    this.setState(state=>({ addQuestionForm:true }))
  }

  editQuestion = (question)=>{
    this.setState(state=>({ editQuestionForm:true, selRecord:question }))
  }

  addCourse = ()=>{
    this.setState(state=>({ addCourseForm:true }))
  }

  editCourse = (course)=>{
    this.setState(state=>({ editCourseForm:true, selRecord:course }))
  }

  categoryDelete = (categoryId) => {
    const thisCourse=this;
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此類別刪除後將無法找回，確定刪除?':'You will delete this catrgory and cannot get it back, continue?',
    //   content: 'You will delete this post and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: ()=> {
        var delpost_url = sessionStorage.getItem('serverPort')+'elearning/delete_category/'+categoryId;
        // setTimeout(()=>{
            // message.info('Your request for post delete was sent.');
            
            fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success('This course has been deleted successfully. We now turn you back to Home page.', 1);
                      thisCourse.loadCategory()
                  }else if(res.status===555){
                      message.warning('Sorry, your request was denied by server.');
                  }else{
                      message.error(res.status,": ", res.msg);
                  };
                }
            })

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
  }

  QuestionDelete = (questionId) => {
    const thisCourse=this;
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此問題刪除後將無法找回，確定刪除?':'You will delete this question and cannot get it back, continue?',
    //   content: 'You will delete this post and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: ()=> {
        var delpost_url = sessionStorage.getItem('serverPort')+'elearning/delete_question/'+questionId;
        // setTimeout(()=>{
            // message.info('Your request for post delete was sent.');
            
            fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success('This course has been deleted successfully. We now turn you back to Home page.', 1);
                      thisCourse.setState({delQuestion:questionId})
                      thisCourse.loadQuestion()
                  }else if(res.status===555){
                      message.warning('Sorry, your request was denied by server.');
                  }else{
                      message.error(res.status,": ", res.msg);
                  };
                }
            })

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
  }

  QuizDelete = (quizId) => {
    const thisCourse=this;
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此測驗刪除後將無法找回，確定刪除?':'You will delete this assessment and cannot get it back, continue?',
    //   content: 'You will delete this post and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: ()=> {
        var delpost_url = sessionStorage.getItem('serverPort')+'elearning/delete_quiz/'+quizId;
        // setTimeout(()=>{
            // message.info('Your request for post delete was sent.');
            
            fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success('This course has been deleted successfully. We now turn you back to Home page.', 1);
                      
                      thisCourse.setState({delQuiz:quizId}) 
                      thisCourse.loadQuiz()
                  }else if(res.status===555){
                      message.warning('Sorry, your request was denied by server.');
                  }else{
                      message.error(res.status,": ", res.msg);
                  };
                }
            })

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
  }

  courseDelete = (courseId) => {
    const thisCourse=this;
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此課程刪除後將無法找回，確定刪除?':'You will delete this course and cannot get it back, continue?',
    //   content: 'You will delete this post and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk: ()=> {
        var delpost_url = sessionStorage.getItem('serverPort')+'elearning/delete_course/'+courseId;
        // setTimeout(()=>{
            // message.info('Your request for post delete was sent.');
            
            fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success('This course has been deleted successfully. We now turn you back to Home page.', 1);
                      thisCourse.loadCourse()
                  }else if(res.status===555){
                      message.warning('Sorry, your request was denied by server.');
                  }else{
                      message.error(res.status,": ", res.msg);
                  };
                }
            })

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
  }

  handleQuizAdd = () => {
    this.setState(state=>({ addQuizForm:false }))
    this.componentWillMount();
  }

  handleQuizEdit = (record) => {
    this.setState(state=>({ editQuizForm:false, selectedQuizRecord:record }))
    this.componentWillMount();
  }

  handleCatAdd = () => {
    this.setState(state=>({ addCatForm:false }))
    this.componentWillMount();
  }

  handleQuestionAdd = () => {
    this.setState(state=>({ addQuestionForm:false }))
    this.componentWillMount();
  }

  handleQuestionEdit = (record) => {
    this.setState(state=>({ editQuestionForm:false,selectedQuestionRecord:record }))
    this.componentWillMount();
  }

  handleCatEdit = () =>{
    this.setState(state=>({ editCatForm:false }))
    this.loadCategory()
  }

  handleQuizQuestionEdit = () => {
    this.setState(state=>({ quizQuestionManageForm:false }))
  }

  handleCourseQuizEdit = () => {
    this.setState(state=>({ courseQuizManageForm:false }))
  }

  handleCourseAdd = () => {
    this.setState(state=>({ addCourseForm:false }))
    this.loadCourse();
  }

  handleCourseEdit = () => {
    this.setState(state=>({ editCourseForm:false }))
    this.loadCourse();
  }

  handleSearchCourseInputChange = (event) => {
    this.setState({
      searchCourseQuery: event.target.value
    });
  }

  handleSearchQuizInputChange = (event) => {
    this.setState({
      searchQuizQuery: event.target.value
    });
  }

  handleSearchCategoryInputChange = (event) => {
    this.setState({
      searchCategoryQuery: event.target.value
    });
  }

  handleSearchQuestionInputChange = (event) => {
    this.setState({
      searchQuestionQuery: event.target.value
    });
  }

  handleSearchCourse = () => {
    this.loadCourse();
  }

  handleSearchQuiz = () => {
    this.loadQuiz();
  }

  handleSearchCategory = () => {
    this.loadCategory();
  }

  handleSearchQuestion = () => {
    this.loadQuestion();
  }

  /*
  showDeleteConfirmQuiz = (postId) => {
    confirm({
      title: sessionStorage.getItem('lang')==='zh_TW'? '此常用資料刪除後將無法找回，確定刪除?':'You will delete this post and cannot get it back, continue?',
      okText: intl.get('@GENERAL.DELETE'),
      okType: 'danger',
      centered: true,
      cancelText: intl.get('@GENERAL.CANCEL'),
      onOk() {
        var delpost_url = sessionStorage.getItem('serverPort')+'elearning/delete_quiz/'+postId;            
            fetchData(delpost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status===200){
                      message.success('This post has been deleted successfully. We now turn you back to Home page.', 1); 
                      
                      this.loadQuiz();  
                  }else if(res.status===555){
                      message.warning('Sorry, your request was denied by server.');
                  }else{
                      message.error(res.status,": ", res.msg);
                  };
                }
            })

        // }, 2000);
      },
      onCancel() { 
        // message.info("Delete request cancelled");
      },
    });
}*/

handleCourseCatChange = (event) => {
  this.setState({ courseCatSelect: event }, () => {
    this.loadQuiz();
  });
}

  handleCatChange = (event) => {
    this.setState({ categorySelect: event }, () => {
      this.loadQuestion();
    });
  }

  handleFileChange = (event) => {
    this.setState({ selectedFile: event.target.files[0], isButtonDisabled: false });
  };

  handleUpload = () => {
    if (this.state.selectedFile) {
      this.setState({ loading:true });
      const reader = new FileReader();
  
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
  
        const importedQuestion = [];
  
        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          for (let i = 2; i < jsonData.length; i++) {
            const row = jsonData[i];
            const [Question, Answer_1, Answer_2, Answer_3, Answer_4, Answer_5, Answer_6, Answer_7, Answer_8, Answer_9, Answer_10, correctAnswer,topic, randomSetting, postVideoLink, assessment, category] = row;
            if(Question) {
              let answerString = '';

              for (let i = 1; i <= 10; i++) {
                const answer = eval(`Answer_${i}`);
                if (answer) {
                  if (answerString !== '') {
                    answerString += ';,;';
                  }
                  answerString += `${answer}`;
                }
              }

              const parsedRandomSetting = randomSetting ? parseInt(randomSetting) : 0;

              if(postVideoLink) {
                postVideoLink = postVideoLink.trim()
              } else {
                postVideoLink = ""
              }
              const question = {
                'courseName': sheetName.trim(),
                'quizName': assessment.trim(),
                'category': category.trim(),
                'questionTitle': Question.replace("\n", "<br>").trim(),
                'answer': answerString,
                'correctAnswer': parseInt(correctAnswer),
                'randomSetting': parsedRandomSetting,
                'createdBy':sessionStorage.getItem('@userInfo.id'),
                'postVideoLink':postVideoLink
              };
    
              importedQuestion.push(question);
            }
          }
        });
        //console.log(importedQuestion)
        this.setState({ importedQuestion });
        this.insertFormExcel();
        
      };
  
      reader.readAsArrayBuffer(this.state.selectedFile);
    }
  };

  handleDownload = () =>{
    const sample = process.env.PUBLIC_URL + '/documents/sample.xlsx';
    window.location.href = sample;
  }
  
  insertFormExcel = () =>{
    const { importedQuestion } = this.state
    this.setState({ isButtonDisabled: true });
    let createPost_url = sessionStorage.getItem('serverPort')+'elearning/importQuestions/?user='+sessionStorage.getItem('@userInfo.id');
        fetchData(createPost_url, 'post', importedQuestion, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    if(res.msg=="Success") {
                      message.success("Post Insert successfully.");
                      console.log(res)
                      const importedLog = res.data.join("<br>");
                      this.setState({ importedLog, isImportedLogVisible: true });
                      this.loadQuestion();
                    } else {
                      message.error("Sorry, post Insert was rejected by server.", 1);
                      console.log(res)
                      const importedLog = res.data.join("<br>");
                      this.setState({ importedLog, isImportedLogVisible: true });
                      this.setState({ loading:false });
                    }
                }else{
                    message.error("Sorry, post Insert was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post Insert was rejected by server.", 1);
            }
        })
  }

  exportToXLSX = (courseId) => {
    const { report } = this.state;
    let createPost_url = sessionStorage.getItem('serverPort')+'elearning/course_report/'+courseId;
        fetchData(createPost_url, 'post', { user: sessionStorage.getItem('@userInfo.id') }, response=>{
            this.setState({ loading: false });
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                  this.setState({report:res.data})
                  if (res.data) {
                    message.success("Export successfully.");
                    //const { data } = this.props;
                    let data = res.data;
                    // 提取数据的键作为标题行
                    const headers = Object.keys(data[0]);

                    // 创建工作簿
                    const workbook = XLSX.utils.book_new();

                    // 获取 distinct 的 data.assessmentName 值
                    const distinctAssessmentNames = [...new Set(data.map(item => item.assessmentName))];

                    // 遍历 distinct 的 data.assessmentName 值
                    distinctAssessmentNames.forEach(assessmentName => {
                      // 过滤数据，只保留与当前 assessmentName 相关的行
                      const filteredData = data.filter(item => item.assessmentName === assessmentName);

                      // 创建工作表
                      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...filteredData.map(item => Object.values(item))]);

                      // 设置冻结窗格，冻结第一行
                      worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

                      // 将工作表添加到工作簿，工作表名称为 assessmentName
                      XLSX.utils.book_append_sheet(workbook, worksheet, assessmentName);
                    });

                    // 将工作簿保存为XLSX文件
                    XLSX.writeFile(workbook, data[0]["courseName"]+'.xlsx');
                  }
                }else{
                    message.error("Sorry, post Insert was rejected by server.", 1);
                }
            }else{
                message.error("Sorry, post Insert was rejected by server.", 1);
            }
        })

    
  };

  saveXLSXFile = (fileData, fileName) => {
    const blob = new Blob([this.s2ab(fileData)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  s2ab = s => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff;
    }
    return buf;
  };

  render(){
    const { isButtonDisabled,isImportedLogVisible, importedLog ,editCatForm, cat, selectedQuestionRecord, delQuestion, delQuiz,selectedQuizRecord,searchCourseQuery,searchQuizQuery,searchQuestionQuery,searchCategoryQuery, course, quiz, quizQuestionManageForm,courseQuizManageForm, catId,catAllList, editCourseForm, addCourseForm, addCatForm, addQuizForm,addQuestionForm,editQuestionForm, editQuizForm, courseList, quizList,catList,questionList,questioncurrent_page, catcurrent_page, loading ,quizcurrent_page, coursecurrent_page, questiontotal_results, quiztotal_results, cattotal_results, coursetotal_results, submitting, selRecord, courseCatAllList, courseCatId  } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { Item } = Descriptions;
    const { Content } = Layout;
    const { TabPane } = Tabs;

    const course_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '課程名稱':'Course Title'), 
                          dataIndex: 'courseName', 
                          render: (text) => text }, 
                          {key: 3, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '建立日期':'Created Date'), 
                          dataIndex: 'modifiedAt',          
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},
                          {key: 4, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'id',          
                          render: (text,record) => (
                          <div>
                          <button className="btn-run" onClick={() => this.courseDuplicate(record)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '複製':'Duplicate'}
                          </button> 
                          <button className="btn-edit" onClick={() => this.courseQuizManage(record)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '管理':'Manage'}
                          </button>
                          <button className="btn-edit-option" onClick={() => this.editCourse(record)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                          </button>
                          <button className="btn-result" onClick={() => this.courseDelete(record.id)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                          </button>
                          <button className="btn-result" onClick={() => this.exportToXLSX(record.id)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '匯出':'Export'}
                          </button>
                          </div>)},      
                          ];


    const quiz_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '測驗名稱':'Assessment Title'), 
                          dataIndex: 'title', 
                          render: (text) => text }, 
                          {key: 3, title:(sessionStorage.getItem('lang')==='zh_TW'? '時間限制':'Time Limit'),dataIndex:'limitTime',
                        render:(text) => ( <span>
                          {text === '0'
                            ? (sessionStorage.getItem('lang') === 'zh_TW' ? '無限時間' : 'Infinite')
                            : text + " " + (sessionStorage.getItem('lang') === 'zh_TW' ? '分鐘' : 'minute(s)')}
                        </span>)},
                          {key: 4, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '建立日期':'Created Date'), 
                          dataIndex: 'modifiedAt',          
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},
                          {key: 5, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'id',          
                          render: (text,record) => (
                          <div>
                          {/* <button className="btn-run" onClick={() => this.showDeleteConfirmQuiz(record.id)}>
                          Remove
                          </button> */}
                          <button className="btn-edit" onClick={() => this.quizQuestionManage(record)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '管理':'Manage'}
                          </button>
                          <button className="btn-edit-option" onClick={() => this.editQuiz(record)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                          </button>
                          <button className="btn-result" onClick={() => this.handleRunResult(record.id)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '成績':'Result'}
                          </button>
                          <button className="btn-result" onClick={() => this.QuizDelete(record.id)}>
                          {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                          </button>
                          </div>)},      
                          ];
    
    const cat_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '類別名稱':'Category Title'), 
                          dataIndex: 'title', 
                          render: (text) => text }, 
                          {key: 3, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '建立日期':'Created Date'), 
                          dataIndex: 'created_at',       
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},
                          {key: 5, 
                            title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                            dataIndex: 'created_at',
                            render: (text,record) => (
                            <div>
                              <button className="btn-edit" onClick={() => this.editCat(record)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                              </button>
                              <button className="btn-result" onClick={() => this.categoryDelete(record.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                              </button>
                            </div> 
                            )}   
                          ];

    const question_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                            title: (sessionStorage.getItem('lang')==='zh_TW'? '問題':'Question'), 
                            dataIndex: 'questionTitle', 
                            render: (text) => {
                              // 移除所有HTML標籤、HTML TAB和&nbsp;
                              const strippedText = text.replace(/<[^>]+>|&nbsp;|\t/g, '');
                          
                              // 限制文字在30個字以內，超過部分添加三個點
                              const truncatedText = strippedText.length > 30 ? strippedText.substring(0, 30) + '...' : strippedText;
                          
                              return truncatedText;
                            }
                          },
                          {key: 3, 
                            title:(sessionStorage.getItem('lang')==='zh_TW'? '類別':'Category'), 
                            dataIndex: 'catTitle'},
                          {key: 4, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '建立日期':'Created Date'), 
                          dataIndex: 'created_at',          
                          render: (text, record) => text===null? moment(record.createdAt).format("YYYY-MM-DD"):moment(text).format("YYYY-MM-DD")},    
                          ,
                          {key: 5, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'created_at',
                          render: (text,record) => (
                            <div>
                            <button className="btn-edit" onClick={() => this.editQuestion(record)}>
                            {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                            </button>
                            <button className="btn-result" onClick={() => this.QuestionDelete(record.id)}>
                            {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                            </button>
                            </div>)},      
                            ];
                          
    const quizPaginprops = {
        position: 'both',
        defaultCurrent: 1,
        current: quizcurrent_page,
        // hideOnSinglePage: true,
        pageSize: 10,
        total: quiztotal_results,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
        onChange: this.handleQuizPageChange,
      }

    const coursePaginprops = {
        position: 'both',
        defaultCurrent: 1,
        current: coursecurrent_page,
        // hideOnSinglePage: true,
        pageSize: 10,
        total: coursetotal_results,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
        onChange: this.handleCoursePageChange,
      }

    const catpaginprops = {
        position: 'both',
        defaultCurrent: 1,
        current: catcurrent_page,
        // hideOnSinglePage: true,
        pageSize: 10,
        total: cattotal_results,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
        onChange: this.handleCatPageChange,
      }

    const questionpaginprops = {
        position: 'both',
        defaultCurrent: 1,
        current: questioncurrent_page,
        // hideOnSinglePage: true,
        pageSize: 10,
        total: questiontotal_results,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
        onChange: this.handleQuestPageChange,
    }

    return(
        <div className="clearfix" style={{ width:'100%' }}>
        <Content className="cms-content">
            <h1>
                {intl.get('@E_LEARNING_MANAGEMENT.TITLE')}
            </h1>
            <div>
                <div style={{display:'flex', marginBottom: '40px'}}>
                  <a onClick={() => this.addCourse()} className="btn-elearning" style={{width:'160px', float:'none'}}>{intl.get('@E_LEARNING.ADD_COURSE')}</a>
                  <a onClick={() => this.addQuiz()} className="btn-elearning" style={{width:'160px', float:'none'}}>{intl.get('@E_LEARNING.CREATE_QUIZ')}</a>
                  <a onClick={() => this.addCat()} className="btn-elearning" style={{width:'160px', float:'none'}}>{intl.get('@E_LEARNING.ADD_CATEGORY')}</a>
                  <a onClick={() => this.addQuestion()} className="btn-elearning" style={{width:'160px', float:'none'}}>{intl.get('@E_LEARNING.ADD_QUESTION')}</a>
                </div>
                <div style={{width:'100%'}}>
                  <Tabs type="card" defaultActiveKey="1" >
                    <TabPane key={1} tab={sessionStorage.getItem('lang')==='zh_TW'? '課程列表':'Course List'}>
                        <div className="row">
                          <div className="search col-12">
                            <input
                              type="text"
                              value={searchCourseQuery}
                              onChange={this.handleSearchCourseInputChange}
                              placeholder="Search Course Title"
                              style={{maxWidth:'300px!important',width:'100%'}}
                              />
                            <Button type="primary" htmlType="submit" onClick={this.handleSearchCourse}>Search Course Title</Button>
                          </div>
                        </div>
                        <Table 
                          style={{ paddingTop: '16px', width:'100%' }}
                          loading={ loading }
                          rowKey={record=>record.id}
                          bordered
                          pagination={coursePaginprops}
                          columns={course_column}
                          dataSource={courseList}
                          />
                    </TabPane>
                    <TabPane key={2} tab={sessionStorage.getItem('lang')==='zh_TW'? '測驗列表':'Assessment List'}>
                    <Form>
                      <Form.Item>
                      {getFieldDecorator('courseCatId', { 
                            rules: [{required: false, message: intl.get('@GENERAL.REQUIRED')}],
                            initialValue:("0")
                        })(
                            <Select value={courseCatId} onChange={this.handleCourseCatChange}>
                            <Option key="0" value="0">{sessionStorage.getItem('lang')==='zh_TW'? '所有課程':'All Course'}</Option>
                            {courseCatAllList.map((courseCatOption,index) => (
                            <Option key={index+1} value={courseCatOption.id}>{courseCatOption.courseName}</Option>
                            ))}
                            </Select>
                        )}
                    </Form.Item>
                      <div className="row">
                          <div className="search col-12">
                            <input
                              type="text"
                              value={searchQuizQuery}
                              onChange={this.handleSearchQuizInputChange}
                              placeholder="Search Assessment Title"
                              style={{maxWidth:'300px!important',width:'100%'}}
                              />
                            <Button type="primary" htmlType="submit" onClick={this.handleSearchQuiz}>Search Assessment Title</Button>
                          </div>
                        </div>
                        
                        </Form>
                        <Table 
                        style={{ paddingTop: '16px', width:'100%' }}
                        loading={ loading }
                        rowKey={record=>record.id}
                        bordered
                        pagination={quizPaginprops}
                        columns={quiz_column}
                        dataSource={quizList}
                        />
                    </TabPane>
                    <TabPane key={3} tab={sessionStorage.getItem('lang')==='zh_TW'? '分類列表':'Category List'}>
                      <div className="row">
                          <div className="search col-12">
                            <input
                              type="text"
                              value={searchCategoryQuery}
                              onChange={this.handleSearchCategoryInputChange}
                              placeholder="Search Category Title"
                              style={{maxWidth:'300px!important',width:'100%'}}
                              />
                            <Button type="primary" htmlType="submit" onClick={this.handleSearchCategory}>Search Category Title</Button>
                          </div>
                        </div>
                      <Table 
                          style={{ paddingTop: '16px', width:'100%' }}
                          loading={ loading }
                          rowKey={record=>record.id}
                          bordered
                          pagination={catpaginprops}
                          columns={cat_column}
                          dataSource={catList}
                          />
                    </TabPane>
                    <TabPane key={4} tab={sessionStorage.getItem('lang')==='zh_TW'? '問題列表':'Question List'}>
                    <Form>
                      <Form.Item>
                      {getFieldDecorator('catId', { 
                            rules: [{required: false, message: intl.get('@GENERAL.REQUIRED')}],
                            initialValue:("0")
                        })(
                            <Select value={catId} onChange={this.handleCatChange}>
                            <Option key="0" value="0">{sessionStorage.getItem('lang')==='zh_TW'? '所有分類':'All Categories'}</Option>
                            {catAllList.map((catOption,index) => (
                            <Option key={index+1} value={catOption.id}>{catOption.title}</Option>
                            ))}
                            </Select>
                        )}
                    </Form.Item>
                    
                    <div className="row">
                          <div className="search col-12">
                            <input
                              type="text"
                              value={searchQuestionQuery}
                              onChange={this.handleSearchQuestionInputChange}
                              placeholder="Search Question Title"
                              style={{maxWidth:'300px!important',width:'100%'}}
                              />
                            <Button type="primary" htmlType="submit" onClick={this.handleSearchQuestion}>Search Question Title</Button>
                          </div>
                        </div>
                    </Form>
                    <div className="row" style={{marginTop:'30px'}}>
                      <div className="col-6">
                        <input type="file" onChange={this.handleFileChange} accept=".xlsx, .xls" />
                        <Button type="primary" onClick={this.handleUpload} disabled={isButtonDisabled}>{sessionStorage.getItem('lang')==='zh_TW'? '匯入excel':'Import form Excel'}</Button>
                      </div>
                      <div className="col-6" style={{textAlign:'right'}}>
                        <Button type="primary" onClick={this.handleDownload}>{sessionStorage.getItem('lang')==='zh_TW'? '下載範例':'Download Template'}</Button>
                      </div>
                    </div>
                    <div className="row" style={{marginTop:'30px'}}>
                      {isImportedLogVisible && (
                        <div className="col-12">
                          <div className="importLog" dangerouslySetInnerHTML={{ __html: importedLog }}></div>
                        </div>
                      )}
                    </div>
                    <Table 
                          style={{ paddingTop: '16px', width:'100%' }}
                          loading={ loading }
                          rowKey={record=>record.id}
                          bordered
                          pagination={questionpaginprops}
                          columns={question_column}
                          dataSource={questionList}
                          />
                    </TabPane>
                  </Tabs>
                </div>
            </div>
            <Modal
            title={intl.get('@E_LEARNING.CREATE_QUIZ')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='800px'
            visible={addQuizForm}
            footer={null}
            onCancel={e=>this.setState({ addQuizForm: false })}
            >
              <ElearningQuizForm
              handleQuizAdd={this.handleQuizAdd} 
              submitting={submitting}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.QUIZ_EDIT')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='800px'
            visible={editQuizForm}
            footer={null}
            onCancel={e=>this.setState({ editQuizForm: false })}
            >
              <ElearningQuizFormEdit
              handleQuizEdit={(record)=>this.handleQuizEdit(record)}
              submitting={submitting}
              selRecord={selRecord}
              editQuizForm={this.state.editQuizForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.ADD_CATEGORY')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='800px'
            visible={addCatForm}
            footer={null}
            onCancel={e=>this.setState({ addCatForm: false })}
            >
              <ElearningCatForm
              handleCatAdd={this.handleCatAdd}
              submitting={submitting}
              addCatForm={this.state.addCatForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.EDIT_QUESTION')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1400px'
            visible={editCatForm}
            footer={null}
            onCancel={e=>this.setState({ editCatForm: false })}
            >
              <ElearningCatFormEdit
              handleCatEdit={ this.handleCatEdit }
              submitting={submitting}
              selRecord={cat}
              editCatForm={this.state.editCatForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.ADD_QUESTION')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1400px'
            visible={addQuestionForm}
            footer={null}
            onCancel={e=>this.setState({ addQuestionForm: false })}
            >
              <ElearningQuestionForm
              handleQuestionAdd={this.handleQuestionAdd}
              submitting={submitting}
              catAllList={catAllList}
              addQuestionForm={this.state.addQuestionForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.EDIT_QUESTION')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1400px'
            visible={editQuestionForm}
            footer={null}
            onCancel={e=>this.setState({ editQuestionForm: false })}
            >
              <ElearningQuestionFormEdit
              handleQuestionEdit={(record)=>this.handleQuestionEdit(record)}
              submitting={submitting}
              selRecord={selRecord}
              catAllList={catAllList}
              editQuestionForm={this.state.editQuestionForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.QUESTION_MANAGE')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1000px'
            visible={quizQuestionManageForm}
            footer={null}
            onCancel={e=>this.setState({ quizQuestionManageForm: false })}
            >
            <ElearningQuizQuestionManage

              editQuestion={(record) => this.editQuestion(record)}
              QuestionDelete={(id) => this.QuestionDelete(id)}
              handleQuizQuestionEdit={this.handleQuizQuestionEdit}
              submitting={submitting}
              catAllList={catAllList}
              selectedQuestionRecord={selectedQuestionRecord}
              delQuestion={delQuestion}
              quiz={quiz}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.ADD_COURSE')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1400px'
            visible={addCourseForm}
            footer={null}
            onCancel={e=>this.setState({ addCourseForm: false })}
            >
              <ElearningCourseForm
              handleCourseAdd={this.handleCourseAdd}
              submitting={submitting}
              addCourseForm={this.state.addCourseForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.EDIT_COURSE')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1400px'
            visible={editCourseForm}
            footer={null}
            onCancel={e=>this.setState({ editCourseForm: false })}
            >
              <ElearningCourseFormEdit
              handleCourseEdit={this.handleCourseEdit}
              submitting={submitting}
              selRecord={selRecord}
              editCourseForm={this.state.editCourseForm}
              />
            </Modal>

            <Modal
            title={intl.get('@E_LEARNING.COURSE_MANAGE')}
            bodyStyle={{ height: '60%' }}
            destroyOnClose
            centered
            width='1000px'
            visible={courseQuizManageForm}
            footer={null}
            onCancel={e=>this.setState({ courseQuizManageForm: false })}
            >
            <ElearningCourseQuizManage
              editQuiz={(record) => this.editQuiz(record)}
              handleRunResult={(id) => this.handleRunResult(id)}
              handleRunResult_2={(quizId,courseId) => this.handleRunResult_2(quizId,courseId) }
              quizQuestionManage={(record) => this.quizQuestionManage(record)}
              QuizDelete={(id) => this.QuizDelete(id)}
              handleCourseQuizEdit={this.handleCourseQuizEdit}
              submitting={submitting}
              selectedQuizRecord={selectedQuizRecord}
              delQuiz={delQuiz}
              course={course}
              />
            </Modal>
        </Content>
        </div>
    )
  }
}

export default Form.create()(ElearningManagement);