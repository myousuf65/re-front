//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190612 */
//Comments //***s=]*** 



import React from 'react';
import { Layout, Icon, Upload, Drawer, message, Table, Button, Popconfirm, Spin, Progress } from 'antd';
import intl from 'react-intl-universal';

import { fetchData, getCategoryTree, bytesToSize } from '../service/HelperService';

import WrappedRescForm from './resource_createform';
import WrappedResAccessRuleForm from './res_accessrule_form';
import WrappedResPublishForm from './res_publish_form';

import './res_creation.css';

const Dragger = Upload.Dragger;
const cateOptions = getCategoryTree();

export default class ResCreation extends React.Component{
    constructor(props){
        super(props);
        this.state={ 
            visible:false,
            showAccessRule: false,
            showPublishSettings: false,
            fileList: [],
            resourceList: [],
            ifNewVideo: false,
            selRecord: null,
            selectedRowKeys: [],
            selectedRows: [],
            uploading: false,
            progressPercent: 0,
            disableEditBtn: true,
            disableManageBtn: true,
            visiblepop: false,
            userGroupId: 1,
            groupOptions: []
        };
    }

    componentDidMount(){
        let getUserGroup = sessionStorage.getItem('serverPort')+'user/get/'+sessionStorage.getItem('@userInfo.id');
        fetchData(getUserGroup, 'get', null, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&res.data.groupId){
                    this.setState({ userGroupId: res.data.groupId })
                }else{
                    this.setState({ userGroupId: 1 })
                }
            }else{
                this.setState({ userGroupId: 1 })
            }
        })

        this.getSplUsrGroupList();
    }

    getSplUsrGroupList = () =>{
        let getSUGrpList_url = sessionStorage.getItem('serverPort')+'splusrgrp/getAll/'+sessionStorage.getItem('@userInfo.id');
        
        fetchData(getSUGrpList_url, 'get', null, response=>{
          if(response.ifSuccess){
            let res = response.result;
            if(res.status===200&&Array.isArray(res.data)){
              this.setState({ groupOptions: res.data.sort((a,b) => (a.groupName > b.groupName) ? 1 : ((b.groupName > a.groupName) ? -1 : 0)) });
            }else{
                this.setState({ groupOptions: [] });
            }
          }else{
            this.setState({ groupOptions: [] });
          }
        })
    }

    showDrawer = (record) => {
        this.setState({ visible: true, selRecord: record });
    };

    onClose = () => {
        this.setState({ visible: false, ifNewVideo: false });
    }

    handleInfoForm = (updates) => {
        
        // -------update specific record
        if(updates !== null){
            var newResourceList = this.state.resourceList;
            var sel_updated = this.state.selectedRows;
            if(this.state.ifNewVideo === true){
                this.setState(state => ({ 
                    resourceList: [...state.resourceList, updates],
                    ifNewVideo: false,
                    visible: false,
                }));
            }else{
                var list_index = newResourceList.indexOf(this.state.selRecord);
                newResourceList.splice(list_index,1,updates);
                var sel_index = sel_updated.indexOf(this.state.selRecord);
                sel_updated.splice(sel_index,1,updates);
                this.setState({ resourceList: newResourceList,
                                selectedRows: sel_updated,
                                selRecord: updates,
                                visible: false });
            };
        } else {
            message.warning('You did not input anything.');
        };
    }

    showAccessRule = () => {
        if(this.state.selectedRows.length > 0){
            this.setState({ showAccessRule: true });
        }else{
            message.info('Please select some files first.');
        }
    };

    onCloseAccessRule = () => {
        this.setState({ showAccessRule: false });
    };

    handleAccessRule = (settings) => {
        var selectedRows = this.state.selectedRows;
        var resourceList = this.state.resourceList;
        selectedRows.forEach(record => { var selIndex = resourceList.indexOf(record);
                                        record.if_km = settings.if_km;
                                        record.k_market = settings.k_market;
                                        record.if_ks = settings.if_ks;
                                        record.k_square = settings.k_square;
                                        record.if_wg = settings.if_wg;
                                        record.wisdom_gallery = settings.wisdom_gallery;
                                        record.if_su = settings.if_su;
                                        record.special_user = settings.special_user;
                                        record.if_sulist = settings.if_sulist;
                                        record.special_user_list = settings.special_user_list;
                                        resourceList.splice(selIndex, 1, record);
                                        });
        
        this.setState(state => ({resourceList: resourceList, showAccessRule: false}));
    }

    showPublishSettings = () => {
        if(this.state.selectedRows.length > 0){
            this.setState({ showPublishSettings: true });
        }else{
            message.info('Please select some files first.');
        }
    };

    onClosePublishSettings = () => {
        this.setState({ showPublishSettings: false });
    };

    handlePublishSettings = (settings) => {
        var selectedRows = this.state.selectedRows;
        var newResourceList = this.state.resourceList;

        selectedRows.forEach(record => { 
            var index = newResourceList.indexOf(record);
            record.resCate = settings.resCate;
            //--uat
            record.downloadOriginal = record.resourceTypeId===2? 0:settings.downloadOriginal;
            record.downloadType = record.resourceTypeId===2? 0:settings.downloadType;
            record.accessChannel = settings.accessChannel;
            record.latestNews = settings.latestNews;
            record.latestNewsExpiry = settings.latestNewsExpiry;
            record.activated = settings.activated;
            newResourceList.splice(index,1,record);
        });
        
        this.setState(state => ({resourceList: newResourceList, showPublishSettings: false}));
    }

    handleNewVideo=()=>{
        var resource_obj = {
            "uid": "",
            // -------to be modified
            "resourceTypeId": 2,
            "titleTc": "",
            "titleEn": "",
            "descTc": "",
            "descEn": "",
            "resCate": [],
            "accessChannel": [],
            "downloadOriginal": 0,  //--uat
            "downloadType": 0, //--uat
            "latestNews": 0,
            "latestNewsExpiry": null,
            "activated": 0,
            // -------to be modified
            "originalname": "video"+new Date().getTime(),
            "nfilename": "video"+new Date().getTime(),
            "ofilename": "video"+new Date().getTime(),
            "filesize": null,
            // "draggerFile": null,
            "videoLink": "",
            "thumbUrl": null,
            "if_km": false,
            "k_market": [],
            "if_ks": false,
            "k_square": [],
            "if_wg": false,
            "wisdom_gallery": [],
            "if_su": false,
            "special_user": [],
            "if_sulist": false,
            "special_user_list": [] 
        };
        this.setState({ ifNewVideo: true });

        this.showDrawer(resource_obj);
    }

    // -------settings of Delete btn
    handleVisibleChange = visible => {
        if (!visible) {
        this.setState({ visiblepop: visible });
        return;
        };

        if(this.state.resourceList.length===0?true:false){
        // message.success("confirmed");
        }else{
        this.setState({ visiblepop: visible });
        }
    }

    onDelete = () => {
        const { selectedRowKeys, selectedRows } = this.state;
        if(selectedRowKeys.length > 0){
            selectedRows.forEach(record => { 
                this.setState(state => {
                    const newResourceList = state.resourceList.slice();
                    const selIndex = newResourceList.indexOf(record);
                    newResourceList.splice(selIndex,1);
                    return { resourceList: newResourceList };
                });
            });
            this.setState({ selectedRowKeys:[], selectedRows:[] });
        };

        this.setState({ disableManageBtn:true });

    }

    onCancelDelete = () => {
        message.error("Delete request cancelled")
    }

    generateThumbnail = (file) => {
        const r = new FileReader();
        let thumbUrl = undefined;
        r.readAsDataURL(file);
        r.onload = e => {
           thumbUrl = e.target.result;
        };
        return thumbUrl;
    }

    handleSubmit = () => {
        var selRows = [];

        this.state.selectedRows.forEach((record)=>{
            var titleReady = false;
            var descReady = false;
            var accessRuleReady = false;
            var cateReady = false;
            var accessRule_arr = record.k_market.concat(record.k_square,record.wisdom_gallery);

            if(record.titleEn!=="" || record.titleTc!==""){
                titleReady = true;
                if(record.titleEn!=="" && record.titleTc===""){
                    record.titleTc = record.titleEn;
                  }else if(record.titleEn==="" && record.titleTc!==""){
                    record.titleEn = record.titleTc;
                  }
            } 
            if(record.descEn!=="" || record.descTc!==""){
                descReady = true;
                if(record.descEn!=="" || record.descTc===""){
                    record.descTc = record.descEn;
                  }else if(record.descEn==="" || record.descTc!==""){
                    record.descEn = record.descTc;
                  }
            }
            if(accessRule_arr.length>0){
                accessRuleReady = true;
            }
            
            if(record.resCate.length>0){
                cateReady = true;
            }

            if (titleReady&&descReady&&accessRuleReady&&cateReady){
                selRows.push(record);
            }else{
                message.error('More info. required for '+record.originalname, 3);
            };

        });


        if (selRows.length>0){
            this.setState(state=>({ uploading: true }));
            var ifGotErr = false;

            selRows.forEach((record,index,array)=>{
                let resCreate_url = sessionStorage.getItem('serverPort')+'resource/create/?user='+sessionStorage.getItem('@userInfo.id');
                if(!ifGotErr){
                    fetchData(resCreate_url, 'post', [record], response=>{
                        if(response.ifSuccess){
                          let res = response.result;
                          if(res.status===200){
                              this.setState(state => {
                                  let newResourceList = this.state.resourceList.slice();
                                  const selIndex = newResourceList.indexOf(record);
                                  newResourceList.splice(selIndex,1);
  
                                  let currentProgress = ((index+1)/array.length)*100;
                                  
                                  return { resourceList: newResourceList, progressPercent: currentProgress };
                              });
                              
                          } else {
                              message.info("Please ensure each record has at least one title, one description, one category and one access rule.",  )
                          };
  
                          if(index===array.length-1){
                              setTimeout(()=> { this.setState(state=>({ uploading: false })) }, 1000);
                              setTimeout(()=> { this.setState(state=>({ progressPercent: 0 })) }, 1000);
                          }
                        }else{
                            if(response.result.status===401 || response.result.status===440){
                              ifGotErr = true;
                            }
                            message.error('Sorry, your request was rejected by server.');
                            if(index===array.length-1){
                              setTimeout(()=> { this.setState(state=>({ uploading: false })) }, 1000);
                              setTimeout(()=> { this.setState(state=>({ progressPercent: 0 })) }, 1000);
                            }
                        }

                    })
                }

            })

        } else {
            message.info("Please ensure each record has at least one title, one description, one category and one access rule.")
        }
        this.setState(state =>({ selectedRowKeys: [], selectedRows: [], disableManageBtn: true }));

    }

    render() {
        const { Content } = Layout;
        const { uploading, progressPercent, fileList, resourceList, showAccessRule, showPublishSettings, disableManageBtn, selectedRowKeys, selectedRows, visiblepop, userGroupId, groupOptions } = this.state;
        const draggerprops = {
            name: 'file',
            multiple: true,
            // -------to be modified
            action: sessionStorage.getItem('serverPort')+'upload/single/?user='+sessionStorage.getItem('@userInfo.id'),
            headers: {'accessToken': sessionStorage.getItem('accessToken'), 'accesshost': window.location.hostname, },
            // data: (file)=>{},
            accept: 'image/*,.doc,.docx,.xml,application/msword,.pdf,.xlsx,.xls',
            listType: 'picture',
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file);
                    const newFileList = state.fileList.slice();
                    newFileList.splice(index, 1);
                    return { fileList: newFileList };
                });
            },
            beforeUpload: file => {
                let fname = file.name;
                let if_duplicated = false;
                this.state.resourceList.forEach(ires=>{
                    if(ires.originalname === fname){                    
                        if_duplicated=true;
                    };
                });
                if(if_duplicated){
                    sessionStorage.getItem('lang')==='zh_TW'?
                    message.warning(<div style={{ textAlign:"left" }}><p>上傳取消</p><p>相同文件(名)已存在</p></div>)
                    :message.warning(<div style={{ textAlign:"left" }}><p>Upload rejected</p><p>A file already existing with same filename.</p></div>);
                    return false;
                };
            },
            fileList,
            // showUploadList: false,
            showUploadList: true,
            onPreview: this.showDrawer,
            onSuccess: (response, file) => {
                if(response.status!==200){
                    message.error(`${response.msg} (${response.status})`);
                    return false;
                }

                const res = response.data;
                let resource_obj = {
                    "uid": res.nfilename,
                    "resourceTypeId": res.resourceTypeId,
                    "titleTc": "",
                    "titleEn": "",
                    "descTc": "",
                    "descEn": "",
                    "resCate": [],
                    "accessChannel": [],
                    "downloadOriginal": 0,//--uat
                    "downloadType": 0,//--uat
                    "latestNews": 0,
                    "latestNewsExpiry": null,
                    "activated": 0,
                    "originalname": res.originalname,
                    "ofilename": res.ofilename,
                    "nfilename": res.nfilename,
                    "filesize": res.filesize,
                    "thumbUrl": file.thumbUrl,
                    "videoLink": "",
                    "if_km": false,
                    "k_market": [],
                    "if_ks": false,
                    "k_square": [],
                    "if_wg": false,
                    "wisdom_gallery": [],
                    "if_su": false,
                    "special_user": [],
                    "if_sulist": false,
                    "special_user_list": [],
                };

                // ------prepare thumbnail (base64) for image
                if (file.type.startsWith('image/')){
                    const r = new FileReader();
                    r.readAsDataURL(file);
                    r.onload = e => {
                        resource_obj.thumbUrl = e.target.result;
                    };
                }

                this.setState(state => ({ 
                    resourceList: [...state.resourceList, resource_obj]
                }));
            },
            onError: res =>{
                if(res.data===undefined){
                    message.error('Server connection refused!');
                } else {
                    console.log(res.data);
                };
            },
        };
        
        const rowSelection = {
            selectedRowKeys,
            selectedRows,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({ selectedRowKeys, selectedRows });
                selectedRowKeys.length > 0 ? this.setState({ disableManageBtn: false }) : this.setState({ disableManageBtn: true });
            },
            getCheckboxProps: record => ({
                // disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };

        const customSpin = <Progress style={{ left: '0%' }} strokeColor={{ from: '#108ee9', to: '#87d068' }} status="active" percent={progressPercent} format={(percent)=>percent+'%'} spin="true" />

        return(
            <div className="clearfix" style={{ width:'100%' }} >
                <Content className="cms-content" >
                    <h1>
                        <div style={{ display: 'inline-block', width: '60%' }}>
                            {intl.get("@RES_MANAGEMENT.NEW-RESOURCE")}
                        </div>
                        <div style={{ display: 'inline-block', width: '40%', textAlign: 'right' }}>
                            <Button className="res_create_btn" shape="round" type="primary" href="#/adminconsole/resources/management" ><Icon type="rollback" /> {intl.get("@RES_MANAGEMENT.BACK")}</Button>
                        </div>
                        
                    </h1>

                    <div className="cms-white-box">
                        
                        <Spin 
                        spinning={uploading} 
                        indicator={customSpin}
                        >
                        <Dragger {...draggerprops}>
                            <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                            </p>
                            <p className="ant-upload-hint">
                            {intl.get("@RES_MANAGEMENT.DRAGGER")}
                            </p>
                        </Dragger>

                        <div style={{ marginTop: '30px' }}>
                        <div className="table-operations" style={{ display: 'inline-block', width: '70%', textAlign: 'left' }}>
                        <label style={{ marginRight: '8px' }}><span>{intl.get("@RES_MANAGEMENT.ASSIGN")}</span></label>
                            <Button type="primary" shape="round" size="small" style={{ marginRight: '8px' }} disabled={disableManageBtn} onClick={this.showAccessRule}>{intl.get("@RES_MANAGEMENT.ACCESS-RULE")}</Button>
                            <Button type="primary" shape="round" size="small" style={{ marginRight: '8px' }} disabled={(userGroupId!==5&&userGroupId!==3)||disableManageBtn} onClick={this.showPublishSettings} >{intl.get("@RES_MANAGEMENT.PUBLISH-SETTINGS")}</Button>
                        </div>
                        <div style={{ display: 'inline-block', width: '30%', textAlign: 'right' }}>
                            <Button type="primary" shape="round" size="small" onClick={this.handleNewVideo} >{intl.get("@RES_MANAGEMENT.NEW-VIDEO")}</Button>
                        </div>
                        </div>


                        <Table
                            style={{ paddingTop: '16px' }}
                            rowKey={(record,index)=>index}
                            rowSelection={rowSelection}
                            pagination={false}
                            rowClassName={record=>(record===this.state.selRecord&&this.state.visible? "res-row-selected":"res-row")}
                            columns={[{title:(sessionStorage.getItem('lang')==='zh_TW'? '文件':'Files'), dataIndex: 'originalname'}, {title:(sessionStorage.getItem('lang')==='zh_TW'? '文件大小':'File Size'), dataIndex: 'filesize', render: (text, record) => bytesToSize(record.filesize)}]}
                            // dataSource={fileList}
                            dataSource={resourceList}
                            onRow={record => { 
                                return {
                                    // onClick: event => {this.onClickRecords();}
                                    onClick: event => {this.showDrawer(record);}
                                };
                            }}
                        />

                        <div style={{ paddingTop: '16px' }}>
                            <Popconfirm 
                            title="All selected items will be deleted, continue?" 
                            visible={visiblepop} 
                            onVisibleChange={this.handleVisibleChange} 
                            okText="Cancel"
                            onConfirm={this.onCancelDelete} 
                            cancelText="Yes"
                            onCancel={this.onDelete}>
                                <Button style={{ marginRight: '8px' }} shape="round" disabled={disableManageBtn} type="danger">{intl.get("@RES_MANAGEMENT.DELETE")}</Button>
                            </Popconfirm>
                            <Button style={{ marginRight: '8px' }} type="primary" shape="round" onClick={this.handleSubmit} disabled={disableManageBtn}>{intl.get("@RES_MANAGEMENT.SUBMIT")}</Button>
                        </div>

                        <Drawer
                            id = "drawer-indiv-info"
                            title={intl.get('@RES_MANAGEMENT.ALL-INFO')}
                            width='45%'
                            onClose={this.onClose}
                            destroyOnClose={true}
                            visible={this.state.visible}
                        >
                            <WrappedRescForm handleInfoForm={this.handleInfoForm} selRecord={this.state.selRecord} cateOptions={cateOptions} userGroupId={userGroupId} groupOptions={groupOptions} />
                        </Drawer>

                        <Drawer
                            id = "drawer-batch-info"
                            title={intl.get('@RES_DRAWER_INFO.PUBLISH-SETTINGS')}
                            width='25%'
                            onClose={this.onClosePublishSettings}
                            destroyOnClose={true}
                            visible={showPublishSettings}
                        >
                            <WrappedResPublishForm handlePublishSettings={this.handlePublishSettings} cateOptions={cateOptions} userGroupId={userGroupId} />

                        </Drawer>

                        <Drawer
                            id = "drawer-access-rule"
                            title={intl.get('@RES_DRAWER_INFO.ACCESS-RULE')}
                            width='35%'
                            onClose={this.onCloseAccessRule}
                            destroyOnClose={true}
                            visible={showAccessRule}
                        >
                            <WrappedResAccessRuleForm handleAccessRule={this.handleAccessRule} groupOptions={groupOptions} />
                        </Drawer>
                        </Spin>
                        
                    </div>
                </Content>
            </div>
        )
    }
}
