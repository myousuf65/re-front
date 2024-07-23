//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200116 */
//Comments //***s=]***

import React, { Component } from "react";
import { Form, Input, Radio, Button, Popconfirm, message } from "antd";

import { CKEditor } from "ckeditor4-react";
import intl from "react-intl-universal";
import { keywordsScanner } from "../service/HelperService";

const RadioGroup = Radio.Group;

class ForumCommentForm extends Component {
  state = {
    username: sessionStorage.getItem("@userInfo.fullname") || "NULL",
    selectedValue: 0,
    radioInput: "",
    content: "",
    postId: null,
    submitting: false,
  };

  componentWillReceiveProps(nextProps) {
    // this.setState(state=>({ loading: true }));

    if (nextProps.postId !== null || nextProps.postId !== undefined) {
      this.setState((state) => ({ postId: nextProps.postId }));
    }

    if (nextProps.submitting !== this.state.submitting) {
      this.setState((state) => ({ submitting: nextProps.submitting }));
    }
  }

  onEditorChange = (event) => {
    let data = event.editor.getData();
    this.setState((state) => ({ content: data }));
    return data;
  };

  customHandler = () => {
    let data = this.props.form.getFieldInstance("content").editor.getData();
    return data;
  };

  onRadioChange = (e) => {
    this.setState({ selectedValue: e.target.value });
    if (e.target.value === 0) {
      this.setState({ radioInput: "" });
    }
  };

  onPopconfirmOk = (e) => {
    // console.log(e);
    // // this.props.form.resetFields();
    // this.setState({ selectedValue: 0, radioInput: '' });
    this.props.handleCancel();
  };

  onRadioInputChange = (e) => {
    this.setState({ radioInput: e.target.value });
  };

  handleSubmit = (e) => {
    let getEData = this.customHandler();

    const { radioInput } = this.state;
    // ---- wrap content & alias for further scan
    let scanTarget = getEData;
    if (this.props.form.getFieldValue("isAlias") === 1 && radioInput) {
      scanTarget += ",";
      scanTarget += radioInput;
    }

    let scanResult = keywordsScanner(scanTarget);
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValues) => {
      if (!getEData) {
        message.error(
          sessionStorage.getItem("lang") === "zh_TW"
            ? "留言內容不可為空"
            : "Type your comment here.",
          7
        );
      } else if (fieldsValues["isAlias"] === 1 && !radioInput) {
        message.error("Alias should not be empty", 7);
      } else if (!err && scanResult) {
        const values = {
          postId: this.state.postId,
          createdBy: sessionStorage.getItem("@userInfo.id"),
          ...fieldsValues,
          content: getEData || this.state.content,
          // 'rootCmntId': this.props.rootCmnt===null? -1:this.props.rootCmnt.id,
          isReply2Cmnt:
            this.props.rootCmnt === null ? 1 : this.props.rootCmnt.id,
          alias: fieldsValues["isAlias"] === 1 ? radioInput : "",
        };

        this.props.handleCmntSubmit(values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const radioStyle = {
      display: "inline",
      height: "30px",
      lineHeight: "30px",
    };

    return (
      <Form style={{ display: "block" }} onSubmit={this.handleSubmit}>
        {/* <div hidden>{CKEditor.editorUrl = sessionStorage.getItem('serverPort')+'resources/js/ckeditor/ckeditor.js'}</div> */}
        {/* ***s=]*** Input Area */}
        <Form.Item className="comment-form">
          {getFieldDecorator("content", {
            rules: [
              {
                max: 500,
                message:
                  sessionStorage.getItem("lang") === "zh_TW"
                    ? "應用更多格式可能會影響你的評論長度(建議少於150中文字)"
                    : "Content cannot be longer than 450 characters (html format considered).",
              },
              // {required: true, message: sessionStorage.getItem('lang')==='zh_TW'? '內容不可為空':'Type your comment here.'}
            ],
            getValueFromEvent: this.onEditorChange,
          })(
            <CKEditor
              config={{
                language:
                  sessionStorage.getItem("lang") === "zh_TW" ? "zh" : "en",
                toolbar: [
                  { name: "clipboard", items: ["Undo", "Redo"] },
                  { name: "colors", items: ["TextColor", "BGColor"] },
                  {
                    name: "basicstyles",
                    items: ["Bold", "Italic", "Strike", "-", "RemoveFormat"],
                  },
                  { name: "insert", items: ["EmojiPanel"] },
                ],
              }}
              onChange={this.onEditorChange}
            />
          )}
        </Form.Item>

        {/* ***s=]*** Replier Name */}
        <Form.Item
          label={
            sessionStorage.getItem("lang") === "zh_TW"
              ? "回覆者姓名"
              : "Name to be used as the replier"
          }
          // style={{ float: 'left', display: 'inline-block', width: '60%', minHeight:'80px' }}
        >
          {getFieldDecorator("isAlias", {
            initialValue: this.state.selectedValue,
          })(
            <RadioGroup onChange={this.onRadioChange}>
              <Radio style={radioStyle} value={0}>
                {this.state.username}
              </Radio>
              <Radio style={radioStyle} value={1}>
                {intl.get("@MY_BLOG.ALIAS")}
                {this.state.selectedValue === 1 ? (
                  <Input
                    style={{ width: 100, marginLeft: 10 }}
                    onChange={this.onRadioInputChange}
                    allowClear
                  />
                ) : null}
              </Radio>
            </RadioGroup>
          )}
        </Form.Item>
        {/* ***s=]*** Button */}
        <Form.Item>
          <Button
            shape="round"
            htmlType="submit"
            type="primary"
            loading={this.state.submitting}
          >
            {intl.get("@MINI_BLOG.SUBMIT")}
          </Button>
          <Popconfirm
            title={
              sessionStorage.getItem("lang") === "zh_TW"
                ? "你將放棄此次編輯，確定？"
                : "Sure to quit and discard this draft?"
            }
            okText={sessionStorage.getItem("lang") === "zh_TW" ? "是" : "Yes"}
            cancelText={
              sessionStorage.getItem("lang") === "zh_TW" ? "取消" : "Cancel"
            }
            onConfirm={this.onPopconfirmOk}
          >
            <Button style={{ marginLeft: "5%" }} shape="round">
              {intl.get("@MINI_BLOG.CANCEL")}
            </Button>
          </Popconfirm>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedForumCommentForm = Form.create({ name: "comment_form" })(
  ForumCommentForm
);
export default WrappedForumCommentForm;
