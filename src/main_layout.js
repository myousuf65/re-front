//** Arthor: s=] */
//** Create Date: 20190507*/

import React from "react";

import {
  Layout,
  Menu,
  Spin,
  Input,
  Icon,
  Result,
  Button,
  Skeleton,
  Badge,
  Modal,
} from "antd";
import SubMenu from "antd/lib/menu/SubMenu";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
  withRouter,
} from "react-router-dom";
import reqwest from "reqwest";
import intl from "react-intl-universal";
import { LocaleProvider } from "antd";
import zh_TW from "antd/lib/locale-provider/zh_TW";
import en_US from "antd/lib/locale-provider/en_US";
import moment from "moment";
import "moment/locale/zh-hk";
import { detect } from "detect-browser";
import { fetchData, getAccessMode } from "./service/HelperService";
import "./main_layout.css";
import "./design/css/style.css";
import "./design/css/responsive.css";

import AuthenticatedRoute from "./component/AuthenticatedRoute";
import FAQPage from "./home_component/faq";
import SeniorOffrList from "./senior_offr_list/senior_offr_list";
import MyPet from "./my_pet_component/my_pet";
// import { userLevelIcons } from './service/common';
import MyPin from "./my_pin_component/my_pin";
import { P } from "pdfjs-dist/build/pdf.worker";
const HomeLayout = React.lazy(() =>
  import(/* webpackChunkName: 'HomeLayout' */ "./home_component/home_layout")
);
const ResourcesDetails = React.lazy(() =>
  import(
    /* webpackChunkName: 'ResourcesDetails' */ "./resources_component/resources_details"
  )
);
const MiniblogHome = React.lazy(() =>
  import(
    /* webpackChunkName: 'MiniblogHome' */ "./miniblog_component/miniblog_home"
  )
);
const PostDetails = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostDetails' */ "./miniblog_component/miniblog_postdetails"
  )
);
const PostCreator = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostCreator' */ "./miniblog_component/miniblog_postcreator"
  )
);
const ResourcesShowAll = React.lazy(() =>
  import(
    /* webpackChunkName: 'ResourcesShowAll' */ "./resources_component/resources_showall"
  )
);
const ResourcesLatestNews = React.lazy(() =>
  import(
    /* webpackChunkName: 'ResourcesLatestNews' */ "./resources_component/resources_latestNews"
  )
);
const AdminconsoleLayout = React.lazy(() =>
  import(
    /* webpackChunkName: 'AdminconsoleLayout' */ "./admin_console_component/admin_console_layout"
  )
);
const MiniblogMyBlog = React.lazy(() =>
  import(
    /* webpackChunkName: 'MiniblogMyBlog' */ "./miniblog_component/miniblog_myblog"
  )
);
const ResourcesCate = React.lazy(() =>
  import(
    /* webpackChunkName: 'ResourcesCate' */ "./resources_component/resources_category"
  )
);
const PostEditor = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./miniblog_component/miniblog_posteditor"
  )
);
const MyFavourites = React.lazy(() =>
  import(
    /* webpackChunkName: 'MyFavourites' */ "./home_component/my_favourites"
  )
);

const MyDownload = React.lazy(() =>
  import(/* webpackChunkName: 'MyDownload' */ "./home_component/my_download")
);
const MyInbox = React.lazy(() =>
  import(/* webpackChunkName: 'MyInbox' */ "./home_component/my_inbox")
);
const ForumRouter = React.lazy(() =>
  import(/* webpackChunkName: 'ForumRouter' */ "./forum_component/forum_router")
);
// const SeniorOffrList = React.lazy(() =>
//   import(/* webpackChunkName: 'SeniorOffrList' */ "./senior_offr_list/senior_offr_list")
// );
const MobileAppPage = React.lazy(() =>
  import(
    /* webpackChunkName: 'MobileAppPage' */ "./home_component/mobileAppDownload"
  )
);
const NewsCornerHome = React.lazy(() =>
  import(
    /* webpackChunkName: 'NewsCornerHome' */ "./newscorner_component/newscorner_home"
  )
);

const SpecialCollectionHome = React.lazy(() =>
  import(
    /* webpackChunkName: 'MiniblogHome' */ "./specialCollection_component/specialCollection_home"
  )
);
const SpecialCollectionMySpecialCollection = React.lazy(() =>
  import(
    /* webpackChunkName: 'MiniblogMyBlog' */ "./specialCollection_component/specialCollection_mySpecialCollection"
  )
);
const SpecialCollectionPostCreator = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostCreator' */ "./specialCollection_component/specialCollection_postcreator"
  )
);
const SpecialCollectionPostEditor = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./specialCollection_component/specialCollection_posteditor"
  )
);
const ElearningHome = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./elearning_component/elearning_home"
  )
);
const ElearningQuizList = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./elearning_component/elearning_quiz_list"
  )
);
const ElearningQuiz = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./elearning_component/elearning_quiz"
  )
);
const ElearningQuizResult = React.lazy(() =>
  import(
    /* webpackChunkName: 'PostEditor' */ "./elearning_component/elearning_quiz_result"
  )
);
const WowzaHome = React.lazy(() =>
  import(/* webpackChunkName: 'PostEditor' */ "./wowza_component/wowza_home")
);
// const TBRe = React.lazy(() =>
//   import(/* webpackChunkName: 'TBRe' */ "")
// );

const { Content, Footer } = Layout;
const browser = detect();
const blockOS_arr = ["iOS", "Android OS", "BlackBerry OS", "Windows Mobile"];

