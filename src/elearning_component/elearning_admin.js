import React,{ useState , Component } from 'react';
import intl from 'react-intl-universal';

export default class ElearningAdmin extends Component{
    constructor(props) {
        super(props);
        this.state = {
          selectedCategory: null,
          loading: false,
          quizList: [],
          allQuizList: [],
        };
      }

    handleCategoryClick = (category) => {
        this.setState(state=>({ selectedCategory: category }));
        
    }

    componentDidMount() {
        const quizListData = [
          {
            id: 0,
            name: "Quiz#1",
            category: "Cat#1"
          },
          {
            id: 1,
            name: "Quiz#2",
            category: "Cat#1"
          },
          {
            id: 2,
            name: "Quiz#3",
            category: "Cat#2"
          },
          {
            id: 3,
            name: "Quiz#4",
            category: "Cat#2"
          },
          {
            id: 4,
            name: "Quiz#5",
            category: "Cat#2"
          }
        ];
    
        this.setState({ quizList: quizListData, allQuizList: quizListData });
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
        window.location.href = `#/elearning/candidate_result_list/${quizId}`; // 替換為你想要的連結格式
    };

    handleRunEditOption = (quizId) => {
        window.location.href = `#/elearning/edit_quiz/${quizId}`; // 替換為你想要的連結格式
    }

    render(){

        const { quizList,selectedCategory,allQuizList } = this.state;

        // 使用 Set 物件來儲存不重複的類別
        const categorySet = new Set();
        this.state.quizList.forEach((quiz) => {
            categorySet.add(quiz.category);
        });

        // 將 Set 轉換為陣列
        const categoryList = [...categorySet];
        const filteredQuizList = quizList.filter(
            (quiz) => quiz.category === selectedCategory
        );
        

        return(
            <div>

                <div className="mini-blog-header">
                    <div className="container clearfix">
                        <a href="#/elearning/home"><h2 style={{width: 'calc(100% - 510px)'}}>{intl.get('@E_LEARNING.E_LEARNING')}</h2></a>
                        <a href="#/elearning/home" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.MY_E_LEARNING')}</a>
                        <a href="#/elearning/add_question" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.ADD_QUESTION')}</a>
                        <a href="#/elearning/create_quiz" className="btn-elearning" style={{width:'160px'}}>{intl.get('@E_LEARNING.CREATE_QUIZ')}</a>
                    </div>
                </div>

                <div className="page-content">
                    <div className="container create-post">
                        <div className="row">
                            <div className="col-lg-3">
                                <div className="create-post-main">
                                    <h3>{intl.get('@E_LEARNING.CATEGORY')}</h3>
                                    {categoryList.map((category) => (
                                        <p
                                        key={category}
                                        className={`${selectedCategory === category ? 'selected' : ''} quiz-cat`}
                                        onClick={() => this.handleCategoryClick(category)}
                                        >
                                        {category}
                                        </p>
                                    ))}
                                </div>
                            </div>
                            <div className="col-lg-9">
                                <div className="create-post-main">
                                    <h3>{intl.get('@E_LEARNING.QUIZ')}</h3>
                                    {filteredQuizList.length === 0 ? (
                                        allQuizList.map((quiz) => (
                                            <div className="quiz-item" key={quiz.id}>
                                            <span>{quiz.name}</span>
                                            <span>
                                                <button className="btn-run" onClick={() => this.handleRunQuiz(quiz.id)}>
                                                Remove
                                                </button>
                                                <button className="btn-edit" onClick={() => this.handleRunEdit(quiz.id)}>
                                                Edit Quiestion
                                                </button>
                                                <button className="btn-edit-option" onClick={() => this.handleRunEditOption(quiz.id)}>
                                                Edit Option
                                                </button>
                                                <button className="btn-result" onClick={() => this.handleRunResult(quiz.id)}>
                                                Candidates Result
                                                </button>
                                            </span>
                                            </div>
                                        ))
                                        ) : (
                                        filteredQuizList.map((quiz) => (
                                            <div className="quiz-item" key={quiz.id}>
                                            <span>{quiz.name}</span>
                                            <span>
                                                <button className="btn-run" onClick={() => this.handleRunQuiz(quiz.id)}>
                                                Remove
                                                </button>
                                                <button className="btn-edit" onClick={() => this.handleRunEdit(quiz.id)}>
                                                Edit Quiestion
                                                </button>
                                                <button className="btn-edit-option" onClick={() => this.handleRunEditOption(quiz.id)}>
                                                Edit Option
                                                </button>
                                                <button className="btn-result" onClick={() => this.handleRunResult(quiz.id)}>
                                                Candidates Result
                                                </button>
                                            </span>
                                            </div>
                                        ))
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
            </div>
        );
    }
}