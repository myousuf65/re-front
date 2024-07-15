//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 20190521 */
//Comments //***s=]*** 


import React from 'react';
import { Icon } from 'antd';
import Slider from 'react-slick';
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

import './sel_post_gallery.css';

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "red" }}
      onClick={onClick}
    />
  );
}
  
function SamplePrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "block", background: "green" }}
      onClick={onClick}
    />
  );
}

export default class SelPostGallery extends React.Component{
    constructor(props){
      super(props);
      this.next = this.next.bind(this);
      this.previous = this.previous.bind(this);
    }

    state = { isOpen: false, photoIndex: 0, galleryList: this.props.photo_gallery };

    componentWillReceiveProps(nextProps){
      if(nextProps.photo_gallery !== null && nextProps.photo_gallery !== undefined && nextProps.photo_gallery !== this.state.galleryList ){
        this.setState({ galleryList: nextProps.photo_gallery });
      }
    }

    next() {
        this.slider.slickNext();
      }
    previous() {
        this.slider.slickPrev();
      }

    handlePreview(photoIndex) {
      this.setState({ photoIndex, isOpen: true, });
    };

    handleCancel = () => this.setState({ isOpen: false });

    render() {
      const {isOpen, galleryList, photoIndex } = this.state;
      const settings = {
          infinite: true,
          slidesToShow: galleryList.length > 5? 5: (galleryList.length > 1? (galleryList.length - 1) : 1),
          slidesToScroll: 1,
          centerMode: true,
          autoplay: true,
          speed: 2000,
          autoplaySpeed: 5000,
          pauseOnHover: true,
          arrows: false,
          vertical: true,
          verticalSwiping: false,
          nextArrow: <SampleNextArrow />,
          prevArrow: <SamplePrevArrow />,
          swipeToSlide: false,
          beforeChange: function(currentSlide, nextSlide) {
            // console.log("before change", currentSlide, nextSlide);
          },
          afterChange: function(currentSlide) {
            // console.log("after change", currentSlide); <a href={sessionStorage.getItem('serverPort')+item.ofilename }>
          }
      };
      
      return(
          <div className="sel-post-gallery">
            <Icon className="gallerybutton" type="up" onClick={this.previous} />

            <Slider className="galleryslider" ref={c => (this.slider = c)} {...settings}>
                {galleryList.map((item, index)=> (
                <div style={{ margin: '0 0' }} key={item.id}>
                  <img 
                  onClick={(e)=>this.handlePreview(index)} 
                  key={item.id}
                  src={item.src}
                  alt={item.ofilename} 
                  />
                </div>))}
            </Slider>

            <Icon className="gallerybutton" type="down" onClick={this.next} />

            <div className="blog-gallery-modal" onContextMenu={(e)=>e.preventDefault()}>
            {isOpen && (
              <Lightbox
                imagePadding={60}
                enableZoom={false}
                mainSrc={galleryList[photoIndex].src}
                nextSrc={galleryList[(photoIndex + 1) % galleryList.length].src}
                prevSrc={galleryList[(photoIndex + galleryList.length - 1) % galleryList.length].src}
                onCloseRequest={() => this.setState({ isOpen: false })}
                onMovePrevRequest={() =>
                  this.setState({
                    photoIndex: (photoIndex + galleryList.length - 1) % galleryList.length
                  })
                }
                onMoveNextRequest={() =>
                  this.setState({
                    photoIndex: (photoIndex + 1) % galleryList.length
                  })
                }
              />
            )}
            </div>
          </div>
        )
    }
}
