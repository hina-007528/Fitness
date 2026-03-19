import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FitnessCenter, Timer, TrendingUp, PlayArrow, Visibility, Favorite, ShareOutlined, Message, Close, Add, Edit, Delete } from "@mui/icons-material";
import { getAllTutorials, getTutorialById, likeTutorial, addTutorialComment, getTutorialComments, shareTutorial, createTutorial, updateTutorialPost, deleteTutorialPost } from "../api";
import { useToast } from "../components/Toast";
import ShareDialog from "../components/ShareDialog";
import CommentSheet from "../components/CommentSheet";
import TutorialEditor from "../components/TutorialEditor";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";

const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
  background: ${({ theme }) => theme.bg};
`;

const Wrapper = styled.div`
  flex: 1;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0px 16px;
  margin-bottom: 32px;
`;

const Title = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  text-align: center;
  margin-bottom: 20px;
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 16px;
  text-align: center;
  padding: 20px;
  background: ${({ theme }) => theme.card};
  border-radius: 8px;
  border: 1px solid #ff4444;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 20px;
  background: ${({ active, theme }) => active ? theme.primary : theme.card};
  color: ${({ active, theme }) => active ? 'white' : theme.text_primary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }
`;

const TutorialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const TutorialCard = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
`;

const TutorialImage = styled.div`
 position: relative; 
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary + 40}, ${({ theme }) => theme.primary + 20});
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  ${({ videoUrl }) => videoUrl && `
    background: none;
    
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background: #000;
    }
  `}
`;

const PlayButton = styled.div`
 position: absolute;   // key change
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); // perfect centering
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const TutorialContent = styled.div`
  padding: 20px;
  position: relative;
`;

const DetailsButtonOverlay = styled.button`
  position: absolute;
  top: -40px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  
  &:hover {
    background: ${({ theme }) => theme.primary + 20};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const TutorialHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary + 20};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
`;

const TutorialTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin: 0;
  flex: 1;
  margin-left: 12px;
`;

const ViewsCount = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 12px;
`;

const TutorialMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`;

const DifficultyBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ level, theme }) => 
    level === 'beginner' ? theme.success + 20 :
    level === 'intermediate' ? theme.warning + 20 :
    theme.danger + 20
  };
  color: ${({ level, theme }) => 
    level === 'beginner' ? theme.success :
    level === 'intermediate' ? theme.warning :
    theme.danger
  };
`;

const TutorialExcerpt = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  line-height: 1.6;
  margin-bottom: 16px;
  font-size: 14px;
`;

const TutorialFooter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: start;
  padding-top: 12px;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 10};
`;

const TutorialTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.text_primary + 10};
  color: ${({ theme }) => theme.text_secondary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
`;

const ReadMoreButton = styled.button`
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.primary + 20};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.primary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 40px;
  color: ${({ theme }) => theme.text_secondary};
  
  .empty-icon {
    font-size: 80px;
    color: ${({ theme }) => theme.text_primary + 20};
    margin-bottom: 24px;
  }
  
  .empty-title {
    font-size: 24px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
    margin-bottom: 16px;
  }
  
  .empty-description {
    font-size: 16px;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .empty-action {
    margin-top: 24px;
    
    button {
      padding: 12px 24px;
      background: ${({ theme }) => theme.primary};
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
      
      &:hover {
        background: ${({ theme }) => theme.primary + 20};
      }
    }
  }
`;

const TutorialActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 80%;
  max-width: 900px;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  overflow: hidden;
`;

const VideoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => theme.primary};
  color: white;
`;

const VideoTitle = styled.h2`
  margin: 0;
  font-size: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const VideoContent = styled.div`
  padding: 20px;
`;

const VideoPlayer = styled.div`
  width: 100%;
  height: 400px;
  background: #000;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  margin-bottom: 20px;
`;

const VideoInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const VideoActions = styled.div`
  display: flex;
  gap: 16px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const CommentSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 10};
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const CommentTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.text_primary};
  font-size: 18px;
  font-weight: 600;
`;

