

// ------5/7---

import React from 'react';
import {Layout, Input, Button, Icon, message, Drawer ,Tree, Spin} from 'antd';
import intl from 'react-intl-universal';

import  './res_management.css';
import { fetchData } from '../service/HelperService';
import WrappedRescForm from './category_edit_form';
const { TreeNode } = Tree;

export default class CategoryEditForm extends React.Component{

    state = {
        selRecord: {},
        resultList: [],
        res_search_name: null,
        showInfoForm: false,
        loading: false
    }

    componentDidMount = () =>{
        this.getAllCate();
    }

    getAllCate=()=>{
        let loading_url = sessionStorage.getItem('serverPort')+'category/adminall';

        this.setState(state => ({ selRecord: {}, loading: true}));
        fetchData(loading_url,'get',null,response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.data !== undefined && res.status === 200){
                  this.setState({
                      resultList: res.data,
                      loading: false
                  });
              } else {
                  this.setState({
                      resultList: [],
                      loading: false
                  });
              }
              
            } else {
                this.setState({
                    resultList: [],
                    loading: false
                });
            }
        });
    }


//  -----------------Search Area ------------------------------
    onIDBlur = (e) =>{
        this.setState({res_search_name: e.target.value});
    }

//  ----------------Collect Searching criteria for further action-------------------
    prepSearchParams = () => {
        const { res_search_name } = this.state;
        var urlParams = '';
        if(res_search_name){
            urlParams += '&name=' + res_search_name;
        };

        return urlParams;
    }

    onSearch = () => {
        var cate_search_url = sessionStorage.getItem('serverPort')+'category/find?';
        var searchParams = this.prepSearchParams();
        this.setState({ loading: true });

        if(searchParams !== null && searchParams !== ''){
            cate_search_url += searchParams;
            fetchData( cate_search_url, 'get', null, response =>{
                if(response.ifSuccess){
                  let res = response.result;
                  if(res.status === 200){
                      this.setState({
                        resultList: res.data,
                        loading: false
                      })
                  } else {                    
                    this.setState({
                        resultList: [],
                        loading: false
                    })
                  }
                }else {                    
                    this.setState({
                        resultList: [],
                        loading: false
                    })
                }
            });
        } else {
            this.getAllCate();
        }
    }

 // -------Update individual resource
    showInfoForm = (record) => {
        this.setState(state=>({ showInfoForm: true, selRecord: record }));
    };

    onCloseInfoForm = () => {
        this.setState({ showInfoForm: false });
    }

    handleInfoForm = (updates) => {
        let single_url = sessionStorage.getItem('serverPort')+'category/update';
    
        fetchData(single_url,'post',updates,response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                message.success("Success Update");
              } else {
                message.error("Failed to Update");
              };

              this.setState({ showInfoForm: false });
              this.onSearch();
            }
        });
    };

    onExpand = expandedKeys => {
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
          expandedKeys,
          autoExpandParent: false
        });
      };

    
    onSelect = (selectedKeys) => {
        let findId_url = sessionStorage.getItem('serverPort')+'category/get?id='+selectedKeys;
        fetchData( findId_url, 'get', null, response =>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status === 200){
                    this.showInfoForm(res.data);
                } else if (res.status === 555){
                    this.setState({ selectedKeys });
                    this.showInfoForm(null);
                }
            }
        })
    };

    renderTreeNodes = data =>
      data.map(item => {
        // let cateName = item.nameEn;
        let cateName =sessionStorage.getItem('lang')==='zh_TW'? item.nameTc:item.nameEn;
        // sessionStorage.getItem('lang')==='zh_TW'
        // if(item.nameTc && item.nameTc!==item.nameEn){
        //     cateName = `${item.nameEn} [${item.nameTc}]`
        // }
        if (item.children) {
            return (
                // <TreeNode title={item.nameEn} key={item.id} dataRef={item}>
                <TreeNode title={cateName} key={item.id} dataRef={item}>
                {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
        } 
        // return <TreeNode {...item} title={item.nameEn} key={item.id} dataRef={item} />;
        return <TreeNode {...item} title={cateName} key={item.id} dataRef={item} />;
      });


      
    render(){
        const { Content } = Layout;
        const { resultList, showInfoForm, loading, selRecord, selectedKeys } = this.state;

        return (
            <div className ="clearfix" style={{width: '100%'}}>
                <Content className="cms-content">
                    <h1>
                        <div style={{display: 'inline-block', width: '65%'}}>
                            {intl.get('@CATE.CATEGORY-MANAGEMENT')}
                        </div>
                        <div style={{display: 'inline-block', width:'35%', textAlign: 'right'}}>
                            <Button shape="round" type="primary" href="#/adminconsole/category/creation"><Icon type ="plus" />New Category</Button>
                        </div>
                    </h1>
                    <div className="cms-white-box">
                        <div className="res_search">
                            <h5>{intl.get('@RES_MANAGEMENT.SEARCH')}</h5>
                            <div style={{width: '50%'}}>
                                <Input className="res-search-input" allowClear placeholder="Name" onBlur={this.onIDBlur} />
                            </div>
                            
                            <div style={{ textAlign: 'right', margin: '8px 0' }} >
                                <Button className="res_btn" shape="round" type="primary" onClick={this.onSearch}>{intl.get('@RES_MANAGEMENT.SEARCH')}</Button>
                            </div>
                        </div>

                        <div style={{padding: '4px'}}>
                            
                            <h5>{intl.get('@RES_MANAGEMENT.RESULTS')}</h5>
                            <Spin spinning={loading}>
                                <Tree
                                onExpand={this.onExpand}
                                expandedKeys={this.state.expandedKeys}
                                autoExpandParent={this.state.autoExpandParent}
                                onSelect={this.onSelect}
                                selectedKeys={selectedKeys}
                                >
                                    {this.renderTreeNodes(resultList)} 
                                </Tree>
                            </Spin>

                        </div>
                        
                        <Drawer    
                        id = "drawer=indiv-info"
                        title = {'Category Edit Form'}
                        width ='45%'
                        onClose={this.onCloseInfoForm}
                        destroyOnClose={true}
                        visible={showInfoForm}
                        >
                            <WrappedRescForm handleInfoForm={this.handleInfoForm} selRecord={selRecord} />
                        </Drawer>

                    </div>
                </Content>
            </div>
        )
    }






}