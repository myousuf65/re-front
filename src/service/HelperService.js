import React from 'react';
import reqwest from 'reqwest';
import { Modal } from 'antd';
import intl from 'react-intl-universal';
import FastScanner from 'fastscan';

// ---------- remarks (updated at Mar 27, 2020) ----------
// err.response.status
// 401: invalid accessToken => redirect to login page
// 409: account is logined on other device => redirect to login page
// 423: suspended account => redirect to login page
// 440: session timeout on server
// ---------- end ----------


export function fetchData (url, method, data, callback) {
  reqwest({
    url: url,
    method: method,
    contentType: "application/json;charset=UTF-8",
    headers: {
      'accessToken': sessionStorage.getItem('accessToken'),
      'accesshost': window.location.hostname,
    },
    processData: false,
    timeout: 120000,
    mode: 'cors',
    data: JSON.stringify(data),
    success: (res) => {
      callback( { ifSuccess: true, result: res } );
    },
    error: (err) => {
      if(err.status!==401&&err.status!==440){
        callback({ ifSuccess: false, result: err });
      }else{
        if(url===`${sessionStorage.getItem('serverPort')}auth/twofactorauth`){
          callback({ ifSuccess: false, result: err });
        }else if(url===`${sessionStorage.getItem('serverPort')}auth/logout`){

        }else if(err.status===401){
          sessionStorage.clear();
          window.location.assign('/');
        }else if(err.status===440){
          let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
          fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
          window.location.assign('#/failout');
        }
      }

      // if(err.status===401){
      //   if(url===`${sessionStorage.getItem('serverPort')}auth/twofactorauth`){

      //   }else if(url===`${sessionStorage.getItem('serverPort')}auth/logout`){

      //   }else{
      //     sessionStorage.clear();
      //     window.location.assign('/');
      //   }
      // }else if(err.status===440){
      //   if(url===`${sessionStorage.getItem('serverPort')}auth/twofactorauth`){

      //   }else if(url===`${sessionStorage.getItem('serverPort')}auth/logout`){

      //   }else{
      //     let clearBackendSession_url = sessionStorage.getItem('serverPort')+'auth/logout';
      //     fetchData(clearBackendSession_url, 'post', null, repsonse=>{});
      //     window.location.assign('#/failout');
      //   }
      // };
      // callback({ ifSuccess: false, result: err });
    },
  })
};

export function getAccessMode(){
  // Intranet Mode === 1
  // Remote Mode === 2
  // Mobile Mode === 3
  var link =window.location
  let accessMode = 2;
  if(link.type){
    if(link.type==="DanaLocation"){
      accessMode = 2;   // Remote Mode === 2
    }
  }else{
    if((link.host==="dsp.csd.hksarg")){
      accessMode = 1;   // Intranet Mode === 1
    }else{
      accessMode = 3;   // Mobile Mode === 3
    }
  }
  return accessMode;
}

export function getCategoryTree(){
  // get all categories (showInfo === true )
  // format category list for tree selection
  var categoryTree = JSON.parse(sessionStorage.getItem('@cateList')) || [];

  if(categoryTree){
    let pre_cateList = categoryTree.map(iCate=>{
        return handleCateChildren(iCate);
    });
    console.log('---global function')
    return pre_cateList;
  }else{
      return [];
  }

  function handleCateChildren(cate){

    let currentLang = sessionStorage.getItem('lang');
    let treedCate = {
        title: currentLang==='zh_TW'? cate.nameTc:cate.nameEn,
        value: cate.id,
        key: cate.id,
    };
    if(cate.children!==null){
        let children = cate.children.map(childCate=>{
            return handleCateChildren(childCate);
        });
        treedCate.children = children;
        // treedCate.disabled = true;
    }
    return treedCate;
  }
}

export function bytesToSize (bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export function stripHtml(description, replaceSpace){
  description = description.replace(/(\n)/g, "");  
  description = description.replace(/(\t)/g, "");  
  description = description.replace(/(\r)/g, "");  
  description = description.replace(/<\/?[^>]*>/g, "");  
  if(replaceSpace){
    description = description.replace(/\s*/g, "");
  }
  return description;
}

// export function keywordsScanner(keywordsArr, content, actionTitle){
export function keywordsScanner(content, actionTitle){
  let keywordsArr = require('../temp_json/sensitive_keywords.json')
  var scanner = new FastScanner(keywordsArr)
  // consider lower/upper case, halfwidth/fullwidth forms
  var stripHtml_str = stripHtml(content, true).toLowerCase();
  var results = scanner.hits(toCDB(stripHtml_str));

  // TODO: this temporary solution needs further follow up
  let specialHandler = ["dame"];
  // let whiteCase = "fundamental";
  var scanner1 = new FastScanner(specialHandler);
  var content1 = content.toLowerCase();
  var search = scanner1.search(toCDB(content1));
  var results1 = {};
  search.every((value)=>{
    let strHead = value[0]-1;
    let strEnd = value[0]+4;
    if(strHead>-1 && !content1[strHead].match(/[a-z]/i)&&!content1[strEnd].match(/[a-z]/i)){
      results1.dame = 1;
      return false;
    }else if(strHead===-1 && !content1[strEnd].match(/[a-z]/i)){
      results1.dame = 1;
      return false;
    }

    return true;
  })

  var conclusion = { ...results, ...results1 }

  if(isEmpty(conclusion)){
    return true;
  }else{
    let title = actionTitle||intl.get('@GENERAL.KEYWORD-TITLE');
    let details = printResults(conclusion);
    showWarning(title, details);
    return false;
  }

  // if(isEmpty(results)){
  //   return true;
  // }else{
  //   let title = actionTitle||intl.get('@GENERAL.KEYWORD-TITLE');
  //   let details = printResults(results);
  //   showWarning(title, details);
  //   return false;
  // }
}

function toCDB(str){
  var tmp ="";

  for(var i = 0; i<str.length; i++){
    if(str.charCodeAt(i)===12288){
      tmp += String.fromCharCode(str.charCodeAt(i)-12256);
      continue;
    }

    if(str.charCodeAt(i)>65280 && str.charCodeAt(i)<65375){
      tmp += String.fromCharCode(str.charCodeAt(i)-65248);
      continue;
    }else{
      tmp += String.fromCharCode(str.charCodeAt(i));
    }
  }

  return tmp;
}

function printResults(results){
  let content = [];
  for(var prop in results){
    if(results.hasOwnProperty(prop)){
      content.push(prop);
    }
  }
  return content.map(item=>(<div>{item}</div>))
}

function showWarning(title, content){
  Modal.warning({
    title: title,
    content: content,
    onOk(){},
    onCancel(){},
  })
}

function isEmpty(obj) {
  for(var prop in obj) {
    if(obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}
