import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Close, Save, Delete, Add, Remove, Videocam } from '@mui/icons-material';
import { createTutorial, updateTutorialPost, deleteTutorialPost, getTutorialByIdForEdit } from '../api';
import { useToast } from './Toast';

// Upload helper for videos
const uploadVideo = async (token, file) => {
  console.log('Starting video upload for file:', file.name, 'size:', file.size);
  const formData = new FormData();
  formData.append('file', file);
  
  const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:8080/api').replace(/\/$/, '');
  const response = await fetch(`${apiBase}/upload/single`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  console.log('Video upload response status:', response.status);
  
  if (!response.ok) {
    console.error('Video upload failed with status:', response.status);
    const errorText = await response.text();
    console.error('Error response:', errorText);
    throw new Error('Video upload failed');
  }
  
  const result = await response.json();
  console.log('Video upload result:', result);
  return result.data.url;
};

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

const EditorContainer = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
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
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 20};
  margin-top: auto;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &.save {
    background: ${({ theme }) => theme.primary};
    color: white;
    &:hover {
      background: ${({ theme }) => theme.primary + 20};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    &:disabled {
      background: ${({ theme }) => theme.text_primary + 20};
      cursor: not-allowed;
      transform: none;
    }
  }

  &.delete {
    background: #f44336;
    color: white;
    &:hover {
      background: #d32f2f;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(244, 67, 54, 0.15);
    }
  }

  &.cancel {
    background: ${({ theme }) => theme.text_primary + 10};
    color: ${({ theme }) => theme.text_primary};
    &:hover {
      background: ${({ theme }) => theme.text_primary + 20};
      transform: translateY(-2px);
    }
  }

  &.add {
    background: #2196F3;
    color: white;
    &:hover {
      background: #1976D2;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(33, 150, 243, 0.15);
    }
  }

  &.remove {
    background: #FF9800;
    color: white;
    &:hover {
      background: #F57C00;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(255, 152, 0, 0.15);
    }
  }
`;

const Content = styled.div`
  padding: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StepItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StepInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const EquipmentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EquipmentItem = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const EquipmentInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.text_primary + 20};
  border-radius: 8px;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const CharCount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary};
  text-align: right;
