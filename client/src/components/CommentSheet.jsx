import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Close, Person, Delete, Edit, Send, MoreVert, Mic, AttachFile, Image, Videocam, Stop } from '@mui/icons-material';
import { useToast } from './Toast';
import { addComment, updateComment, deleteComment, addReply, updateReply, deleteReply, getTutorialComments, addTutorialComment, updateTutorialComment, deleteTutorialComment, addTutorialReply, updateTutorialReply, deleteTutorialReply } from '../api';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 10000;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Sheet = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 0 20px 20px 0;
  width: 400px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    border-radius: 0;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.text_primary + 20};
  background: ${({ theme }) => theme.card};
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
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
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.text_primary + 10};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.text_primary + 30};
    border-radius: 3px;
    
    &:hover {
      background: ${({ theme }) => theme.text_primary + 50};
    }
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 12px;
  
  &.own-message {
    flex-direction: row-reverse;
  }
  
  &.other-message {
    flex-direction: row;
  }
`;

const CommentAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary + 20};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  border: 2px solid ${({ theme }) => theme.card};
`;

const CommentContent = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 70%;
  gap: 2px;
`;

const CommentBubble = styled.div`
  padding: 8px 12px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  
  &.own-message {
    background: ${({ theme }) => theme.primary};
    color: white;
    border-top-right-radius: 4px;
  }
  
  &.other-message {
    background: ${({ theme }) => theme.card};
    color: ${({ theme }) => theme.text_primary};
    border: 1px solid ${({ theme }) => theme.text_primary + 20};
    border-top-left-radius: 4px;
  }
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  margin-bottom: 2px;
`;

const CommentText = styled.div`
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  
  &.own-message {
    color: white;
  }
  
  &.other-message {
    color: ${({ theme }) => theme.text_primary};
  }
`;

const CommentMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${({ theme }) => theme.text_secondary};
  padding: 0 4px;
  
  &.own-message {
    justify-content: flex-end;
  }
  
  &.other-message {
    justify-content: flex-start;
  }
`;

const InputContainer = styled.div`
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 20};
  background: ${({ theme }) => theme.card};
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const InputWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.text_primary + 10};
  border-radius: 20px;
  padding: 8px 12px;
`;

const Input = styled.textarea`
  flex: 1;
  border: none;
  background: none;
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  min-height: 20px;
  max-height: 100px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.text_secondary};
  }
`;

const SendButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.text_primary + 20};
    cursor: not-allowed;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 12px;

  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary + 10};
  }

  &.delete {
    &:hover {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }
  }
`;

const ReplySection = styled.div`
  margin-left: 48px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReplyItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

const ReplyAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary + 20};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  flex-shrink: 0;
  font-size: 10px;
`;

const ReplyContent = styled.div`
  flex: 1;
`;

const ReplyBubble = styled.div`
  background: ${({ theme }) => theme.card};
  padding: 8px 12px;
  border-radius: 14px;
  border-top-left-radius: 4px;
  max-width: 85%;
  word-wrap: break-word;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -6px;
    width: 0;
    height: 0;
    border-top: 6px solid transparent;
    border-right: 6px solid ${({ theme }) => theme.card};
    border-bottom: 0 solid transparent;
    border-left: 0 solid transparent;
  }
`;

const ReplyAuthor = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  font-size: 12px;
  margin-bottom: 2px;
`;

const ReplyText = styled.div`
  color: ${({ theme }) => theme.text_primary};
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const ReplyTime = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 2px;
  padding-left: 2px;
`;

const ReplyActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 2px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${ReplyItem}:hover & {
    opacity: 1;
  }
`;

const ReplyAction = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  padding: 1px 3px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 10px;

  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary + 10};
  }
`;

const CommentActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${CommentItem}:hover & {
    opacity: 1;
  }
`;

const CommentTime = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 2px;
  padding-left: 4px;
`;




const InputActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const InputButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 36px;
  height: 36px;

  &:hover {
    color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary + 10};
  }

  &.send {
    background: ${({ theme }) => theme.primary};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.primary + 20};
    }

    &:disabled {
      background: ${({ theme }) => theme.text_primary + 20};
      cursor: not-allowed;
    }
  }
