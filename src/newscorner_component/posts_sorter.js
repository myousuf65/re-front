//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date:  20190403*/
//Comments //s=]:



import React from 'react';
import { Select, Icon } from 'antd';

const Option = Select.Option;

const current_lang = sessionStorage.getItem('lang');

const children = [
    <Option key="publish_at:desc"><Icon type="sort-descending" /> {current_lang==='zh_TW'? '最新': 'Newest'} </Option>,
    // <Option key="publish_at:asc"><Icon type="sort-ascending" /> {current_lang==='zh_TW'? '曾經': 'Oldest'} </Option>,
    // <Option key="modifiedDate:desc"><Icon type="bulb" /> {current_lang==='zh_TW'? '最新更新': 'Newest Modified'} </Option>,
    // <Option key="repliedDate:desc"><Icon type="bell" /> {current_lang==='zh_TW'? '最新回覆': 'Newest Replied'} </Option>,
    <Option key="hit:desc"><Icon type="eye" /> {current_lang==='zh_TW'? '最多瀏覽': 'Most Views'} </Option>,
    <Option key="likes:desc"><Icon type="like" /> {current_lang==='zh_TW'? '最多讚': 'Most Likes'} </Option>,
    <Option key="comments:desc"><Icon type="message" /> {current_lang==='zh_TW'? '最熱議': 'Most Comments'} </Option>,
];

export default class PostsSorter extends React.Component{

    handleOnChange = (key) => {
        this.props.sortPosts(key);
    }

    render(){
        return(
            <Select
            className="blog-sort-toggler"
            showSearch
            defaultValue="publish_at:desc"
            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            onChange={this.handleOnChange}
            >
                {children}
            </Select>
        )
    };
}
