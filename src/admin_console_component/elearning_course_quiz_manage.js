import React from 'react';
import { Table , Form, Icon, Input, Select, Button, message } from 'antd';
import intl from 'react-intl-universal';
import moment from 'moment';
import locale from 'antd/lib/date-picker/locale/zh_TW';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';

moment.locale('zh-hk');

const { Option } = Select;
class CourseQuizForm extends React.Component{

  state ={ catId:0, categorySelect:0,quizList:[],quizList:[],submitting: false, course: this.props.course, catAllList:this.props.catAllList, fileList: [], ruleOptions: [] ,quizcurrent_page:1,quiztotal_results:0, quizcurrent_page:1,quiztotal_results:0,
  quizs: [
    { id: 1, quizTitle: 'Quiz 1', orderby:0 },
    { id: 2, quizTitle: 'Quiz 2', orderby:1 },
    { id: 3, quizTitle: 'Quiz 3', orderby:2 },
    { id: 4, quizTitle: 'Quiz 4', orderby:3 },
    // 其他問題...
  ],
  searchQuizs: [
    { id: 5, text: 'Add Quiz 1' },
    { id: 6, text: 'Add Quiz 2' },
    { id: 7, text: 'Add Quiz 3' },
    { id: 9, text: 'Add Quiz 4' },
    // 其他問題...
  ],
  addedQuizList:[],
  categoryOptions: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
  searchQuery: '',
  addedQuizCurrent_page:1, addedQuizTotal_results:0,
  orderTouched:false
  };

    componentDidMount(){
      this.loadCourseQuiz();
    }

    componentDidUpdate(prevProps) {
      if (prevProps.selectedQuizRecord !== this.props.selectedQuizRecord) {
        // Handle the updated selectedRecord
        // Update the displayed record based on the new data
        this.updateDisplayedRecord(this.props.selectedQuizRecord);
      }
      if (prevProps.delQuiz !== this.props.delQuiz) {
        // Handle the updated selectedRecord
        // Update the displayed record based on the new data
        this.deleteDisplayedRecord(this.props.delQuiz);
      }
    }

    updateDisplayedRecord(record){
      if(record) {
        const { addedQuizList, quizList } = this.state;

        const updatedList = addedQuizList.map((quiz) => {
          if (quiz.id === record.id) {
            // 修改標題（TITLE）
            let modifiedTitle = record.title;

            // 返回修改後的項目
            return {
              ...quiz,
              title: modifiedTitle,
            };
          }

          return quiz;
        });

        const updatedList2 = quizList.map((quiz) => {
          if (quiz.id === record.id) {
            // 修改標題（TITLE）
            let modifiedTitle = record.title;

            // 返回修改後的項目
            return {
              ...quiz,
              title: modifiedTitle,
            };
          }

          return quiz;
        });

        // 更新狀態中的addedQuizList
        this.setState({ addedQuizList: updatedList, quizList:updatedList2 });
      }
    }

