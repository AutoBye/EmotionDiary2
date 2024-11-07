import React from 'react';
import './testmodal.css'; // Modal 스타일

function Modal({ message, onClose }) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}

export default Modal;
