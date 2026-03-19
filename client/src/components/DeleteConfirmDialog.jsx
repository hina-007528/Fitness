import React from 'react';
import styled from 'styled-components';
import { Delete, Close } from '@mui/icons-material';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Dialog = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};
  }
`;

const Content = styled.div`
  margin-bottom: 24px;
`;

const Message = styled.p`
  margin: 0 0 16px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.text_primary};
  line-height: 1.5;
`;

const Warning = styled.div`
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #d32f2f;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.cancel {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};

    &:hover {
      background: ${({ theme }) => theme.text_primary + 20};
    }
  }

  &.delete {
    background: #f44336;
    color: white;

    &:hover {
      background: #d32f2f;
    }

    &:disabled {
      background: ${({ theme }) => theme.text_primary + 20};
      cursor: not-allowed;
    }
  }
`;

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, itemName = 'item', isLoading = false }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Header>
          <Title>
            <Delete style={{ color: '#f44336' }} />
            Delete {itemName}
          </Title>
          <CloseButton onClick={onClose}>
            <Close />
          </CloseButton>
        </Header>

        <Content>
          <Message>
            Are you sure you want to delete this {itemName}? This action cannot be undone.
          </Message>
          
          <Warning>
            <WarningText>
              ⚠️ This will permanently remove the {itemName} and all associated data.
            </WarningText>
          </Warning>
        </Content>

        <Actions>
          <Button className="cancel" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className="delete" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : `Delete ${itemName}`}
          </Button>
        </Actions>
      </Dialog>
    </Overlay>
  );
};

export default DeleteConfirmDialog;
