import React from 'react';
import ReactDOM from 'react-dom';
import { Input, Button, message } from 'antd';
import ReactHlsPlayer from 'react-hls-player';
import { fetchData } from '../service/HelperService.js';

export default class WowzaHome extends React.Component{

    state = { 
        mediaUrl1: 'http://192.168.1.32:1935/vod/mp4:sample.mp4/playlist.m3u8',
        mediaLink1: '',
        mediaUrl2: 'wowza.mp4',
        mediaLink2: '',
        prefix: 'wowzatoken',
        sharedSecret: '12345',
        playing: false
    };

    componentDidMount(){
        

    }

    handleSubmit1 = async () => {
        const { mediaUrl1 } = this.state;
        const userId = sessionStorage.getItem('@userInfo.id');
    
        const values = {
          'media_url': mediaUrl1,
      };

        this.setState(state=>({ loading: true }));
        let intl_url = sessionStorage.getItem('serverPort')+'/wowza/getFullLink/'+userId;
        fetchData(intl_url, 'post', values, response=>{
            if(response.ifSuccess){
                let res = response.result;
                if(res.status===200){
                    this.setState(state=>({
                        mediaLink1:res.data
                    }));
                } else {
                    message.warning(res.status+': '+ res.msg);
                };
            }else{
              this.setState(state=>({ loading: false }));
            }
        });
    };

    handleSubmit2 = async () => {
      const { mediaUrl2,prefix,sharedSecret } = this.state;
      const userId = sessionStorage.getItem('@userInfo.id');
  
      const values = {
        'media_url': mediaUrl2,
        'prefix':prefix ,
        'sharedSecret':sharedSecret
    };

      this.setState(state=>({ loading: true }));
      let intl_url = sessionStorage.getItem('serverPort')+'/wowza/getFullLinkToken/'+userId;
      //let intl_url = sessionStorage.getItem('serverPort')+'wowza/stream/'+mediaUrl2;
      fetchData(intl_url, 'post', values, response=>{
          if(response.ifSuccess){
              let res = response.result;
              if(res.status===200){
                  this.setState(state=>({
                      mediaLink2:res.data
                  }));
              } else {
                  message.warning(res.status+': '+ res.msg);
              };
          }else{
            this.setState(state=>({ loading: false }));
          }
      });
  };
    
    handleMediaUrlChange1 = (event) => {
        this.setState({ mediaUrl1: event.target.value });
    };

    handleMediaUrlChange2 = (event) => {
      this.setState({ mediaUrl2: event.target.value });
  };

  handlePrefixChange = (e) => {
    this.setState({ prefix: e.target.value });
  };

  handleSharedSecretChange = (e) => {
    this.setState({ sharedSecret: e.target.value });
  };

  handleOnReady=()=>{
    setTimeout(() => this.setState({ playing: true }), 100);
  }
    
    render() {
        const { playing, mediaUrl1, mediaLink1, mediaUrl2, mediaLink2, prefix, sharedSecret } = this.state;
       

        return(
            <div>
              <Input value={mediaUrl1} onChange={this.handleMediaUrlChange1} placeholder="Enter media URL" style={{width:'1000px'}}/>
              <Button onClick={this.handleSubmit1}>Submit</Button>
      
              <div>
                  <ReactHlsPlayer
                    src={mediaLink1} 
                    autoPlay={false}
                    controls={true}
                    width="500"
                    height="auto"
                  />
                </div>

              <Input value={mediaUrl2} onChange={this.handleMediaUrlChange2} placeholder="Enter media URL" style={{width:'1000px'}}/>
              <Input
                value={prefix}
                onChange={this.handlePrefixChange}
                placeholder="Enter prefix"
                style={{ width: '1000px' }}
              />
              <Input
                value={sharedSecret}
                onChange={this.handleSharedSecretChange}
                placeholder="Enter shared secret"
                style={{ width: '1000px' }}
              />
              <Button onClick={this.handleSubmit2}>Submit</Button>

              <div>
                <ReactHlsPlayer
                  src={mediaLink2}
                  onContextMenu={e => e.preventDefault()} 
                  playing={playing}
                  autoPlay={false}
                  controls={true}
                  width="500"
                  height="auto"
                  config={{ 
                    file: { 
                        attributes: {
                            controlsList: 'nodownload',
                            autoPlay: true,
                            // muted: this.handleChromeAutoPlay()
                        } 
                    } 
                  }}
                />
              </div>
            </div>
        );
    };
}
