import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const spinnerContent = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <Spinner animation="border" variant="primary" role="status" className="mb-3">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="text-muted small fw-medium mb-0">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div 
        className="d-flex align-items-center justify-content-center vh-100 bg-white bg-opacity-75 position-fixed top-0 start-0 w-100" 
        style={{ zIndex: 9999 }}
      >
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
