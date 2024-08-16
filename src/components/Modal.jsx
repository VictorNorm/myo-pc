import React from 'react';

const Modal = ({ show, handleClose, children }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {children}
        {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
        <button onClick={handleClose} className='cta-1'>OK</button>
      </div>
    </div>
  );
};

export default Modal;
