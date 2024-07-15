//** This is a temp for s=] to use */
//** Arthor: s=] */
//** Date: 0507 */
//Comments //***s=]*** 



import React from 'react';
import intl from 'react-intl-universal';
import {LazyLoadImage} from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

const learningTopic = sessionStorage.getItem('photo')+ 'weekly-selflearning.jpg';

export default class LearningTopic extends React.Component{

    onClick=()=>{
        this.props.handleCateShortcut(10776);
    }

    render() {

        return(
            <div className="weekly-topic">
                {/* eslint-disable-next-line */}
                <a onClick={this.onClick}>
                    <LazyLoadImage alt="weekly topic" effect="black-and-white" src={learningTopic} /> 
                    {/* <img alt="weekly topic" src={learningTopic} /> */}
                    <div className="weekly-topic-words">
                        <h2>{intl.get('@LEARNING_TOPIC.WEEKLY')}</h2>
                        <p>{intl.get('@LEARNING_TOPIC.TOPICS')}</p>
                    </div>
                </a>
            </div>
        )
    }
}