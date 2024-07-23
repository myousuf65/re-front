//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200812 */

import React, { Component } from "react";
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
import locale from "antd/lib/date-picker/locale/zh_TW";
import { CKEditor } from "ckeditor4-react";
import moment from "moment";
import intl from "react-intl-universal";

import "./post_form.css";
import { fetchData, keywordsScanner } from "../service/HelperService";

moment.locale("zh-hk");

const { Option } = Select;
const RadioGroup = Radio.Group;

class PostForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: sessionStorage.getItem("@userInfo.fullname") || "NULL",
      mode: "time",
      disableTimePicker: true,
      radioValue: "user",
      radioInput: "",
      categoryList: [],
      postCreatorsList: [],
      loading: false,
      isSuperAdmin: false,
      ruleOptions: [],
    };
  }

  componentDidMount() {
    this.getCreatorsList();
    this.getCategoryList();
    this.checkSuperAdmin();
  }

  checkSuperAdmin = () => {
    var isSuperAdmin = false;

    let getUserGroup_url =
      sessionStorage.getItem("serverPort") +
      "user/get/" +
      sessionStorage.getItem("@userInfo.id");
    fetchData(getUserGroup_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && res.data.groupId && res.data.groupId === 5) {
          isSuperAdmin = true;
        }
      }

      this.setState({ isSuperAdmin: isSuperAdmin });
    });
  };

  getCreatorsList = () => {
    let getBlogger_url =
      sessionStorage.getItem("serverPort") +
      `blog/assistant/getOriginal/${sessionStorage.getItem("@userInfo.id")}`;
    fetchData(getBlogger_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && res.data) {
          this.setState({
            postCreatorsList: res.data.sort((a, b) =>
              a.fullname > b.fullname ? 1 : b.fullname > a.fullname ? -1 : 0
            ),
          });
        }
      }
    });
  };

  getCategoryList = () => {
    this.setState({ categoryList: require("../temp_json/blog_allcates.json") });
  };

  onSearchAccessRule = (inputs) => {
    if (!inputs) {
      this.setState((state) => ({ ruleOptions: [] }));
    } else {
      let getARbyDesc_url =
        sessionStorage.getItem("serverPort") +
        "access_rule/search/" +
        sessionStorage.getItem("@userInfo.id") +
        "?page=1&description=" +
        inputs;
      fetchData(getARbyDesc_url, "get", null, (response) => {
        if (response.ifSuccess) {
          let res = response.result;
          if (res.status === 200 && res.data !== undefined) {
            this.setState((state) => ({ ruleOptions: res.data }));
          } else {
            this.setState((state) => ({ ruleOptions: [] }));
          }
        } else {
          this.setState((state) => ({ ruleOptions: [] }));
        }
      });
    }
  };

  onSwitchClick = (checked) => {
    this.setState({ disableTimePicker: !checked });
  };

  onRadioChange = (e) => {
    this.setState({ radioValue: e.target.value });
  };

  onRadioInputChange = (e) => {
    this.setState({ radioInput: e.target.value });
  };
  onRadioSelectChange = (value) => {
    this.setState({ radioInput: value });
  };

  handlePickerOpenChange = (open) => {
    if (open) {
      this.setState({ mode: "time" });
    }
  };

  handlePickerPanelChange = (value, mode) => {
    this.setState({ mode });
  };

  handleSubmit = (e) => {
    //let getEData = this.customHandler();
    let getEData = "";
    const { radioInput } = this.state;
    // ---- wrap content & alias for further scan
    let scanTarget = getEData;

    if (this.props.form.getFieldValue("postTitle")) {
      scanTarget = this.props.form.getFieldValue("postTitle");
    }

    if (
      this.props.form.getFieldValue("nominatedAuthor") === "alias" &&
      radioInput
    ) {
      scanTarget += ",";
      scanTarget += radioInput;
    }

    let scanResult = keywordsScanner(scanTarget);
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, fieldsValues) => {
      if (fieldsValues["nominatedAuthor"] === "alias" && !radioInput) {
        message.error("Alias should not be empty", 7);
      } else if (!err && scanResult) {
        this.setState({ loading: true });

        const values = {
          ...fieldsValues,
          createdBy: sessionStorage.getItem("@userInfo.id"),
          isPublic: fieldsValues["isPublic"] ? 1 : 0,
          publishAt:
            fieldsValues["isPublic"] === 0
              ? null
              : moment(fieldsValues["publishAt"]).format("YYYY-MM-DD HH:mm:ss"),
          showAsAlias: fieldsValues["nominatedAuthor"] === "alias" ? 1 : 0,
          alias:
            fieldsValues["nominatedAuthor"] === "alias" ? radioInput : null,
          originalCreator:
            fieldsValues["nominatedAuthor"] === "others"
              ? radioInput
              : sessionStorage.getItem("@userInfo.id"),
          link: fieldsValues["link"] || null,
          accessRuleId: fieldsValues["accessRuleId"] || null,
          accessChannel: fieldsValues["accessChannel"] || null,
        };

        let createPost_url =
          sessionStorage.getItem("serverPort") +
          "specialCollection/create/" +
          sessionStorage.getItem("@userInfo.id");
        fetchData(createPost_url, "post", values, (response) => {
          this.setState({ loading: false });
          if (response.ifSuccess) {
            let res = response.result;
            if (res.status === 200) {
              message.success("Post create successfully.");
              setTimeout(() => {
                window.location.replace(
                  `#/specialCollection/myspecialCollection`
                );
              }, 1000);
            } else {
              message.error("Sorry, post creation was rejected by server.", 1);
            }
          } else {
            message.error("Sorry, post creation was rejected by server.", 1);
          }
        });
      }
    });
  };

  onCancelDelete = () => {};

  onDelete = () => {
    window.location.assign("#/specialCollection/myblog");
  };

  onEditorChange = (event) => {
    const data = event.editor.getData();
    return data;
  };

  onEditorPaste = (evt) => {
    // Handle dropping a gallery image by transforming the image string into HTML.
    // Note: All pasted and dropped content is handled in one event - editor#paste.
    var dataValue = evt.data.dataValue;
    if (dataValue.indexOf('<img name="auth-post-img"') === 0) {
      var divImg = document.createElement("div");
      divImg.innerHTML = dataValue;
      let img = divImg.firstElementChild;

      if (!img) {
        return;
      }

      // // ---filter out placeholder
      // var loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
      // var brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
      // if(img.getAttribute('src')===loadingImg||img.getAttribute('src')===brokenImg){
      //     message.info('Preparing... Please wait until image is loaded.', 5);
      //     return;
      // }

      evt.data.dataValue =
        "<img " +
        'alt="' +
        img.getAttribute("data") +
        '" ' +
        'src="' +
        img.getAttribute("src") +
        '" ' +
        " />";
    } else if (dataValue.indexOf('POST-IMG alt="') === 0) {
      evt.data.dataValue =
        "<img " + dataValue.slice(dataValue.indexOf('G alt="') + 2) + " />";
    } else {
      return;
    }
  };

  customHandler = () => {
    let data = this.props.form.getFieldInstance("content").editor.getData();
    return data;
  };

  render() {
    const {
      getFieldDecorator,
      getFieldError,
      isFieldTouched,
    } = this.props.form;
    const {
      username,
      categoryList,
      mode,
      disableTimePicker,
      radioValue,
      postCreatorsList,
      loading,
      isSuperAdmin,
      ruleOptions,
    } = this.state;

    const radioStyle1 = {
      display: "inline",
      height: "30px",
      lineHeight: "30px",
    };
    const radioStyle2 = {
      display: "block",
      height: "30px",
      lineHeight: "30px",
    };

    const categoryError = getFieldError("categoryId");
    const titleError = getFieldError("postTitle");
    const contentError = getFieldError("content");
    // Only show error after a field is touched.
    const publishAtError =
      isFieldTouched("publishAt") && getFieldError("publishAt");

    return (
      <div>
        {/* <div hidden>{CKEditor.editorUrl = sessionStorage.getItem('serverPort')+'resources/js/ckeditor/ckeditor.js'}</div> */}
        <Spin spinning={loading}>
          <Form
            layout="horizontal"
            labelAlign="left"
            onSubmit={this.handleSubmit}
          >
            {/* ***s=]*** Category */}
            {/*}
                <Form.Item
                label={intl.get('@MINI_BLOG.CATEGORY')}
                validateStatus={categoryError ? 'error' : ''}
                help={categoryError || ''}
                >
                {getFieldDecorator('categoryId', {
                    rules: [{ required: true, message: intl.get('@MINI_BLOG.CATEGORY')+intl.get('@GENERAL.IS-REQUIRED') }],
                })(
                    <Select className="postTags" placeholder={intl.get('@MINI_BLOG.CATEGORY-TIPS')} >
                        { categoryList.map(icate=>{return <Option key={icate.id}>{sessionStorage.getItem('lang')==='zh_TW'? icate.category_c : icate.category}</Option>})}
                    </Select>
                )}
                </Form.Item>*/}

            {/* ***s=]*** Title */}
            <Form.Item
              label={intl.get("@GENERAL.TITLE-EN")}
              validateStatus={titleError ? "error" : ""}
              help={titleError || ""}
            >
              {getFieldDecorator("postTitle", {
                rules: [
                  {
                    required: true,
                    message:
                      intl.get("@GENERAL.TITLE-EN") +
                      intl.get("@GENERAL.IS-REQUIRED"),
                  },
                ],
              })(
                <Input
                  style={{ lineHeight: 0, maxWidth: "400px" }}
                  prefix={
                    <Icon
                      type="file-text"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  placeholder={intl.get("@GENERAL.TITLE-EN")}
                  allowClear
                />
              )}
            </Form.Item>

            <Form.Item
              label={intl.get("@GENERAL.TITLE-ZH")}
              validateStatus={titleError ? "error" : ""}
              help={titleError || ""}
            >
              {getFieldDecorator("postTitleZh", {
                rules: [
                  {
                    required: true,
                    message:
                      intl.get("@GENERAL.TITLE-ZH") +
                      intl.get("@GENERAL.IS-REQUIRED"),
                  },
                ],
              })(
                <Input
                  style={{ lineHeight: 0, maxWidth: "400px" }}
                  prefix={
                    <Icon
                      type="file-text"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  placeholder={intl.get("@GENERAL.TITLE-ZH")}
                  allowClear
                />
              )}
            </Form.Item>
            {/* --------------------------------Content-------------------------------------------- */}
            {/*<Form.Item
                label={intl.get('@MINI_BLOG.CONTENT')}
                validateStatus={contentError ? 'error' : ''}
                >
                {getFieldDecorator('content', { getValueFromEvent: this.onEditorChange })(
                    <CKEditor 
                    config={{
                        language: sessionStorage.getItem('lang')==='zh_TW'? 'zh':'en',
                        height: '25em',
                        // removeButtons: 'Html5video'
                    }}
                    // onChange={this.onEditorChange}
                    // Handle dropping a contact by transforming the contact object into HTML.
                    // Note: All pasted and dropped content is handled in one event - editor#paste.
                    onPaste={this.onEditorPaste}
                    onInstanceReady={()=>this.setState({ loading: false })}
                    // onAfterSetData={evt=>{
                    //     var data = evt.data.dataValue;
                    //     console.log('onAfterSetData: ', data);
                    // }}
                    />
                )}
                </Form.Item>/*}
{/* ---------------------------------------------------------------------------- */}

            {/** video link (2023 CR) */}
            <Form.Item
              label={intl.get("@BOOKMARK.LINK")}
              validateStatus={titleError ? "error" : ""}
              help={titleError || ""}
            >
              {getFieldDecorator("link", {
                rules: [{ required: false, message: "" }],
              })(
                <Input
                  disabled={isSuperAdmin ? false : true}
                  style={{ lineHeight: 0, maxWidth: "600px" }}
                  prefix={
                    <Icon
                      type="file-text"
                      style={{ color: "rgba(0,0,0,.25)" }}
                    />
                  }
                  placeholder={intl.get("@BOOKMARK.LINK")}
                  allowClear
                />
              )}
            </Form.Item>

            {/* access channel */}
            <Form.Item label={intl.get("@RES_DRAWER_INFO.ACCESS-CHANNEL")}>
              {getFieldDecorator("accessChannel", {
                rules: [
                  { required: true, message: intl.get("@GENERAL.REQUIRED") },
                ],
              })(
                <Select>
                  <Option key="1">
                    {intl.get("@BANNERS_MANAGEMENT.INTRANET-ONLY")}
                  </Option>
                  <Option key="2">
                    {intl.get("@BANNERS_MANAGEMENT.BOTH")}
                  </Option>
                  <Option key="4">
                    {intl.get("@BANNERS_MANAGEMENT.INTERNET-ONLY")}
                  </Option>
                </Select>
              )}
            </Form.Item>

            {/* access rule */}
            <Form.Item label={intl.get("@RES_MANAGEMENT.ACCESS-RULE")}>
              {getFieldDecorator("accessRuleId", {
                rules: [
                  { required: true, message: intl.get("@GENERAL.REQUIRED") },
                ],
              })(
                <Select
                  placeholder="Search by Access Rule Description"
                  onSearch={this.onSearchAccessRule}
                  filterOption={false}
                  optionLabelProp="label"
                  mode="multiple"
                  style={{ width: "100%" }}
                >
                  {ruleOptions.length === 0
                    ? null
                    : ruleOptions.map((item) => {
                        return (
                          <Option key={item.id} label={item.description}>{`${
                            item.description
                          }(${item.id})`}</Option>
                        );
                      })}
                </Select>
              )}
            </Form.Item>

            <div>
              {/* ***s=]*** Go Publish */}
              <Form.Item
                className="if_published"
                label={intl.get("@MINI_BLOG.GO-PUBLIC")}
              >
                {getFieldDecorator("isPublic")(
                  <Switch
                    onClick={this.onSwitchClick}
                    size="default"
                    checkedChildren={<Icon type="check" />}
                    unCheckedChildren={<Icon type="close" />}
                  />
                )}
              </Form.Item>

              {/* ***s=]*** Blog Publish Date */}
              <Form.Item
                className="if_published"
                label={intl.get("@MINI_BLOG.PUBLISH-DATE")}
                help={publishAtError || ""}
              >
                {getFieldDecorator("publishAt", {
                  initialValue: moment(),
                  valueProName: "moment",
                })(
                  <DatePicker
                    locale={locale}
                    format="YYYY/MM/DD HH:mm:ss"
                    mode={mode}
                    showTime
                    onOpenChange={this.handlePickerOpenChange}
                    onPanelChange={this.handlePickerPanelChange}
                  />
                )}
              </Form.Item>
            </div>

            {/* ***s=]*** Name to be used in the post */}
            <Form.Item
              label={intl.get("@MINI_BLOG.ORIGINAL-CREATOR")}
              style={{ display: "none" }}
            >
              {getFieldDecorator("nominatedAuthor", { initialValue: "user" })(
                <RadioGroup
                  name="nominatedAuthor"
                  onChange={this.onRadioChange}
                >
                  <Radio style={radioStyle1} value="user">
                    {username}
                  </Radio>
                  <Radio style={radioStyle1} value="alias">
                    {intl.get("@MY_BLOG.ALIAS")}
                    {radioValue === "alias" ? (
                      <Input
                        onChange={this.onRadioInputChange}
                        style={{
                          maxWidth: "16em",
                          marginLeft: 10,
                          lineHeight: 0,
                          display: "inline-block",
                        }}
                        allowClear
                      />
                    ) : null}
                  </Radio>

                  <Radio
                    style={radioStyle2}
                    disabled={postCreatorsList.length === 0}
                    value="others"
                  >
                    {intl.get("@MY_BLOG.OTHER-CREATOR")}
                    {radioValue === "others" ? (
                      <Select
                        showSearch
                        optionFilterProp="label"
                        onChange={this.onRadioSelectChange}
                        style={{ maxWidth: "16em", marginLeft: 10 }}
                      >
                        {postCreatorsList.map((option) => {
                          return (
                            <Option
                              key={option.id}
                              label={`${option.fullname}(${option.staffNo})`}
                            >{`${option.fullname}(${option.staffNo})`}</Option>
                          );
                        })}
                      </Select>
                    ) : null}
                  </Radio>
                </RadioGroup>
              )}
            </Form.Item>

            {/* ***s=]*** Buttons */}
            <Form.Item className="formButtons">
              <Button type="primary" disabled={loading} htmlType="submit">
                {intl.get("@GENERAL.CREATE")}
              </Button>

              <Popconfirm
                title="Sure to leave this page? You will lose all inputs."
                okText={intl.get("@GENERAL.CANCEL")}
                onConfirm={this.onCancelDelete}
                cancelText={intl.get("@GENERAL.YES")}
                onCancel={this.onDelete}
              >
                <Button
                  type="default"
                  title="Leave current page without saving changes"
                >
                  {intl.get("@GENERAL.CANCEL")}
                </Button>
              </Popconfirm>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    );
  }
}

const WrappedPostForm = Form.create({ name: "post_form" })(PostForm);

export default WrappedPostForm;
