
// const loadingImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';
// const brokenImg = process.env.PUBLIC_URL + '/images/blog-img-broken.jpeg';

export function authImg() {
  var imgArr = document.getElementsByName('auth-img');
  let imgTemp = process.env.PUBLIC_URL+'/images/document.png';
  let tempRes = process.env.PUBLIC_URL+'/images/pdf.png';
  let tempVideo = process.env.PUBLIC_URL + '/images/video-home.png';

  function loadTempImg(type){
    if(type==='VIDEO'){
      return tempVideo;
    }else if(type==='RES-PDF'){
      return tempRes;
    }else{
      return imgTemp;
    }
  }

  if (imgArr.length > 0) {

    for(let i=0 ; i<imgArr.length; i++){
      let img = imgArr[i];
      let url = img.getAttribute('data');
      let type = img.getAttribute('alt');

      if(url&&url.indexOf("data:image/")===0){
        img.src = url;
      }else if(!url) {
        img.src = loadTempImg(type);
      }else{
        
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }

        request.onreadystatechange = function () {

          if (request.readyState === 3) {
            img.src = loadTempImg(type);
          }else if (request.readyState ===4 && request.status === 200) {
            img.src = URL.createObjectURL(request.response);
            img.onload = function () {
              URL.revokeObjectURL(img.src);
            };
          }

        };

        request.send(null);
      }
    };
  }
};

export function authImgByName(name) {
  var imgArr = document.getElementsByName(name);

  if (imgArr.length > 0) {

    for(let i=0 ; i<imgArr.length; i++){
      let img = imgArr[i];
      let url = img.getAttribute('data');

      if(url===null||url===undefined){
        img.src = null;
      }else{
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }

        request.onreadystatechange = function () {

          // if (request.readyState == XMLHttpRequest.LOADING) {
          if (request.readyState === 3) {
            img.src = null;
          }else if (request.readyState ===4 && request.status === 200) {
            img.src = URL.createObjectURL(request.response);

            img.onload = function () {
              URL.revokeObjectURL(img.src);
            };
          }else if (request.readyState ===4 && request.status !== 200) {
            img.src = null;
          }

        };

        request.send(null);
      }
    };
  }
};

export function authImgByName2(name) {
  var imgArr = document.getElementsByName(name);

  if (imgArr.length > 0) {

    for(let i=0 ; i<imgArr.length; i++){
      let img = imgArr[i];
      let url = img.getAttribute('data');

      if(!url){
        img.src = null;
      }else if (!img.src){
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }

        request.onreadystatechange = function () {

          // if (request.readyState == XMLHttpRequest.LOADING) {
          if (request.readyState === 3) {
            img.src = null;
          }else if (request.readyState ===4 && request.status === 200) {
            img.src = URL.createObjectURL(request.response);

            // img.onload = function () {
            //   URL.revokeObjectURL(img.src);
            // };
          }else if (request.readyState ===4 && request.status !== 200) {
            img.src = null;
          }

        };

        request.send(null);
      }
    };
  }
};

export function authPostImg() {
  var imgArr = document.getElementsByName('auth-post-img');
  var tempPostImg = process.env.PUBLIC_URL + '/images/blog-img-loading.jpeg';

  if (imgArr.length > 0) {

    for(let i=0 ; i<imgArr.length; i++){
      let img = imgArr[i];
      let url = img.getAttribute('data');
      let imgSrc = img.getAttribute('src');

      if(url===null||url===undefined){
        img.src = null;
      }else if (!imgSrc || imgSrc === tempPostImg){
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }

        img.src = tempPostImg;

        request.onreadystatechange = function () {

          if (request.readyState ===4 && request.status === 200) {
            img.src = URL.createObjectURL(request.response);
          }
          // if (request.readyState == XMLHttpRequest.LOADING) {
          // if (request.readyState === 3) {
          //   img.src = tempPostImg;

          // }else if (request.readyState ===4 && request.status === 200) {
          //   img.src = URL.createObjectURL(request.response);

          // }else if (request.readyState ===4 && request.status !== 200) {
          //   img.src = tempPostImg;
          // }

        };

        request.send(null);
      }
    };
  }
};

export function authDivImg(){
  var imgDivArr = document.getElementsByName('auth-div-img');
  let tempPDF = process.env.PUBLIC_URL+'/images/pdf.png';
  let tempVideo = process.env.PUBLIC_URL + '/images/video-home.png';

  function loadTempImg(type){
    if(type==='VIDEO'){
      return tempVideo;
    }else if(type==='POSTS'){
      return null;
    }else{
      return tempPDF;
    }
  }

  if(imgDivArr.length>0){
    for(let i=0 ; i<imgDivArr.length; i++){
      let imgDiv = imgDivArr[i];
      let url = imgDiv.getAttribute('data');
      let type = imgDiv.getAttribute('alt');

      if(!url){
        imgDiv.style.backgroundImage = "url("+loadTempImg(type)+ ")";
      }else{
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }
        
        request.onreadystatechange = function () {
          // if (request.readyState == XMLHttpRequest.LOADING) {
          if (request.readyState === 3) {

            imgDiv.style.backgroundImage = "url("+loadTempImg(type)+ ")";

          }else if (request.readyState ===4 && request.status === 200) {
            imgDiv.style.backgroundImage = "url("+URL.createObjectURL(request.response)+")";
            imgDiv.onload = function(){
              URL.revokeObjectURL(imgDiv.style.backgroundImage);
            }
          }
        };
        request.send(null);
      }
    }
  }
}

