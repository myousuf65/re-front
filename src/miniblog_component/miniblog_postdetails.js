//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190609 */
//Comments //***s=]***

import React from "react";
import { BackTop, Modal, Button, message, Skeleton, Empty } from "antd";
import intl from "react-intl-universal";
import moment from "moment";

import { fetchData } from "../service/HelperService";

import SelPost from "./sel_post";
import SelPostComments from "./sel_post_cmnts";
import SelPostGallery from "./sel_post_gallery";
import WrappedCommentForm from "./comment_form";
import WrappedCommentEditForm from "./comment_form_edit";
// import { authImgByName } from '../resources_component/authimg';

const blogTriangle = process.env.PUBLIC_URL + "/images/blog-triangle.png";
const loadingImg = process.env.PUBLIC_URL + "/images/blog-img-loading.jpeg";
const brokenImg = process.env.PUBLIC_URL + "/images/blog-img-broken.jpeg";

const termsOfUseJson = require("../temp_json/terms_of_use.json");

export default class PostDetails extends React.Component {
  state = {
    loading: true,
    selPostId: null,
    selPost: {},
    selCmnt: {},
    photoGallery: [],
    hindCmntEditor: true,
    submitting: false,
    hindCmntUpdater: true,
    editSubmitting: false,
    modalVisible: false,
    modalTitle:
      sessionStorage.getItem("lang") === "zh_TW"
        ? termsOfUseJson.miniblog.titleTc
        : termsOfUseJson.miniblog.titleEn,
    modalContent:
      sessionStorage.getItem("lang") === "zh_TW"
        ? termsOfUseJson.miniblog.contentTc
        : termsOfUseJson.miniblog.contentEn,
    rootCmntId: -1,
    rootCmnt: null,
    cmntAuthor: {},
    relatedPosts: [],
  };

  componentWillMount() {
    let hrefId = window.location.href.slice(
      window.location.href.lastIndexOf("?id=") + 4
    );
    this.setState((state) => ({ selPostId: hrefId }));
    this.getSelPost(hrefId);
  }

  getSelPost = (selPostId) => {
    this.setState((state) => ({ loading: true }));
    let selpost_url =
      sessionStorage.getItem("serverPort") +
      "blog/getDetail/" +
      selPostId +
      "?user=" +
      sessionStorage.getItem("@userInfo.id");

    fetchData(selpost_url, "get", null, (response) => {
      let res = response.result;
      if (response.ifSuccess) {
        if (res.status === 200 && res.data.blog) {
          this.handleGallery(res.fileList);
          this.setState({
            selPost: res.data,
            loading: false,
          });
          this.props.handleScoring(res.score);
        } else {
          message.warning(intl.get("@MINI_BLOG.NOT-FOUND"), 2);
          setTimeout(() => {
            window.location.replace("#/miniblog/home");
          }, 2000);
        }
      } else {
        if (res.status !== 401 && res.status !== 440) {
          message.warning(intl.get("@MINI_BLOG.NOT-FOUND"), 2);
          setTimeout(() => {
            window.location.replace("#/miniblog/home");
          }, 2000);
        }
      }
    });

    // ------handle related posts
    if (window.location.host === "dsp.csd.hksarg") {
      // ------for intranet search engine
      var postUrl = encodeURIComponent(window.location.href);
      let getFromEngine_url =
        sessionStorage.getItem("serverPort") +
        "search/related/" +
        sessionStorage.getItem("@userInfo.id") +
        "?resource_url=" +
        postUrl +
        "&return_type=blog";

      this.getRelatedPosts(getFromEngine_url);
    } else {
      // ------for internet
      let getFromServer_url =
        sessionStorage.getItem("serverPort") +
        "blog/related/" +
        sessionStorage.getItem("@userInfo.id") +
        "?post=" +
        selPostId;
      this.getRelatedPosts(getFromServer_url);
    }
  };

