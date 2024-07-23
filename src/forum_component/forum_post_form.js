//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200212 */

import React, { Component } from "react";
import {
  Popconfirm,
  Form,
  Icon,
  Input,
  Radio,
  Button,
  message,
  Breadcrumb,
  Upload,
  List,
  Checkbox,
} from "antd";
import { CKEditor } from "ckeditor4-react";
import intl from "react-intl-universal";

import {
  fetchData,
  bytesToSize,
  keywordsScanner,
} from "../service/HelperService";
import { authPostImg } from "../resources_component/authimg.js";

// import "../miniblog_component/post_form.css";
// import "./forum_post.css";
// const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
// const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';
// CKEditor.editorUrl = process.env.PUBLIC_URL + 'ckeditor/ckeditor.js';

const RadioGroup = Radio.Group;
const Dragger = Upload.Dragger;

class ForumPostForm extends Component {
  state = {
    username: sessionStorage.getItem("@userInfo.fullname") || "Author",
    radioValue: "user",
    radioInput: "",
    loading: false,
    order: 999,
    selCategory: [],
    selSubCateId: null,
    imgList: [],
    fileList: [],
    uploadList: [],
    showIfReplied: false,
  };

  componentDidMount() {
    let winHref = window.location.href;
    let selSubCateId = winHref.slice(winHref.lastIndexOf("kc/post/new/") + 12);

    this.getSelCatePath(selSubCateId);
  }

