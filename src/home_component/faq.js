import React from 'react';
import { Collapse, Skeleton } from 'antd';
import intl from 'react-intl-universal';

import { fetchData } from '../service/HelperService';
import './faq.css';

const { Panel } = Collapse;
export default class FAQPage extends React.Component{

  state = {
    loading: true,
    faqList: [],
  }

  componentDidMount(){
    this.getFaqList();
  }

  getFaqList = () => {
    this.setState({ loading: true });
    let getFaq_url = sessionStorage.getItem('serverPort')+"faq/"+sessionStorage.getItem("@userInfo.id");

    fetchData(getFaq_url, 'get', null, response => {
      let faqList = [];
      let faqAQ=[];
      if(response.ifSuccess){
        let res = response.result;
        if (res.status === 200&&res.data&&Array.isArray(res.data)){
          faqList = res.data;
        }
      }

      this.setState({ faqList, loading: false })
    })
  }

  getLocaleText = (zh, en) => {
    return sessionStorage.getItem('lang')==='zh_TW'? zh: en;
  }

  render() {
    const { faqList, loading } = this.state;

    const TitleStyle = {
      borderRadius: 4,
      marginBottom: 15,
      border: 0,
      overflow: 'hidden',
      fontSize: '1.2rem',
      // fontWeight: 'bold',
      color:'#0c0d0d',
    };
    const customPanelStyle = {
      // borderRadius: 4,
      // marginBottom: 10,
      // border: 0,
      overflow: 'hidden',
      fontSize: '1.2rem',
      // fontWeight: 'bold',
      color: '#007bff',
    };

    const answerStyle = {
      paddingLeft: '24px',
      fontWeight: 'normal',
      color: '#1eab85'
    }

    return (
      <div className="page-content" >
        <div className="container">
        <h2 style={{ marginBottom: '0.8rem' }}>{intl.get("@MAIN_LAYOUT.FAQ")}</h2>
        <Skeleton active paragraph={{ rows: 4 }} loading={loading}>
              <Collapse
                className="kms-faq-title"
                bordered={false}
              >
          {faqList.map(item2 => {
          const { id,   titleTc, titleEn,faqQuestion} = item2;
            return( 
           <Panel header={this.getLocaleText(titleTc, titleEn)} key={id} style={TitleStyle}>
             
            <Skeleton active paragraph={{ rows: 4 }} loading={loading}>
              <Collapse
                className="kms-faq"
                bordered={false}
              >
                {faqQuestion.map(item => {
                  const { id, questionEn, questionTc, answerEn, answerTc } = item;
                  console.log('faq js = see item ', item);
                  return (
                    <Panel header={this.getLocaleText(questionTc, questionEn)} key={id} style={customPanelStyle}>
                      <p style={answerStyle} >
                      <div dangerouslySetInnerHTML={{ __html: this.getLocaleText(answerTc, answerEn)}} />
                      </p>

                    





                    </Panel>
                  );
                })}
              </Collapse>
            </Skeleton>
           
        </Panel>
            );
       
      }) } 
        </Collapse>
       </Skeleton>
        </div>
       </div>
    )
  }

}
