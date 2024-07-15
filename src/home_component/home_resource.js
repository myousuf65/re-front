//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 0507 */
//Comments //***s=]*** 



import React from 'react';
import moment from 'moment';
import 'moment/locale/zh-tw';

moment.locale('zh-tw');
let tempPDF = process.env.PUBLIC_URL+'/images/pdf.png';
let tempVideo = process.env.PUBLIC_URL + '/images/video-home.png';

export default class HomeResource extends React.Component{

    state={ data: [] };

    componentWillReceiveProps(nextProps){
        if(!nextProps.loadingRes){
            if(nextProps.resourceData !== null && nextProps.resourceData !== undefined){
                if(nextProps.resourceData !== this.state.data){
                    this.setState({ data: nextProps.resourceData });
                }
                
            }else{
                this.setState({ data: [] });
            }
        }
    }

    render() {
        const { data } = this.state;
        
        return(
                <div className="row">
                    {data.map(item=>{
                        return (
                        <div key={item.id} className="col-md-3 col-6">
                        <div className="media-box">
                        <div className="media-thumb">
                            <a href={`#/resourcedetails/?id=${item.id}`}>
                                <div 
                                style={{   
                                    backgroundPosition: 'center',
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    height: '150px',
                                    width: 'auto',
                                    backgroundImage: `url('${item.type==="VIDEO"? tempVideo:tempPDF}')`
                                }}
                                name="auth-div-img"
                                data-alt="0"
                                data={item.thumbnail}
                                alt={item.type}
                                />
                            </a>
                            <span>{item.type}</span>
                        </div>
                        <a href={`#/resourcedetails/?id=${item.id}`}>{sessionStorage.getItem('lang')==='zh_TW'? item.titleTc:item.titleEn}</a>
                        <p>{sessionStorage.getItem('lang')==='zh_TW'? '日期':'Date'}: {moment(item.createdAt).format("YYYY-MM-DD")}</p>
                        </div>
                        </div>
                        )
                    })}
                </div>
        )
    }
}