  getSelCatePath = (selCateId) => {
    let getSelPost_url =
      sessionStorage.getItem("serverPort") +
      "forum/category/family/" +
      sessionStorage.getItem("@userInfo.id") +
      "/" +
      selCateId;
    fetchData(getSelPost_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && res.data.length > 0) {
          this.setState({ selSubCateId: selCateId, selCategory: res.data });
        } else {
          message.error("Sorry, the selected category is NOT available.");
          setTimeout(() => {
            window.location.assign("#/kc/home");
          }, 5000);
        }
      } else {
        this.setState({ selSubCateId: selCateId, selCategory: [] });
        // message.error('Sorry, the selected category is NOT available.');
        // setTimeout(()=>{window.location.assign('#/kc/home')}, 5000);
      }
    });
  };

  onEditorChange = (event) => {
    const data = event.editor.getData();
    return data;
  };

  customHandler = (iEditor) => {
    let data = this.props.form.getFieldInstance(iEditor).editor.getData();
    return data;
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

  getCategoryId = () => {
    const cateCopy = this.state.selCategory;
    var cateArrLen = cateCopy.length;

    if (cateArrLen > 0) {
      return cateCopy[cateArrLen - 1].id;
    } else {
      message.error("Category info is missing");
      return 0;
    }
  };

  handleNewImg = (img) => {
    console.log("new image: ", this.state.imgList.indexOf(img.url));
    if (this.state.imgList.indexOf(img.url) < 0) {
      this.setState((state) => ({ imgList: [...state.imgList, img.url] }));
    }
  };

  // ----collect all adopted imgs
  imgArrHandler = (cke_content) => {
    let imgArr = Array.from(
      new DOMParser()
        .parseFromString(cke_content, "text/html")
        .querySelectorAll("img")
    ).map((img) => {
      return img.getAttribute("alt");
    });
    // .map( img => img.getAttribute( 'src' ).substring(serverPort.length));
    console.log("uploaded image(s): ", this.state.imgList);
    console.log("adopted image(s): ", imgArr);
    let imgDiff = this.state.imgList.filter(
      (imgUrl) => !imgArr.includes(imgUrl)
    );
    console.log("deleted image(s): ", imgDiff);

    if (imgDiff.length > 0) {
      let forumImgDel_url =
        sessionStorage.getItem("serverPort") +
        "forum/post/remove/photo/" +
        sessionStorage.getItem("@userInfo.id");
      fetchData(forumImgDel_url, "post", imgDiff, (res) => {});
    }
  };

  handleSubmit = (e) => {
    let getEData = this.customHandler("content");
    let getHiddenData = this.customHandler("hiddenField");

    const { radioInput, showIfReplied } = this.state;
    // ---- wrap title & content & hidden content & alias for sensitive keywords scan
    let scanTarget = getEData;
    if (this.props.form.getFieldValue("title")) {
      scanTarget = this.props.form.getFieldValue("title") + "," + scanTarget;
    }
    if (
      this.props.form.getFieldValue("nominatedAuthor") === "alias" &&
      radioInput
    ) {
      scanTarget += ",";
      scanTarget += radioInput;
    }
    if (showIfReplied && getHiddenData) {
      scanTarget += ",";
      scanTarget += getHiddenData;
    }

    let scanResult = keywordsScanner(scanTarget);

    // let getCateId = this.getCategoryId();
    e.preventDefault();

    this.props.form.validateFieldsAndScroll((err, fieldsValues) => {
      if (fieldsValues["nominatedAuthor"] === "alias" && !radioInput) {
        message.error("Alias should not be empty", 7);
      } else if (!err && scanResult) {
        this.setState((state) => ({ loading: true }));

        const values = {
          ...fieldsValues,
          category: this.state.selSubCateId,
          content: getEData === null ? "" : getEData,
          hiddenField: showIfReplied && getHiddenData ? getHiddenData : null,
          isAlias: fieldsValues["nominatedAuthor"] === "alias" ? 1 : 0,
          alias:
            fieldsValues["nominatedAuthor"] === "alias" ? radioInput : null,
          order: 999,
        };

        this.imgArrHandler(scanTarget);

        let createPost_url =
          sessionStorage.getItem("serverPort") +
          "forum/post/new/" +
          sessionStorage.getItem("@userInfo.id");
        fetchData(createPost_url, "post", values, (response) => {
          if (response.ifSuccess) {
            let res = response.result;
            if (res.status === 200) {
              message.success("Post create successfully.");
              setTimeout(() => {
                window.location.replace(`#/kc/post/details?id=${res.data.id}`);
              }, 1000);
            } else {
              message.error("Failed to create: " + res.msg, 2);
              this.setState((state) => ({ loading: false }));
            }
          } else {
            if (response.result.status === 400) {
              let res = JSON.parse(response.result.response);
              message.error("Failed to create: " + res.msg, 2);
            } else {
              message.error("Sorry, your request was rejected by server.", 2);
            }

            this.setState((state) => ({ loading: false }));
          }
        });
      }
    });
  };

  onCancelDelete = () => {};

  onDelete = () => {
    const { selCategory } = this.state;
    if (selCategory !== undefined && selCategory !== null) {
      if (selCategory.length > 1) {
        window.location.assign(
          "#/kc/postlist/" + selCategory[0].id + "/?id=" + selCategory[1].id
        );
      } else if (selCategory.length > 0) {
        window.location.assign("#/kc/category/" + selCategory[0].id);
      } else {
        window.location.assign("#/kc/home");
      }
    } else {
      window.location.assign("#/kc/home");
    }
  };

  handleImgSrc = (str, target) => {
    // // ---filter out placeholder
    // if(target.getAttribute('src')===loadingImg || target.getAttribute('src')===brokenImg){
    //     message.info('Preparing... Please wait until image is loaded.', 5);
    //     return;
    // }

    const el = document.createElement("textarea");
    const ck = document.getElementById("kc-form-ckeditor-content");
    el.value =
      'POST-IMG alt="' + str + '" src="' + target.getAttribute("src") + '" ';
    document.body.appendChild(el);
    el.select();
    ck.scrollIntoView();
    document.execCommand("copy");
    message.success(
      "Now you can insert the Image into Content Editor by Paste.",
      5
    );
    document.body.removeChild(el);
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

  handleChange = ({ file, fileList }) => {
    var uploadList = [...fileList];
    this.setState({ uploadList: [...uploadList] });

    const status = file.status;

    if (status === "done") {
      // if(file.response.status===200){
      if (!file.response.status) {
        uploadList = fileList.filter((item) => item.uid !== file.uid);
        this.setState((state) => ({
          fileList: [...state.fileList, file.response],
          uploadList: [...uploadList],
        }));
        this.handleNewImg(file.response);
        authPostImg();
      } else {
        message.error(
          `${file.response.status}IN${bytesToSize(
            file.size || 0
          )}: Failed to upload image ${file.name}`,
          7
        );
      }
    } else if (status === "error") {
      message.error(
        `${file.error.status}OU${bytesToSize(
          file.size || 0
        )}: Failed to upload image ${file.name}`,
        7
      );
    }
  };

  handleDraggerRemove = (file) => {
    return true;
  };

  onCheckboxChange = (e) => {
    this.setState({ showIfReplied: e.target.checked });
  };

  render() {
    const { getFieldDecorator, getFieldError } = this.props.form;
    const { selCategory, loading, showIfReplied } = this.state;

    const radioStyle = {
      display: "inline",
      height: "30px",
      lineHeight: "30px",
    };

    const titleError = getFieldError("title");

    const httpHeaders = {
      accessToken: sessionStorage.getItem("accessToken"),
      accesshost: window.location.hostname,
    };

    const draggerprops = {
      name: "upload",
      multiple: true,
      accept: "image/*",
      listType: "picture",
      action: `${sessionStorage.getItem(
        "serverPort"
      )}forum/post/new/photo/${sessionStorage.getItem(
        "@userInfo.id"
      )}/0&responseType=json`,
      headers: httpHeaders,
      fileList: this.state.uploadList,
      onChange: this.handleChange,
      // onRemove: this.handleDraggerRemove,
    };

    return (
      <div>
        {/* <div hidden>{CKEditor.editorUrl = sessionStorage.getItem('serverPort')+'resources/js/ckeditor/ckeditor.js'}</div> */}

        <Form
          layout="horizontal"
          labelAlign="left"
          onSubmit={this.handleSubmit}
        >
          {/* --------------------------------Category-------------------------------------------- */}
          <Form.Item disabled>
            <Breadcrumb separator=">">
              <Breadcrumb.Item>{intl.get("@GENERAL.CATEGORY")}</Breadcrumb.Item>
              {selCategory.map((iCate) => (
                <Breadcrumb.Item key={iCate.id}>
                  {sessionStorage.getItem("lang") === "zh_TW"
                    ? iCate.nameTc
                    : iCate.nameEn}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </Form.Item>

          {/* --------------------------------Title-------------------------------------------- */}
          <Form.Item
            validateStatus={titleError ? "error" : ""}
            help={titleError || ""}
          >
            {getFieldDecorator("title", {
              rules: [
                {
                  required: true,
                  message:
                    intl.get("@GENERAL.TITLE") +
                    intl.get("@GENERAL.IS-REQUIRED"),
                },
              ],
            })(
              <Input
                style={{ lineHeight: 0, maxWidth: "400px" }}
                prefix={
                  <Icon type="file-text" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder={intl.get("@GENERAL.TITLE")}
                allowClear
              />
            )}
          </Form.Item>

          {/* --------------------------------Content-------------------------------------------- */}

          <div className="row">
            <div className="col-md-9" id="kc-form-ckeditor-content">
              <Form.Item>
                {getFieldDecorator("content", {
                  // rules: [{required: true, message: sessionStorage.getItem('lang')==='zh_TW'? '內容不可為空':'Content is required.' }],
                  // getValueFromEvent: this.onEditorChange,
                })(
                  <CKEditor
                    config={{
                      language:
                        sessionStorage.getItem("lang") === "zh_TW"
                          ? "zh"
                          : "en",
                      height: "25em",
                      // removeButtons: 'Html5video',
                      contentsCss: ["ckeditor/contents_kc.css"],
                    }}
                    onPaste={this.onEditorPaste}
                    onChange={this.onEditorChange}
                  />
                )}
              </Form.Item>

              {/* --------------------------------Display if replied-------------------------------------------- */}
              <Form.Item>
                <Checkbox
                  checked={showIfReplied}
                  onChange={this.onCheckboxChange}
                >
                  {intl.get("@FORUM_GENERAL.SHOW-IF-REPLIED")}
                </Checkbox>
              </Form.Item>

              <div hidden={!showIfReplied}>
                <Form.Item>
                  {getFieldDecorator("hiddenField", {
                    // getValueFromEvent: this.onEditorChange,
                  })(
                    <CKEditor
                      config={{
                        language:
                          sessionStorage.getItem("lang") === "zh_TW"
                            ? "zh"
                            : "en",
                        height: "10em",
                        // removeButtons: 'Html5video',
                        contentsCss: ["ckeditor/contents_kc.css"],
                      }}
                      onPaste={this.onEditorPaste}
                      onChange={this.onEditorChange}
                    />
                  )}
                </Form.Item>
              </div>
            </div>

            <div
              className="col-md-3"
              style={{ height: "500px", overflowY: "auto" }}
            >
              <Form.Item>
                <Dragger {...draggerprops}>
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-text">
                    {intl.get("@MY_BLOG.DRAGGER-TIPS")}
                  </p>
                </Dragger>
                <List
                  style={{ overflowY: "auto", maxHeight: "300px" }}
                  itemLayout="horizontal"
                  header={<b>Select to insert:</b>}
                  bordered
                  dataSource={this.state.fileList}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      extra={
                        <img
                          style={{
                            display: "block",
                            width: "50%",
                            overflow: "hidden",
                            height: "auto",
                            margin: "0 auto",
                            cursor: "pointer",
                          }}
                          name="auth-post-img"
                          onClick={(e) => this.handleImgSrc(item.url, e.target)}
                          alt={item.url}
                          data={item.url}
                        />
                      }
                    >
                      {item.id}
                    </List.Item>
                  )}
                />
              </Form.Item>
            </div>
          </div>

          {/* --------------------------------Alias-------------------------------------------- */}
          <Form.Item label={intl.get("@FORUM_GENERAL.ALIAS-AUTHOR")}>
            {getFieldDecorator("nominatedAuthor", { initialValue: "user" })(
              <RadioGroup name="nominatedAuthor" onChange={this.onRadioChange}>
                <Radio style={radioStyle} value="user">
                  {this.state.username}
                </Radio>
                <Radio style={radioStyle} value="alias">
                  {intl.get("@MY_BLOG.ALIAS")}
                  <Input
                    onChange={this.onRadioInputChange}
                    style={{
                      width: "8em",
                      marginLeft: 10,
                      lineHeight: 0,
                      display: "inline-block",
                    }}
                    allowClear
                    hidden={this.state.radioValue !== "alias"}
                  />
                </Radio>
              </RadioGroup>
            )}
          </Form.Item>

          {/* --------------------------------Read Only-------------------------------------------- */}
          <Form.Item label={intl.get("@FORUM_ADMIN.ALLOW-COMMENT")}>
            {getFieldDecorator("allowComment", { initialValue: 0 })(
              <RadioGroup name="allowComment">
                <Radio style={radioStyle} value={0}>
                  {intl.get("@GENERAL.YES")}
                </Radio>
                <Radio style={radioStyle} value={1}>
                  {intl.get("@GENERAL.NO")}
                </Radio>
              </RadioGroup>
            )}
          </Form.Item>

          {/* --------------------------------Submit or Quit-------------------------------------------- */}
          <Form.Item className="formButtons">
            <Button type="primary" loading={loading} htmlType="submit">
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
      </div>
    );
  }
}

const WrappedForumPostForm = Form.create({ name: "forum_post_form" })(
  ForumPostForm
);

export default WrappedForumPostForm;
