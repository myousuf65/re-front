import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';

export const CustomZoomOutButton = props => {
    const { scale, handleZoomOut } = props;
    if (scale === 1) return <Icon className="customDisabledBtn" type="zoom-out" />;

    return (
        <Icon className="customPDFBtn" type="zoom-out" onClick={handleZoomOut} />
    );
};
CustomZoomOutButton.propTypes = {
    scale: PropTypes.number.isRequired,
    handleZoomOut: PropTypes.func.isRequired
};
export const CustomResetZoomButton = props => {
    const { scale, handleResetZoom} = props;
    if (scale === 1) return <Icon className="customDisabledBtn" type="sync" />;

    return (
        <Icon className="customPDFBtn" type="sync" onClick={handleResetZoom} />
    );
};
CustomResetZoomButton.propTypes = {
    scale: PropTypes.number.isRequired,
    handleResetZoom: PropTypes.func.isRequired
};

export const CustomZoomInButton = props => {
    const { scale, handleZoomIn } = props;
    if (scale === 3) return <Icon className="customDisabledBtn" type="zoom-in" />;

    return (
        <Icon className="customPDFBtn" type="zoom-in" onClick={handleZoomIn} />
    );
};
CustomZoomInButton.propTypes = {
    scale: PropTypes.number.isRequired,
    handleZoomIn: PropTypes.func.isRequired
};

export const CustomRotateLeftButton = props => {
    const { rotationAngle, handleRotateLeft } = props;
    if (rotationAngle === -90) return <Icon className="customDisabledBtn" type="undo" />;

    return (
      <Icon className="customPDFBtn" type="undo" onClick={handleRotateLeft} />
    );
};
CustomRotateLeftButton.propTypes = {
    rotationAngle: PropTypes.number.isRequired,
    handleRotateLeft: PropTypes.func.isRequired
};

export const CustomResetRotationButton = props => {
    const { rotationAngle, handleResetRotation } = props;
    if (rotationAngle === 0 || rotationAngle === 360) return <Icon className="customDisabledBtn" type="sync" />;

    return (
      <Icon className="customPDFBtn" type="sync" onClick={handleResetRotation} />
    );
};
CustomResetRotationButton.propTypes = {
    rotationAngle: PropTypes.number.isRequired,
    handleResetRotation: PropTypes.func.isRequired
};

export const CustomRotateRightButton = props => {
    const { rotationAngle, handleRotateRight } = props;
    if (rotationAngle === 90) return <Icon className="customDisabledBtn" type="redo" />;

    return (
      <Icon className="customPDFBtn" type="redo" onClick={handleRotateRight} />
    );
};
CustomRotateRightButton.propTypes = {
    rotationAngle: PropTypes.number.isRequired,
    handleRotateRight: PropTypes.func.isRequired
};

export const CustomPrevButton = props => {
    const { page, handlePrevClick } = props;
    if (page === 1) return <div />;

    return (
        <Icon className="customPDFBtn" type="left" onClick={handlePrevClick} />
    );
};
CustomPrevButton.propTypes = {
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    handlePrevClick: PropTypes.func.isRequired
};

export const CustomNextButton = props => {
    const { page, pages, handleNextClick } = props;
    if (page === pages) return <div />;

    return (
        <Icon className="customPDFBtn" type="right" onClick={handleNextClick} />
    );
};
CustomNextButton.propTypes = {
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    handleNextClick: PropTypes.func.isRequired
};

export const CustomPages = props => {
    const { page, pages } = props;
    return (
        <h5 style={{ display: 'inline-block', color: '#fff', marginTop: 0 }}>
            Page {page} / {pages}
        </h5>
    );
};
CustomPages.propTypes = {
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired
};

const CustomNavigation = props => {
    const { page, pages, scale, rotationAngle } = props;

    const { handlePrevClick, handleResetZoom, handleNextClick, handleZoomOut, handleZoomIn, handleRotateLeft, handleResetRotation, handleRotateRight } = props;

    return (
        <div className="customWrapper">
          <div className='row'>

            <div className='col-sm-4'>
              <CustomZoomOutButton 
              scale={scale}
              handleZoomOut={handleZoomOut}
              />
              <CustomResetZoomButton 
              scale={scale}
              handleResetZoom={handleResetZoom}
              />
              <CustomZoomInButton 
              scale={scale}
              handleZoomIn={handleZoomIn}
              />
            </div>

            <div className='col-sm-4'>
              <CustomPrevButton
                  page={page}
                  pages={pages}
                  handlePrevClick={handlePrevClick}
              />
              <CustomPages page={page} pages={pages} />
              <CustomNextButton
                  page={page}
                  pages={pages}
                  handleNextClick={handleNextClick}
              />
            </div>

            <div className='col-sm-4'>
              <CustomRotateLeftButton
              rotationAngle={rotationAngle}
              handleRotateLeft={handleRotateLeft}
              />
              <CustomResetRotationButton
              rotationAngle={rotationAngle}
              handleResetRotation={handleResetRotation}
              />
              <CustomRotateRightButton
              rotationAngle={rotationAngle}
              handleRotateRight={handleRotateRight}
              />
            </div>

          </div>
        </div>
    );
};
CustomNavigation.propTypes = {
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    scale: PropTypes.number.isRequired,
    rotationAngle: PropTypes.number.isRequired,
    handlePrevClick: PropTypes.func.isRequired,
    handleNextClick: PropTypes.func.isRequired,
    handleZoomOut: PropTypes.func.isRequired,
    handleResetZoom: PropTypes.func.isRequired,
    handleZoomIn: PropTypes.func.isRequired,
    handleRotateLeft: PropTypes.func.isRequired,
    handleResetRotation: PropTypes.func.isRequired,
    handleRotateRight: PropTypes.func.isRequired,
};

export default CustomNavigation;