import React, { useEffect, useState, createContext, useContext } from 'react';
import styled from 'styled-components';
import { CheckCircle, Error, Info, Close } from '@mui/icons-material';

const StyledToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ToastWrapper = styled.div`
  min-width: 300px;
  max-width: 400px;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  border-left: 4px solid ${({ type }) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'info': return '#2196F3';
      default: return '#2196F3';
    }
  }};
  animation: slideIn 0.3s ease-out;
  transition: all 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  &.removing {
    animation: slideOut 0.3s ease-out;
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

const ToastIcon = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#f44336';
      case 'info': return '#2196F3';
      default: return '#2196F3';
    }
  }};
  flex-shrink: 0;
`;

const ToastMessage = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.4;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const Toast = ({ toast, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRemoving(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle />;
      case 'error':
        return <Error />;
      case 'info':
        return <Info />;
      default:
        return <Info />;
    }
  };

  return (
    <ToastWrapper type={toast.type} className={isRemoving ? 'removing' : ''}>
      <ToastIcon type={toast.type}>
        {getIcon()}
      </ToastIcon>
      <ToastMessage>{toast.message}</ToastMessage>
      <ToastClose onClick={handleClose}>
        <Close />
      </ToastClose>
    </ToastWrapper>
  );
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <StyledToastContainer>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </StyledToastContainer>
  );
};

// Toast context for easy usage throughout the app
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = {
    success: (message, duration) => addToast(message, 'success', duration),
    error: (message, duration) => addToast(message, 'error', duration),
    info: (message, duration) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <StyledToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