`;

const TutorialEditor = ({ isOpen, onClose, tutorial, onSave, token, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    difficulty: 'beginner',
    duration: '30 min',
    category: 'fitness',
    tags: '',
    equipment: [''],
    steps: [''],
    imageUrl: '',
    videoUrl: '',
    author: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (tutorial && isOpen) {
      setIsLoading(true);
      loadTutorialData();
    } else if (isOpen) {
      // Reset form for new tutorial
      setFormData({
        title: '',
        description: '',
        content: '',
        difficulty: 'beginner',
        duration: '30 min',
        category: 'fitness',
        tags: '',
        equipment: [''],
        steps: [''],
        imageUrl: '',
        videoUrl: '',
        author: ''
      });
    }
  }, [tutorial, isOpen]);

  const loadTutorialData = async () => {
    try {
      const response = await getTutorialByIdForEdit(tutorial._id);
      const tutorialData = response.data;
      setFormData({
        title: tutorialData.title || '',
        description: tutorialData.description || '',
        content: tutorialData.content || '',
        difficulty: tutorialData.difficulty || 'beginner',
        duration: tutorialData.duration || '30 min',
        category: tutorialData.category || 'fitness',
        tags: tutorialData.tags ? tutorialData.tags.join(', ') : '',
        equipment: tutorialData.equipment || [''],
        steps: tutorialData.steps || [''],
        imageUrl: tutorialData.imageUrl || '',
        videoUrl: tutorialData.videoUrl || '',
        author: tutorialData.author || ''
      });
    } catch (error) {
      console.error('Error loading tutorial data:', error);
      toast.error('Failed to load tutorial data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStepChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }));
  };

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const removeStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleEquipmentChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.map((item, i) => i === index ? value : item)
    }));
  };

  const addEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, '']
    }));
  };

  const removeEquipment = (index) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index)
    }));
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Video file selected:', file); // Debug log
    console.log('File type:', file.type); // Debug log
    console.log('File size:', file.size); // Debug log

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('Video file must be less than 50MB');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('Starting video upload...'); // Debug log
      const videoUrl = await uploadVideo(token, file);
      console.log('Video upload successful, URL:', videoUrl); // Debug log
      setFormData(prev => ({
        ...prev,
        videoUrl: videoUrl
      }));
      toast.success('Video uploaded successfully!');
    } catch (error) {
      console.error('Video upload error:', error); // Debug log
      toast.error(`Video upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveVideo = () => {
    setFormData(prev => ({
      ...prev,
      videoUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const tutorialData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        equipment: formData.equipment.filter(item => item.trim()),
        steps: formData.steps.filter(step => step.trim()),
        // Ensure required fields are present
        author: user?.name || 'Anonymous',
        publishedAt: new Date().toISOString(),
        isPublished: true
      };
      
      console.log('Tutorial data being sent:', tutorialData); // Debug log
      console.log('videoUrl in tutorialData:', tutorialData.videoUrl); // Debug log
      console.log('videoUrl in formData:', formData.videoUrl); // Debug log
      console.log('TutorialData before API call:', tutorialData); // Debug log
      console.log('TutorialEditor props:', { isOpen, isEditMode: !!tutorial, tutorial: tutorial ? 'exists' : 'null', onSave: !!onSave, token: !!token, user: !!user }); // Debug log
      
      console.log('Saving tutorial data:', tutorialData); // Debug log
      console.log('Tutorial ID:', tutorial?._id); // Debug log
      console.log('Is editing existing tutorial:', !!tutorial); // Debug log

      let response;
      if (tutorial) {
        console.log('Updating tutorial with ID:', tutorial._id); // Debug log
        response = await updateTutorialPost(token, tutorial._id, tutorialData);
        console.log('API response:', response); // Debug log
        console.log('Response data:', response.data); // Debug log
        toast.success('Tutorial updated successfully!');
      } else {
        console.log('Creating new tutorial'); // Debug log
        console.log('Token being used:', token); // Debug log
        console.log('Tutorial data being sent:', tutorialData); // Debug log
        
        if (!token) {
          throw new Error('No token provided');
        }
        
        response = await createTutorial(token, tutorialData);
        console.log('Create tutorial response:', response); // Debug log
        toast.success('Tutorial created successfully!');
      }

      console.log('Tutorial save response:', response); // Debug log
      onSave(response.data || response);
      onClose();
    } catch (error) {
      console.error('Error saving tutorial:', error);
      toast.error(`Failed to save tutorial: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!tutorial) return;
    
    if (!window.confirm('Are you sure you want to delete this tutorial? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTutorialPost(token, tutorial._id);
      toast.success('Tutorial deleted successfully!');
      onSave(null);
      onClose();
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      toast.error('Failed to delete tutorial');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <EditorContainer>
        <Header>
          <Title>{tutorial ? 'Edit Tutorial' : 'Create New Tutorial'}</Title>
          
        </Header>

        <Content>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter tutorial title"
                  maxLength={200}
                  required
                />
                <CharCount>{formData.title.length}/200</CharCount>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  placeholder="Enter author name"
                  maxLength={100}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of the tutorial"
                  maxLength={300}
                />
                <CharCount>{formData.description.length}/300</CharCount>
              </FormGroup>

              <FormGroup>
                <Label>Video Upload</Label>
                <VideoUploadContainer>
                  {formData.videoUrl ? (
                    <VideoPreview>
                      <video src={formData.videoUrl} controls style={{ width: '100%', maxHeight: '200px' }} />
                      <RemoveVideoButton type="button" onClick={handleRemoveVideo}>
                        <Delete /> Remove Video
                      </RemoveVideoButton>
                    </VideoPreview>
                  ) : (
                    <VideoUploadLabel>
                      <Videocam />
                      <VideoUploadInput
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={isSubmitting}
                      />
                      <VideoUploadText>
                        {isSubmitting ? 'Uploading...' : 'Click to upload video (max 50MB)'}
                      </VideoUploadText>
                    </VideoUploadLabel>
                  )}
                </VideoUploadContainer>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="30 min"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="fitness">Fitness</option>
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="yoga">Yoga</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="fitness, workout, beginner"
                />
              </FormGroup>

              <FormGroup>
                <Label>Equipment Needed</Label>
                <EquipmentContainer>
                  {formData.equipment.map((item, index) => (
                    <EquipmentItem key={index}>
                      <EquipmentInput
                        value={item}
                        onChange={(e) => handleEquipmentChange(index, e.target.value)}
                        placeholder="Equipment item"
                      />
                      {formData.equipment.length > 1 && (
                        <Button 
                          type="button" 
                          className="remove" 
                          onClick={() => removeEquipment(index)}
                        >
                          <Remove />
                        </Button>
                      )}
                    </EquipmentItem>
                  ))}
                  <Button type="button" className="add" onClick={addEquipment}>
                    <Add />
                    Add Equipment
                  </Button>
                </EquipmentContainer>
              </FormGroup>

              <FormGroup>
                <Label>Steps</Label>
                <StepsContainer>
                  {formData.steps.map((step, index) => (
                    <StepItem key={index}>
                      <StepInput
                        value={step}
                        onChange={(e) => handleStepChange(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                      />
                      {formData.steps.length > 1 && (
                        <Button 
                          type="button" 
                          className="remove" 
                          onClick={() => removeStep(index)}
                        >
                          <Remove />
                        </Button>
                      )}
                    </StepItem>
                  ))}
                  <Button type="button" className="add" onClick={addStep}>
                    <Add />
                    Add Step
                  </Button>
                </StepsContainer>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="content">Content *</Label>
                <TextArea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Write your tutorial content here..."
                  minHeight={300}
                  required
                />
                <CharCount>{formData.content.length} characters</CharCount>
              </FormGroup>
            </Form>
          )}
        </Content>
        
        <Footer>
          <Actions>
            {tutorial && (
              <Button 
                className="delete" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Delete />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
            <Button 
              className="save" 
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
            >
              <Save />
              {isSubmitting ? 'Saving...' : (tutorial ? 'Save' : 'Create')}
            </Button>
             <Button className="cancel" onClick={onClose} disabled={isSubmitting || isDeleting}>
            <Close />
            Cancel
          </Button>
          </Actions>
         
        </Footer>
      </EditorContainer>
    </Overlay>
  );
};

// Video upload styled components
const VideoUploadContainer = styled.div`
  margin-bottom: 20px;
`;

const VideoUploadLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.background};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.background}08;
  }

  svg {
    font-size: 48px;
    color: ${({ theme }) => theme.primary};
    margin-bottom: 10px;
  }
`;

const VideoUploadInput = styled.input`
  display: none;
`;

const VideoUploadText = styled.span`
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  text-align: center;
`;

const VideoPreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
`;

const RemoveVideoButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  z-index: 1;

  &:hover {
    background: rgba(255, 0, 0, 1);
  }
`;

export default TutorialEditor;
