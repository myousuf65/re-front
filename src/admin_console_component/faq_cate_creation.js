//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200206 */
//Comments //***s=]***

import React from "react";
import {
  Layout,
  Form,
  Input,
  Button,
  TreeSelect,
  Select,
  Icon,
  message,
  Popconfirm,
  Tooltip,
} from "antd";

import { CKEditor } from "ckeditor4-react";
import intl from "react-intl-universal";

import { fetchData } from "../service/HelperService";

class FaqNewCateForm extends React.Component {
  state = {
    userOptions: null,
    cateOptions: [],
    ruleOptions: [],
    groupOptions: [],
    selRuleOptions: [],
    selUserOptions: [],
    selGroupOptions: [],
    imgUrl: "",
    imgUrl_head: null,
    loadingIcon: false,
    submitting: false,
    isFather: true,
  };

  componentWillMount = () => {
    this.getForumCate();
  };

  getForumCate = () => {
    this.setState({ loading: true });
    let getForumCate_url =
      sessionStorage.getItem("serverPort") +
      "faq/admin/categoryall/" +
      sessionStorage.getItem("@userInfo.id");
    fetchData(getForumCate_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.data !== undefined && res.status === 200) {
          this.handleCateList_Lv1(res.data);
        } else {
          this.setState({
            cateOptions: [],
          });
        }
      } else {
        this.setState({
          cateOptions: [],
        });
      }
    });
  };

  onEditorChange = (event) => {
    let data = event.editor.getData();
    this.setState((state) => ({ content: data }));
    return data;
  };

  handleCateList_Lv1 = (cateList) => {
    let pre_cateList = cateList.map((cate) => ({
      key: cate.id,
      value: cate.id,
      title:
        cate.titleTc === cate.titleEn
          ? cate.titleEn
          : `${cate.titleEn} (${cate.titleTc})`,
    }));
    this.setState({ cateOptions: pre_cateList });
  };

  onChangeParentId = (selParentId) => {
    if (
      selParentId !== undefined &&
      selParentId !== null &&
      selParentId !== 0
    ) {
      if (this.state.isFather) {
        this.setState({ isFather: false });
        this.props.form.setFieldsValue({ imgUrl: null });
      }
    } else {
      if (!this.state.isFather) {
        this.setState({ isFather: true });
        this.props.form.setFieldsValue({ imgUrl: null });
      }
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, fieldsValues) => {
      if (!err) {
        this.setState({ submitting: true });
        var values = {
          ...fieldsValues,
          titleTc:
            fieldsValues["titleTc"] === undefined ||
            fieldsValues["titleTc"] === null ||
            fieldsValues["titleTc"] === ""
              ? fieldsValues["titleEn"]
              : fieldsValues["titleTc"],
          QuestionTc:
            fieldsValues["QuestionTc"] === undefined ||
            fieldsValues["QuestionTc"] === null ||
            fieldsValues["QuestionTc"] === ""
              ? fieldsValues["QuestionEn"]
              : fieldsValues["QuestionTc"],
          AnswerTc:
            fieldsValues["AnswerTc"] === undefined ||
            fieldsValues["AnswerTc"] === null ||
            fieldsValues["AnswerTc"] === ""
              ? fieldsValues["AnswerEn"]
              : fieldsValues["AnswerTc"],
          level: this.state.isFather ? 1 : 2,
          parentForumId: fieldsValues["parentForumId"] || 0,
        };

        if (this.state.isFather) {
          // delete values.accessChannel;
          delete values.showInfo;
          delete values.admin;
          delete values.orderBy;
          delete values.accessRules_access;
          delete values.accessRules_writer;
          delete values.specialUser_access;
          delete values.specialUser_writer;
          delete values.specialUserList_access;
          delete values.specialUserList_writer;
        }

        // setTimeout(()=>{console.log('forumCate Creation: ', values); this.setState({submitting:false});}, 1000)

        let newCate_url =
          sessionStorage.getItem("serverPort") +
          "faq/create/" +
          sessionStorage.getItem("@userInfo.id");
        fetchData(newCate_url, "post", values, (response) => {
          if (response.ifSuccess) {
            let res = response.result;
            if (res.status === 200) {
              message.success("Create Successfully!");
              this.setState({ submitting: false });
              window.location.assign("#/adminconsole/faq/management");
            } else {
              message.error(res.msg);
              this.setState({ submitting: false });
            }
          } else {
            message.error("Server denied.");
            this.setState({ submitting: false });
          }
        });
      }
    });
  };

  handleCancel = (e) => {
    message.success(
      sessionStorage.getItem("lang") === "zh_TW"
        ? "取消創建"
        : "Creation Cancelled"
    );
    window.location.assign("#/adminconsole/faq/management");
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { Option } = Select;
    const { Content } = Layout;
    const {
      cateOptions,
      userOptions,
      ruleOptions,
      groupOptions,
      selRuleOptions,
      selUserOptions,
      selGroupOptions,
      submitting,
    } = this.state;

    return (
      <div className="clearfix" style={{ width: "100%" }}>
        <Content className="cms-content">
          <h1>
            <div style={{ display: "inline-block", width: "60%" }}>
              {intl.get("@FAQ_ADMIN.CREATION")}
            </div>

            <div
              style={{
                display: "inline-block",
                width: "40%",
                textAlign: "right",
              }}
            >
              <Button
                className="res_create_btn"
                shape="round"
                type="primary"
                href="#/adminconsole/faq/management"
              >
                <Icon type="rollback" /> {intl.get("@RES_MANAGEMENT.BACK")}
              </Button>
            </div>
          </h1>

          <div className="cms-white-box">
            <Form
              layout="vertical"
              labelCol={{ xs: { span: 64 }, sm: { span: 6 } }}
              wrapperCol={{ xs: { span: 24 }, sm: { span: 18 } }}
              labelAlign="left"
            >
              <Form.Item
                label={
                  <span>
                    {intl.get("@FORUM_ADMIN.PARENT")}&nbsp;
                    <Tooltip title="Leave it empty if new category belongs to level 1.">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }
              >
                {getFieldDecorator("parentForumId", { initialValue: null })(
                  <TreeSelect
                    dropdownStyle={{ maxHeight: "200px", overflow: "auto" }}
                    allowClear
                    dropdownMatchSelectWidth={true}
                    treeData={cateOptions}
                    onChange={this.onChangeParentId}
                  />
                )}
              </Form.Item>
              <span hidden={!this.state.isFather}>
                <Form.Item label={intl.get("@FORUM_ADMIN.NAME-EN")}>
                  {getFieldDecorator("titleEn")(
                    <Input allowClear style={{ maxWidth: "400px" }} />
                  )}
                </Form.Item>

                <Form.Item label={intl.get("@FORUM_ADMIN.NAME-TC")}>
                  {getFieldDecorator("titleTc")(
                    <Input allowClear style={{ maxWidth: "400px" }} />
                  )}
                </Form.Item>
              </span>
              <span hidden={this.state.isFather}>
                <Form.Item label={intl.get("@FAQ_ADMIN.QUESTION-EN")}>
                  {getFieldDecorator("QuestionEn")(
                    <textarea
                      style={{ whiteSpace: "pre-wrap", minWidth: "500px" }}
                      allowClear
                    />
                  )}
                </Form.Item>
                <Form.Item label={intl.get("@FAQ_ADMIN.QUESTION-TC")}>
                  {getFieldDecorator("QuestionTc")(
                    <textarea style={{ minWidth: "500px" }} allowClear />
                  )}
                </Form.Item>
                <Form.Item label={intl.get("@FAQ_ADMIN.ANSWER-EN")}>
                  {getFieldDecorator("AnswerEn", {
                    getValueFromEvent: this.onEditorChange,
                  })(
                    // <textarea style={{minWidth: '500px'}} allowClear />
                    <CKEditor
                      config={{
                        // language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                        toolbar: [
                          { name: "clipboard", items: ["Undo", "Redo"] },
                          { name: "colors", items: ["TextColor", "BGColor"] },
                          {
                            name: "basicstyles",
                            items: [
                              "Bold",
                              "Italic",
                              "Strike",
                              "-",
                              "RemoveFormat",
                            ],
                          },
                          { name: "insert", items: ["EmojiPanel"] },
                        ],
                      }}
                      onChange={this.onEditorChange}
                    />
                  )}
                </Form.Item>
                <Form.Item label={intl.get("@FAQ_ADMIN.ANSWER-TC")}>
                  {getFieldDecorator("AnswerTc", {
                    getValueFromEvent: this.onEditorChange,
                  })(
                    // <textarea  style={{minWidth: '500px'}} allowClear />
                    <CKEditor
                      config={{
                        // language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                        toolbar: [
                          { name: "clipboard", items: ["Undo", "Redo"] },
                          { name: "colors", items: ["TextColor", "BGColor"] },
                          {
                            name: "basicstyles",
                            items: [
                              "Bold",
                              "Italic",
                              "Strike",
                              "-",
                              "RemoveFormat",
                            ],
                          },
                          { name: "insert", items: ["EmojiPanel"] },
                        ],
                      }}
                      onChange={this.onEditorChange}
                    />
                  )}
                </Form.Item>
              </span>

              <Form.Item>
                <Button
                  style={{ marginRight: "8px" }}
                  type="primary"
                  onClick={this.handleSubmit}
                  loading={submitting}
                >
                  {intl.get("@GENERAL.CREATE")}
                </Button>
                <Popconfirm
                  placement="topRight"
                  title={
                    sessionStorage.getItem("lang") === "zh_TW"
                      ? "你將放棄此次編輯，確定？"
                      : "Sure to quit and discard this draft?"
                  }
                  okText={intl.get("@GENERAL.YES")}
                  cancelText={intl.get("@GENERAL.CANCEL")}
                  onConfirm={this.handleCancel}
                >
                  <Button type="danger" disabled={submitting}>
                    {intl.get("@GENERAL.CANCEL")}
                  </Button>
                </Popconfirm>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </div>
    );
  }
}

const WrappedFaqNewCateForm = Form.create({ name: "faq_new_cate_form" })(
  FaqNewCateForm
);
export default WrappedFaqNewCateForm;
