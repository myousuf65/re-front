import FastScanner from 'fastscan';

/* 
About isBetaUser
1. check if current user is in kms test team: return TRUE if yes;
2. Purpose: A/B Testing on production;
3. This function should be removed from whole project when KMS Revamp is closed
 */
function isBetaUser(){
  const userId = sessionStorage.getItem('@userInfo.id');
  const testTeam_arr = ['7105', '6997', '8645'];
  return testTeam_arr.includes(userId);
}

// *** About fastscan
// search(content, option={})   // return 2D array: [ [match1, indexOf(match1)], [match2, indexOf(match2)] ]
// hits(content, options={})    // return object: { match1: frequency, match2: frequency }
// add(template_word)           // words.concat(template_word)
// options = {quick: false, longest: false}   
// ---- quick mode: return when get firch match
// ---- longest: when more than one match found on same location, return the longest match

// keywordsScanner
function ContentScan (content) {
  var words = require('../temp_json/sensitive_keywords.json');
  var scanner = new FastScanner(words);
  var hits = scanner.hits(content);

  return hits;
}

const userLevelAvatarLib = [
  { level: 1, style: {border: '5px solid #c2cadc'} },
  { level: 2, style: {border: '5px solid #84ce98'} },
  { level: 3, style: {border: '5px solid #dcb65a'} },
  { level: 4, style: {border: '5px solid #a4b1b9'} },
  { level: 5, style: {border: '5px solid #88c4f8'} },
]

const userLevelIcons = ["default"];

const userLevelIconNames = [
  { id: 'default', nameEn: 'Default', nameTc: '默認' },
]

const getCurrentIconName = (selection) => {
  let match = userLevelIconNames.find(i => i.id === selection);
  if(!match){
    return "NA";
  }

  return sessionStorage.getItem('lang')==="zh_TW"? match.nameTc:match.nameEn;

}

export {
  isBetaUser,
  ContentScan,
  userLevelAvatarLib,
  userLevelIcons,
  getCurrentIconName,
}