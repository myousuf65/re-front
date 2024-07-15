import React from 'react';
import { Result, Icon } from 'antd';


export default class LoadingPage extends React.Component {

  render(){
    const welcomeText = (
      <p>
        Welcome to CSD Knowledge Management System<br />
        歡迎到訪懲教署知識管理系統
      </p>
    )
    return(
      <div style={{
        height: '100vh',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'}}>
      <div>
        <Result
        icon={<Icon type="smile" theme="twoTone" />}
        title={welcomeText}
        />
      </div>
      </div>
    )
  }
}