    deleteDisplayedRecord(id){
      if (id) {
        const { addedQuizList,quizList } = this.state;
    
        const updatedList = addedQuizList.filter((quiz) => quiz.id !== id);
        const updatedList2 = quizList.filter((quiz) => quiz.id !== id);
       
        this.setState({ addedQuizList: updatedList, quizList:updatedList2 });
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

    handleRemoveQuiz = (id) => {
      // const { addedQuizList } = this.state;
      // const selectedQuiz = addedQuizList.find(quiz => quiz.id === id);

      // if (selectedQuiz) {
      // this.setState(prevState => ({
      //     addedQuizList: prevState.addedQuizList.filter(quiz => quiz.id !== id)
      // }));
      // }
      const { addedQuizList,quizList } = this.state;
      let deleted = false;

      const updatedQuizList = addedQuizList.filter(quiz => {
        if (quiz.id === id && !deleted) {
          deleted = true;
          quizList.push(quiz);
          return false; // 不包括匹配的问题
        }
        return true; // 保留其他问题
      });

      this.setState({
        addedQuizList: updatedQuizList,
        quizList:quizList
      });
    }

    handleAddQuiz = (id) => {
        const { quizList } = this.state;
        const selectedQuiz = quizList.find(quiz => quiz.id === id);

        if (selectedQuiz) {
        this.setState(prevState => ({
            addedQuizList: [...prevState.addedQuizList, selectedQuiz],
            quizList: prevState.quizList.filter(quiz => quiz.id !== id)
        }));
        }
    }

    handleSearchQuizs = () => {
        const { searchQuery } = this.state;

        // 模拟从数据库中查找匹配问题的过程
        // 这里只是简单判断问题文本是否包含搜索查询，实际应用中需与数据库交互
        const searchResults = this.state.add_quizs.filter((quiz) =>
        quiz.text.includes(searchQuery)
        );

        this.setState({ searchResults });
    };

    handleSearchQuizs = () => {
      //this.loadQuiz();
      
      this.loadQuiz();
    }

    loadCourseQuiz = ()=> {
      const { course } = this.state;
      let loading_url = sessionStorage.getItem('serverPort') + 'elearning/getManageQuiz/'+sessionStorage.getItem('@userInfo.id')+'?courseId='+course.id;
      fetchData(loading_url, 'get', null, response=>{
        if(response.ifSuccess){
          let res = response.result;
          if(res.data !== undefined&&res.status===200){
            const updatedQuizList = res.data
            this.setState({
            addedQuizList: updatedQuizList,
            addedQuizCurrent_page: 1,
            addedQuiztotal_results: res.total,
            loading: false
            });
            this.loadQuiz();
          } else {
            message.warning(res.status+': '+ res.msg);
          }
        }
      });
    }

    loadQuiz = ()=> {
        const { categorySelect, searchQuery } = this.state;
        let loading_url = sessionStorage.getItem('serverPort') + 'elearning/search_quiz/'+sessionStorage.getItem('@userInfo.id')+'?page=1&catId='+categorySelect+'&search='+searchQuery;
        this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
        fetchData(loading_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){
              // 檢查資料中是否包含已添加的問題，並從資料中移除
              const updatedQuizList = res.data.filter(quiz => {
                const isAdded = this.state.addedQuizList.some(addedQuiz => addedQuiz.id === quiz.id);
                return !isAdded;
              });
              this.setState({
                quizList: updatedQuizList,
                quizcurrent_page: 1,
                quiztotal_results: res.total,
                loading: false
              });
            } else {
              this.setState({ 
                courseList: [],
                coursecurrent_page:1, 
                coursetotal_results: 0,
                loading: false
              });
            }
          }
        });
    }

    handleQuestPageChange = page=> {
        const { categorySelect, searchQuery } = this.state;
        this.setState(state=>({ quizcurrent_page: page, loading: true }))
        let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/search_quiz/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&search='+searchQuery;
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
                total_results: res.total,
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

    handleAddedQuestPageChange = page=> {
      // const { categorySelect } = this.state;
      // this.setState(state=>({ questcurrent_page: page, loading: true }))
      // let pagin_url = sessionStorage.getItem('serverPort') + 'elearning/searchQuiz/'+sessionStorage.getItem('@userInfo.id')+'?page='+page+'&catId='+categorySelect;
      // let searchParams = this.state.current_params;
      // if(searchParams !== null && searchParams !== ''){
      //   pagin_url += searchParams;
      // }
    }

    moveBanner = (action, index, record) => {

      const { addedQuizList, orderTouched } = this.state;
      const newData = [...this.state.addedQuizList];
      const oldIndex = index;
      var newIndex = -1;
      
      if(action==='prev'&&oldIndex>0){
        newIndex = index-1;
      }else if(action==='next'&&oldIndex<addedQuizList.length-1){
        newIndex = index+1;
      }
  
      if(newIndex === -1){ return }
  
      const relatedBanner = addedQuizList[newIndex];
      newData.splice(oldIndex, 1, relatedBanner);
      newData.splice(newIndex, 1, record);
  
      if(!orderTouched){
        this.setState({ orderTouched: true });
      }
  
      this.setState({ addedQuizList: newData });
    }

  handleSubmit = e => {
    e.preventDefault();
    const { addedQuizList,course } = this.state;
    const url = sessionStorage.getItem('serverPort')+'elearning/manage_quiz/'; // 替換為您的Java Controller端點URL

    const requestData = {
      userId: sessionStorage.getItem('@userInfo.id'),
      courseId: course.id, // 將courseId添加到請求體中
      addedQuizList: addedQuizList,
    };
  
    let loading_url = sessionStorage.getItem('serverPort') + 'elearning/manage_quiz/' + sessionStorage.getItem('@userInfo.id') + '?courseId=' + course.id;
        this.setState(state=>({ selectedRowKeys: [], selectedRows: [], selRecord: null, loading: true }));
        fetchData(loading_url, 'post', requestData, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.data !== undefined&&res.status===200){ 
              message.success("Post Update successfully.");
              this.props.handleCourseQuizEdit();
            } else {
              message.error("Sorry, post Update was rejected by server.", 1);
            }
          } else {
            message.error("Sorry, post Update was rejected by server.", 1);
          }
        });
  };

  onCancelDelete() {
    this.props.handleQuizQuizEdit();
  }

  handleCatChange = (event) => {
    this.setState({ categorySelect: event }, () => {
      this.loadQuiz();
    });
  }

  handleSearchInputChange = (event) => {
    console.log(event)
    this.setState({
      searchQuery: event.target.value
    });
  }

  render(){
    const { course, quizList ,addedQuizList, quizcurrent_page ,quiztotal_results, searchQuery, addedQuizCurrent_page, addedQuizTotal_results } = this.state;


    const addedQuiz_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:"Assessment", 
                          dataIndex: 'title', 
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
                              <div hidden={index===addedQuizList.length-1}>
                                <Icon type="caret-down" onClick={()=>this.moveBanner('next', index, record)} /> 
                              </div>
                            </span>)
                          },
                          {key: 5, 
                          title:(sessionStorage.getItem('lang')==='zh_TW'? '功能':'Function'), 
                          dataIndex: 'id',
                          render: (text,record) => (
                            <div>
                            <button className="btn-add" onClick={() => this.handleRemoveQuiz(record.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '撤走':'Remove'}
                            </button>
                            <button className="btn-edit" onClick={() => this.props.quizQuestionManage(record)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '管理':'Manage'}
                            </button>
                            <button className="btn-edit-option" onClick={() => this.props.editQuiz(record)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                            </button>
                            <button className="btn-result" onClick={() => this.props.handleRunResult_2(record.id,course.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '成績':'Result'}
                            </button>
                            <button className="btn-result" onClick={() => this.props.QuizDelete(record.id)}>
                              {sessionStorage.getItem('lang')==='zh_TW'? '刪除':' Delete'}
                            </button>
                            </div>)},      
                            ];

    const quiz_column = [{key: 1, title:'ID', dataIndex: 'id'},
                          {key: 2, 
                          title:"Assessment", 
                          dataIndex: 'title', 
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
                              <button className="btn-add" onClick={() => this.handleAddQuiz(record.id)}>
                                {sessionStorage.getItem('lang')==='zh_TW'? '加入':'Add'}
                              </button>
                              <button className="btn-edit" onClick={() => this.props.quizQuestionManage(record)}>
                                {sessionStorage.getItem('lang')==='zh_TW'? '管理':'Manage'}
                              </button>
                              <button className="btn-edit-option" onClick={() => this.props.editQuiz(record)}>
                                {sessionStorage.getItem('lang')==='zh_TW'? '修改':'Edit'}
                              </button>
                              <button className="btn-result" onClick={() => this.props.handleRunResult_2(record.id,course.id)}>
                                {sessionStorage.getItem('lang')==='zh_TW'? '成績':'Result'}
                              </button>
                              <button className="btn-result" onClick={() => this.props.QuizDelete(record.id)}>
                                {sessionStorage.getItem('lang')==='zh_TW'? '刪除':' Delete'}
                              </button>
                            </div>)},      
                            ];

    const quizpaginprops = {
        position: 'both',
        defaultCurrent: 1,
        current: quizcurrent_page,
        // hideOnSinglePage: true,
        pageSize: 10,
        total: quiztotal_results,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
        onChange: this.handleQuestPageChange,
    }

    const addedQuizPaginprops = {
      position: 'both',
      defaultCurrent: 1,
      current: addedQuizCurrent_page,
      // hideOnSinglePage: true,
      pageSize: 100,
      total: addedQuizTotal_results,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} records`,
      onChange: this.handleAddedQuestPageChange,
    }

    return(
        <div>
            <h4>{intl.get('@E_LEARNING.QUIZ')}:</h4>
            <div>
                <h5 class="quiz-manage-h5" style={{paddingTop:'40px'}}>Added Assessment</h5>
                <Table 
                  style={{ paddingTop: '16px', width:'100%' }}
                  rowKey={quiz=>quiz.id}
                  bordered
                  pagination={addedQuizPaginprops}
                  columns={addedQuiz_column}
                  dataSource={addedQuizList}
                  />

                <h5 class="quiz-manage-h5" style={{paddingTop:'40px',paddingBottom:'40px'}}>Searched Assessment</h5>
                
                <Form>
                  <div className="search-bar row">
                      <div className="search col-7">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={this.handleSearchInputChange}
                            placeholder="Search"
                            />
                          <Button type="primary" htmlType="submit" onClick={this.handleSearchQuizs}>Search</Button>
                      </div>
                      {/* <div className="category col-5">
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
                      </div> */}
                  </div>
                </Form>
                <Table 
                          style={{ width:'100%' }}
                          rowKey={quiz=>quiz.id}
                          bordered
                          pagination={quizpaginprops}
                          columns={quiz_column}
                          dataSource={quizList}
                          />
            </div>

            <Button type="primary" htmlType="submit" onClick={this.handleSubmit}>Submit</Button>
        </div>
        
    )
  }
}

const elearningCourseQuizForm= Form.create({name:'course_form'})(CourseQuizForm);
export default elearningCourseQuizForm;