const CommentCount = styled.span`
  background: ${({ theme }) => theme.primary + 20};
  color: ${({ theme }) => theme.primary};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
`;

const CommentList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.text_primary + 10};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.primary + 30};
    border-radius: 3px;
  }
`;

const CommentItem = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 5};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary + 20};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const CommentAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primary + 60});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

const CommentContent = styled.div`
  flex: 1;
`;

const CommentAuthor = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 4px;
  font-size: 14px;
`;

const CommentText = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 4px;
`;

const CommentTime = styled.div`
  color: ${({ theme }) => theme.text_secondary + 60};
  font-size: 12px;
`;

const CommentInput = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const CommentTextArea = styled.textarea`
  flex: 1;
  padding: 12px;
  border: 2px solid ${({ theme }) => theme.text_primary + 10};
  border-radius: 12px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  resize: none;
  min-height: 50px;
  font-family: inherit;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.primary + 10};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.text_secondary + 60};
  }
`;

const CommentSubmit = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primary + 20});
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ShareModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.card};
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  min-width: 480px;
  max-width: 90%;
  border: 1px solid ${({ theme }) => theme.text_primary + 10};
`;

const ShareHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ShareTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.text_primary};
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primary + 40});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const ShareCloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};
  }
`;

const ShareOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ShareOption = styled.button`
  padding: 20px 16px;
  background: ${({ theme }) => theme.bg};
  border: 2px solid ${({ theme }) => theme.text_primary + 10};
  border-radius: 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.text_primary};
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.primary + 10};
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ShareIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  ${props => props.facebook && `
    background: #1877f2;
    color: white;
  `}
  
  ${props => props.twitter && `
    background: #1da1f2;
    color: white;
  `}
  
  ${props => props.linkedin && `
    background: #0077b5;
    color: white;
  `}
  
  ${props => props.copy && `
    background: ${({ theme }) => theme.primary};
    color: white;
  `}
`;

const ShareUrl = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.text_primary + 10};
  border-radius: 12px;
`;

const ShareUrlInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.text_primary + 10};
  border-radius: 8px;
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text_primary};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
  
  &::selection {
    background: ${({ theme }) => theme.primary + 30};
  }
`;

const ShareUrlButton = styled.button`
  padding: 12px 20px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary}, ${({ theme }) => theme.primary + 20});
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ShareDescription = styled.p`
  color: ${({ theme }) => theme.text_secondary};
  font-size: 14px;
  margin: 0 0 20px 0;
  text-align: center;
  line-height: 1.5;
`;

const DetailsModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DetailsContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

const DetailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.text_primary + 20};
  background: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 16px 16px 0 0;
`;

const DetailsTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
`;

const DetailsContent = styled.div`
  padding: 24px;
`;

const DetailsSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.text_primary};
  font-size: 18px;
  font-weight: 600;
`;

const SectionContent = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  line-height: 1.6;
  font-size: 16px;
`;

const StepsList = styled.ol`
  margin: 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 12px;
    line-height: 1.6;
    color: ${({ theme }) => theme.text_secondary};
  }
`;

const EquipmentList = styled.ul`
  margin: 0;
  padding-left: 20px;
  
  li {
    margin-bottom: 8px;
    color: ${({ theme }) => theme.text_secondary};
  }
`;

const DetailsMeta = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.text_primary + 10};
  border-radius: 20px;
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`;

const DetailsActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 20};
`;

const DetailsButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.primary {
    background: ${({ theme }) => theme.primary};
    color: white;
    
    &:hover {
      background: ${({ theme }) => theme.primary + 20};
    }
  }
  
  &.secondary {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};
    
    &:hover {
      background: ${({ theme }) => theme.text_primary + 20};
    }
  }
