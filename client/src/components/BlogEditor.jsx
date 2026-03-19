import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Close, Save, Delete, Image as ImageIcon } from '@mui/icons-material';
import { createBlog, updateBlogPost, deleteBlogPost, getBlogBySlugForEdit } from '../api';
import { useToast } from './Toast';

// Upload helper
const uploadImage = async (token, file) => {
  console.log('Starting upload for file:', file.name, 'size:', file.size); // Debug log
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/upload/single`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  console.log('Upload response status:', response.status); // Debug log
  
  if (!response.ok) {
    console.error('Upload failed with status:', response.status); // Debug log
    const errorText = await response.text();
    console.error('Error response:', errorText); // Debug log
    throw new Error('Upload failed');
  }
  
  const result = await response.json();
  console.log('Upload result:', result); // Debug log
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
  transition: all 0.2s;

  &.save {
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

  &.delete {
    background: #f44336;
    color: white;
    &:hover {
      background: #d32f2f;
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

const Content = styled.div`
  padding: 24px;
  flex: 1;
  overflow-y: auto;
`;

const Footer = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 10};
  background: ${({ theme }) => theme.bg};
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

const CharCount = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text_secondary};
  text-align: right;
`;

const ImageUploadContainer = styled.div`
  margin-bottom: 20px;
`;

const ImageUploadLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px dashed ${({ theme }) => theme.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.primary};
    background: ${({ theme }) => theme.bg_light};
  }
`;

const ImageUploadInput = styled.input`
  display: none;