export function authDivImgByName(name){
  var imgDivArr = document.getElementsByName(name);
  
  let tempPDF = process.env.PUBLIC_URL+'/images/pdf.png';
  let tempVideo = process.env.PUBLIC_URL + '/images/video-home.png';

  function loadTempImg(type){
    if(type==='VIDEO'){
      return tempVideo;
    }else if(type==='POSTS'){
      return null;
    }else{
      return tempPDF;
    }
  }

  if(imgDivArr.length>0){
    for(let i=0 ; i<imgDivArr.length; i++){
      let imgDiv = imgDivArr[i];
      let url = imgDiv.getAttribute('data');
      let type = imgDiv.getAttribute('alt');

      if(!url){
        imgDiv.style.backgroundImage = "url("+loadTempImg(type)+ ")";
      }else{
        url = sessionStorage.getItem('serverPort')+url;
        let request = new XMLHttpRequest();
        request.open('get', url, true);
        request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
        request.setRequestHeader('accesshost', window.location.hostname);

        request.onloadstart = function () {
          request.responseType = 'blob';
        }
        
        request.onreadystatechange = function () {
          // if (request.readyState == XMLHttpRequest.LOADING) {
          if (request.readyState === 3) {
            if(type!=="POSTS"){
              imgDiv.style.backgroundImage = "url("+loadTempImg(type)+ ")";
            }

          }else if (request.readyState === 4 && request.status === 200) {
              imgDiv.style.backgroundImage = "url("+URL.createObjectURL(request.response)+")";

              imgDiv.onload = function(){
                fadeIn(imgDiv);
                URL.revokeObjectURL(imgDiv.style.backgroundImage);
              }
          }
        };
        request.send(null);
      }
    }
  }
}


export function fadeIn(curImg) {
  var duration = 3000, interval = 100, target = 1;
  var step = (target / duration) * interval;
  var timer = window.setInterval(function () {
      var curOp = curImg.style.opacity;
      if (curOp >= 1) {
          curImg.style.opacity = 1;
          window.clearInterval(timer);
          return;
      }
      curOp += step;
      curImg.style.opacity = curOp;
  }, interval);
}

function isInSight(el) {
  const bound = el.getBoundingClientRect();
  const clientHeight = window.innerHeight;
  //如果只考虑向下滚动加载
  //const clientWidth = window.innerWeight;
  return bound.top <= clientHeight + 100;
}

export function checkImgsByName(name) {
  const imgs = document.getElementsByName(name);
  Array.from(imgs).forEach(el => {
    if (isInSight(el)) {
      loadImg(el);
    }
  })
}

function loadImg(el) {
  if (el.getAttribute('data-alt')==="0") {
    el.setAttribute('data-alt', 1);
    lazyImg(el);
  }
}

function lazyImg(curImg) {
  let imgDiv = curImg;
  let url = imgDiv.getAttribute('data');
  let tagName = imgDiv.tagName;

  if(!url){
    imgDiv.setAttribute('data-alt', '2')
  }else{
    url = sessionStorage.getItem('serverPort')+url;
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.setRequestHeader('accessToken', sessionStorage.getItem('accessToken'));
    request.setRequestHeader('accesshost', window.location.hostname);

    request.onloadstart = function () {
      request.responseType = 'blob';
    }
    
    request.onreadystatechange = function () {
      if(request.readyState === 4){
        if (request.status === 200) {
          imgDiv.setAttribute('data-alt', '2')
          var blobUrl = URL.createObjectURL(request.response);

          if(tagName==='DIV'){
            imgDiv.style.backgroundImage = "url("+blobUrl+")";
          }else if(tagName==='IMG'){
            imgDiv.src = blobUrl;
          }

          imgDiv.onload = function(){
            if(tagName==='DIV'){
              fadeIn(imgDiv);
            }

            URL.revokeObjectURL(blobUrl);
          }
      }else{
        imgDiv.setAttribute('data-alt', '2')
      }}
    };
    request.send(null);
  }
}

// ---throttle
export function throttle(fn, mustRun = 500) {
  let previous = null;

  return function() {
    const now = new Date();
    const context = this;
    const args = arguments;
    if (!previous){
      previous = 0;
    }
    const remaining = now - previous;
    if (mustRun && remaining >= mustRun) {
      fn.apply(context, args);
      previous = now;
    }
  }
}