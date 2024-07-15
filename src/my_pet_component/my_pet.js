import React from 'react';
import { Tooltip, Icon ,message ,Skeleton} from 'antd';
import { detect } from 'detect-browser';
import { fetchData } from '../service/HelperService';
import { authImgByName2 } from '../resources_component/authimg';
import './my_pet.css';
import MyPin from '../my_pin_component/my_pin'

const petsOption = [ "A", "B", "C", "D" ];
const actionOption = [ "_bone", "_hand", "_heart" ];
const path = "images/profile/pets/";
const promptTextOptions = [
  {type:"A", nameEn:"German Shepherd Dog", nameTc:"德國牧羊犬", en:["Guard", "Patrol", "Tracking", "Crowd Control"], en1:["Well-muscled", 'Devotion', 'Strong obedient', "Intelligent"], tc:["警衛", "保安巡邏", "追蹤", "人群控制"], tc1:["體格健壯", "性格忠誠", "服從性高", "天資聰明"] },
  {type:"B", nameEn:"Kunming Dog", nameTc:"昆明犬", en:["Guard", "Patrol", "Tracking", "Crowd Control"], en1:["Highly flexibility", 'With keen nose', "Strong obedient", "Agile"], tc:["警衛", "保安巡邏", "追蹤", "人群控制"], tc1:["適應力強", "嗅覺靈敏", "性格忠誠", "機警靈活"] },
  {type:"C", nameEn:"Springer Spaniel", nameTc:"史賓格犬", en:["Detecting Dangerous Drugs, Hand-made alcoholic substances, Cigarette, Cell phone, Explosives"], en1:["Energetic", "Tough", "With keen sense of smell", "Initiative"], tc:["嗅查危險藥物、私釀橙酒、香煙、手提電話、爆炸物品"], tc1:["精力充沛", "聰明勇敢", "嗅覺靈敏", "主動性強"] },
  {type:"D", nameEn:"Labrador Retriever", nameTc:"拉布拉多尋回犬", en:["Detecting Dangerous Drugs (Screening Person)"], en1:["Even-tempered", "Tenacious", "With keen sense of smell", "active"], tc:["嗅查危險藥物、人物"], tc1:["個性溫馴", "堅毅不屈", "嗅覺靈敏", "活潑好動"] },
]

const browser = detect();
const blockOS_arr = ['iOS', 'Android OS', 'BlackBerry OS', 'Windows Mobile'];

export default class MyPet extends React.Component{
  state = {
    iconList: [], 
    type: "A",
    show: null,
    selected: null,
    promptText: null
  };

  componentWillReceiveProps(nextProps){
    if(nextProps.interaction){
      this.petAction(nextProps.type);
    }
  }



  displayList = (listArr) => {
    if(!Array.isArray(listArr)){ return };
    
    if(listArr.length === 1){
      return <ul>{listArr[0]}</ul>;
    }else{
      return (<ul>{listArr.map(item => (<li>{item}</li>))}</ul>)
    } 

  }

  petAction = (type) => {
    if(!petsOption.includes(type)){
      return;
    }


    let description = promptTextOptions.find(i => i.type===type);
    let promptText = null;
    if(description){
      if(sessionStorage.getItem('lang')==='zh_TW'){
        promptText = (
          <div>
            
            <p style={{textAlign:'center',fontWeight:'bold'}}>{description.nameTc}</p>
            <table id="features-tbl">
              <tbody>
                <tr>
                  <td className="ftbl-title">工作範疇:&nbsp;</td>
                  {/* <td>{description.tc}</td> */}
                  <td>{this.displayList(description.tc)}</td>
                </tr>
                <tr>
                  <td className="ftbl-title">特性:&nbsp;</td>
                  <td>{this.displayList(description.tc1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          )
      }else{
        promptText = (
          <div>
            <p style={{textAlign:'center',fontWeight:'bold'}}>{description.nameEn}</p>
            <table id="features-tbl">
              <tbody>
                <tr>
                  <td className="ftbl-title">Work&nbsp;Task:&nbsp;</td>
                  <td>{this.displayList(description.en)}</td>
                </tr>
                <tr>
                  <td className="ftbl-title">Character:&nbsp;</td>
                  <td>{this.displayList(description.en1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          )
      }
    }

    this.setState({ promptText });

    // get action randomly
    let action = actionOption[this.getRndInteger(0,2)];

    let output = path + type + action + ".gif";
    let img = document.getElementById("my-pet");
    img.setAttribute("src", output);
    this.pauseAction(type);
    // return output;
  }

  getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }

  pauseAction = (type) => {
    let staticImg = "images/profile/pets/"+type+".png";
    let img = document.getElementById("my-pet");
    if(img&&img.src){
      setTimeout(()=>img.setAttribute("src", staticImg), 10000);
    }
  }

  handlePetGoHome = () => {
    this.setState({ show: "none" });
  }

  onPetClick = () => {
    this.petAction("C");
  }

  checkIfIPadPro = () => {
    let isTouchable = "ontouchstart" in document.documentElement;
    return isTouchable && browser.os === "Mac OS";
  }

  render(){
    const { type } = this.props;
    const { show, promptText } = this.state;

    const tooltipTrigger = blockOS_arr.includes(browser.os) || this.checkIfIPadPro()? "click":"hover";
    console.log('iconList = ',this.state.iconList );

    
    return(

      <div>
       
          {/* <div className="pin-img" style={{ float: 'left'}} >
          <MyPin />
        </div> */}
       
        {/* <div id="pet-ball" style={{ display: show || "block" }}> */}
     
       {
        !type?null:(

                <>
                <div id="pet-ball" style={{ display: show || "block" }}> 
                
                <span className="pet-quit" onClick={this.handlePetGoHome}><Icon type="close-circle" theme="filled" style={{ color: 'black', backgroundColor: 'lightgrey', borderRadius: '50%' }} /></span>
                <div className="pet-background">
                <Tooltip placement="left" title={promptText || ""} trigger={tooltipTrigger}>
                  <img id="my-pet" alt="my-pet" src="" />
                </Tooltip>
              </div>
              </div>
              </>
             )
      }
      {/* </div> */}
     
      </div>

      // <div id="pet-ball" style={{ display: show||"block" }} >
      //   <span className="pet-quit" onClick={this.handlePetGoHome} ><Icon type="close-circle" theme="filled" style={{ color:'black', backgroundColor:'lightgrey', borderRadius: '50%' }} /></span>
      //   <div className="pet-background" onClick={this.onPetClick} >
      //     <Tooltip placement="left" title={promptText||""} trigger={tooltipTrigger} >
      //       <img id="my-pet" alt="my-pet" src="images/profile/pets/B_bone.gif" />
      //     </Tooltip>
      //   </div>
      // </div>
    )
  }
}