`;

const ImagePreview = styled.div`
  margin-top: 12px;
  position: relative;
  
  img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
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
  
  &:hover {
    background: ${({ theme }) => theme.bg_light};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BlogEditor = ({ isOpen, onClose, blog, onSave, token, user }) => {
  const isEditMode = Boolean(blog?.slug);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'fitness',
    tags: '',
    readTime: '5 min read',
    featuredImage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (isEditMode && isOpen) {
      setIsLoading(true);
      loadBlogData();
    } else if (isOpen) {
      // Reset form for new blog
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'fitness',
        tags: '',
        readTime: '5 min read',
        featuredImage: ''
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [isEditMode, blog, isOpen]);

  const loadBlogData = async () => {
    try {
      const response = await getBlogBySlugForEdit(blog.slug);
      const blogData = response.data;
      console.log('Loaded blog data for editing:', blogData); // Debug log
      setFormData({
        title: blogData.title || '',
        excerpt: blogData.excerpt || '',
        content: blogData.content || '',
        category: blogData.category || 'fitness',
        tags: blogData.tags ? blogData.tags.join(', ') : '',
        readTime: blogData.readTime || '5 min read',
        featuredImage: blogData.featuredImage || ''
      });
      setImagePreview(blogData.featuredImage || '');
    } catch (error) {
      console.error('Error loading blog data:', error);
      console.log('Falling back to blog prop data:', blog); // Debug log
      
      // Fallback to using the blog prop data if API fails
      if (blog) {
        setFormData({
          title: blog.title || '',
          excerpt: blog.excerpt || '',
          content: blog.content || '',
          category: blog.category || 'fitness',
          tags: blog.tags ? blog.tags.join(', ') : '',
          readTime: blog.readTime || '5 min read',
          featuredImage: blog.featuredImage || ''
        });
        setImagePreview(blog.featuredImage || '');
      }
      
      // Don't show error toast if we have fallback data
      if (!blog) {
        toast.error('Failed to load blog data');
      }
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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log('Image selected:', file); // Debug log
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    console.log('Image validation passed, starting upload...'); // Debug log
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    // Upload image immediately
    if (token) {
      console.log('Token available, starting upload...'); // Debug log
      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(token, file);
        console.log('Image URL returned from upload:', imageUrl); // Debug log
        setFormData(prev => ({
          ...prev,
          featuredImage: imageUrl
        }));
        console.log('FormData after setting featuredImage:', {title: formData.title, featuredImage: imageUrl}); // Debug log
        toast.success('Image uploaded successfully');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
        // Keep the preview but don't set the URL
      } finally {
        setIsUploading(false);
      }
    } else {
      console.log('No token available for upload'); // Debug log
      toast.error('Please sign in to upload images');
      setImageFile(null);
      setImagePreview('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      featuredImage: ''
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
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Ensure required fields are present
        author: user?.name || 'Anonymous',
        publishedAt: new Date().toISOString(),
        isPublished: true
      };

      console.log('FormData before saving:', formData); // Debug log
      console.log('BlogData before API call:', blogData); // Debug log

      console.log('BlogEditor props:', { isOpen, isEditMode, blog: blog ? 'exists' : 'null', onSave: !!onSave, token: !!token, user: !!user }); // Debug log
      
      console.log('Saving blog data:', blogData); // Debug log
      console.log('Blog slug:', blog?.slug); // Debug log
      console.log('Is editing existing blog:', isEditMode); // Debug log

      let response;
      if (isEditMode) {
        console.log('Updating blog with slug:', blog.slug); // Debug log
        response = await updateBlogPost(token, blog.slug, blogData);
        console.log('API response:', response); // Debug log
        console.log('Response data:', response.data); // Debug log
        toast.success('Blog updated successfully!');
      } else {
        console.log('Creating new blog'); // Debug log
        console.log('Token being used:', token); // Debug log
        console.log('Blog data being sent:', blogData); // Debug log
        
        if (!token) {
          throw new Error('No token provided');
        }
        
        response = await createBlog(token, blogData);
        console.log('Create blog response:', response); // Debug log
        toast.success('Blog created successfully!');
      }

      console.log('Save response:', response); // Debug log
      
      // Handle different response structures
      const savedBlog = response?.data || response;
      console.log('Blog to save to parent:', savedBlog); // Debug log
      
      if (savedBlog) {
        onSave(savedBlog);
      } else {
        console.error('No blog data in response:', response);
        toast.error('Failed to save blog - no data returned');
      }
      onClose();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(`Failed to save blog: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!blog) return;
    
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteBlogPost(token, blog.slug);
        toast.success('Blog deleted successfully!');
        onClose(); // Close the editor
        onSave(null); // Signal deletion to parent
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast.error('Failed to delete blog');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen}>
      <EditorContainer>
        <Header>
          <Title>{isEditMode ? 'Edit Blog' : 'Create New Blog'}</Title>
          <CloseButton onClick={onClose} disabled={isSubmitting || isDeleting}>
            <Close />
          </CloseButton>
        </Header>
        
        <Content>
          <Form onSubmit={handleSubmit}>
            <ImageUploadContainer>
              <ImageUploadLabel>
                <ImageUploadInput
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log('File input onChange triggered'); // Test log
                    handleImageChange(e);
                  }}
                  disabled={isUploading}
                />
                <ImageIcon />
                <span>{isUploading ? 'Uploading...' : 'Upload Featured Image'}</span>
              </ImageUploadLabel>
              
              {imagePreview && (
                <ImagePreview>
                  <img src={imagePreview} alt="Preview" />
                  <RemoveImageButton type="button" onClick={removeImage}>
                    <Close style={{ fontSize: '14px' }} />
                  </RemoveImageButton>
                </ImagePreview>
              )}
            </ImageUploadContainer>

            <FormGroup>
              <Label>Title *</Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter blog title"
                required
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>Excerpt</Label>
              <TextArea
                type="text"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief description of the blog"
                maxLength={300}
              />
              <CharCount>{formData.excerpt.length}/300</CharCount>
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
                <option value="nutrition">Nutrition</option>
                <option value="wellness">Wellness</option>
                <option value="workout">Workout</option>
                <option value="lifestyle">Lifestyle</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="fitness, health, workout"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="readTime">Read Time</Label>
              <Input
                id="readTime"
                name="readTime"
                value={formData.readTime}
                onChange={handleChange}
                placeholder="5 min read"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="content">Content *</Label>
              <TextArea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your blog content here..."
                minHeight={300}
                required
              />
              <CharCount>{formData.content.length} characters</CharCount>
            </FormGroup>
          </Form>
        </Content>
        
        <Footer>
          <Actions>
            {isEditMode && (
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
              className="cancel" 
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              <Close />
              Cancel
            </Button>
            <Button 
              className="save" 
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading}
            >
              <Save />
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save' : 'Create')}
            </Button>
          </Actions>
        </Footer>
      </EditorContainer>
    </Overlay>
  );
};

export default BlogEditor;
