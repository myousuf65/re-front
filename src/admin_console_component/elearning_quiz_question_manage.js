import React from 'react';
import { Table , Form, Icon, Input, Select, Button, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

moment.locale('zh-hk');

const { Option } = Select;
class QuizForm extends React.Component{

  state ={ catId:0, categorySelect:0,questionList:[],submitting: false, quiz: this.props.quiz, catAllList:this.props.catAllList, fileList: [], ruleOptions: [] ,questioncurrent_page:1,questiontotal_results:0,
  questions: [
    { id: 1, questionTitle: 'Question 1', orderby:0 },
    { id: 2, questionTitle: 'Question 2', orderby:1 },
    { id: 3, questionTitle: 'Question 3', orderby:2 },
    { id: 4, questionTitle: 'Question 4', orderby:3 },
    // 其他問題...
  ],
  searchQuestions: [
    { id: 5, text: 'Add Question 1' },
    { id: 6, text: 'Add Question 2' },
    { id: 7, text: 'Add Question 3' },
    { id: 9, text: 'Add Question 4' },
    // 其他問題...
  ],
  addedQuestionList:[],
  categoryOptions: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
  searchQuery: '',
  addedQuestionCurrent_page:1, addedQuestionTotal_results:0,
  orderTouched:false
  };

    componentDidMount(){
      this.loadQuizQuestion();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.selectedQuestionRecord !== this.props.selectedQuestionRecord) {
        // Handle the updated selectedRecord
        // Update the displayed record based on the new data
        this.updateDisplayedRecord(this.props.selectedQuestionRecord);
      }
      if (prevProps.delQuestion !== this.props.delQuestion) {
        // Handle the updated selectedRecord
        // Update the displayed record based on the new data
        this.deleteDisplayedRecord(this.props.delQuestion);
      }
    }

    componentWillReceiveProps(nextProps){
      // if(nextProps.submitting!==this.state.submitting){
      //   this.setState({ submitting: nextProps.submitting });
      // };
      // if(nextProps.selRecord!==this.state.selRecord){
      //   this.setState({ selRecord: nextProps.selRecord });
      // };
    }

    updateDisplayedRecord(record){
      if(record) {
        const { addedQuestionList,questionList } = this.state;

        const updatedList = addedQuestionList.map((question) => {
          if (question.id === record.id) {
            // 修改標題（TITLE）
            let modifiedTitle = record.questionTitle;

            // 返回修改後的項目
            return {
              ...question,
              questionTitle: modifiedTitle,
            };
          }

          return question;
        });

        const updatedList2 = questionList.map((question) => {
          if (question.id === record.id) {
            // 修改標題（TITLE）
            let modifiedTitle = record.questionTitle;

            // 返回修改後的項目
            return {
              ...question,
              questionTitle: modifiedTitle,
            };
          }

          return question;
        });

        // 更新狀態中的addedQuizList
        this.setState({ addedQuestionList: updatedList, questionList:updatedList2 });
      }
    }

    deleteDisplayedRecord(id){
      if (id) {
        const { addedQuestionList,questionList } = this.state;
    
        const updatedList = addedQuestionList.filter((question) => question.id !== id);
        const updatedList2 = questionList.filter((question) => question.id !== id);
        this.setState({ addedQuestionList: updatedList, questionList:updatedList2 });
      }
    }

    handleRemoveQuestion = (id) => {
      // const { addedQuestionList } = this.state;
      // const selectedQuestion = addedQuestionList.find(question => question.id === id);

      // if (selectedQuestion) {
      // this.setState(prevState => ({
      //     addedQuestionList: prevState.addedQuestionList.filter(question => question.id !== id)
      // }));
      // }
      const { addedQuestionList,questionList } = this.state;
      let deleted = false;

      const updatedQuestionList = addedQuestionList.filter(question => {
        if (question.id === id && !deleted) {
          deleted = true;
          questionList.push(question);
          return false; // 不包括匹配的问题
        }
        return true; // 保留其他问题
      });

      this.setState({
        addedQuestionList: updatedQuestionList,
        questionList:questionList
      });
    }

    handleAddQuestion = (id) => {
        const { questionList } = this.state;
        const selectedQuestion = questionList.find(question => question.id === id);

        if (selectedQuestion) {
        this.setState(prevState => ({
            addedQuestionList: [...prevState.addedQuestionList, selectedQuestion],
            questionList: prevState.questionList.filter(question => question.id !== id)
        }));
        }
    }

    handleSearchQuestions = () => {
        const { searchQuery } = this.state;

        // 模拟从数据库中查找匹配问题的过程
        // 这里只是简单判断问题文本是否包含搜索查询，实际应用中需与数据库交互
        const searchResults = this.state.add_questions.filter((question) =>
        question.text.includes(searchQuery)
        );

        this.setState({ searchResults });
    };

    handleSearchQuestions = () => {
      this.loadQuestion();
    }

    loadQuizQuestion = ()=> {
      const { quiz } = this.state;
      let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getManageQuestions/'+sessionStorage.getItem('@userInfo.id')+'?quizId='+quiz.id;
      fetchData(loading_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.data !== undefined&&res.status===200){
            const updatedQuestionList = res.data
            this.setState({
            addedQuestionList: updatedQuestionList,
            addedQuestionCurrent_page: 1,
            addedQuestiontotal_results: res.total,
            loading: false
            });
            this.loadQuestion();
          } else {
            message.warning(res.status+': '+ res.msg);
          }
        }
      });
    }
  
    loadQuestion = ()=> {
        const { categorySelect, searchQuery } = this.state;
        let loading_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuestion/'+sessionStorage.getItem('@userInfo.id')+'?page=1&catId='+categorySelect+'&search='+searchQuery;
        this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
        fetchData(loading_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){
              // 檢查資料中是否包含已添加的問題，並從資料中移除
              const updatedQuestionList = res.data.filter(question => {
                const isAdded = this.state.addedQuestionList.some(addedQuestion => addedQuestion.id === question.id);
                return !isAdded;
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

    handleQuestPageChange = page=> {
        const { categorySelect, searchQuery } = this.state;
        this.setState(state=>({ questioncurrent_page: page, loading: true }))
        let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuestion/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&catId='+categorySelect+'&search='+searchQuery;
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
                resultList: [],
                total_results: 0,
                loading: false,
              })
            }
          }
        });
      }

    handleAddedQuestPageChange = page=> {
      // const { categorySelect } = this.state;
      // this.setState(state=>({ questcurrent_page: page, loading: true }))
      // let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuestion/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&catId='+categorySelect;
      // let searchParams = this.state.current_params;
      // if(searchParams !== null && searchParams !== ''){
      //   pagin_url += searchParams;
      // }
    }

    moveBanner = (action, index, record) => {

      const { addedQuestionList, orderTouched } = this.state;
      const newData = [...this.state.addedQuestionList];
      const oldIndex = index;
      var newIndex = -1;
      
      if(action==='prev'&&oldIndex>0){
        newIndex = index-1;
      }else if(action==='next'&&oldIndex<addedQuestionList.length-1){
        newIndex = index+1;
      }
  
      if(newIndex === -1){ return }
  
      const relatedBanner = addedQuestionList[newIndex];
      newData.splice(oldIndex, 1, relatedBanner);
      newData.splice(newIndex, 1, record);
  
      if(!orderTouched){
        this.setState({ orderTouched: true });
      }
  
      this.setState({ addedQuestionList: newData });
    }

  handleSubmit = e => {
    e.preventDefault();
    const { addedQuestionList,quiz } = this.state;
    const url = sessionStorage.getItem('serverPort')+'elearning/manage_question/'; // 替換為您的Java Controller端點URL

    const requestData = {
      userId: sessionStorage.getItem('@userInfo.id'),
      quizId: quiz.id, // 將quizId添加到請求體中
      addedQuestionList: addedQuestionList,
    };
  
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/manage_question/' + sessionStorage.getItem('@userInfo.id') + '?quizId=' + quiz.id;
        this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
        fetchData(loading_url, 'post', requestData, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){ 
              message.success("Post Update successfully.");
              this.props.handleQuizQuestionEdit();
            } else {
              message.error("Sorry, post Update was rejected by server.", 1);
            }
          } else {
            message.error("Sorry, post Update was rejected by server.", 1);
          }
        });
  };

  onCancelDelete() {
    this.props.handleQuizQuestionEdit();
  }

  handleCatChange = (event) => {
    this.setState({ categorySelect: event }, () => {
      this.loadQuestion();
    });
  }

  handleSearchInputChange = (event) => {
    console.log(event)
    this.setState({
      searchQuery: event.target.value
    });
  }

  render(){
    const { catId, catAllList, questionList,quiz,questions,addedQuestionList, searchQuestions,categoryOptions,searchQuery, questioncurrent_page, questiontotal_results, addedQuestionCurrent_page, addedQuestionTotal_results } = this.state;
    const { getFieldDecorator, getFieldError, isFieldTouched } = this.props.form;
    const titleError = getFieldError('postTitle');
    const publishAtError = isFieldTouched('publishAt') && getFieldError('publishAt');

    const addedQuestion_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:"Question", 
                          dataIndex: 'questionTitle', 
                          render: (text) =>  {
                            // 移除所有HTML標籤
                            const strippedText = text.replace(/<[^>]+>|&nbsp;|\t/g, '');

                            // 限制文字在30個字以內，超過部分添加三個點
                            const truncatedText = strippedText.length > 30 ? strippedText.substring(0, 30) + '...' : strippedText;

                            return truncatedText;}
                          }, 
                          { key: 3, title: intl.get('@BANNERS_MANAGEMENT.ORDER'), dataIndex: 'orderby',align: 'center', render: (text, record, index)=>(
                            <span> 
                              <div hidden={index===0}>
                                <Icon type="caret-up" onClick={()=>this.moveBanner('prev', index, record)} />
                              </div>
                              <div hidden={index===addedQuestionList.length-1}>
                                <Icon type="caret-down" onClick={()=>this.moveBanner('next', index, record)} /> 
                              </div>
                            </span>)
                          },
                          {key: 5, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'id',
                          render: (text,record) => (
                            <div>
                              <button className="btn-add" onClick={() => this.handleRemoveQuestion(record.id)}>{sessionStorage.getItem('lang')==='zh_TW'? '撤走':'Remove'}</button>
                              <button className="btn-edit" onClick={() => this.props.editQuestion(record)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                              </button>
                              <button className="btn-result" onClick={() => this.props.QuestionDelete(record.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                              </button>
                            </div>)},      
                            ];

    const question_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:"Question", 
                          dataIndex: 'questionTitle', 
                          render: (text) =>  {
                            // 移除所有HTML標籤
                            const strippedText = text.replace(/<[^>]+>|&nbsp;|\t/g, '');

                            // 限制文字在30個字以內，超過部分添加三個點
                            const truncatedText = strippedText.length > 30 ? strippedText.substring(0, 30) + '...' : strippedText;

                            return truncatedText;}
                          }, 
                          {key: 5, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'id',
                          render: (text,record) => (
                            <div>
                              <button className="btn-add" onClick={() => this.handleAddQuestion(record.id)}>{sessionStorage.getItem('lang')==='zh_TW'? '加入':'Add'}</button>
                              <button className="btn-edit" onClick={() => this.props.editQuestion(record)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                              </button>
                              <button className="btn-result" onClick={() => this.props.QuestionDelete(record.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '刪除':'Delete'}
                              </button>
                            </div>)},      
                            ];

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

    const addedQuestionPaginprops = {
      position: 'both',
      defaultCurrent: 1,
      current: addedQuestionCurrent_page,
      // hideOnSinglePage: true,
      pageSize: 100,
      total: addedQuestionTotal_results,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
      onChange: this.handleAddedQuestPageChange,
    }

    return(
        <div>
            <h4>{intl.get('@E_LEARNING.QUIZ')}:</h4>
            <div>
                <h5 class="quiz-manage-h5" style={{paddingTop:'40px'}}>Added Questions</h5>
                <Table 
                  style={{ paddingTop: '16px', width:'100%' }}
                  rowKey={question=>question.id}
                  bordered
                  pagination={addedQuestionPaginprops}
                  columns={addedQuestion_column}
                  dataSource={addedQuestionList}
                  />

                <h5 class="quiz-manage-h5" style={{paddingTop:'40px',paddingBottom:'40px'}}>Searched Questions</h5>
                
                <Form>
                  <div className="search-bar row">
                      <div className="search col-7">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={this.handleSearchInputChange}
                            placeholder="Search"
                            />
                          <Button type="primary" htmlType="submit" onClick={this.handleSearchQuestions}>Search</Button>
                      </div>
                      <div className="category col-5">
                        <Form.Item>
                          {getFieldDecorator('catId', { 
                                initialValue:("0")
                            })(
                                <Select value={catId} onChange={this.handleCatChange}>
                                <Option key="0" value="0">All Categories</Option>
                                {catAllList.map((catOption,index) => (
                                <Option key={index+1} value={catOption.id}>{catOption.title}</Option>
                                ))}
                                </Select>
                            )}
                        </Form.Item>
                      </div>
                  </div>
                </Form>
                <Table 
                          style={{ width:'100%' }}
                          rowKey={question=>question.id}
                          bordered
                          pagination={questionpaginprops}
                          columns={question_column}
                          dataSource={questionList}
                          />
            </div>

            <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>Submit</Button>
        </div>
        
    )
  }
}

const elearningQuizForm= Form.create({name:'quiz_form'})(QuizForm);
export default elearningQuizForm;