  getRelatedPosts = (url) => {
    fetchData(url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && res.data && res.data.length > 0) {
          this.setState((state) => {
            let relatedPosts = [];
            res.data.forEach((iPost) => {
              relatedPosts.push({
                id: iPost.id,
                title: iPost.title,
                publishAt: iPost.publishAt,
              });
            });
            return { relatedPosts: relatedPosts };
          });
        } else {
          this.setState({ relatedPosts: [] });
        }
      } else {
        this.setState({ relatedPosts: [] });
      }
    });
  };

  handleGallery = (fileList) => {
    if (typeof fileList !== "object") {
      this.setState({ photoGallery: [] });
      return;
    }

    var preFileList = fileList.map((img) => {
      let tempImg = {
        id: img.id,
        ofilename: img.ofilename,
        src: loadingImg,
      };
      return tempImg;
    });

    this.setState({ photoGallery: preFileList });

    var thisComponent = this;
    var blobFileList = [];
    preFileList.forEach((img) => {
      if (!img.ofilename) {
        blobFileList.push(img);
      }

      let url = sessionStorage.getItem("serverPort") + img.ofilename;
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
        blobFileList.push(img);
        if (blobFileList.length === preFileList.length) {
          thisComponent.setState({ photoGallery: blobFileList });
        }
      };

      request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
          img.src = URL.createObjectURL(request.response);
        } else if (request.readyState === 4 && request.status !== 200) {
          img.src = brokenImg;
        }
      };

      request.send(null);
    });
  };

  showModal = (rootCmnt, cmntAuthor) => {
    this.setState({
      modalVisible: true,
      rootCmnt: rootCmnt,
      cmntAuthor: cmntAuthor,
    });
  };

  handleOk = (e) => {
    this.setState({ modalVisible: false, hindCmntEditor: false });
    const cknew = document.getElementById("blog-comment-ckform");
    cknew.scrollIntoView();
  };

  handleCancel = (e) => {
    this.setState({ modalVisible: false, rootCmnt: null, cmntAuthor: {} });
  };

  handleCancelCmnt = () => {
    this.setState({ hindCmntEditor: true, rootCmnt: null, cmntAuthor: {} });
  };

  handleCommentList = (ref) => {
    this.child = ref;
  };

  addNewComment = (rootCmnt, cmnt) => {
    this.child.handleCommentList("new", rootCmnt, cmnt, null);
  };

  handleCmntSubmit = (cmntData) => {
    this.setState({ cmntAuthor: "" });
    let cmnt_url = sessionStorage.getItem("serverPort") + "blog/comment/create";
    fetchData(cmnt_url, "post", cmntData, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200) {
          message.success("Comment created.");
          this.props.handleScoring(res.score);
          this.addNewComment(this.state.rootCmnt, res.data);
          this.setState((state) => ({
            rootCmntId: -1,
            rootCmnt: null,
            cmntAuthor: {},
            hindCmntEditor: true,
            submitting: false,
          }));
          // ------add new comment into local commentList
        } else if (res.status === 555) {
          message.warning("Your request was denied by server");
          this.setState((state) => ({
            rootCmntId: -1,
            rootCmnt: null,
            cmntAuthor: {},
            hindCmntEditor: true,
            submitting: false,
          }));
        } else {
          message.error(res.status + ": " + res.msg);
          this.setState((state) => ({ submitting: false }));
        }
      } else {
        this.setState((state) => ({ submitting: false }));
      }
    });
  };
  // ------edit a comment
  handleCmntModify = (rootcmnt, cmnt) => {
    console.log("inside comment modify function", rootcmnt, cmnt);
    this.setState((state) => ({
      rootCmnt: rootcmnt,
      selCmnt: cmnt,
      hindCmntUpdater: false,
    }));

    const ckedit = document.getElementById("blog-comment-ckform");
    ckedit.scrollIntoView();
  };

  updateComment = (rootCmnt, selCmnt, newCmnt) => {
    console.log("inside update comment function", selCmnt, newCmnt);
    this.child.handleCommentList("updated", rootCmnt, selCmnt, newCmnt);
  };

  handleCmntModifySubmit = (cmntData) => {
    let cmnt_url = sessionStorage.getItem("serverPort") + "blog/comment/update";
    fetchData(cmnt_url, "post", cmntData, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200) {
          message.success("Comment updated.");
          this.updateComment(this.state.rootCmnt, this.state.selCmnt, res.data);
          this.setState((state) => ({
            // rootCmnt: null,
            // selCmnt: {},
            hindCmntUpdater: true,
            editSubmitting: false,
          }));
        } else if (res.status === 555) {
          message.warning("Your request was denied by server");
          this.setState((state) => ({
            rootCmnt: null,
            selCmnt: {},
            hindCmntUpdater: true,
            editSubmitting: false,
          }));
        } else {
          message.error(res.status + ": " + res.msg);
          this.setState((state) => ({ editSubmitting: false }));
        }
      }
    });
  };

  handleCancelCmntUpdate = () => {
    this.setState({
      rootCmnt: null,
      selCmnt: {},
      hindCmntUpdater: true,
    });
  };

  handleRelated = (postId) => {
    window.location.assign(`#/miniblog/details/?id=${postId}`);
    this.setState((state) => ({ selPostId: postId }));
    this.getSelPost(postId);
  };

  // handleContentImg=()=>{
  //     var postContent = document.getElementById("miniblog-post-details")
  //     if(!postContent){
  //         return
  //     }
  //     var imgs_oldUrl = postContent.querySelectorAll('img[src*="resources/"]:not([name="auth-img-blog"])');
  //     imgs_oldUrl.forEach(function(img) {
  //         let apiIndex = img.src.indexOf("resources/");
  //         if(apiIndex>-1){
  //             let relativePath = img.src.slice(apiIndex);
  //             img.setAttribute('name', "auth-img-blog");
  //             img.setAttribute('data', relativePath);
  //             img.setAttribute('alt', "POSTS");
  //             img.setAttribute('src', relativePath);
  //         }
  //     });

  //     var imgs_blobUrl = postContent.querySelectorAll('img[src*="blob:"]:not([name="auth-img-blog"])');
  //     imgs_blobUrl.forEach(function(img) {
  //         img.setAttribute('name', "auth-img-blog");
  //         img.setAttribute('data', img.getAttribute('alt'));
  //         img.setAttribute('alt', "POSTS");
  //     });

  //     authImgByName('auth-img-blog');
  // }

  render() {
    const {
      loading,
      relatedPosts,
      hindCmntEditor,
      hindCmntUpdater,
    } = this.state;

    return (
      <div>
        <div className="blog-details-header">
          <div className="container clearfix">
            <a href="#/miniblog/home">
              <h2>{intl.get("@MINI_BLOG.MINI-BLOG")}</h2>
            </a>
            <a
              hidden={
                sessionStorage.getItem("@userInfo.isBlogger") > 0 ? false : true
              }
              href="#/miniblog/post/new"
              className="btn-post-creation"
            >
              {intl.get("@MY_BLOG.POST-CREATION")}
            </a>
            <a href="#/miniblog/myblog" className="btn-my-blog">
              {intl.get("@MINIBLOG_HOME.MY-BLOG")}
            </a>
          </div>
        </div>

        <div className="page-content">
          <div className="container blog-details">
            <div className="row">
              <div className="col-lg-9 col-md-8">
                <div className="blog-details-main">
                  <Skeleton
                    active
                    avatar
                    paragraph={{ rows: 6 }}
                    loading={loading}
                  >
                    <SelPost
                      selPost={this.state.selPost}
                      fileList={this.state.photoGallery}
                      handleScoring={this.props.handleScoring}
                    />
                  </Skeleton>
                  <img src={blogTriangle} alt="" className="blog-triangle" />
                </div>

                <div className="blog-comments">
                  <h3>{intl.get("@MINI_BLOG.COMMENTS")}</h3>
                  <Skeleton
                    active
                    avatar
                    paragraph={{ rows: 3 }}
                    loading={loading}
                  >
                    <div style={{ marginBottom: "40px" }}>
                      <SelPostComments
                        postId={this.state.selPostId}
                        showModal={this.showModal}
                        handleCommentList={this.handleCommentList}
                        handleCmntModify={this.handleCmntModify}
                      />
                    </div>
                    {/* eslint-disable-next-line */}
                    <div
                      className="add-comment"
                      hidden={!hindCmntEditor || !hindCmntUpdater}
                    >
                      <a
                        className="btn-add-comment"
                        onClick={() => this.showModal(null, "")}
                      >
                        {intl.get("@MINI_BLOG.LEAVE-COMMENT")}
                      </a>
                    </div>
                    <div
                      id="blog-comment-ckform"
                      style={{ height: "1em", width: "1em" }}
                    />
                  </Skeleton>
                  <Modal
                    title={this.state.modalTitle}
                    visible={this.state.modalVisible}
                    closable={false}
                    centered
                    footer={[
                      <Button key="back" onClick={this.handleCancel}>
                        {intl.get("@GENERAL.BACK")}
                      </Button>,
                      <Button
                        key="confirm"
                        type="primary"
                        onClick={this.handleOk}
                      >
                        {intl.get("@GENERAL.AGREE")}
                      </Button>,
                    ]}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {this.state.modalContent}
                    </div>
                  </Modal>

                  <div
                    // style={{ paddingBottom: '3em' }}
                    hidden={hindCmntEditor}
                  >
                    <WrappedCommentForm
                      hindCmntEditor={hindCmntEditor}
                      quitCmntEditor={this.handleCancelCmnt}
                      handleCmntSubmit={this.handleCmntSubmit}
                      postId={this.state.selPostId}
                      rootCmnt={this.state.rootCmnt}
                      initReply={this.state.cmntAuthor}
                      submitting={this.state.submitting}
                    />
                  </div>

                  <div
                    // style={{ paddingBottom: '3em' }}
                    hidden={hindCmntUpdater}
                  >
                    <WrappedCommentEditForm
                      hindCmntUpdater={hindCmntUpdater}
                      selCmnt={this.state.selCmnt}
                      quitCmntEditor={this.handleCancelCmntUpdate}
                      handleCmntModifySubmit={this.handleCmntModifySubmit}
                      editSubmitting={this.state.editSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-3 col-md-4">
                <div
                  className="carousel vertical-slider"
                  hidden={this.state.photoGallery.length === 0 ? true : false}
                >
                  <SelPostGallery photo_gallery={this.state.photoGallery} />
                </div>

                <div className="related-resources">
                  <h2>
                    <span>{intl.get("@MINI_BLOG.RELATED-POSTS")}</span>
                  </h2>

                  <ul
                    className="related-blog-list related-list"
                    style={{ padding: "15px 20px 15px 30px" }}
                  >
                    <Skeleton active paragraph={{ rows: 3 }} loading={loading}>
                      {relatedPosts.length > 0 ? (
                        relatedPosts.map((item, index) => {
                          if (index < 5) {
                            return (
                              <li>
                                {/* eslint-disable-next-line */}
                                <a onClick={() => this.handleRelated(item.id)}>
                                  {item.title}
                                </a>
                                <p>
                                  <span className="date">
                                    {moment(item.publishAt).format(
                                      "YYYY-MM-DD"
                                    )}
                                  </span>
                                </p>
                                {/* <p>{item.author} <span className="date">{moment(item.publishAt).format('YYYY-MM-DD')}</span></p> */}
                              </li>
                            );
                          } else {
                            return null;
                          }
                        })
                      ) : (
                        <div style={{ width: "100%" }}>
                          <Empty
                            description={
                              sessionStorage.getItem("lang") === "zh_TW"
                                ? "暫無相關文章"
                                : "No Related Post"
                            }
                          />
                        </div>
                      )}
                    </Skeleton>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BackTop />
      </div>
    );
  }
}