//settings for Multi-language
// require("react-intl/locale-data/jsonp/en.js");
// require("react-intl/locale-data/jsonp/zh.js");

const locales = {
  en_US: require("./locales/en_US.json"),
  zh_TW: require("./locales/zh_TW.json"),
};

const celebrate100_logo =
  process.env.PUBLIC_URL + "/images/activity/100yr_logo.jpeg";
const adminIcon = process.env.PUBLIC_URL + "/images/icon-admin.png";

const userLevelBarLib = [
  {
    level: 1,
    style: {
      backgroundImage: "linear-gradient(to right, #dfe3ec 65%, #dbe3eb)",
    },
  },
  {
    level: 2,
    style: {
      backgroundImage: "linear-gradient(to right, #84ce98 65%, #bfedcc)",
    },
  },
  {
    level: 3,
    style: {
      backgroundImage: "linear-gradient(to right, #dcb65a 65%, #eae3b4)",
    },
  },
  {
    level: 4,
    style: {
      backgroundImage: "linear-gradient(to right, #b7c1c8 25%, #d5e0e6)",
      borderBottom: "5px solid #b2bec9",
    },
  },
  {
    level: 5,
    style: {
      backgroundImage: "linear-gradient(to right, #9fcff9 65%, #d0e3f5)",
      borderBottom: "5px solid #82add1",
    },
  },
];

class MainLayout extends React.Component {
  state = {
    folderName: null,
    initDone: false,
    lang: "en_US",
    userlogined: {},
    failedLogin: false,
    menuOptions: [],
    menuHidden: true,
    selCate: 1,
    loadingMenu: false,
    level: intl.get("@MAIN_LAYOUT.BRONZE"),
    navBarLevel: 1,
    score: 0,
    inboxNotice: 0,
    userProfileImage: {
      background: "url(" + adminIcon + ") left center no-repeat",
    },
    myPetType: null,
    animatePet: false,
  };

  componentWillUnmount() {
    this.unlisten();
  }

  componentWillMount() {
    this.unlisten = this.props.history.listen((location, action) => {
      this.checkInboxNotice();
    });

    sessionStorage.setItem("@resourceVideoDomain", "https://ams.csd.gov.hk/");
    sessionStorage.setItem("@resourceVideoFormat", ".mp4");

    if (!sessionStorage.getItem("@userInfo.login")) {
      // get login user by api
      this.fetchUser((res) => {
        console.log("get user by Staff No.");
        if (res.status === 200 && res.data !== null) {
          console.log("Get user info from server...");
          sessionStorage.setItem("@userInfo.login", true);
          sessionStorage.setItem("@userInfo.id", res.data.id);
          sessionStorage.setItem("@userInfo.staffNo", res.data.staffNo);
          // no fullname provided from current api & api needs further modification
          sessionStorage.setItem("@userInfo.username", res.data.fullname);
          sessionStorage.setItem("@userInfo.fullname", res.data.fullname);
          // apply template data here & api needs further modification
          sessionStorage.setItem(
            "@userInfo.profile_photo",
            res.data.profilePhoto || ""
          );
          // sessionStorage.setItem('@userInfo.login_tries', res.loginTimes || 0);
          sessionStorage.setItem(
            "@userInfo.login_last_try",
            res.data.loginLastTry
          );
          sessionStorage.setItem(
            "lang",
            (res.data.lang === "tc" ? "zh_TW" : "en_US") || "en_US"
          );
          sessionStorage.setItem("@userInfo.score", res.score || 0);
          sessionStorage.setItem(
            "@userInfo.isBlogger",
            res.data.isBlogger || 0
          );
          sessionStorage.setItem("@userInfo.usergroup", res.data.usergroup);

          if (
            res.msg === "1" ||
            res.msg === "2" ||
            res.msg === "3" ||
            res.msg === "4"
          ) {
            sessionStorage.setItem("accessChannel", res.msg);
          }

          let currentUser = {
            id: res.data.id,
            staffNo: res.data.staffNo,
            username: res.data.fullname,
            fullname: res.data.fullname,
            profile_photo: "",
            // login_tries: res.loginTimes || 0,
            login_last_try: res.data.loginLastTry,
            lang: (res.data.lang === "tc" ? "zh_TW" : "en_US") || "en_US",
            score: res.score || 0,
            isBlogger: res.data.isBlogger || 0,
          };

          this.handleLastLoginTry(res.data.staffNo);

          this.loadLocales();
          this.handleResCateId();
          this.setState(
            (state) => ({
              userlogined: currentUser,
              lang: sessionStorage.getItem("lang"),
            }),
            () => this.checkInboxNotice()
          );
          this.checkMobileVersion();
          this.handleScoring(sessionStorage.getItem("@userInfo.score"));
          // this.handleAdminConsole();

          //this.showPopOut();
          // ----fetch menu
          this.setState((state) => ({ loadingMenu: true }));
          let getCateList_url =
            sessionStorage.getItem("serverPort") + "category/all";
          fetchData(getCateList_url, "get", null, (response) => {
            if (response.ifSuccess) {
              let res = response.result;
              if (res.data !== undefined) {
                this.setState({ menuOptions: res.data, loadingMenu: false });
                sessionStorage.setItem("@cateList", JSON.stringify(res.data));
              } else {
                this.setState((state) => ({
                  menuOptions: [],
                  loadingMenu: false,
                }));
                sessionStorage.setItem("@cateList", "[]");
              }
            } else {
              this.setState((state) => ({
                menuOptions: [],
                loadingMenu: false,
              }));
              sessionStorage.setItem("@cateList", "[]");
            }
          });
        } else {
          // ----enable this before sycn to git
          this.setState((state) => ({ initDone: false, failedLogin: true }));
        }
      });
    } else {
      let currentUser = {
        id: sessionStorage.getItem("@userInfo.id"),
        staffNo: sessionStorage.getItem("@userInfo.staffNo"),
        username: sessionStorage.getItem("@userInfo.username"),
        fullname: sessionStorage.getItem("@userInfo.fullname"),
        profile_photo: sessionStorage.getItem("@userInfo.profile_photo"),
        // login_tries: sessionStorage.getItem('@userInfo.login_tries'),
        login_last_try: parseInt(
          sessionStorage.getItem("@userInfo.login_last_try")
        ),
        lang: sessionStorage.getItem("lang"),
        score: sessionStorage.getItem("@userInfo.score"),
        isBlogger: sessionStorage.getItem("@userInfo.isBlogger"),
      };
      this.loadLocales();
      this.handleResCateId();
      this.setState(
        (state) => ({
          userlogined: currentUser,
          lang: sessionStorage.getItem("lang") || "en_US",
        }),
        () => this.checkInboxNotice()
      );
      this.handleScoring(sessionStorage.getItem("@userInfo.score"));

      // this.handleAdminConsole();
      // ----fetch menu
      this.setState((state) => ({ loadingMenu: true }));
      let getCateList_url =
        sessionStorage.getItem("serverPort") + "category/all";
      fetchData(getCateList_url, "get", null, (response) => {
        if (response.ifSuccess) {
          let res = response.result;
          if (res.data !== undefined) {
            this.setState({ menuOptions: res.data, loadingMenu: false });
            sessionStorage.setItem("@cateList", JSON.stringify(res.data));
          } else {
            this.setState((state) => ({ menuOptions: [], loadingMenu: false }));
            sessionStorage.setItem("@cateList", "[]");
          }
        } else {
          this.setState((state) => ({ menuOptions: [], loadingMenu: false }));
          sessionStorage.setItem("@cateList", "[]");
        }
      });
    }
  }

