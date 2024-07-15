var req = new XMLHttpRequest();
req.open('GET',document.location,false);
// req.send(null);
var link =window.location;
// var headers = req.getAllResponseHeaders().toLocaleLowerCase();
// console.log('Header -- ',headers,' Link - ',link);
if (link.type){
  if (link.type==="DanaLocation"){
    sessionStorage.setItem('serverPort',',DanaInfo=.adqBfwiFos1k2s,SSL+api/');
    sessionStorage.setItem('photo',',DanaInfo=.adqBfwiFos1k2s,SSL+images/');
    sessionStorage.setItem('accessChannel', 2)
  }
}else{
  let url = link.origin+link.pathname+'api/';
  let photo =link.origin+link.pathname+'images/';
  sessionStorage.setItem('serverPort', url);
  sessionStorage.setItem('photo',photo);

  if(!sessionStorage.getItem('accessChannel')){
    if ((link.host==="dsp.csd.hksarg") || (link.host ==="localhost") ){
      sessionStorage.setItem('accessChannel', 1)
    } else  if ((link.host==="dsptest.csd.ccgo.hksarg") || (link.host ==="localhost")){
      sessionStorage.setItem('accessChannel', 1)
    }      
    else if (link.host==="kms.csd.gov.hk" || link.host==="kmst.csd.gov.hk"){
      sessionStorage.setItem('accessChannel', 3)
    }else{
      sessionStorage.setItem('accessChannel', 4)
    }
  }
}