`;

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedTutorials, setLikedTutorials] = useState(new Set());
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tutorialToDelete, setTutorialToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTutorialForDetails, setSelectedTutorialForDetails] = useState(null);
  
  const toast = useToast();
  
  // Get token from localStorage or use mock for development
  const getToken = () => {
    const storedToken = localStorage.getItem('fittrack-app-token');
    if (storedToken) {
      return storedToken;
    }
    // For development, return a mock JWT-like token
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMSIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTY5NTEyMzIwMCwiZXhwIjo5OTk5OTk5OTk5fQ.mocksignature';
  };
  
  // Mock user - in real app this would come from auth context
  const user = { id: 'user1', name: 'John Doe', token: getToken() };

  useEffect(() => {
    fetchTutorials();
  }, [selectedFilter, selectedCategory]);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (selectedFilter !== 'all') filters.difficulty = selectedFilter;
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      
      console.log('Fetching tutorials with filters:', filters); // Debug log
      console.log('API URL:', process.env.REACT_APP_API_URL || 'http://localhost:8080/api/'); // Debug log
      
      const response = await getAllTutorials(filters);
      console.log('Tutorials API response:', response); // Debug log
      
      // Ensure we always set an array, even if response is unexpected
      const tutorialsData = response && Array.isArray(response) ? response : 
                           response && Array.isArray(response.data) ? response.data : [];
      
      setTutorials(tutorialsData);
      console.log('Tutorials data set:', tutorialsData.length, 'tutorials loaded');
    } catch (err) {
      setError('Failed to load tutorials. Please try again.');
      console.error('Error fetching tutorials:', err);
      console.error('Error details:', err.response?.data || err.message); // Debug log
      setTutorials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (tutorial) => {
    setSelectedTutorialForDetails(tutorial);
    setDetailsDialogOpen(true);
  };

  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedTutorialForDetails(null);
  };

  const handleTutorialClick = async (tutorial) => {
    try {
      console.log('Tutorial clicked:', tutorial); // Debug log
      console.log('Tutorial ID:', tutorial._id); // Debug log
      console.log('Tutorial id:', tutorial.id); // Debug log
      console.log('Tutorial keys:', Object.keys(tutorial)); // Debug log
      
      const response = await getTutorialById(tutorial._id);
      setSelectedTutorial(response.data);
      setShowVideoModal(true);
      
      // Load real comments from backend
      try {
        const commentsResponse = await getTutorialComments(tutorial._id);
        setComments(commentsResponse.data || []);
      } catch (commentErr) {
        console.error('Error loading comments:', commentErr);
        setComments([]);
      }
    } catch (err) {
      console.error('Error viewing tutorial:', err);
    }
  };

  const handleLike = async (tutorialId) => {
    const token = localStorage.getItem("fittrack-app-token");
    if (!token) {
      toast.error('Please sign in to like tutorials');
      return;
    }

    try {
      const response = await likeTutorial(token, tutorialId);
      
      // Update local state
      setTutorials(Array.isArray(tutorials) ? tutorials.map(tutorial => 
        tutorial._id === tutorialId 
          ? { ...tutorial, likes: response.data.likes }
          : tutorial
      ) : []);

      // Update liked tutorials set
      const newLikedTutorials = new Set(likedTutorials);
      if (response.data.liked) {
        newLikedTutorials.add(tutorialId);
        toast.success('Tutorial liked successfully!');
      } else {
        newLikedTutorials.delete(tutorialId);
        toast.success('Like removed');
      }
      setLikedTutorials(newLikedTutorials);

      // Update selected tutorial if in modal
      if (selectedTutorial && selectedTutorial._id === tutorialId) {
        setSelectedTutorial({ ...selectedTutorial, likes: response.data.likes });
      }
    } catch (error) {
      console.error('Error liking tutorial:', error);
      toast.error('Failed to like tutorial');
    }
  };

  const handleShare = (tutorial) => {
    console.log('Share clicked for tutorial:', tutorial);
    setCurrentTutorial(tutorial);
    setShareDialogOpen(true);
  };

  const handleCommentAdded = () => {
    // Update the current tutorial's comment count
    if (currentTutorial) {
      setCurrentTutorial(prev => ({
        ...prev,
        commentCount: (prev.commentCount || 0) + 1
      }));
      
      // Also update the tutorial in the list
      setTutorials(prev => prev.map(tutorial => 
        tutorial._id === currentTutorial._id 
          ? { ...tutorial, commentCount: (tutorial.commentCount || 0) + 1 }
          : tutorial
      ));
    }
  };

  const handleViewComments = (tutorial) => {
    console.log('Comments clicked for tutorial:', tutorial);
    setCurrentTutorial(tutorial);
    setCommentSheetOpen(true);
  };

  const handleCreateTutorial = () => {
    setEditingTutorial(null);
    setEditorOpen(true);
  };

  const handleEditTutorial = (tutorial) => {
    setEditingTutorial(tutorial);
    setEditorOpen(true);
  };

  const handleTutorialSave = (savedTutorial) => {
    if (savedTutorial) {
      fetchTutorials();
    }
    setEditorOpen(false);
    setEditingTutorial(null);
  };

  const handleDeleteTutorial = async (tutorial) => {
    setTutorialToDelete(tutorial);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTutorial = async () => {
    if (!tutorialToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteTutorialPost(user.token, tutorialToDelete._id);
      toast.success('Tutorial deleted successfully!');
      fetchTutorials();
      setDeleteDialogOpen(false);
      setTutorialToDelete(null);
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      toast.error('Failed to delete tutorial');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareToSocial = async (platform) => {
    const token = localStorage.getItem("fittrack-app-token");
    
    try {
      // Track share in backend if user is logged in
      if (token && selectedTutorial) {
        await shareTutorial(token, selectedTutorial._id, platform);
      }

      // Open social media share dialog
      const url = window.location.href;
      const text = `Check out this tutorial: ${selectedTutorial?.title}`;
      
      let shareUrl = '';
      switch(platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }
      setShowShareModal(false);
    } catch (err) {
      console.error('Error sharing tutorial:', err);
      // Still open share dialog even if backend tracking fails
      const url = window.location.href;
      const text = `Check out this tutorial: ${selectedTutorial?.title}`;
      
      let shareUrl = '';
      switch(platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
          break;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank');
      }
      setShowShareModal(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareModal(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const token = localStorage.getItem("fittrack-app-token");
    if (!token) {
      alert('Please sign in to comment');
      return;
    }

    try {
      const response = await addTutorialComment(token, selectedTutorial._id, newComment);
      
      // Add comment to local state
      setComments([...comments, response.data]);
      setNewComment('');
      
      // Update tutorial comment count
      setTutorials(Array.isArray(tutorials) ? tutorials.map(tutorial => 
        tutorial._id === selectedTutorial._id 
          ? { ...tutorial, comments: [...(tutorial.comments || []), response.data] }
          : tutorial
      ) : []);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  };

  const closeModal = () => {
    setShowVideoModal(false);
    setSelectedTutorial(null);
    setComments([]);
    setNewComment('');
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <LoadingSpinner>
            <div>Loading tutorials...</div>
          </LoadingSpinner>
        </Wrapper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Wrapper>
          <ErrorMessage>{error}</ErrorMessage>
        </Wrapper>
      </Container>
    );
  }

  return (
    <Container>
      <Wrapper>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title>Professional Fitness Tutorials</Title>
          <button
            onClick={handleCreateTutorial}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#1976D2';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#2196F3';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <Add />
            Create Tutorial
          </button>
        </div>
        
        <FilterBar>
            <FilterButton 
              active={selectedFilter === 'all'} 
              onClick={() => setSelectedFilter('all')}
            >
              All Levels
            </FilterButton>
            <FilterButton 
              active={selectedFilter === 'beginner'} 
              onClick={() => setSelectedFilter('beginner')}
            >
              Beginner
            </FilterButton>
            <FilterButton 
              active={selectedFilter === 'intermediate'} 
              onClick={() => setSelectedFilter('intermediate')}
            >
              Intermediate
            </FilterButton>
            <FilterButton 
              active={selectedFilter === 'advanced'} 
              onClick={() => setSelectedFilter('advanced')}
            >
              Advanced
            </FilterButton>
        </FilterBar>

        <TutorialGrid>
          {Array.isArray(tutorials) && tutorials.map((tutorial) => (
            <TutorialCard 
              key={tutorial._id || tutorial.id} 
              onClick={() => handleTutorialClick(tutorial)}
            >
              <TutorialImage videoUrl={tutorial.videoUrl}>
                {tutorial.videoUrl ? (
                  <video 
                    src={tutorial.videoUrl}
                    muted
                    preload="metadata"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain' ,
                      background: '#000',
                    }}
                  />
                ) : null}
                <PlayButton>
                  <PlayArrow />
                </PlayButton>
              </TutorialImage>
              <TutorialContent>
                <DetailsButtonOverlay onClick={(e) => { e.stopPropagation(); handleViewDetails(tutorial); }}>
                  <Visibility style={{ fontSize: '14px' }} />
                  View Details
                </DetailsButtonOverlay>
               
                <TutorialHeader>
                  <IconWrapper>
                    <FitnessCenter />
                  </IconWrapper>
                  <TutorialTitle>{tutorial.title}</TutorialTitle>
                </TutorialHeader>
                
                <TutorialMeta>
                  <DifficultyBadge level={tutorial.difficulty}>
                    {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
                  </DifficultyBadge>
                  <ViewsCount>
                    <Visibility style={{ fontSize: '16px' }} />
                    {tutorial.views || 0}
                  </ViewsCount>
                </TutorialMeta>

                <TutorialExcerpt>
                  {tutorial.content ? tutorial.content.substring(0, 100) + '...' : 'No description available'}
                </TutorialExcerpt>

                {tutorial.steps && tutorial.steps.length > 0 && (
                  <div>
                    <strong>Key Points:</strong>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                      {tutorial.steps.slice(0, 3).map((step, index) => (
                        <li key={index} style={{ fontSize: '13px', marginBottom: '4px' }}>
                          {step.length > 60 ? step.substring(0, 60) + '...' : step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <TutorialFooter>
                  <TutorialTags>
                    {tutorial.tags && tutorial.tags.slice(0, 3).map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                    {tutorial.duration && <Tag>{tutorial.duration}</Tag>}
                  </TutorialTags>
                  <TutorialActions>
                    {/* <ActionButton onClick={(e) => { e.stopPropagation(); handleViewDetails(tutorial); }}>
                      <Visibility style={{ fontSize: '16px' }} />
                      View Details
                    </ActionButton> */}
                    <ActionButton onClick={(e) => { e.stopPropagation(); handleLike(tutorial._id); }}>
                      <Favorite style={{ fontSize: '16px', color: likedTutorials.has(tutorial._id) ? '#e91e63' : 'inherit' }} />
                      {tutorial.likes || 0}
                    </ActionButton>
                    <ActionButton onClick={(e) => { e.stopPropagation(); handleShare(tutorial); }}>
                      <ShareOutlined style={{ fontSize: '16px' }} />
                      Share
                    </ActionButton>
                    <ActionButton onClick={(e) => { e.stopPropagation(); handleViewComments(tutorial); }}>
                      <Message style={{ fontSize: '16px' }} />
                      {tutorial.commentCount || 0}
                    </ActionButton>
                    {tutorial.authorId === user.id || true && ( // Show for demo - remove || true in production
                      <>
                        <ActionButton onClick={(e) => { e.stopPropagation(); handleEditTutorial(tutorial); }}>
                          <Edit style={{ fontSize: '16px' }} />
                        
                        </ActionButton>
                        <ActionButton 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleDeleteTutorial(tutorial);
                          }} 
                          className="delete"
                        >
                          <Delete style={{ fontSize: '16px' }} />
                    
                        </ActionButton>
                      </>
                    )}
                  </TutorialActions>
                </TutorialFooter>
              </TutorialContent>
            </TutorialCard>
          ))}
        </TutorialGrid>

        {tutorials.length === 0 && !loading && (
          <EmptyState>
            <div className="empty-icon">📚</div>
            <div className="empty-title">No Tutorials Found</div>
            <div className="empty-description">
              {selectedFilter !== 'all' || selectedCategory !== 'all' 
                ? "No tutorials match your current filters. Try adjusting your criteria."
                : "No tutorials are available at the moment. Check back soon for new fitness content!"
              }
            </div>
            {(selectedFilter !== 'all' || selectedCategory !== 'all') && (
              <div className="empty-action">
                <button onClick={() => {
                  setSelectedFilter('all');
                  setSelectedCategory('all');
                }}>
                  Clear Filters
                </button>
              </div>
            )}
          </EmptyState>
        )}

        {/* Video Modal */}
        {showVideoModal && selectedTutorial && (
          <VideoModal onClick={closeModal}>
            <VideoContainer onClick={(e) => e.stopPropagation()}>
              <VideoHeader>
                <VideoTitle>{selectedTutorial.title}</VideoTitle>
                <CloseButton onClick={closeModal}>
                  <Close />
                </CloseButton>
              </VideoHeader>
              <VideoContent>
                <VideoPlayer>
                  {selectedTutorial.videoUrl ? (
                    <video 
                      controls 
                      style={{ width: '100%', maxHeight: '400px' }}
                      src={selectedTutorial.videoUrl}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div>
                      <PlayArrow style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <div>Video coming soon</div>
                      <div style={{ fontSize: '14px', opacity: 0.7 }}>
                        No video available for this tutorial
                      </div>
                    </div>
                  )}
                </VideoPlayer>
                
                <VideoInfo>
                  <div>
                    <strong>Duration:</strong> {selectedTutorial.duration || 'N/A'}
                  </div>
                  <VideoActions>
                    <ActionButton onClick={() => handleLike(selectedTutorial._id)}>
                      <Favorite style={{ fontSize: '16px', color: likedTutorials.has(selectedTutorial._id) ? '#e91e63' : 'inherit' }} />
                      {selectedTutorial.likes || 0}
                    </ActionButton>
                    <ActionButton onClick={() => handleShare(selectedTutorial)}>
                      <ShareOutlined style={{ fontSize: '16px' }} />
                      Share
                    </ActionButton>
                    <ActionButton onClick={() => handleViewComments(selectedTutorial)}>
                      <Message style={{ fontSize: '16px' }} />
                      {selectedTutorial.commentCount || 0}
                    </ActionButton>
                  </VideoActions>
                </VideoInfo>

           

              
              </VideoContent>
            </VideoContainer>
          </VideoModal>
        )}

        {/* Share Modal */}
        {showShareModal && (
          <VideoModal onClick={() => setShowShareModal(false)}>
            <ShareModal onClick={(e) => e.stopPropagation()}>
              <ShareHeader>
                <ShareTitle>Share This Tutorial</ShareTitle>
                <ShareCloseButton onClick={() => setShowShareModal(false)}>
                  <Close />
                </ShareCloseButton>
              </ShareHeader>
              
              <ShareDescription>
                Help others discover this amazing tutorial by sharing it on your favorite platforms
              </ShareDescription>
              
              <ShareOptions>
                <ShareOption onClick={() => handleShareToSocial('facebook')}>
                  <ShareIcon facebook>f</ShareIcon>
                  Facebook
                </ShareOption>
                <ShareOption onClick={() => handleShareToSocial('twitter')}>
                  <ShareIcon twitter>𝕏</ShareIcon>
                  Twitter
                </ShareOption>
                <ShareOption onClick={() => handleShareToSocial('linkedin')}>
                  <ShareIcon linkedin>in</ShareIcon>
                  LinkedIn
                </ShareOption>
                <ShareOption onClick={handleCopyLink}>
                  <ShareIcon copy>🔗</ShareIcon>
                  Copy Link
                </ShareOption>
              </ShareOptions>
              
              <ShareUrl>
                <ShareUrlInput 
                  value={window.location.href}
                  readOnly
                />
                <ShareUrlButton onClick={handleCopyLink}>
                  Copy URL
                </ShareUrlButton>
              </ShareUrl>
            </ShareModal>
          </VideoModal>
        )}
      </Wrapper>
      
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        item={currentTutorial}
        type="tutorial"
      />
      
      <CommentSheet
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        item={currentTutorial}
        type="tutorial"
        token={user.token}
        user={user}
        onCommentAdded={handleCommentAdded}
      />
      
      <TutorialEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        tutorial={editingTutorial}
        onSave={handleTutorialSave}
        token={user.token}
      />
      
      {detailsDialogOpen && selectedTutorialForDetails && (
        <DetailsModal onClick={closeDetailsDialog}>
          <DetailsContainer onClick={(e) => e.stopPropagation()}>
            <DetailsHeader>
              <DetailsTitle>{selectedTutorialForDetails.title}</DetailsTitle>
              <CloseButton onClick={closeDetailsDialog}>
                <Close />
              </CloseButton>
            </DetailsHeader>
            <DetailsContent>
              <DetailsMeta>
                <MetaItem>
                  <Timer style={{ fontSize: '16px' }} />
                  {selectedTutorialForDetails.duration || 'N/A'}
                </MetaItem>
                <MetaItem>
                  <DifficultyBadge level={selectedTutorialForDetails.difficulty}>
                    {selectedTutorialForDetails.difficulty?.charAt(0).toUpperCase() + selectedTutorialForDetails.difficulty?.slice(1)}
                  </DifficultyBadge>
                </MetaItem>
                <MetaItem>
                  <FitnessCenter style={{ fontSize: '16px' }} />
                  {selectedTutorialForDetails.category || 'N/A'}
                </MetaItem>
              </DetailsMeta>

              {selectedTutorialForDetails.description && (
                <DetailsSection>
                  <SectionTitle>Description</SectionTitle>
                  <SectionContent>{selectedTutorialForDetails.description}</SectionContent>
                </DetailsSection>
              )}

              {selectedTutorialForDetails.content && (
                <DetailsSection>
                  <SectionTitle>Full Content</SectionTitle>
                  <SectionContent>{selectedTutorialForDetails.content}</SectionContent>
                </DetailsSection>
              )}

              {selectedTutorialForDetails.steps && selectedTutorialForDetails.steps.length > 0 && (
                <DetailsSection>
                  <SectionTitle>Steps</SectionTitle>
                  <StepsList>
                    {selectedTutorialForDetails.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </StepsList>
                </DetailsSection>
              )}

              {selectedTutorialForDetails.equipment && selectedTutorialForDetails.equipment.length > 0 && (
                <DetailsSection>
                  <SectionTitle>Equipment Needed</SectionTitle>
                  <EquipmentList>
                    {selectedTutorialForDetails.equipment.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </EquipmentList>
                </DetailsSection>
              )}

              {selectedTutorialForDetails.tags && selectedTutorialForDetails.tags.length > 0 && (
                <DetailsSection>
                  <SectionTitle>Tags</SectionTitle>
                  <TutorialTags>
                    {selectedTutorialForDetails.tags.map((tag, index) => (
                      <Tag key={index}>{tag}</Tag>
                    ))}
                  </TutorialTags>
                </DetailsSection>
              )}
            </DetailsContent>
            <DetailsActions>
              <DetailsButton className="secondary" onClick={closeDetailsDialog}>
                Close
              </DetailsButton>
              <DetailsButton 
                className="primary" 
                onClick={() => {
                  closeDetailsDialog();
                  handleTutorialClick(selectedTutorialForDetails);
                }}
              >
                Play Video
              </DetailsButton>
            </DetailsActions>
          </DetailsContainer>
        </DetailsModal>
      )}
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setTutorialToDelete(null);
        }}
        onConfirm={confirmDeleteTutorial}
        itemName="tutorial"
        isLoading={isDeleting}
      />
    </Container>
  );
};

export default Tutorials;
