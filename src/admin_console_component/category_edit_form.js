import React from 'react';
import { Switch, Form, message, Button, TreeSelect } from 'antd';
import intl from 'react-intl-universal';
import TextArea from 'antd/lib/input/TextArea';

import { fetchData } from '../service/HelperService';

class CatEdit extends React.Component{

    state = { parentList: [] }

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

    handleDelete =(e)=>{
        let delete_url = sessionStorage.getItem('serverPort')+'category/delete?categoryId='+this.props.selRecord.id
                        +'&userId='+sessionStorage.getItem('@userInfo.id');

        fetchData( delete_url, 'get', null, response => {
            if(response.ifSuccess){
              let res = response.result;
              if(res.status === 200){
                  if (res.data==="Have both resource and sub category"){
                      message.error('Still have resource and sub category');
                  } else if (res.data === "Still have resource"){
                      message.error('Still have resource under this category');
                  } else if (res.data === "Still have sub category"){
                      message.error('Still have sub category under this category');
                  } else  {
                      message.success("Delete Successful ")
                  }
              } else  {
                  message.error('Your request was rejected by server');
              } 
            }
        });
    }

    handleSubmit = (e) =>{
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValues) =>{
            if(!err){
                const test ={
                    fieldsValues,
                    'id': this.props.selRecord.id,
                    'nameTc': fieldsValues['nameTc'] || this.props.selRecord.nameTc,
                    'nameEn': fieldsValues['nameEn'] || this.props.selRecord.nameEn,
                    'level': this.props.selRecord.level,
                    'createdBy': sessionStorage.getItem('@userInfo.id'),
                    'parent': fieldsValues['parent'] || this.props.selRecord.parentCatId,
                    'modifiedBy':sessionStorage.getItem('@userInfo.id'),
                    'showInfo': fieldsValues['showInfo'],

                };
                this.props.handleInfoForm(test);
            }
        });
    };
  

    render(){
        const { getFieldDecorator } = this.props.form;

        const { id, nameTc, nameEn, parentCatId, showInfo} =  this.props.selRecord;
       
        console.log('usergroup ', sessionStorage.getItem('@userInfo.usergroup'));
        return(
            <div>
                <Form onSubmit ={this.handleSubmit}>
                    <div className="cms-white-box">
                        {id}
                        <Form.Item label="Name (English): ">
                            {getFieldDecorator('nameEn',{initialValue: nameEn})(<TextArea rows={1}/>)}
                        </Form.Item>

                        <Form.Item label="Name (Chinese): ">
                            {getFieldDecorator('nameTc',{initialValue: nameTc})(<TextArea rows={1}/>)}
                        </Form.Item>

                        <Form.Item label="Parent: ">
                            {getFieldDecorator('parent', {initialValue: parentCatId===0?null:parentCatId})(
                                <TreeSelect
                                dropdownStyle={{ maxHeight: '400px', overflow: 'auto', }}
                                dropdownMatchSelectWidth={true}
                                treeData={this.state.cateOptions}
                                placeholder="Please select"
                                disabled={sessionStorage.getItem('@userInfo.usergroup')<4}
                                />
                            )}
                        </Form.Item>            
                    
                        <Form.Item 
                        label="ShowInfo: " >
                            {getFieldDecorator('showInfo', {initialValue: showInfo}) (<Switch defaultChecked={showInfo}/>)}
                             
                        </Form.Item>
                    </div>
                </Form>
                <div style={{ position:'absolute', left: 0, bottom: 0, width: '100%', borderTop: '1px solid #e9e9e9', padding: '10px 16px', background: '#fff', textAlign: 'right'}} >
                    <Button style={{ marginRight: '8px' }}  type="primary" onClick={ this.handleSubmit }>{intl.get('@GENERAL.SAVE')}</Button>
                    <Button type="danger" onClick={ this.handleDelete } disabled={sessionStorage.getItem('@userInfo.usergroup')<4}>{intl.get('@GENERAL.DELETE')}</Button>
                </div>
            </div>
        )
    }
}
const WrappedCatEdit= Form.create({name:'category_edit_form'})(CatEdit);
export default WrappedCatEdit;