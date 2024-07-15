//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20200206 */
//Comments //***s=]*** 


import React from 'react';
import {Layout, Button, Icon, message, Drawer ,Tree, Spin} from 'antd';
import intl from 'react-intl-universal';

import  './res_management.css';
import WrappedForumCateForm from './forum_cate_form';
import { fetchData } from '../service/HelperService';

const { TreeNode } = Tree;

export default class ForumCateManagement extends React.Component{

    state = {
        selRecord: {},
        resultList: [],
        cateOptions: [],
        groupOptions: [],
        showInfoForm: false,
        loading: true,
        updating: false,
        deleting: false,
    }

    componentWillMount = () =>{
        this.getForumCate();
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

    getForumCate=()=>{
        this.setState({ loading: true });
        let getForumCate_url = sessionStorage.getItem('serverPort')+'forum/admin/categoryall/'+sessionStorage.getItem('@userInfo.id');
        fetchData(getForumCate_url,'get',null,response=>{
            if(response.ifSuccess){
            let res = response.result;
                if(res.data !== undefined && res.status === 200){
                    this.setState({
                        resultList: res.data,
                        loading: false
                    });
                    this.handleCateList_Lv1(res.data);
                } else {
                    this.setState({
                        resultList: [],
                        cateOptions: [],
                        loading: false
                    });
                }
            }else{
                this.setState({
                    resultList: [],
                    cateOptions: [],
                    loading: false
                });
            }
        })
    }

    handleCateList_Lv1=(cateList)=>{
        let pre_cateList = cateList.map(cate=>({
            key: cate.id,
            value: cate.id,
            // title: sessionStorage.getItem('lang')==='zh_TW'? cate.nameTc:cate.nameEn,
            title: cate.nameTc===cate.nameEn? cate.nameEn:`${cate.nameEn} (${cate.nameTc})`,
        }));
        this.setState({ cateOptions: pre_cateList });
    }

    handleCateList=(cateList)=>{
        let pre_cateList = cateList.map(iCate=>this.handleCateChildren(iCate));
        this.setState({ cateOptions: pre_cateList });
    }

    handleCateChildren=(cate)=>{
        let treedCate = {
            title: sessionStorage.getItem('lang')==='zh_TW'? cate.nameTc:cate.nameEn,
            value: cate.id,
            key: cate.id,
        };
        if(cate.subCate!==null){
            let children = cate.subCate.map(childCate=>{
                return this.handleCateChildren(childCate);
            });
            treedCate.children = children;
        }
        return treedCate;
    }


 // -------Update individual resource    
    onSelect = (selectedKeys) => {
        // this.setState({ showInfoForm: true })
        let getSelCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/get/'+sessionStorage.getItem('@userInfo.id')+'/'+selectedKeys;
        fetchData(getSelCate_url,'get',null,response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200&&res.data[0]!==undefined){
                    this.showInfoForm(res.data[0]);
                }else{
                    message.error(res.msg);
                }
            }else{
                message.error('Server denied.');
            }
        })
    };

    showInfoForm = (record) => {
        this.setState(state=>({ showInfoForm: true, selRecord: record }));
    };

    onCloseInfoForm = () => {
        this.setState({ showInfoForm: false, selRecord: {} });
    }

    handleInfoForm = (updates) => {
        this.setState({ updating: true })
        
        // setTimeout(()=>{this.setState({updating:false}); message.success('save')}, 3000)
        let updateCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/update/'+sessionStorage.getItem('@userInfo.id');
        fetchData(updateCate_url,'post',updates,response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    message.success('Update Successfully!')
                    this.setState({ updating: false, showInfoForm: false });
                    this.getForumCate();
                }else{
                    message.error(res.msg);
                    this.setState({ updating: false });
                }
            }else{
                message.error('Server denied.');
                this.setState({ updating: false });
            }
        })
    };

    handleDelete=(selRecordId)=>{
        this.setState({ deleting: true });
        let delSelCate_url = sessionStorage.getItem('serverPort')+'forum/admin/category/delete/'+selRecordId+'/'+sessionStorage.getItem('@userInfo.id');
        fetchData(delSelCate_url, 'post', null, response=>{
          if(response.ifSuccess){
            // let res = response.result;
            // if(res.status===200&&res.data!==undefined){
                this.setState({ deleting: false });
                message.success('Delete successfully!')
                this.onCloseInfoForm();
                this.getForumCate();
            // }else{
            //     message.error('Failed to delete: '+res.msg);
            // }
          }else{
            this.setState({ deleting: false });
            message.error('Your request was rejected by server');
          }
        })
      }

    onExpand = expandedKeys => {
        // console.log("onExpand", expandedKeys);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
          expandedKeys,
          autoExpandParent: false
        });
    };

    preTreeNodes=(node)=>{
        if(node.subCate.length>0){
            return (
                <TreeNode key={node.id} title={node.nameTc===node.nameEn? node.nameEn:`${node.nameEn} (${node.nameTc})`}>
                    {node.subCate.map(item=>this.preTreeNodes(item))}
                </TreeNode>
            )
        }else{
            return <TreeNode key={node.id} title={node.nameTc===node.nameEn? node.nameEn:`${node.nameEn} (${node.nameTc})`} />
        }
    }
      
    render(){
        const { Content } = Layout;
        const { resultList, selRecord, showInfoForm, loading, expandedKeys, autoExpandParent, selectedKeys, cateOptions, updating, deleting, groupOptions } = this.state;

        return (
            <div className ="clearfix" style={{width: '100%'}}>
                <Content className="cms-content">
                    <h1>
                        <div style={{display: 'inline-block', width: '65%'}}>
                            {intl.get('@FORUM_ADMIN.MANAGEMENT')}
                        </div>
                        <div style={{display: 'inline-block', width:'35%', textAlign: 'right'}}>
                            <Button shape="round" type="primary" href="#/adminconsole/kc/category/creation"><Icon type ="plus" />{intl.get('@FORUM_ADMIN.NEW-CATE')}</Button>
                        </div>
                    </h1>
                    <div className="cms-white-box">
                        <div style={{padding: '4px'}}>
                            <Spin spinning={loading}>
                                <Tree
                                onExpand={this.onExpand}
                                expandedKeys={expandedKeys}
                                autoExpandParent={autoExpandParent}
                                onSelect={this.onSelect}
                                selectedKeys={selectedKeys}
                                >
                                    {resultList.map(iCate=>this.preTreeNodes(iCate))} 
                                </Tree>
                            </Spin>
                        </div>
                        
                        <Drawer    
                        id = "drawer-indiv-info"
                        title = "Edit"
                        width = '45%'
                        onClose={this.onCloseInfoForm}
                        destroyOnClose={true}
                        visible={showInfoForm}
                        >
                            <WrappedForumCateForm handleInfoForm={this.handleInfoForm} selRecord={selRecord} updating={updating} deleting={deleting} cateOptions={cateOptions} handleDelete={this.handleDelete} groupOptions={groupOptions} />
                        </Drawer>

                    </div>
                </Content>
            </div>
        )
    }






}