  // handleAdminConsole=()=>{
  //   const profilePhoto = sessionStorage.getItem("@userInfo.profile_photo");

  //   if(userLevelIcons.includes(profilePhoto)){
  //     this.setState({ userProfileImage: {background: "url(images/profile/"+profilePhoto+".png) left center no-repeat", backgroundSize: "contain"} });
  //     return;
  //   }

  //   let imgPath = sessionStorage.getItem('serverPort')+profilePhoto;
  //   let request = new XMLHttpRequest();
  //   request.open('get', imgPath, true);
  //   request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
  //   request.setRequestHeader('accesshost', window.location.hostname);

  //   request.responseType = 'blob';

  //   request.onloadend = () => {
  //     if(this.response){
  //       this.setState({ userProfileImage: {background: "url("+this.response+") left center no-repeat", backgroundSize: "contain"} });
  //     }
  //   };

  //   request.send();

  // }

  renderTopBarManually = () => {
    if (
      sessionStorage.getItem("@userInfo.staffNo") !== "12132" &&
      sessionStorage.getItem("@userInfo.staffNo") !== "13780"
    ) {
      return;
    }

    let navBarLevel = this.state.navBarLevel;
    navBarLevel = (navBarLevel % 5) + 1;
    this.setState({ navBarLevel });
  };

  handleLink = (linkTo) => {
    if (linkTo) {
      let cateSubString = "#/resources/category/";
      let ifCategory = linkTo.indexOf(cateSubString);
      ifCategory = -1;
      if (ifCategory > -1) {
        let index = ifCategory + cateSubString.length;
        let selCateId = parseInt(linkTo.substring(index));
        this.props.handleCateShortcut(selCateId);
      } else {
        var thisHref = linkTo;
        var newHref = thisHref;

        // ---production
        let checker1 = thisHref.startsWith("https://kms.csd.gov.hk/");
        let checker2 = thisHref.startsWith("https://dsp.csd.hksarg/kms/");
        // ---uat
        let checker3 = thisHref.startsWith("https://kmst.csd.gov.hk/");
        let checker4 = thisHref.startsWith("https://dsp.csd.hksarg/kmsuat/");
        let checker5 = thisHref.startsWith(
          "https://dsptest.csd.ccgo.hksarg/uat/"
        );

        if (checker1 || checker2 || checker3 || checker4) {
          if (checker1) {
            newHref = thisHref.replace("https://kms.csd.gov.hk/", "");
          } else if (checker2) {
            newHref = thisHref.replace("https://dsp.csd.hksarg/kms/", "");
          } else if (checker3) {
            newHref = thisHref.replace("https://kmst.csd.gov.hk/", "");
          } else if (checker4) {
            newHref = thisHref.replace("https://dsp.csd.hksarg/kmsuat/", "");
          } else if (checker5) {
            newHref = thisHref.replace(
              "https://dsptest.csd.ccgo.hksarg/uat/",
              ""
            );
          }

          // window.location.assign(newHref);
          window.open(newHref);
        } else {
          if (
            thisHref.startsWith("https://") ||
            thisHref.startsWith("http://")
          ) {
            if (
              thisHref ===
              "https://dsp.csd.hksarg/elearnps/login.jsp?sn=MTIyNDA="
            ) {
              sessionStorage.removeItem("accessToken");
              sessionStorage.removeItem("authenticatedUser");
            }
            // window.location.assign(linkTo);
            window.open(linkTo);
          } else {
            // window.location.assign('https://'+linkTo);
            window.open("https://" + linkTo);
          }
        }
      }
    }
  };

