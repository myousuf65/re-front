// transfers sessionStorage from one tab to another
var sessionStorage_transfer = function(event) {
  if(!event) { event = window.event; } // ie suq
  if(!event.newValue) return;          // do nothing if no value to work with
  if (event.key == 'getSessionStorage' && sessionStorage.getItem('accessToken')) {
    // another tab asked for the sessionStorage -> send it

    console.log('-----broadcast');
    localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));

    // the other tab should now have it, so we're done with it.
    localStorage.removeItem('sessionStorage'); // <- could do short timeout as well.
  } else if (event.key == 'sessionStorage' && !sessionStorage.getItem('accessToken')) {
    console.log('-----copy');

    if(!sessionStorage.getItem('_target')){
      let winHref = window.location.href;
      sessionStorage.setItem('_target', winHref);
    }

    // another tab sent data <- get it
    var data = JSON.parse(event.newValue);
    for (var key in data) {
      sessionStorage.setItem(key, data[key]);
    }
    
    if(sessionStorage.getItem('_target')){
      window.location.assign(sessionStorage.getItem('_target'));
      sessionStorage.removeItem('_target');
    }else{
      window.location.assign('#/');
    }
  }
};

// listen for changes to localStorage
if(window.location.hostname!=='dsp.csd.hksarg'){
  if(window.addEventListener) {
    window.addEventListener("storage", sessionStorage_transfer, false);
  } else {
    window.attachEvent("onstorage", sessionStorage_transfer);
  };

  if (!sessionStorage.getItem('accessToken')) {
    // trigger: Ask other tabs for session storage
    localStorage.setItem('getSessionStorage', Date.now());
    localStorage.removeItem('getSessionStorage');
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
    localStorage.setItem('getSessionStorage', Date.now());
    localStorage.removeItem('getSessionStorage');
  };
}


