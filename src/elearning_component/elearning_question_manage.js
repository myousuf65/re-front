import React, { Component } from "react";
import intl from "react-intl-universal";
import {
  Popconfirm,
  Form,
  Icon,
  Input,
  Select,
  Switch,
  DatePicker,
  Radio,
  Button,
  message,
  Spin,
} from "antd";
import { CKEditor } from "ckeditor4-react";

export default class ElearningQuestionManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: [
        { id: 1, text: "Question 1" },
        { id: 2, text: "Question 2" },
        { id: 3, text: "Question 3" },
        { id: 4, text: "Question 4" },
        // 其他問題...
      ],
      add_questions: [
        { id: 5, text: "Add Question 1" },
        { id: 6, text: "Add Question 2" },
        { id: 7, text: "Add Question 3" },
        { id: 9, text: "Add Question 4" },
        // 其他問題...
      ],
      categoryOptions: ["Category 1", "Category 2", "Category 3", "Category 4"],
      searchQuery: "", // 搜索查询
      searchResults: [],
      newQuestionTitle: "",
      newQuestionAnswers: ["", "", "", ""],
      correctAnswer: 0,
    };
  }

  handleRemoveQuestion = (id) => {
    this.setState((prevState) => ({
      questions: prevState.questions.filter((question) => question.id !== id),
    }));
  };

  handleAddQuestion = (id) => {
    const { questions, add_questions } = this.state;
    const selectedQuestion = add_questions.find(
      (question) => question.id === id
    );

    if (selectedQuestion) {
      this.setState((prevState) => ({
        questions: [...prevState.questions, selectedQuestion],
        add_questions: prevState.add_questions.filter(
          (question) => question.id !== id
        ),
      }));
    }
  };

  handleSearchQuestions = () => {
    const { searchQuery } = this.state;

    // 模拟从数据库中查找匹配问题的过程
    // 这里只是简单判断问题文本是否包含搜索查询，实际应用中需与数据库交互
    const searchResults = this.state.add_questions.filter((question) =>
      question.text.includes(searchQuery)
    );

    this.setState({ searchResults });
  };

  handleSearchInputChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  handleTitleChange = (event, editor) => {
    const data = editor.getData();
    this.setState({ newQuestionTitle: data });
  };

  handleAnswerChange = (index, event) => {
    const { newQuestionAnswers } = this.state;
    const updatedAnswers = [...newQuestionAnswers];
    updatedAnswers[index] = event.target.value;
    this.setState({ newQuestionAnswers: updatedAnswers });
  };

  handleCorrectAnswerChange = (event) => {
    this.setState({ correctAnswer: event.target.value });
  };

  render() {
    const {
      questions,
      add_questions,
      categoryOptions,
      searchQuery,
      newQuestionTitle,
      newQuestionAnswers,
      correctAnswer,
    } = this.state;
    const displayQuestions = questions;
    const searchQuestions = add_questions;

    return (
      <div>
        <div className="mini-blog-header">
          <div className="container clearfix">
            <a href="#/elearning/home">
              <h2 style={{ width: "calc(100% - 510px)" }}>
                {intl.get("@E_LEARNING.E_LEARNING")}
              </h2>
            </a>
            <a
              href="#/elearning/home"
              className="btn-elearning"
              style={{ width: "160px" }}
            >
              {intl.get("@E_LEARNING.MY_E_LEARNING")}
            </a>
            <a
              href="#/elearning/admin"
              className="btn-elearning"
              style={{ width: "160px" }}
            >
              {intl.get("@E_LEARNING.ADMIN")}
            </a>
            <a
              href="#/elearning/add_question"
              className="btn-elearning"
              style={{ width: "160px" }}
            >
              {intl.get("@E_LEARNING.ADD_QUESTION")}
            </a>
          </div>
        </div>

        <div className="page-content">
          <div className="container create-post">
            <div className="row">
              <div className="col-lg-12">
                <div className="create-post-main">
                  <h2>{intl.get("@E_LEARNING.QUIZ")}</h2>
                  <div>
                    <h3 class="quiz-manage-h3">Added Questions</h3>
                    <div className="scrollable-div">
                      {displayQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="question-add"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ flex: 1 }}>
                            <label className="question-text">
                              {question.text}
                            </label>
                          </div>
                          <div>
                            <button
                              className="btn-remove"
                              onClick={() =>
                                this.handleRemoveQuestion(question.id)
                              }
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 class="quiz-manage-h3">Searched Questions</h3>
                    <div className="searchable-div">
                      <div className="search-bar">
                        <div className="search">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={this.handleSearchInputChange}
                            placeholder="Search"
                          />
                          <button
                            className="btn-elearning-search"
                            onClick={this.handleSearchQuestions}
                          >
                            Search
                          </button>
                        </div>
                        <div className="category">
                          <select onChange={this.handleCategoryChange}>
                            <option value="">All Categories</option>
                            {categoryOptions.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {searchQuestions.map((question) => (
                        <div
                          key={question.id}
                          className="searched-question"
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <div style={{ flex: 1 }}>
                            <label className="question-text">
                              {question.text}
                            </label>
                          </div>
                          <div>
                            <button
                              className="btn-add"
                              onClick={() =>
                                this.handleAddQuestion(question.id)
                              }
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 class="quiz-manage-h3">Add New Question</h3>
                    <div className="add-question-form">
                      <div className="question-title">
                        <label>Question Title:</label>
                        <CKEditor
                          activeClass="ckeditor"
                          data={newQuestionTitle}
                          onChange={this.handleTitleChange}
                        />
                      </div>
                      <div className="question-answers">
                        <label>Answers:</label>
                        {newQuestionAnswers.map((answer, index) => (
                          <div key={index} className="mc-ans">
                            <span>{index + 1}.</span>
                            <span>
                              <input
                                type="text"
                                value={answer}
                                onChange={(event) =>
                                  this.handleAnswerChange(index, event)
                                }
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="correct-answer">
                        <label>Correct Answer:</label>
                        <select
                          value={correctAnswer}
                          onChange={this.handleCorrectAnswerChange}
                        >
                          {newQuestionAnswers.map((answer, index) => (
                            <option key={index} value={index}>
                              {index + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          className="btn-elearning"
                          onClick={this.handleAddQuestion}
                        >
                          Submit
                        </button>
                        <div style={{ clear: "both" }} />
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