`;

const ReplyInputContainer = styled.div`
  margin-left: 48px;
  margin-top: 8px;
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const ReplyInput = styled.textarea`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 16px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 12px;
  min-height: 32px;
  max-height: 80px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text_secondary};
  }
`;

const ReplySendButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 28px;
  height: 28px;
  padding: 0;

  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }
`;

const EditInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.primary};
  border-radius: 18px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  min-height: 44px;
  max-height: 120px;
  resize: none;
  font-family: inherit;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.text_secondary};
  }
`;

const EditActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;

const EditButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &.save {
    background: ${({ theme }) => theme.primary};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.primary + 20};
    }
  }

  &.cancel {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};

    &:hover {
      background: ${({ theme }) => theme.text_primary + 20};
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`;

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid ${({ theme }) => theme.text_primary + 20};
  border-top: 3px solid ${({ theme }) => theme.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.text_secondary};
`;

// Media attachment styled components
const AttachmentPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const AttachmentItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  
  &.image {
    width: 80px;
    height: 80px;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &.video {
    width: 120px;
    height: 80px;
    
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  &.audio {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    min-width: 150px;
    background: ${({ theme }) => theme.primary + 10};
    
    audio {
      flex: 1;
      height: 30px;
    }
  }
`;

const RemoveAttachment = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const AttachmentMenu = styled.div`
  position: absolute;
  bottom: 60px;
  left: 16px;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1000;
`;

const AttachmentMenuItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  
  &:hover {
    background: ${({ theme }) => theme.text_primary + 10};
  }
`;

const RecordingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f44336;
  color: white;
  border-radius: 20px;
  font-size: 12px;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const CommentSheet = ({ isOpen, onClose, item, type = 'blog', token, user, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyingToReply, setReplyingToReply] = useState(null);
  
  // Media attachment states
  const [attachments, setAttachments] = useState([]);
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  const toast = useToast();

  // WhatsApp-style date formatting
  const formatDate = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffTime = Math.abs(now - commentDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return commentDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return commentDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    if (isOpen && item) {
      loadComments();
    }
  }, [isOpen, item, type]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      console.log('Loading comments for:', item); // Debug log
      console.log('Type:', type); // Debug log
      
      if (type === 'tutorial') {
        // Fetch comments from API for tutorials
        const response = await getTutorialComments(item._id);
        console.log('Tutorial comments response:', response); // Debug log
        setComments(response.data || []);
      } else {
        // Use the comments from the blog item directly
        if (item && item.comments) {
          console.log('Using comments from blog item:', item.comments); // Debug log
          setComments(item.comments);
        } else {
          console.log('No comments found in blog item, using empty array'); // Debug log
          setComments([]);
        }
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting comment:', newComment); // Debug log
      console.log('Item for comment:', item); // Debug log
      console.log('Type:', type); // Debug log
      console.log('Token:', token); // Debug log
      
      // Call the correct API based on type
      let response;
      if (type === 'tutorial') {
        response = await addTutorialComment(token, item._id, newComment);
      } else {
        response = await addComment(token, item.slug || item._id, newComment);
      }
      console.log('Comment API response:', response); // Debug log
      
      // Add the new comment to the local state
      const newCommentData = response.data || {
        id: Date.now(),
        userName: user?.name || 'Anonymous',
        content: newComment,
        createdAt: new Date(),
        userId: user?.id,
      };
      
      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      toast.success('Comment posted successfully!');
      
      // Notify parent component to update comment count
      if (onCommentAdded) {
        onCommentAdded();
      }
      
      // Update the parent component to refresh the blog data
      if (type === 'blog' && item.slug) {
        // This will trigger a refresh of the blog data in the parent
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('blogCommentAdded', { 
            detail: { blogSlug: item.slug, comment: newCommentData } 
          }));
        }, 100);
      }
      
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await updateComment(token, commentId, editText);
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: editText }
          : comment
      ));
      setEditingComment(null);
      setEditText('');
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(token, commentId);
      
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment._id);
    setReplyText('');
  };

  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) return;

    try {
      // Use correct API based on type
      let response;
      if (type === 'tutorial') {
        response = await addTutorialReply(token, commentId, replyText);
      } else {
        response = await addReply(token, commentId, replyText);
      }
      
      const newReply = response.data || {
        id: Date.now(),
        author: user?.name || 'Anonymous',
        content: replyText,
        createdAt: new Date(),
        userId: user?.id,
        parentCommentId: commentId
      };

      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      
      setReplyText('');
      setReplyingTo(null);
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Failed to add reply:', error);
      toast.error('Failed to post reply');
    }
  };

  const handleReplyEdit = async (commentId, replyId, newText) => {
    if (!newText.trim()) return;

    try {
      await updateReply(token, commentId, replyId, newText);
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === replyId ? { ...reply, content: newText } : reply
              )
            }
          : comment
      ));
      toast.success('Reply updated successfully!');
    } catch (error) {
      console.error('Failed to edit reply:', error);
      toast.error('Failed to update reply');
    }
  };

  const handleReplyDelete = async (commentId, replyId) => {
    try {
      await deleteReply(token, commentId, replyId);
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== replyId)
            }
          : comment
      ));
      toast.success('Reply deleted successfully!');
    } catch (error) {
      console.error('Failed to delete reply:', error);
      toast.error('Failed to delete reply');
    }
  };

    
  const canEditOrDelete = (comment) => {
    return user && comment.userId === user.id;
  };

  const canEditOrDeleteReply = (reply) => {
    return user && reply.userId === user.id;
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Media handling functions
  const handleFileSelect = (event, type) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const currentAttachments = replyingTo ? replyAttachments : attachments;
    const setAttachmentsFunc = replyingTo ? setReplyAttachments : setAttachments;

    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`File ${file.name} is too large. Maximum size is 50MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment = {
          id: Date.now() + Math.random(),
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'audio',
          url: e.target.result,
          file: file,
          name: file.name,
          size: file.size
        };
        setAttachmentsFunc(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset the input
    event.target.value = '';
  };

  const removeAttachment = (attachmentId) => {
    const setAttachmentsFunc = replyingTo ? setReplyAttachments : setAttachments;
    setAttachmentsFunc(prev => prev.filter(att => att.id !== attachmentId));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const attachment = {
          id: Date.now(),
          type: 'audio',
          url: url,
          blob: blob,
          name: `voice_${Date.now()}.webm`,
          size: blob.size,
          duration: recordingTime
        };

        const setAttachmentsFunc = replyingTo ? setReplyAttachments : setAttachments;
        setAttachmentsFunc(prev => [...prev, attachment]);
        setAudioBlob(blob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.info('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      setRecordingTime(0);
      toast.success('Recording stopped');
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const uploadAttachments = async (attachmentList) => {
    if (!attachmentList || attachmentList.length === 0) return [];

    const uploadedAttachments = [];
    
    for (const attachment of attachmentList) {
      if (attachment.file) {
        const formData = new FormData();
        formData.append('file', attachment.file);

        try {
          const response = await fetch('http://localhost:8080/api/upload/single', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            uploadedAttachments.push({
              type: attachment.type,
              url: `http://localhost:8080${result.data.url}`,
              filename: result.data.filename,
              originalName: result.data.originalName,
              size: result.data.size,
              duration: attachment.duration
            });
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('Error uploading attachment:', error);
          toast.error(`Failed to upload ${attachment.name}`);
        }
      } else if (attachment.blob) {
        // Handle audio blob
        const formData = new FormData();
        const audioFile = new File([attachment.blob], attachment.name, { type: 'audio/webm' });
        formData.append('file', audioFile);

        try {
          const response = await fetch('http://localhost:8080/api/upload/single', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            uploadedAttachments.push({
              type: 'audio',
              url: `http://localhost:8080${result.data.url}`,
              filename: result.data.filename,
              originalName: result.data.originalName,
              size: result.data.size,
              duration: attachment.duration
            });
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          console.error('Error uploading audio:', error);
          toast.error('Failed to upload voice recording');
        }
      }
    }

    return uploadedAttachments;
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <Sheet>
        <Header>
          <Title>Comments ({item?.commentCount || comments.length})</Title>
          <CloseButton onClick={onClose}>
            <Close />
          </CloseButton>
        </Header>

        <Content>
          {isLoading ? (
            <LoadingSpinner>
              <Spinner />
            </LoadingSpinner>
          ) : comments.length === 0 ? (
            <EmptyState>
              No comments yet. Be the first to share your thoughts!
            </EmptyState>
          ) : (
            <CommentList>
              {comments.map(comment => {
                const isOwnMessage = comment.userId === user?.id;
                return (
                  <CommentItem key={comment._id} className={isOwnMessage ? 'own-message' : 'other-message'}>
                    <CommentAvatar>
                      {(comment.userName || comment.author || 'Anonymous' || '').charAt(0).toUpperCase()}
                    </CommentAvatar>
                    <CommentContent>
                      {editingComment === comment._id ? (
                        <>
                          <EditInput
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Edit your comment..."
                            autoFocus
                          />
                          <EditActions>
                            <EditButton 
                              className="cancel" 
                              onClick={() => {
                                setEditingComment(null);
                                setEditText('');
                              }}
                            >
                              Cancel
                            </EditButton>
                            <EditButton 
                              className="save" 
                              onClick={() => handleEdit(comment._id)}
                            >
                            Save
                          </EditButton>
                        </EditActions>
                      </>
                    ) : (
                      <>
                        <CommentBubble className={isOwnMessage ? 'own-message' : 'other-message'}>
                          <CommentText className={isOwnMessage ? 'own-message' : 'other-message'}>
                            {comment.content}
                          </CommentText>
                        </CommentBubble>
                        <CommentMeta className={isOwnMessage ? 'own-message' : 'other-message'}>
                          <span>{formatDate(comment.createdAt)}</span>
                          {isOwnMessage && <span>✓✓</span>}
                        </CommentMeta>
                        <CommentTime>{formatDate(comment.createdAt)}</CommentTime>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <ReplySection>
                            {comment.replies.map(reply => (
                              <ReplyItem key={reply.id}>
                                <ReplyAvatar>
                                  {(reply.author || reply.userName || 'Anonymous' || '').charAt(0).toUpperCase()}
                                </ReplyAvatar>
                                <ReplyContent>
                                  <ReplyAuthor>{reply.author || reply.userName || 'Anonymous'}</ReplyAuthor>
                                  <ReplyBubble>
                                    <ReplyText>{reply.content}</ReplyText>
                                  </ReplyBubble>
                                  <ReplyTime>{formatDate(reply.createdAt)}</ReplyTime>
                                  {canEditOrDeleteReply(reply) && (
                                    <ReplyActions>
                                      <ReplyAction onClick={() => {
                                        setEditingComment(`reply-${comment._id}-${reply.id}`);
                                        setEditText(reply.content);
                                      }}>
                                        <Edit style={{ fontSize: '10px' }} />
                                      </ReplyAction>
                                      <ReplyAction onClick={() => handleReplyDelete(comment._id, reply.id)}>
                                        <Delete style={{ fontSize: '10px' }} />
                                      </ReplyAction>
                                    </ReplyActions>
                                  )}
                                </ReplyContent>
                              </ReplyItem>
                            ))}
                          </ReplySection>
                        )}
                        
                        {/* Reply Input */}
                        {replyingTo === comment._id && (
                          <ReplyInputContainer>
                            <ReplyInput
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              autoFocus
                            />
                            <ReplySendButton onClick={() => handleReplySubmit(comment._id)}>
                              <Send style={{ fontSize: '14px' }} />
                            </ReplySendButton>
                          </ReplyInputContainer>
                        )}
                        
                        {/* Comment Actions */}
                        <CommentActions>
                          <ActionButton onClick={() => handleReply(comment)}>
                            Reply
                          </ActionButton>
                          {canEditOrDelete(comment) && (
                            <>
                              <ActionButton onClick={() => {
                                setEditingComment(comment._id);
                                setEditText(comment.content);
                              }}>
                                <Edit style={{ fontSize: '12px' }} />
                              </ActionButton>
                              <ActionButton 
                                className="delete" 
                                onClick={() => handleDelete(comment._id)}
                              >
                                <Delete style={{ fontSize: '12px' }} />
                              </ActionButton>
                            </>
                          )}
                        </CommentActions>
                      </>
                    )}
                  </CommentContent>
                </CommentItem>
                );
              })}
            </CommentList>
          )}
        </Content>

        <InputContainer>
          <InputWrapper>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type a message..."
              maxLength={500}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </InputWrapper>
          <SendButton 
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            title="Send message"
          >
            <Send style={{ fontSize: '16px' }} />
          </SendButton>
        </InputContainer>
      </Sheet>
    </Overlay>
  );
};

export default CommentSheet;
