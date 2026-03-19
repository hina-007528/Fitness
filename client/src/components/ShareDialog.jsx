import React, { useState } from 'react';
import styled from 'styled-components';
import { Close, ContentCopy, Facebook, Twitter, WhatsApp, LinkedIn, Email } from '@mui/icons-material';
import { useToast } from './Toast';

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
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
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
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.text_primary + 20};
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
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
  padding: 24px;
`;

const SharePreview = styled.div`
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const PreviewTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 8px;
`;

const PreviewDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
  margin-bottom: 12px;
  line-height: 1.4;
`;

const PreviewUrl = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.primary};
  font-family: monospace;
  word-break: break-all;
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const ShareButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 12px;
  background: ${({ theme }) => theme.card};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: ${({ theme }) => theme.text_primary};

  &:hover {
    background: ${({ theme }) => theme.primary + 10};
    border-color: ${({ theme }) => theme.primary};
    transform: translateY(-2px);
  }

  &.facebook {
    color: #1877f2;
    border-color: #1877f2;
    &:hover {
      background: #1877f2 + 10;
    }
  }

  &.twitter {
    color: #1da1f2;
    border-color: #1da1f2;
    &:hover {
      background: #1da1f2 + 10;
    }
  }

  &.whatsapp {
    color: #25d366;
    border-color: #25d366;
    &:hover {
      background: #25d366 + 10;
    }
  }

  &.linkedin {
    color: #0077b5;
    border-color: #0077b5;
    &:hover {
      background: #0077b5 + 10;
    }
  }

  &.email {
    color: #ea4335;
    border-color: #ea4335;
    &:hover {
      background: #ea4335 + 10;
    }
  }

  &.copy {
    color: #666;
    border-color: #666;
    &:hover {
      background: #666 + 10;
    }
  }
`;

const ShareIcon = styled.div`
  font-size: 24px;
`;

const CopySection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const CopyInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  font-family: monospace;
`;

const CopyButton = styled.button`
  padding: 12px 16px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }

  &:disabled {
    background: ${({ theme }) => theme.text_primary + 20};
    cursor: not-allowed;
  }
`;

const ShareDialog = ({ isOpen, onClose, item, type = 'blog' }) => {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (!isOpen || !item) return null;

  const itemUrl = `${window.location.origin}/${type === 'blog' ? 'blog' : 'tutorial'}/${item.slug || item.id}`;
  const shareTitle = item.title || item.name;
  const shareDescription = item.description || item.excerpt || `Check out this ${type} on FitnessTrack!`;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: <Facebook />,
      className: 'facebook',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(itemUrl)}`, '_blank');
      }
    },
    {
      name: 'Twitter',
      icon: <Twitter />,
      className: 'twitter',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareTitle} - ${shareDescription}`)}&url=${encodeURIComponent(itemUrl)}`, '_blank');
      }
    },
    {
      name: 'WhatsApp',
      icon: <WhatsApp />,
      className: 'whatsapp',
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} - ${shareDescription} ${itemUrl}`)}`, '_blank');
      }
    },
    {
      name: 'LinkedIn',
      icon: <LinkedIn />,
      className: 'linkedin',
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(itemUrl)}`, '_blank');
      }
    },
    {
      name: 'Email',
      icon: <Email />,
      className: 'email',
      action: () => {
        const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\n${itemUrl}`)}`;
        window.location.href = emailUrl;
        toast.success('Email client opened!');
      }
    },
    {
      name: 'Copy Link',
      icon: <ContentCopy />,
      className: 'copy',
      action: () => handleCopyLink()
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(itemUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <Dialog>
        <Header>
          <Title>Share {type === 'blog' ? 'Blog' : 'Tutorial'}</Title>
          <CloseButton onClick={onClose}>
            <Close />
          </CloseButton>
        </Header>
        
        <Content>
          <SharePreview>
            <PreviewTitle>{shareTitle}</PreviewTitle>
            <PreviewDescription>{shareDescription}</PreviewDescription>
            <PreviewUrl>{itemUrl}</PreviewUrl>
          </SharePreview>

          <ShareOptions>
            {shareOptions.map((option, index) => (
              <ShareButton
                key={index}
                className={option.className}
                onClick={option.action}
              >
                <ShareIcon>{option.icon}</ShareIcon>
                <span>{option.name}</span>
              </ShareButton>
            ))}
          </ShareOptions>

          <CopySection>
            <CopyInput
              value={itemUrl}
              readOnly
            />
            <CopyButton onClick={handleCopyLink} disabled={copied}>
              <ContentCopy />
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </CopySection>
        </Content>
      </Dialog>
    </Overlay>
  );
};

export default ShareDialog;
