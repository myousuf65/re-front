//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190521 */
//Comments //***s=]*** 



import React from 'react';
import { Card, Icon, Tag, Carousel, Spin } from 'antd';
import { Link } from "react-router-dom";

import './posts_top6.css';

const IconText = ({ type, text }) => (
  <span>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

const catesList=require('../temp_json/blog_cates.json');

export default class MiniblogTopPosts extends React.Component{

    render() {
        const {posts_latest_arr, loading} = this.props;

        return(
            <Spin spinning={loading} delay={500} tip="Loading..." >
            <Carousel 
            appendDots={dots => <ul style={{ color: 'black' }}>{dots}</ul>}
            autoplay
            customPaging={i=><button style={{ background: '#000' }}>{i+1}</button>}
            autoplaySpeed={8000}
            slidesToShow={3}
            slidesToScroll={3}
            responsive={[
              {breakpoint: 1200,
                settings: {
                  autoplaySpeed: 5000,
                  slidesToShow: 2,
                  slidesToScroll: 2,
                  infinite: true,
                  dots: true
                }
              },
              {breakpoint: 767,
                settings: {
                  autoplaySpeed: 5000,
                  slidesToShow: 2,
                  slidesToScroll: 2,
                  infinite: true,
                  dots: true
                }
              },
              {breakpoint: 539,
                settings: {
                  autoplaySpeed: 2500,
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  infinite: true,
                  dots: true
                }
              }
            ]}
            >

              {posts_latest_arr.map((iPost,index)=>{return <div key={index} className="latest-blog-card"><PostCard latest_post={iPost} /></div>})}
            
            </Carousel>
            </Spin>
        )
    }
}

class PostCard extends React.Component {

    translateCateId(cateId){
      var catedescription = null;
      let iCate = catesList.filter(item=>{return item.id===cateId})
      if (iCate.length>0){
        catedescription = sessionStorage.getItem('lang')==='zh_TW'? iCate[0].categoryC:iCate[0].category;
      }
      return catedescription;
    }

    stripHtml=(description)=>{
      description = description.replace(/(\n)/g, "");  
      description = description.replace(/(\t)/g, "");  
      description = description.replace(/(\r)/g, "");  
      description = description.replace(/<\/?[^>]*>/g, "");  
      // description = description.replace(/\s*/g, "");
      if(description.length>30){
        description = description.slice(0,30) + '...';
      }
      return description;
    }

    render(){
      const iPost = this.props.latest_post;
      
      return(

      //   <div className="latest-blog-item">
      //     <h3>{top_post.post_title}</h3>
      //     <div className="latest-blog-box">
      //         <div className="latest-blog-photo" style={{ backgroundImage: top_post.cover }}>
      //             <a href="#/miniblog/details"><span>{top_post.publish_at}</span></a>
      //         </div>
      //         <a href="#/miniblog/details" className="blog-desc">{top_post.content}</a>
      //         <p className="blog-type">{top_post.category_id}</p>
      //     </div>
      //   </div>

        <Link to={`/miniblog/details/?id=${typeof(iPost.blog)==='undefined'? 0 : iPost.blog.id }`}>
          <Card
          style={{ maxWidth:'270px', alignContent:'left', margin: '5% auto' }}
          type='inner'
          bordered
          cover={<div 
            className="blog-cover" 
            style={{   
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                height: '150px',
                width: '100%' 
            }} 
            name="auth-div-img"
            data-alt='0'
            data={typeof(iPost.blog)==='undefined'? null:(iPost.blog.thumbnail)}
            alt="POSTS"
            />}
          hoverable={true}
          title={typeof(iPost.blog)==='undefined'? '':iPost.blog.postTitle}
          actions={[
            <IconText type="eye" text={typeof(iPost.blog)==='undefined'?  0 : iPost.blog.hit} />, 
            <IconText type="like" text={iPost.likes || 0}/>, 
            <IconText type="message" text={iPost.comments || 0}/>
          ]}
          >
          <Card.Meta
            description={<div dangerouslySetInnerHTML={{ __html: typeof(iPost.blog)==='undefined'? '':this.stripHtml(iPost.blog.content) }} />}
          />
          <Tag style={{ marginTop:'8px' }} color="volcano">
            {this.translateCateId(typeof(iPost.blog)==='undefined'? 0 : iPost.blog.categoryId)}
          </Tag>
        </Card>
        </Link>
      )
    }
}