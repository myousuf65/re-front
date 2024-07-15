//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date:  20190403*/
//Comments //s=]:


import React from 'react';
import { Select } from 'antd';
import intl from 'react-intl-universal';

// import { fetchData } from '../service/HelperService';

const Option = Select.Option;

export default class PostsSorter extends React.Component{
    
    state = { catesList: require('../temp_json/blog_cates.json') };

    // componentDidMount(){
        // this.setState({ catesList: require('../temp_json/blog_cates.json') })
        // var cates_url = sessionStorage.getItem('serverPort')+'miniblog/getAllCate';
        // fetchData(cates_url, 'get', null, response => {
        //     if(response.ifSuccess){
        //         let res = response.result;
        //         if(res.status===200){
        //             this.setState({ catesList: res.data });
        //         } else {
        //             message.warning(res.status,': ', res.msg);
        //         }
        //     }
        // })
    // }

    handleOnChange = (key) => {
        this.props.filterPosts(key || 0);
    }

    render(){
        return(
            <Select
            className="blog-type-toggler"
            showSearch
            allowClear
            placeholder={intl.get('@GENERAL.ALL')}
            onChange={this.handleOnChange}
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
                {this.state.catesList.map(item => {return <Option key={item.id} value={item.id}>{sessionStorage.getItem('lang')==='zh_TW'? item.categoryC:item.category}</Option>})}
            </Select>
        )
    };
}
