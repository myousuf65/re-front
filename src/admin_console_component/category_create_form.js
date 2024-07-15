import React from 'react';
import { Layout, Icon, Switch, Form, message, Button, TreeSelect } from 'antd';
import intl from 'react-intl-universal';
import TextArea from 'antd/lib/input/TextArea';

import { fetchData } from '../service/HelperService';

class CatCreation extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            parentList: [],
        };
    }

    componentDidMount(){
        this.getCategoryOptions();
    }
  
    getCategoryOptions=()=>{
        let cateList = JSON.parse(sessionStorage.getItem('@cateList')) || [];
        let pre_cateList = cateList.map(iCate=>{
            return this.handleCateChildren(iCate);
        })
        this.setState(state=>({ cateOptions: pre_cateList }));
    }

    handleCateChildren=(cate)=>{
        let currentLang = sessionStorage.getItem('lang');
        let treedCate = {
            title: currentLang==='zh_TW'? cate.nameTc:cate.nameEn,
            value: cate.id,
            key: cate.id,
        };
        if(cate.children!==null){
            let children = cate.children.map(childCate=>{
                return this.handleCateChildren(childCate);
            });
            treedCate.children = children;
        }
        return treedCate;
    }

    showPublishSetting = () =>{
        if(this.state.selectedRows.length > 0){
            this.setState({ showPublicSettings: true});
        } else {
            message.info('Please select some files first.');
        }
    };

    onClosePublichSetting = () =>{
        this.setState({ showPublishSetting: false});
    };

    onChange = value => {
        console.log('onChange ', value);
        this.setState({ value });
    };

    onChange2 = value => {
        console.log('onChange ', value);
        this.setState({ value });
    };

    handleSubmit = (e) =>{
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValues) =>{
            console.log('Received values of form ', fieldsValues);
            if(!err){
                const test ={
                    //fieldsValues,
                    'nameTc': fieldsValues['nameTc'] || fieldsValues['nameEn'],
                    'nameEn': fieldsValues['nameEn'] || fieldsValues['nameTc'],
                    'createdBy': sessionStorage.getItem('@userInfo.id'),
                    'parent': fieldsValues['resCate'] ||0,
                    'showInfo': fieldsValues['showInfo'] ,
                    'isDeleted':0
            
                    
                };
                console.log('JSON for post creation: ', JSON.stringify(test))
                var createPost_url = sessionStorage.getItem('serverPort')+ 'category/add';
                fetchData(createPost_url, 'post', test, response=>{
                    if(response.ifSuccess){
                      let res = response.result;
                      if(res.status === 200){
                          message.success("Post create successfully");
                          setTimeout(()=> {window.location.replace(`#/adminconsole/category`)}, 1000);
                      } else {
                          message.error("Failed to create category",1);
                      }
                    }
                })
            }
        });
    };
  

    render(){
        this.onChange = this.onChange;
        const { Content } = Layout;
        const { getFieldDecorator } = this.props.form;
        
        return(
            <div className="clearfix" style={{ width:'100%' }} >
                <Content className="cms-content" >
                    <h1>
                        <div style={{ display: 'inline-block', width: '60%' }}>
                            New Category
                        </div>

                        <div style={{ display: 'inline-block', width: '40%', textAlign: 'right' }}>
                            <Button className="res_create_btn" shape="round" type="primary" href="#/adminconsole/category" ><Icon type="rollback" /> {intl.get("@RES_MANAGEMENT.BACK")}</Button>
                        </div>
                        
                    </h1>
                <Form onSubmit ={this.handleSubmit}>
                    <div className="cms-white-box">
                    <Form.Item >
                          Name (Chinese): 
                          {getFieldDecorator('nameTc')(<TextArea rows={1}/>)}
                    </Form.Item>
                    <Form.Item>
                        Name (English):
                        {getFieldDecorator('nameEn')(<TextArea rows={1}/>)}
                    </Form.Item>
                   
            

                    <Form.Item >
                        Parent :   
                    {getFieldDecorator('resCate', {initialValue: null})(

                        <TreeSelect
                        style={{ width: 300 }}
                        value={this.state.value}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        dropdownMatchSelectWidth={true}
                        treeData={this.state.cateOptions}
                        placeholder="Please select"
                        onChange={this.onChange}
                      />
                    )}
                </Form.Item>            
                
                <Form.Item 
                label="ShowInfo: ">
                    {getFieldDecorator('showInfo', {initialValue: true}) (<Switch defaultChecked/>)}
                </Form.Item>
                      
                    </div>
                    </Form>
                    <div>
                        <Button style={{ marginRight: '8px' }}  type="primary" onClick={ this.handleSubmit }>{intl.get('@RES_DRAWER_INFO.SAVE')}</Button>

                     </div>
                </Content>
            </div>
        )
    }
}
const WrappedCatCreation= Form.create({name:'category_create_form'})(CatCreation);
export default WrappedCatCreation;