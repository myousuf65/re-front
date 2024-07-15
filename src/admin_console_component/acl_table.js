


import React from 'react';
import { Layout, Checkbox, Table, message, Select } from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
import './res_management.css';

export default class AclForm extends React.Component{
    state={
        usergroup:[],
        dataSource: [],
        serverData: [],
        loadingGroup: false,
    }
     
    componentDidMount(){
        this.getUserGroup();
    }
 
    getUserGroup =() =>{
        let usergroup_url = sessionStorage.getItem('serverPort')+'usergroup/all';
        fetchData(usergroup_url,'get',null,response=>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status === 200){
                  this.setState(state => ({ usergroup: res.data }));
              }
            }
        });
    }

    handleChange = (value) =>{
        // ----initial data
        this.setState(state=>({ dataSource:[], loadingGroup: true }))

        let sitefuncs_url = sessionStorage.getItem('serverPort') + 'acl/all/?userGroupId='+value;
        fetchData( sitefuncs_url, 'get', null, response =>{
            if(response.ifSuccess){
              let res = response.result;
              if(res.status === 200){
                  this.setState(state => {
                      let site=[];
                      res.data.forEach(item=>{
                          let iFunc = {
                              id: item.id,
                              funcName: sessionStorage.getItem('lang')==='zh_TW'? item.sitefuncId.funcNameC:item.sitefuncId.funcName,
                              flagAll: item.flagAll,
                              flagAdd: item.flagAdd,
                              flagSave: item.flagSv,
                              flagUpd: item.flagUpd,
                              flagDel: item.flagDel,
                              flagDownload: item.flagDownload,
                              // groupId: item.usergroupId
                          }
                          if(item.flagAll){
                              iFunc.indeterminatedAll = false;
                              iFunc.flagAdd = false;
                              iFunc.flagSave = false;
                              iFunc.flagUpd = false;
                              iFunc.flagDel = false;
                              iFunc.flagDownload = false;
  
                          }else if(item.flagAdd||item.flagSv||item.flagUpd||item.flagDel||item.flagDownload){
                              iFunc.indeterminatedAll = true;
                              iFunc.flagAll = false;
                          }else{
                              iFunc.indeterminatedAll = false;
                          }
                          site.push(iFunc)
                      });
  
                      return { dataSource: site, serverData: site, loadingGroup: false };
                  })
              } else {
                  this.setState(state => ({ dataSource: [], serverData: [], loadingGroup: false }));
              }
            }
        })
    }

    handleOtherChecked = (e, index, iCol) => {
        let updateACL_url = sessionStorage.getItem('serverPort')+'acl/update';
        let updates = {
            id: e.target.value,
            column: iCol,
            value: e.target.checked
        };

        fetchData(updateACL_url, 'post', updates, response => {
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                let dataSource = this.state.dataSource;

                dataSource[index][iCol] = e.target.checked;
        
                if(dataSource[index].flagAdd&&dataSource[index].flagSave&&dataSource[index].flagUpd&&dataSource[index].flagDel&&dataSource[index].flagDownload){
                    dataSource[index].flagAll = true;
                    dataSource[index].indeterminatedAll = false;
                    dataSource[index].flagAdd = false;
                    dataSource[index].flagSave = false;
                    dataSource[index].flagUpd = false;
                    dataSource[index].flagDel = false;
                    dataSource[index].flagDownload = false;
                }else{
                    dataSource[index].flagAll = false;
                    if(dataSource[index].flagAdd||dataSource[index].flagSave||dataSource[index].flagUpd||dataSource[index].flagDel||dataSource[index].flagDownload){
                        dataSource[index].indeterminatedAll = true;
                    }else{
                        dataSource[index].indeterminatedAll = false;
                    }
                };
        
                this.setState(state=>({ dataSource }));

                message.success("Update successfully.");
                }else{
                    message.error("Your request was rejected by server.");
                }
            }
            
        });

    }

    handleAllChecked = (e, index) => {
        let updateACL_url = sessionStorage.getItem('serverPort')+'acl/update';
        let updates = {
            id: e.target.value,
            column: 'flagAll',
            value: e.target.checked
        };

        fetchData(updateACL_url, 'post', updates, response => {
            if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  let dataSource = this.state.dataSource;
                  dataSource[index].flagAll = e.target.checked;
          
                  dataSource[index].indeterminatedAll = false;
                  dataSource[index].flagAdd = false;
                  dataSource[index].flagSave = false;
                  dataSource[index].flagUpd = false;
                  dataSource[index].flagDel = false;
                  dataSource[index].flagDownload = false;
          
                  this.setState(state=>({ dataSource }));
              }else{
                  message.error("Your request was rejected by server.");
              }
            }
        });
    }

    render(){
        const { Content } = Layout;
        const { Option } = Select;

        const { usergroup, dataSource, loadingGroup } = this.state;

        const table_columns = [
            { key: 1, title: intl.get('@GENERAL.NAME'), dataIndex: 'funcName' },
            { key: 2, title: intl.get('@GENERAL.ALL'), dataIndex: 'flagAll',
            render: (text,record,index) => (<Checkbox indeterminate={record.indeterminatedAll} value={record.id} checked={text} onChange={(e)=>this.handleAllChecked(e, index)} />), 
            editable: true },
            { key: 3, title: intl.get('@GENERAL.ADD'), dataIndex: 'flagAdd',
            render: (text,record,index) => (<Checkbox indeterminate={false} value={record.id} checked={text} onChange={(e)=>this.handleOtherChecked(e, index, "flagAdd")} />), 
            editable: true },
            { key: 4, title: intl.get('@GENERAL.SAVE'), dataIndex: 'flagSave',
            render: (text,record,index) => (<Checkbox indeterminate={false} value={record.id} checked={text} onChange={(e)=>this.handleOtherChecked(e, index, "flagSave")} />), 
            editable: true },
            { key: 5, title: intl.get('@GENERAL.UPDATE'), dataIndex: 'flagUpd',
            render: (text,record,index) => (<Checkbox indeterminate={false} value={record.id} checked={text} onChange={(e)=>this.handleOtherChecked(e, index, "flagUpd")} />), 
            editable: true },
            { key: 6, title: intl.get('@GENERAL.DELETE'), dataIndex: 'flagDel',
            render: (text,record,index) => (<Checkbox indeterminate={false} value={record.id} checked={text} onChange={(e)=>this.handleOtherChecked(e, index, "flagDel")} />), 
            editable: true },
            { key: 7, title: intl.get('@GENERAL.DOWNLOAD'), dataIndex: 'flagDownload',
            render: (text,record,index) => (<Checkbox indeterminate={false} value={record.id} checked={text} onChange={(e)=>this.handleOtherChecked(e, index, "flagDownload")} />),
            editable: true },
        ]
       
        var group =[]
        usergroup.forEach(item =>{
            group.push({
                value: item.id,
                label: item.name
            });
        });

        return(
            <div className= "clearfix" style={{ width:'100%' }}>
                <Content className="cms-content">
                    <h1>
                        <div style={{ display: 'inline-block', width: '100%' }}>
                            ACL
                        </div>
                    </h1>

                    <div className = "cms-white-box">
                        <div style={{ margin: '0 0 32px' }}>
                            <Select placeholder="Please select a group" onChange={this.handleChange}>
                                {group.map(item =>(<Option value={item.value} key={item.value}>{item.label}</Option>) )}
                            </Select>
                        </div>
                     
                         <Table
                         loading={{ spinning: loadingGroup, tip: 'Loading...' }}
                         rowKey={record=>record.id}
                         columns={table_columns}
                         dataSource={dataSource} 
                         pagination={false}
                        />

                    </div>
                
                    
                </Content>

            </div>
            
        )
    }


}