  checkInboxNotice = () => {
    const { myPetType } = this.state;
    if (!sessionStorage.getItem("@userInfo.id")) {
      return;
    }
    let checkInbox_url =
      sessionStorage.getItem("serverPort") +
      "inbox/notice/" +
      sessionStorage.getItem("@userInfo.id");
    fetchData(checkInbox_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && res.data > -1) {
          this.setState({ inboxNotice: res.data });

          if (res.data2 && res.data2.dog && myPetType !== res.data2.dog) {
            this.setState({ myPetType: res.data2.dog });
          }

          this.setState({ animatePet: true }, () =>
            this.setState({ animatePet: false })
          );
        }
      }
    });
  };

  fetchUser = (callback) => {
    console.log("---now findbystaffno");
    reqwest({
      url: sessionStorage.getItem("serverPort") + "user/findbystaffno",
      timeout: 120000,
      type: "json",
      method: "get",
      mode: "cors",
      contentType: "application/json;charset=UTF-8",
      headers: {
        accessToken: sessionStorage.getItem("accessToken"),
        accesshost: window.location.hostname,
        authenticatedUser: sessionStorage.getItem("authenticatedUser"),
      },
      success: (res) => {
        callback(res);
      },
      error: (res) => {
        this.setState((state) => ({ initDone: false, failedLogin: true }));
        if (res.status === 401) {
          sessionStorage.clear();
          window.location.assign("/");
        } else if (res.status === 440) {
          let clearBackendSession_url =
            sessionStorage.getItem("serverPort") + "auth/logout";
          fetchData(clearBackendSession_url, "post", null, (repsonse) => {});
          window.location.assign("#/failout");
        }
      },
    });
  };

  handleLastLoginTry = (staffNo) => {
    let getLastLogin_url =
      sessionStorage.getItem("serverPort") + "user/LoginLastTime/" + staffNo;
    fetchData(getLastLogin_url, "get", null, (response) => {});
  };

  loadLocales() {
    intl
      .init({
        currentLocale: sessionStorage.getItem("lang") || "en_US", //determin locale here
        locales,
      })
      .then(() => {
        this.setState({ initDone: true });
      });
  }

  loadMenuOption(item) {
    var optionItem;
    if (item.children === null || item.children.length === 0) {
      optionItem = (
        <Menu.Item
          className="nav-item"
          key={item.id}
          onClick={(e) => {
            this.setState({ menuHidden: true });
            this.handleCateShortcut(item.id);
          }}
        >
          {sessionStorage.getItem("lang") === "zh_TW"
            ? item.nameTc
            : item.nameEn}
        </Menu.Item>
      );
    } else if (item.children.length > 0) {
      optionItem = item.children.map((child) => this.loadMenuOption(child));
      optionItem = (
        <SubMenu
          className="nav-item some-align-left-class-name"
          key={item.id}
          onTitleClick={(e) => {
            this.setState({ menuHidden: true });
            this.handleCateShortcut(item.id);
          }}
          title={
            " < " +
            (sessionStorage.getItem("lang") === "zh_TW"
              ? item.nameTc
              : item.nameEn)
          }
        >
          {optionItem}{" "}
        </SubMenu>
      );
    }
    return optionItem;
  }

  handleLocaleClick = () => {
    if (this.state.lang === "en_US") {
      this.handleLangChange("tc");
      this.setState({ lang: "zh_TW" });
      sessionStorage.setItem("lang", "zh_TW");
    } else {
      this.handleLangChange("en");
      this.setState({ lang: "en_US" });
      sessionStorage.setItem("lang", "en_US");
    }

    window.location.reload(false);
  };

  handleLangChange = (langOption) => {
    let setLang_url =
      sessionStorage.getItem("serverPort") +
      `user/changeLang/${sessionStorage.getItem("@userInfo.id")}/${langOption}`;
    fetchData(setLang_url, "post", null, (response) => {});
  };

  onSearch = (value) => {
    if (value !== undefined && value !== null && value.length > 0) {
      var theURI = encodeURI(
        sessionStorage.getItem("serverPort") +
          "search/query?keyword=" +
          value +
          "&user_id=" +
          sessionStorage.getItem("@userInfo.id")
      );
      const tab = window.open("about:blank");

      fetchData(theURI, "get", null, (response) => {
        if (response.ifSuccess && response.result.data) {
          tab.location.href = response.result.data;
        } else {
          tab.alert(`${response.result.status} from Search Engine`);
        }
      });
    }
  };

  handleScoring = (newScore) => {
    if (newScore !== undefined) {
      sessionStorage.setItem("@userInfo.score", newScore);
    }

    let score = parseInt(sessionStorage.getItem("@userInfo.score"), 10);
    let level = intl.get("@MAIN_LAYOUT.BASIC");
    let navBarLevel = 1;

    if (score < 500) {
      level = intl.get("@MAIN_LAYOUT.BASIC");
      navBarLevel = 1;
    } else if (score < 1000) {
      level = intl.get("@MAIN_LAYOUT.GREEN");
      navBarLevel = 2;
    } else if (score < 1800) {
      level = intl.get("@MAIN_LAYOUT.GOLD");
      navBarLevel = 3;
    } else if (score < 2700) {
      level = intl.get("@MAIN_LAYOUT.PLATINUM");
      navBarLevel = 4;
    } else if (score >= 2700) {
      level = intl.get("@MAIN_LAYOUT.DIAMOND");
      navBarLevel = 5;
    } else {
      score = 0;
    }

    this.setState({ level, score, navBarLevel });
  };

  handleCateShortcut = (selCate) => {
    this.setState({ selCate: selCate });
    if (selCate === 1) {
      window.location.assign("#/resources/category");
    } else {
      window.location.assign("#/resources/category/" + selCate);
    }
  };

  handleResCateId = () => {
    let winHref = window.location.href;
    let selCateId = winHref.slice(
      winHref.lastIndexOf("resources/category/") + 19
    );

    if (parseInt(selCateId, 10) > 0) {
      this.setState({ selCate: parseInt(selCateId, 10) });
    }
  };

  // Show Main Page Pop up
  showPopOut = () => {
    let get_pop_url =
      sessionStorage.getItem("serverPort") +
      "popout/homepage/" +
      sessionStorage.getItem("@userInfo.id");

    fetchData(get_pop_url, "get", null, (response) => {
      if (response.ifSuccess) {
        let res = response.result;
        if (res.status === 200 && !!res.data.imageUrl) {
          this.handleBlob(res.data.imageUrl, res.data.hypryLink);
        }
      }
    });
  };

  handleBlob = (imageUrl, hypryLink) => {
    let url = sessionStorage.getItem("serverPort") + imageUrl;
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

    var that = this;
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          var blobUrl = URL.createObjectURL(request.response);
          console.log("blob: " + hypryLink);

          that.preparePopOutModal(blobUrl, hypryLink);
        }
      }
    };
    request.send(null);
  };

  handleRedirect = () => {
    window.location.assign("#/mobileappdwnld");
  };

  showNoticeModalForPwPolicy = () => {
    Modal.confirm({
      centered: true,
      bodyStyle: { maxWidth: "75%" },
      icon: null,
      content: (
        <div>
          <p>
            <center>
              <strong>Software Download</strong>
            </center>
          </p>
          <p>
            {" "}
            The latest version of KMS App has been launched. Please update now.{" "}
          </p>
          <p>
            <center>
              <strong>軟件下載</strong>
            </center>
          </p>
          <p>KMS App 最新版本已經推出 稍後下載 立即更新 </p>
        </div>
      ),
      onOk: this.handleRedirect,
      okText: "立即更新",
      cancelButtonProps: { disabled: false },
      cancelText: "稍後更新",
    });
  };

  handleLogout = () => {
    let clearBackendSession_url =
      sessionStorage.getItem("serverPort") + "auth/logout";
    fetchData(clearBackendSession_url, "post", null, (repsonse) => {
      sessionStorage.clear();
      window.location.replace("/");
    });
  };

  //Check mobile app is the latest version
  checkMobileVersion = () => {
    const osType = browser.os;

    // const tooltipTrigger = blockOS_arr.includes(browser.os)? true:false;
    const tooltipTrigger = blockOS_arr.includes(browser.os) ? true : false;
    console.log("browser os  = ", osType);
    //if (tooltipTrigger ===true ){
    if (0 === 1) {
      let get_app_version =
        sessionStorage.getItem("serverPort") +
        "mobile/check/" +
        sessionStorage.getItem("@userInfo.id") +
        "/" +
        osType;
      console.log("main layout , get app version api = ", get_app_version);
      fetchData(get_app_version, "get", null, (response) => {
        if (response.ifSuccess) {
          let res = response.result;
          if (res.status === 200) {
            console.log(" response = ", response);
            console.log(" res data  = ", res.data);
            if (res.data === 1) {
              console.log(" user need to update mobile version ");
              this.showNoticeModalForPwPolicy();
            } else {
              console.log(" user no need to update mobile version ");
              this.showPopOut();
            }
          }
        } else {
          console.log(" response not Success ");
          this.showPopOut();
        }
      });
    } else {
      console.log("Not mobile app");
      this.showPopOut();
    }
    // this.showPopOut();
  };

  preparePopOutModal = (imageUrl, hypryLink) => {
    const tooltipTrigger = blockOS_arr.includes(browser.os) ? true : false;
    // const { popOut_img } = this.state;

    if (tooltipTrigger === true) {
      Modal.info({
        // centered: true,
        style: { top: "20%" },
        bodyStyle: { maxWidth: "250px" },
        icon: null,
        // width: 'inherit',
        width: "90%",

        //   onOk: true,
        content: (
          <a onClick={(e) => this.handleLink(hypryLink)} target="_blank">
            <img
              src={imageUrl}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
                margin: "0px 0px",
              }}
              alt="Notice"
            />
          </a>
        ),
        okText: "Close 關閉",
      });
    } else {
      var screenImage = imageUrl;

      // Create new offscreen image to test
      var theImage = new Image();
      // theImage.src = screenImage.attr(imageUrl);

      // Get accurate measurements from that.
      var imageWidth = theImage.width;
      var imageHeight = theImage.height;

      console.log(
        "main layout, line 581 : width = ",
        imageWidth,
        " height = ",
        imageHeight
      );
      if (imageWidth < imageHeight) {
        console.log("imageWidth<imageHeight");
        Modal.info({
          centered: true,
          style: { top: "20%" },
          bodyStyle: { maxWidth: "60%" },
          icon: null,
          width: "inherit",
          // width: '30%',

          //   onOk: true,
          content: (
            // <a href="https://www.elections.gov.hk/legco2021/chi/index.html" target="_blank">
            // <a href={(e)=>this.handleLink(hypryLink)} target="_blank">
            <a onClick={(e) => this.handleLink(hypryLink)}>
              <img
                src={imageUrl}
                style={{
                  width: "auto",
                  maxWidth: "auto",
                  height: "60vh",
                  maxHeight: "60vh",
                }}
                alt="Notice"
              />
            </a>
          ),
          okText: "Close 關閉",
        });
      } else {
        console.log(
          "imageWidth>imageHeight , ",
          imageWidth,
          " , ",
          imageHeight
        );
        Modal.info({
          centered: true,
          style: { top: "5%" },
          bodyStyle: { maxWidth: "60%" },
          icon: null,
          width: "inherit",
          // width: '30%',

          //   onOk: true,
          content: (
            // <a href="https://www.elections.gov.hk/legco2021/chi/index.html" target="_blank">
            // <a href={(e)=>this.handleLink(hypryLink)} target="_blank">
            <a onClick={(e) => this.handleLink(hypryLink)}>
              <img
                src={imageUrl}
                style={{
                  width: "auto",
                  maxWidth: "50vw",
                  height: "auto",
                  maxHeight: "70vh",
                }}
                alt="Notice"
              />
            </a>
          ),
          okText: "Close 關閉",
        });
      }
    }
  };

  handleMenuClick = () => {
    this.setState((state) => {
      // if(state.menuHidden){
      //   document.addEventListener('click', ()=>{this.setState({menuHidden:true}); })
      // }else{
      //   document.removeEventListener('click',()=>{});
      //   message.info('remove listener');
      // };
      return { menuHidden: !state.menuHidden };
    });
  };

  // handleDemo=()=>{
  //   const thisUser = sessionStorage.getItem('@userInfo.id');
  //   if(thisUser!=='7105'&&thisUser!=='5317'&&thisUser!=='6997'&&thisUser!=='5'){
  //     return <img className="logo-100-yr" onClick={()=>window.open("https://www.csd.gov.hk/100a/", '_blank')} alt="100_years" src={celebrate100_logo} />;
  //   }else{
  //     var demoLink = process.env.PUBLIC_URL + '/images/demo/linefd_1.png';
  //     return <img className="logo-100-yr" id="cr-demo" onClick={this.handleDemoClick} alt="cr-demo" src={demoLink} />;
  //   }
  // }

  // handleDemoClick=()=>{
  //   var randomId = (Math.floor(Math.random() * 10) + 1)%4+1;
  //   var demoLink = process.env.PUBLIC_URL + '/images/demo/linefd_';
  //   document.getElementById("cr-demo").src = demoLink+randomId+'.png';
  // }

  render() {
    const option_json = this.state.menuOptions || [];

    const lazyLoading = (
      <Result
        icon={<Icon type="smile" theme="twoTone" />}
        title={
          sessionStorage.getItem("lang") === "zh_TW"
            ? "歡迎到訪懲教署知識管理系統"
            : "Welcome to CSD Knowledge Management System"
        }
      />
    );

    // const dropdownMenu = (
    //   <Menu
    //   // style={{ position: 'absolute', top: '61px', right: '0px' }}
    //   overflowedIndicator={<Icon type="more" />}
    //   >
    //     {option_json.map((ioption) => this.loadMenuOption(ioption))}

    //     <Menu.Divider />
    //     <Menu.Item className="nav-item" key={99} >
    //       {intl.get('@MAIN_LAYOUT.LOGOUT')}
    //     </Menu.Item>
    //   </Menu>
    // );

    const {
      userlogined,
      failedLogin,
      loadingMenu,
      level,
      score,
      navBarLevel,
      menuHidden,
      inboxNotice,
      myPetType,
      animatePet,
    } = this.state;
    // const {userlogined, failedLogin, loadingMenu, level, score, navBarLevel, menuHidden, inboxNotice } = this.state;
    const accessMode = getAccessMode();
    const navbarTopStyle = userLevelBarLib.find((l) => l.level === navBarLevel)
      .style;

    return (
      <div>
        {this.state.initDone ? (
          // this.state.initDone &&
          <LocaleProvider
            locale={sessionStorage.getItem("lang") === "zh_TW" ? zh_TW : en_US}
          >
            <Layout style={{ minHeight: "100vh", zIndex: 99 }}>
              <nav
                className="navbar ftco_navbar ftco-navbar-light"
                id="ftco-navbar"
              >
                <div className="navbar-top" style={navbarTopStyle}>
                  <div className="container d-flex align-items-stretch">
                    <div className="col-12">
                      <ul className="navbar-top-left clearfix">
                        <li className="navbar-top-fullname">
                          <span className="mobile-hide">
                            {intl.get("@MAIN_LAYOUT.WELCOME")}
                          </span>
                          <a
                            style={{ textDecoration: "underline" }}
                            href="#/adminconsole/user/profile"
                          >
                            {userlogined.fullname}
                          </a>{" "}
                          {userlogined.staffNo === "12240" ||
                          userlogined.staffNo === "12132"
                            ? ` (${sessionStorage.getItem("accessChannel") ||
                                0})`
                            : ""}
                        </li>
                        <li className="mobile-hide">
                          {intl.get("@MAIN_LAYOUT.LOGINTIME")}{" "}
                          {moment(userlogined.login_last_try).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )}
                        </li>
                        <li style={{ marginRight: "2px" }}>
                          <span className="mobile-hide">
                            {intl.get("@MAIN_LAYOUT.LEVEL")}
                          </span>
                          <span onClick={this.renderTopBarManually}>
                            {level}
                          </span>
                        </li>
                        <li>
                          (
                          <a
                            style={{ textDecoration: "underline" }}
                            href="#/adminconsole/user/profile?2"
                          >
                            <span className="mobile-hide2">
                              K-Rewards 2.0&nbsp;
                              <span style={{ fontWeight: "bold" }}>:</span>
                              &nbsp;&nbsp;
                            </span>
                            {score}
                          </a>
                          )
                        </li>
                        <li>
                          <span className="mobile-hide3">
                            <MyPin />
                          </span>
                        </li>

                        {/* <li className="mobile-hide" style={{ marginRight: 0 }}>({intl.get('@MAIN_LAYOUT.ACCUMULATED-LOGIN',{countLogin:userlogined.login_tries})})</li> */}
                      </ul>
                    </div>
                  </div>
                </div>
                {/* <!-- navbar-top --> */}

                <div className="mobile-right-top">
                  <div className="mobile-favor-inbox">
                    <a
                      className="my-favour"
                      href="#/resources/myfavourites"
                      title={intl.get("@MAIN_LAYOUT.MY-FAVOUR")}
                    >
                      &nbsp;
                    </a>
                    <Badge count={inboxNotice} dot={inboxNotice > 0}>
                      <a
                        className="my-inbox"
                        href="#/resources/myinbox"
                        title={intl.get("@MAIN_LAYOUT.MY-INBOX")}
                      >
                        &nbsp;
                      </a>
                    </Badge>
                  </div>
                </div>

                <div className="lang">
                  <div
                    className="lang-current"
                    onClick={this.handleLocaleClick}
                  >
                    {/* eslint-disable-next-line */}
                    <a style={{ color: "#fff" }}>
                      {sessionStorage.getItem("lang") === "zh_TW"
                        ? accessMode === 3
                          ? "E"
                          : "ENG"
                        : accessMode === 3
                        ? "中"
                        : "中 文"}
                    </a>
                  </div>
                </div>

                {/* eslint-disable-next-line */}
                <a
                  className="navbar-toggler d-flex align-items-center"
                  onClick={this.handleMenuClick}
                  title={intl.get("@MAIN_LAYOUT.MENU")}
                >
                  <span>{intl.get("@MAIN_LAYOUT.MENU")}</span>
                </a>
                <div style={{ zIndex: 999 }} hidden={menuHidden}>
                  <Menu
                    className="mobile-menu"
                    selectable={false}
                    expandIcon={<span hidden>{null}</span>}
                    onClick={(subs) => {
                      this.setState((state) => ({ menuHidden: true }));
                    }}
                    // onOpenChange={(subs)=>{this.setState(state=>({ menuHidden: (subs.length===0? true : false) }))}}
                    mode="vertical-right"
                  >
                    {loadingMenu ? (
                      <Spin
                        style={{ width: "220px", padding: "16px" }}
                        tip="Loading..."
                      />
                    ) : (
                      option_json.map((ioption) => this.loadMenuOption(ioption))
                    )}

                    <Menu.Divider />
                    {!sessionStorage.getItem("accessChannel") ||
                    sessionStorage.getItem("accessChannel") === "4" ? null : (
                      <Menu.Item
                        className="nav-item"
                        key={99}
                        onClick={this.handleLogout}
                      >
                        {intl.get("@MAIN_LAYOUT.LOGOUT")}
                      </Menu.Item>
                    )}
                  </Menu>
                </div>

                <div className="container navbar-bottom">
                  <div className="logo clearfix">
                    <a href="#/home">
                      <img
                        src={sessionStorage.getItem("photo") + "logo.png"}
                        alt="logo"
                      />
                    </a>
                  </div>
                  <div
                    className="navbar-bottom-link"
                    style={{ float: "left", padding: "0.5em 1.5em 0" }}
                  >
                    {/* <img className="logo-100-yr" onClick={()=>window.open("https://www.csd.gov.hk/100a/", '_blank')} alt="100_years" src={celebrate100_logo} /> */}
                  </div>
                  <div
                    className="navbar-bottom-link"
                    style={{ paddingTop: "0.5em" }}
                  >
                    <ul className="clearfix">
                      {/* eslint-disable-next-line */}
                      <li style={{ borderLeft: "" }}>
                        <a
                          href="#/resources/mydownload"
                          className="my-download"
                        >
                          {intl.get("@GENERAL.DOWNLOAD")}
                        </a>
                      </li>
                      <li style={{ borderLeft: "" }}>
                        <a
                          href="#/resources/myfavourites"
                          className="my-favour"
                        >
                          {intl.get("@MAIN_LAYOUT.MY-FAVOUR")}
                        </a>
                      </li>
                      <li style={{ borderLeft: "" }}>
                        <Badge count={inboxNotice} dot={inboxNotice > 0}>
                          <a href="#/resources/myinbox" className="my-inbox">
                            {intl.get("@MAIN_LAYOUT.MY-INBOX")}
                          </a>
                        </Badge>
                      </li>
                      <li>
                        <a href="#/adminconsole" className="admin-console">
                          {intl.get("@MAIN_LAYOUT.ADMIN-CONSOLE")}
                        </a>
                      </li>
                      <li
                        className="search"
                        hidden={sessionStorage.getItem("accessChannel") !== "1"}
                      >
                        <fieldset name="search-box">
                          <Input.Search
                            name="search-input"
                            onSearch={this.onSearch}
                            allowClear
                            placeholder={intl.get("@MAIN_LAYOUT.SEARCH")}
                          />
                        </fieldset>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>

              <Content style={{ margin: "0px 0px" }}>
                {/* {this.props.children} */}
                <React.Suspense fallback={lazyLoading}>
                  {/* {(sessionStorage.getItem('@userInfo.id')!==undefined && sessionStorage.getItem('@userInfo.id')!== null)? */}
                  <Router>
                    <Switch>
                      <AuthenticatedRoute
                        path="/home"
                        exact
                        render={() => (
                          <HomeLayout
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resourcedetails"
                        render={() => (
                          <ResourcesDetails
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resources/latestnews"
                        render={() => (
                          <ResourcesLatestNews
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/miniblog/home"
                        render={() => (
                          <MiniblogHome handleScoring={this.handleScoring} />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/miniblog/details"
                        render={() => (
                          <PostDetails handleScoring={this.handleScoring} />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/miniblog/myblog"
                        render={() => <MiniblogMyBlog />}
                      />
                      <AuthenticatedRoute
                        path="/miniblog/post/new"
                        render={() => <PostCreator />}
                      />
                      <AuthenticatedRoute
                        path="/miniblog/post/modify"
                        render={() => <PostEditor />}
                      />
                      <AuthenticatedRoute
                        path="/newscorner/home"
                        render={() => (
                          <NewsCornerHome handleScoring={this.handleScoring} />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/specialCollection/home"
                        render={() => (
                          <SpecialCollectionHome
                            handleScoring={this.handleScoring}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/specialCollection/post/new"
                        render={() => <SpecialCollectionPostCreator />}
                      />
                      <AuthenticatedRoute
                        path="/specialCollection/post/modify"
                        render={() => <SpecialCollectionPostEditor />}
                      />
                      <AuthenticatedRoute
                        path="/specialCollection/mySpecialCollection"
                        render={() => <SpecialCollectionMySpecialCollection />}
                      />
                      <AuthenticatedRoute
                        path="/elearning/home"
                        render={() => <ElearningHome />}
                      />
                      <AuthenticatedRoute
                        path="/elearning/quiz_list"
                        render={() => <ElearningQuizList />}
                      />
                      <AuthenticatedRoute
                        path="/elearning/quiz"
                        render={() => <ElearningQuiz />}
                      />
                      <AuthenticatedRoute
                        path="/elearning/quiz_result"
                        render={() => <ElearningQuizResult />}
                      />
                      <AuthenticatedRoute
                        path="/wowza/index"
                        render={() => <WowzaHome />}
                      />
                      <AuthenticatedRoute
                        path="/resources/category"
                        render={() => (
                          <ResourcesCate
                            handleScoring={this.handleScoring}
                            selCate={this.state.selCate}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resources/kmarket"
                        render={() => (
                          <ResourcesShowAll
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resources/ksquare"
                        render={() => (
                          <ResourcesShowAll
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resources/wisdomgallery"
                        render={() => (
                          <ResourcesShowAll
                            handleScoring={this.handleScoring}
                            handleCateShortcut={this.handleCateShortcut}
                          />
                        )}
                      />
                      <AuthenticatedRoute
                        path="/resources/myfavourites"
                        render={() => <MyFavourites />}
                      />
                      <AuthenticatedRoute
                        path="/resources/myinbox"
                        render={() => <MyInbox />}
                      />
                      <AuthenticatedRoute
                        path="/resources/mydownload"
                        render={() => <MyDownload />}
                      />
                      <AuthenticatedRoute
                        path="/adminconsole"
                        render={() => (
                          <AdminconsoleLayout
                            handleScoring={this.handleScoring}
                          />
                        )}
                      />
                      {/* {sessionStorage.getItem('accessChannel')==='1'? <AuthenticatedRoute path="/seniorofficerlist" render={() => <SeniorOffrList /> } />: null} */}
                      <AuthenticatedRoute
                        path="/seniorofficerlist"
                        render={() => <SeniorOffrList />}
                      />
                      <AuthenticatedRoute
                        path="/kc"
                        render={() => <ForumRouter />}
                      />
                      <AuthenticatedRoute
                        path="/mobileappdwnld"
                        render={() => <MobileAppPage />}
                      />
                      <AuthenticatedRoute
                        path="/faq"
                        render={() => <FAQPage />}
                      />
                      <Redirect exact from="/" to="/home" />
                      <Route component={NotFoundPage} />a
                    </Switch>
                  </Router>
                  {/* : null} */}
                </React.Suspense>

                <MyPet type={myPetType} interaction={animatePet} />
              </Content>
              {/* -------------------------------------------------------------------------- */}

              <Footer style={{ padding: 50, textAlign: "center" }}>
                {intl.get("@MAIN_LAYOUT.FOOTER")}
                {/* <p style={{ color: 'lightgray' }}>v7.14.14</p> */}
                <p style={{ color: "lightgray" }}>v12.29.16P</p>
              </Footer>
            </Layout>
          </LocaleProvider>
        ) : (
          <NoAccessPage failedLogin={failedLogin} />
        )}
      </div>
    );
  }
}

class NotFoundPage extends React.Component {
  render() {
    return (
      <Result
        status="404"
        title="404"
        subTitle={intl.get("@MAIN_LAYOUT.NOT-FOUND-PAGE")}
        extra={
          <Button type="primary" href="#/home">
            {intl.get("@MAIN_LAYOUT.BACK-HOME")}
          </Button>
        }
      />
    );
  }
}

class NoAccessPage extends React.Component {
  state = {
    loading: true,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.failedLogin !== null && nextProps.failedLogin !== undefined) {
      this.setState((state) => ({
        loading: !nextProps.failedLogin,
      }));
    }
  }

  render() {
    const { loading } = this.state;
    return (
      <Skeleton active loading={loading}>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access KMS. You can reach support team at 2899 1825."
          extra={
            <Button
              type="primary"
              onClick={() => window.location.assign(window.origin)}
            >
              Back to CSD Portal
            </Button>
          }
        />
      </Skeleton>
    );
  }
}

export default withRouter(MainLayout);
