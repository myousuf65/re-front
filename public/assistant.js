// ------------UAT
// transfers sessionStorage from one tab to another
var sessionStorage_transfer = function(event) {
  if(!event) { event = window.event; } // ie suq
  if(!event.newValue) return;          // do nothing if no value to work with
  if (event.key == 'getSessionStorage4uat' && sessionStorage.getItem('accessToken')) {
    // another tab asked for the sessionStorage -> send it

    console.log('-----broadcast');
    localStorage.setItem('sessionStorage4uat', JSON.stringify(sessionStorage));

    // the other tab should now have it, so we're done with it.
    localStorage.removeItem('sessionStorage4uat'); // <- could do short timeout as well.
  } else if (event.key == 'sessionStorage4uat' && !sessionStorage.getItem('accessToken')) {
    console.log('-----copy');

    if(!sessionStorage.getItem('_target')){
      let winHref = window.location.href;
      sessionStorage.setItem('_target', winHref);
      console.log('assistant: set _target as ', winHref);
    }
    
    // another tab sent data <- get it
    var data = JSON.parse(event.newValue);
    for (var key in data) {
      sessionStorage.setItem(key, data[key]);
    }

    let thisTarget = sessionStorage.getItem('_target');
    
    if(thisTarget&&thisTarget.indexOf('#/login')<0&&thisTarget.indexOf('#/failout')<0&&thisTarget.indexOf('#/loading')<0){
      window.location.assign(sessionStorage.getItem('_target'));
      console.log('assistant: removed _target: ', thisTarget);
      sessionStorage.removeItem('_target');
    }else{
      window.location.assign('#/');
      console.log('assistant: no _target, go to #/ ', thisTarget||'unknown')
      sessionStorage.removeItem('_target');
    }
  }
};

// listen for changes to localStorage for remote
if(window.location.hostname!=='dsp.csd.hksarg'){
  if(window.addEventListener) {
    window.addEventListener("storage", sessionStorage_transfer, false);
  } else {
    window.attachEvent("onstorage", sessionStorage_transfer);
  };
  
  if (!sessionStorage.getItem('accessToken')) {
    // trigger: Ask other tabs for session storage
    localStorage.setItem('getSessionStorage4uat', Date.now());
    localStorage.removeItem('getSessionStorage4uat');
  };
}

if(window.location.hostname!=='dsptest.csd.ccgo.hksarg'){
  if(window.addEventListener) {
    window.addEventListener("storage", sessionStorage_transfer, false);
  } else {
    window.attachEvent("onstorage", sessionStorage_transfer);
  };
  
  if (!sessionStorage.getItem('accessToken')) {
    // trigger: Ask other tabs for session storage
    localStorage.setItem('getSessionStorage4uat', Date.now());
    localStorage.removeItem('getSessionStorage4uat');
  };
}
