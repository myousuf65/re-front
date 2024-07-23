//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190704 */

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
const loadingImg = process.env.PUBLIC_URL + "/images/blog-img-loading.jpeg";
const brokenImg = process.env.PUBLIC_URL + "/images/blog-img-broken.jpeg";
moment.locale("zh-hk");

const { Option } = Select;
const RadioGroup = Radio.Group;

class PostForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selPost: {},
      username: "",
      mode: "time",
      fileList: [],
      disableTimePicker: true,
      radioValue: "user",
      radioInput: null,
      disableAlias: false,
      categoryList: require("../temp_json/blog_allcates.json"),
      loading: true,
      cke_ready: false,
      getPost_ready: false,
      isSuperAdmin: false,
      ruleOptions: [],
    };
  }

  componentDidMount() {
    // To disable submit button at the beginning
    // this.props.form.validateFields();

    let getRecord_url =
      sessionStorage.getItem("serverPort") +
      "specialCollection/getDetail2/" +
      this.props.selPostId +
      "?user=" +
      sessionStorage.getItem("@userInfo.id");
    fetchData(getRecord_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (
          res.status === 200 &&
          res.data.specialCollection &&
          (res.data.specialCollection.createdBy ===
            sessionStorage.getItem("@userInfo.id") ||
            res.data.specialCollection.originalCreator.id ==
              sessionStorage.getItem("@userInfo.id"))
        ) {
          // if(this.state.cke_ready){
          //     this.handleContentImg(res.data);
          // }
          if (res.data.specialCollection.accessRuleId) {
            res.data.specialCollection.accessRuleId = res.data.specialCollection.accessRuleId.split(
              ","
            );
          }
          this.setState({
            selPost: res.data,
            getPost_ready: true,
            username: res.data.specialCollection.originalCreator.fullname,
            disableTimePicker:
              res.data.specialCollection.is_public === 1 ? false : true,
            // eslint-disable-next-line
            disableAlias:
              res.data.specialCollection.alias == "null" ? false : true,
            radioValue:
              res.data.specialCollection.showAsAlias > 0 ? "alias" : "user",
            // eslint-disable-next-line
            radioInput:
              res.data.specialCollection.alias == "null"
                ? null
                : res.data.specialCollection.alias,
            loading: false,
          });

          this.initialRuleOptions(res.data.specialCollection);
        } else {
          message.warning(intl.get("@MINI_BLOG.NOT-FOUND"), 2);
          setTimeout(() => {
            window.location.replace("#/specialCollection/home");
          }, 2000);
        }
      } else {
        this.setState((state) => ({ getPost_ready: false, loading: false }));
      }
    });

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

  handleContentImg = (selPost) => {
    var blogContent = document.createElement("div");
    blogContent.innerHTML = selPost.specialCollection.content;
    var imgArr = blogContent.querySelectorAll("img");

    if (imgArr.length < 1) {
      this.props.form.setFieldsValue({
        content: selPost.specialCollection.content,
      });
      this.setState({ loading: false });
      return;
    }

    imgArr.forEach((img) => {
      var imgOriginSrc = img.src;
      var imgOriginAlt = img.alt;
      if (!imgOriginAlt.startsWith("resources/") && imgOriginSrc) {
        if (imgOriginSrc.startsWith("https://dsp.csd.hksarg/kms/api/")) {
          img.setAttribute(
            "alt",
            imgOriginSrc.slice(imgOriginSrc.indexOf("kms/api/") + 8)
          );
        } else if (imgOriginSrc.startsWith("https://kms.csd.gov.hk/api/")) {
          img.setAttribute(
            "alt",
            imgOriginSrc.slice(imgOriginSrc.indexOf("hk/api/") + 7)
          );
        } else if (imgOriginSrc.startsWith("api/resources/")) {
          img.setAttribute(
            "alt",
            imgOriginSrc.slice(imgOriginSrc.indexOf("api/") + 4)
          );
        } else if (
          imgOriginSrc &&
          imgOriginSrc.startsWith(
            "https://dsp.csd.hksarg/csdkms3/kms2/filestore2/forum/"
          )
        ) {
          // handle those content img linking to old kms3
          let imgId = imgOriginSrc.lastIndexOf("/");
          if (imgId > -1) {
            let newKMSImg = `resources/${
              selPost.specialCollection.originalCreator.id
            }/${selPost.specialCollection.id}/${imgOriginSrc.slice(imgId + 1)}`;
            img.setAttribute("alt", newKMSImg);
          }
        }
      }

      img.src = loadingImg;
    });

    var innerHTML_v1 = blogContent.innerHTML;
    this.props.form.setFieldsValue({ content: innerHTML_v1 });

    // console.log('----start');
    // this.handleGalleryList(this.props.fileList, innerHTML_v1);
    // console.log('----finish');
    var countLoadedImg = 0;
    var thisForm = this.props.form;
    var thisComponent = this;
    imgArr.forEach((img) => {
      let url = img.getAttribute("alt");

      if (url === null || url === undefined) {
        img.src = brokenImg;
        img.alt = "invalid image";
        countLoadedImg += 1;
        if (countLoadedImg === imgArr.length) {
          var innerHTML_v2 = blogContent.innerHTML;
          thisForm.setFieldsValue({ content: innerHTML_v2 });
          thisComponent.setState({ loading: false });
        }
      } else {
        url = sessionStorage.getItem("serverPort") + url;
        let request = new XMLHttpRequest();
        request.open("get", url, true);
        request.setRequestHeader(
          "accessToken",
          sessionStorage.getItem("accessToken")
        );
        request.setRequestHeader("accesshost", window.location.hostname);

        request.onloadstart = function() {
          request.responseType = "blob";
        };

        request.onloadend = function() {
          countLoadedImg += 1;
          if (countLoadedImg === imgArr.length) {
            var innerHTML_v2 = blogContent.innerHTML;
            thisForm.setFieldsValue({ content: innerHTML_v2 });
            thisComponent.setState({ loading: false });
          }
        };

        request.onreadystatechange = function() {
          if (request.readyState === 4 && request.status === 200) {
            let blobUrl = URL.createObjectURL(request.response);
            img.src = blobUrl;
            // img.onload = function () {
            //   URL.revokeObjectURL(img.src);
            // };
          } else if (request.readyState === 4 && request.status !== 200) {
            img.src = brokenImg;
          }
        };

        request.send(null);
      }
    });
  };

  // -----0510 cannot update content....
  handleGalleryList = (galleryList, content) => {
    var blog = document.createElement("div");
    blog.innerHTML = content;
    var imgArr = blog.querySelectorAll("img");

    imgArr.forEach((img) => {
      let match = galleryList.find(
        (iBlob) => iBlob.ofilename === img.getAttribute("alt")
      );
      if (match) {
        img.src = match.src;
      }
    });

    let innerHTML_v2 = blog.innerHTML;
    this.props.form.setFieldsValue({ content: innerHTML_v2 });
    this.setState({ loading: false });
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

  handlePickerOpenChange = (open) => {
    if (open) {
      this.setState({ mode: "time" });
    }
  };

  initialRuleOptions = (selPost) => {
    if (selPost && selPost.accessRuleId) {
      let selAccessRules = selPost.accessRuleId || [];
      let getARbyId_header =
        sessionStorage.getItem("serverPort") +
        "access_rule/search/" +
        sessionStorage.getItem("@userInfo.id") +
        "?page=1&id=";

      selAccessRules.forEach((iReaderId) => {
        fetchData(getARbyId_header + iReaderId, "get", null, (response) => {
          let selAR = null;
          if (response.ifSuccess) {
            let res = response.result;
            if (
              res.status === 200 &&
              res.data !== undefined &&
              res.data[0] !== undefined
            ) {
              selAR = res.data[0];
            } else {
              selAR = { id: iReaderId, description: `Invalid ${iReaderId}` };
            }
          } else {
            selAR = { id: iReaderId, description: `Invalid ${iReaderId}` };
          }

          if (selAR) {
            this.setState((state) => ({
              ruleOptions: [...state.ruleOptions, selAR],
            }));
          }
        });
      });
    }
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

  handlePickerPanelChange = (value, mode) => {
    this.setState({ mode });
  };

  handleSubmit = (e) => {
    let getEData = "";

    const { radioInput } = this.state;
    // ---- wrap content & alias for further scan
    let scanTarget = getEData;

    if (this.props.form.getFieldValue("postTitle")) {
      scanTarget =
        this.props.form.getFieldValue("postTitle") + "," + scanTarget;
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

    this.props.form.validateFields((err, fieldsValues) => {
      if (fieldsValues["nominatedAuthor"] === "alias" && !radioInput) {
        message.error("Alias should not be empty", 7);
      } else if (!err && scanResult) {
        this.setState((state) => ({ loading: true }));
        const values = {
          ...fieldsValues,
          isPublic: fieldsValues["isPublic"] ? 1 : 0,
          publishAt:
            fieldsValues["isPublic"] === 0
              ? null
              : moment(fieldsValues["publishAt"]).format("YYYY-MM-DD HH:mm:ss"),
          modifiedBy: sessionStorage.getItem("@userInfo.id"),
          showAsAlias: fieldsValues["nominatedAuthor"] === "alias" ? 1 : 0,
          alias:
            fieldsValues["nominatedAuthor"] === "alias"
              ? radioInput
              : this.state.selPost.specialCollection.alias,
          accessRuleId: fieldsValues["accessRuleId"] || null,
          accessChannel: fieldsValues["accessChannel"] || null,
        };

        let updatePost_url =
          sessionStorage.getItem("serverPort") +
          "specialCollection/update/" +
          this.props.selPostId;
        fetchData(updatePost_url, "post", values, (response) => {
          this.setState({ loading: false });
          if (response.ifSuccess) {
            let res = response.result;
            if (res.status === 200) {
              message.success("Edits saved", 2);
              this.setState((state) => {
                if (values.alias !== null) {
                  return { disableAlias: true };
                } else {
                  return { radioInput: state.selPost.specialCollection.alias };
                }
              });
            } else {
              message.error(
                "Failed to save. Your request was rejected by server.",
                2
              );
            }
          } else {
            message.error(
              "Failed to save. Your request was rejected by server.",
              2
            );
          }
        });
      }
    });
  };

  onCancelDelete = () => {};

  onDelete = () => {
    window.location.assign(
      `#/specialCollection/details/?id=${this.props.selPostId}`
    );
  };

  onEditorChange = (event) => {
    const data = event.editor.getData();
    return data;
  };

  onEditorReady = () => {
    if (this.state.getPost_ready) {
      this.handleContentImg(this.state.selPost);
    }
    this.setState({ cke_ready: true });
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
      selPost,
      username,
      categoryList,
      mode,
      disableTimePicker,
      radioInput,
      radioValue,
      loading,
      disableAlias,
      isSuperAdmin,
      ruleOptions,
    } = this.state;

    const radioStyle = {
      display: "inline",
      height: "30px",
      lineHeight: "30px",
    };

    const titleError = getFieldError("postTitle");
    const contentError = getFieldError("content");
    // Only show error after a field is touched.
    const publishAtError =
      isFieldTouched("publishAt") && getFieldError("publishAt");

    return (
      <div>
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
                >
                    <Select className="postTags" disabled={true} value={selPost.specialCollection? selPost.specialCollection.categoryId:null} placeholder={intl.get('@MINI_BLOG.CATEGORY-TIPS')} >
                        {categoryList.map(icate=>{return <Option key={icate.id} value={icate.id}>{sessionStorage.getItem('lang')==='zh_TW'? icate.category_c : icate.category}</Option>})}
                    </Select>
                </Form.Item> */}
            {/* <div className="ant-row ant-form-item">
                    <label style={{ color: 'rgba(0,0,0,0.85)' }}>{intl.get('@MINI_BLOG.CATEGORY')}</label>
                    <Select className="postTags" disabled={true} value={selPost.specialCollection===undefined? null : selPost.specialCollection.categoryId} placeholder={sessionStorage.getItem('lang')==='zh_TW'? '請指定一個類別':'please choose one'} >
                        {categoryList.map(icate=>{return <Option key={icate.id} value={icate.id}>{sessionStorage.getItem('lang')==='zh_TW'? icate.category_c : icate.category}</Option>})}
                    </Select>
                </div> */}

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
                initialValue: selPost.specialCollection
                  ? selPost.specialCollection.postTitle
                  : null,
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
                initialValue: selPost.specialCollection
                  ? selPost.specialCollection.postTitleZh
                  : null,
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

            <Form.Item
              label={intl.get("@BOOKMARK.LINK")}
              validateStatus={titleError ? "error" : ""}
              help={titleError || ""}
            >
              {getFieldDecorator("link", {
                rules: [{ required: false, message: "" }],
                initialValue: selPost.specialCollection
                  ? selPost.specialCollection.link
                  : null,
              })(
                <Input
                  disabled={isSuperAdmin ? false : true}
                  style={{ lineHeight: 0, maxWidth: "400px" }}
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
                initialValue:
                  selPost.specialCollection &&
                  selPost.specialCollection.accessChannel
                    ? selPost.specialCollection.accessChannel
                    : "1",
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

            {/* ***s=]*** Tags(Multiple)(Optional) */}
            <Form.Item label={intl.get("@RES_MANAGEMENT.ACCESS-RULE")}>
              {getFieldDecorator("accessRuleId", {
                rules: [
                  { required: true, message: intl.get("@GENERAL.REQUIRED") },
                ],
                initialValue:
                  selPost.specialCollection &&
                  selPost.specialCollection.accessRuleId
                    ? selPost.specialCollection.accessRuleId
                    : [],
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

            <div style={{ marginBottom: "24px" }}>
              {/* ***s=]*** Go Publish */}
              <Form.Item
                className="if_published"
                label={intl.get("@MINI_BLOG.GO-PUBLIC")}
              >
                {getFieldDecorator("isPublic", {
                  initialValue: selPost.specialCollection
                    ? !disableTimePicker
                    : false,
                  valuePropName: "checked",
                })(
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
                help={
                  publishAtError ||
                  (selPost.specialCollection === undefined
                    ? null
                    : "Last Publish at: " +
                      moment(selPost.specialCollection.publishAt).format(
                        "YYYY/MM/DD HH:mm:ss"
                      ))
                }
              >
                {getFieldDecorator("publishAt", {
                  initialValue:
                    selPost.specialCollection === undefined
                      ? moment()
                      : moment(selPost.specialCollection.publishAt),
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
              {getFieldDecorator("nominatedAuthor", {
                initialValue:
                  selPost.specialCollection === undefined
                    ? "user"
                    : selPost.specialCollection.showAsAlias > 0
                    ? "alias"
                    : "user",
              })(
                <RadioGroup
                  name="nominatedAuthor"
                  onChange={this.onRadioChange}
                >
                  <Radio style={radioStyle} value="user">
                    {username}
                  </Radio>
                  <Radio style={radioStyle} value="alias">
                    {intl.get("@MY_BLOG.ALIAS")}
                    {radioValue === "alias" ? (
                      <Input
                        onChange={this.onRadioInputChange}
                        style={{
                          width: "8em",
                          marginLeft: 10,
                          lineHeight: 0,
                          display: "inline-block",
                        }}
                        disabled={disableAlias}
                        defaultValue={radioInput}
                        allowClear
                      />
                    ) : null}
                  </Radio>
                </RadioGroup>
              )}
            </Form.Item>

            {/* ***s=]*** Buttons */}
            <Form.Item className="formButtons">
              <Button type="primary" disabled={loading} htmlType="submit">
                {intl.get("@GENERAL.SAVE")}
              </Button>

              <Popconfirm
                title="Sure to leave this page? You may lose the unsaved edits."
                okText={intl.get("@GENERAL.CANCEL")}
                onConfirm={this.onCancelDelete}
                cancelText={intl.get("@GENERAL.YES")}
                onCancel={this.onDelete}
              >
                <Button
                  type="default"
                  title="Leave current page without saving changes"
                >
                  {intl.get("@GENERAL.LEAVE")}
                </Button>
              </Popconfirm>
            </Form.Item>
          </Form>
        </Spin>
      </div>
    );
  }
}

const WrappedPostEditForm = Form.create({ name: "post_form" })(PostForm);

export default WrappedPostEditForm;
