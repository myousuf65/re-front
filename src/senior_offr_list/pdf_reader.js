import React from 'react';
import { Progress, Icon } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import '../resources_component/resources_details.css';

pdfjs.GlobalWorkerOptions.workerSrc = process.env.PUBLIC_URL + '/pdf.worker.js';

export default class PDFReader extends React.Component{
  state = { 
    pdfData: null,
    docRotate: 0,
    numPages: null, 
    pageRotate: 0, 
    pageScale: 1,
    pageWidth: null, 
    pageHeight: null, 
    pageNumber: 1, 
  };

  componentWillReceiveProps(nextProps){
    console.log('this: ', this.props.pdfUrl, ' \nnext: ', nextProps.pdfUrl);
    if(nextProps.pdfUrl!==this.props.pdfUrl){
      this.setState({ pdfData: nextProps.pdfUrl? this.handlePDFParam(nextProps.pdfUrl):null })
    }
  }

  handlePDFParam=(url)=>{
    const pdfParam = {
      // url: sessionStorage.getItem('serverPort')+url,
      url: url,
      httpHeaders: {
        "accessToken": sessionStorage.getItem('accessToken'),
        "accesshost": window.location.hostname,
      }
    };
    return pdfParam;
  }

  onLoadSuccess=(pdf)=>{
    this.setState({ numPages: pdf.numPages });
    this.props.handleLoad(true);
  }

  onPageLoadSuccess=(page)=>{
    // ----rotation
    if(page.rotate){
      this.setState({ pageRotate: page.rotate });
    }else{
      this.setState({ pageRotate: 0 });
    }

    const innerWidth = window.innerWidth;

    if(innerWidth<1000){
      var pageFitWidth = innerWidth-80;
      this.setState({ pageWidth: pageFitWidth })
    }else{
      this.setState({ pageHeight: 600 });
    }
  }

  handlePage=(dir)=>{
    const {numPages, pageNumber} = this.state;

    var newPageNum = pageNumber + dir;
    if(newPageNum <= numPages && newPageNum > 0){
      this.setState({ pageNumber: newPageNum });
    }
  }

  handleRotate=(angle)=>{
    const { docRotate } = this.state;
    var newdocRotate = docRotate + angle;

    if(newdocRotate===360){
      this.setState({ docRotate: 0 });
    }else if(newdocRotate === -90 ){
      this.setState({ docRotate: 270 });
    }else{
      this.setState({ docRotate: newdocRotate });
    }
  }

  handleResetRotation=()=>{
    this.setState({ docRotate: 0 })
  }

  handleZoom=(scale)=>{
    const { pageScale } = this.state;
    var newPageScale = pageScale + scale;

    if(newPageScale<3 && newPageScale>0){
      this.setState({ pageScale: newPageScale });
    }
  }

  handleResetZoom=()=>{
    this.setState({ pageScale: 1 });
  }

  refCallback = element => {
    if(element){
        // ----height is wired
        var elementDimension = element.getBoundingClientRect();
        console.log('2---width', elementDimension.width)
        this.setState({ pdfDivWidth: elementDimension.width })
    }
  };

  render(){
    const { pdfData, pageNumber, numPages, docRotate, pageRotate, pageScale, pageHeight, pageWidth } = this.state;
    return (
      <div className="container text-center">
        <div className="customViewer" onContextMenu={(e)=>e.preventDefault()}>
          <Document
          className="customDoc"
          file={pdfData}
          // file={this.props.pdfUrl}
          externalLinkTarget="_blank" // Link target for external links rendered in annotations.
          inputRef={this.refCallback}
          loading={<PdfLoader filesize={null} />}
          onLoadSuccess={this.onLoadSuccess}
          onLoadError={(error)=>{console.log('doc-err', error.message); this.props.handleLoad(false);}}
          // onSourceSuccess   //---triger when pass data to file
          // onSourceError
          options={{
              cMapUrl: 'cmaps/',
              cMapPacked: true,
          }}
          rotate={docRotate}
          >
              <Page 
              className="customCanvas"
              pageNumber={pageNumber}
              width={pageWidth}
              height={pageHeight}
              error="Failed to load the page."
              loading={`Rendering Page ${pageNumber}...`}
              onLoadError={(error) => console.log('page-err', error.message)}
              // onLoadProgress={({ loaded, total }) => console.log('Loading a document: ' + (loaded / total) * 100 + '%')}
              // onLoadSuccess
              renderAnnotationLayer
              scale={pageScale}
              onLoadSuccess={this.onPageLoadSuccess}
              rotate={pageRotate+docRotate}
              /> 
          </Document>
        </div>

        <div className="customWrapper">
        <div className='row'>
            <div className='col-sm-4'>
                <Icon className="customPDFBtn" type="undo" onClick={()=>this.handleRotate(-90)} />
                <Icon className={docRotate!==0? "customPDFBtn":"customDisabledBtn"} type="sync" onClick={this.handleResetRotation} />
                <Icon className="customPDFBtn" type="redo" onClick={()=>this.handleRotate(90)} />
            </div>
            
            <div className='col-sm-4'>
                <Icon className={pageNumber > 1? "customPDFBtn":"customDisabledBtn"} type="left" onClick={()=>this.handlePage(-1)} />
                <h5 style={{ display: 'inline-block', color: '#fff', marginTop: 0 }}>
                    Page {numPages?pageNumber:"-"} / {numPages? numPages:"-"}
                </h5>
                <Icon className={pageNumber < numPages? "customPDFBtn":"customDisabledBtn"} type="right" onClick={()=>this.handlePage(1)} />
            </div>
            
            <div className='col-sm-4'>
                <Icon className={pageScale > 0.5? "customPDFBtn":"customDisabledBtn"} type="zoom-out" onClick={()=>this.handleZoom(-0.5)} />
                <Icon className={pageScale !== 1? "customPDFBtn":"customDisabledBtn"} type="sync" onClick={this.handleResetZoom} />
                <Icon className={pageScale < 2.5? "customPDFBtn":"customDisabledBtn"} type="zoom-in" onClick={()=>this.handleZoom(0.5)} />
            </div>
        </div>
        </div>
      </div>

    )
  }
}

class PdfLoader extends React.Component{

  state={
      successPercent: 0,
  }

  componentWillMount(){
    clearInterval(this.myinterval);
  }

  componentDidMount(){
      var filesize = this.props.filesize || 1024*600;
      var downloadSpeed = 1024*50;  //--- 50kb/s

      var timecost = filesize/downloadSpeed;
      var milestone = timecost/0.05;
      var perProg = 100/milestone;


      this.myinterval = setInterval(() => {
          if(this.state.successPercent+perProg<99.99){
              this.setState({ successPercent: this.state.successPercent+perProg });
          }else{
              this.setState({ successPercent: 99.99 });
              clearInterval(this.myinterval);
          }
      }, 50);
  }

  render(){
      const { successPercent } = this.state;

      return <Progress className="customLoader" strokeColor={{ from: '#108ee9', to: '#87d068' }} percent={ Math.round(successPercent*100)/100 } status="active" />;
  }
}