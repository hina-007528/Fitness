import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Article, CalendarToday, Person, TrendingUp, Favorite, Message, ShareOutlined, Add, Edit, Delete, ThumbDown } from "@mui/icons-material";
import { getAllBlogs, getBlogBySlug, addComment, likeBlog, createBlog, updateBlogPost, deleteBlogPost } from "../api";
import { useToast } from "../components/Toast";
import ShareDialog from "../components/ShareDialog";
import CommentSheet from "../components/CommentSheet";
import BlogEditor from "../components/BlogEditor";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { useSelector } from "react-redux";

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

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 20px;
`;

const BlogCard = styled.div`
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

const BlogImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, ${({ theme }) => theme.primary + 40}, ${({ theme }) => theme.primary + 20});
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.primary};
  font-size: 48px;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BlogContent = styled.div`
  padding: 20px;
`;

const BlogMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BlogTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
  margin: 0 0 12px 0;
  line-height: 1.3;
`;

const BlogExcerpt = styled.p`
  color: ${({ theme }) => theme.text_secondary};
  line-height: 1.6;
  margin: 0 0 16px 0;
`;

const ReadMore = styled.div`
  color: ${({ theme }) => theme.primary};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CategoryTag = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  background: ${({ category, theme }) => 
    category === 'nutrition' ? theme.success + 20 :
    category === 'workout' ? theme.primary + 20 :
    category === 'recovery' ? theme.warning + 20 :
    theme.text_primary + 20
  };
  color: ${({ category, theme }) => 
    category === 'nutrition' ? theme.success :
    category === 'workout' ? theme.primary :
    category === 'recovery' ? theme.warning :
    theme.text_primary
  };
`;

const FullBlogContent = styled.div`
  color: ${({ theme }) => theme.text_secondary};
  line-height: 1.8;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 20};
  
  h4 {
    color: ${({ theme }) => theme.text_primary};
    margin: 20px 0 12px 0;
  }
  
  p {
    margin-bottom: 16px;
  }
  
  ul {
    margin-left: 20px;
    margin-bottom: 16px;
    
    li {
      margin-bottom: 8px;
    }
  }
`;

const BlogActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.text_primary + 20};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text_secondary};
  cursor: pointer;
  font-size: 14px;
  transition: color 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
  
  &.liked {
    color: #e91e63;
    
    &:hover {
      color: #d81b60;
    }
  }
  
  &.disliked {
    color: #f44336;
    
    &:hover {
      color: #e53935;
    }
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

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${({ theme }) => theme.primary + 20};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    
    span {
      display: none;
    }
  }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Blogs = () => {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = localStorage.getItem('fittrack-app-token');

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editorMode, setEditorMode] = useState('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likedBlogs, setLikedBlogs] = useState(new Set());
  const [dislikedBlogs, setDislikedBlogs] = useState(new Set());
  
  const toast = useToast();
  
  const getUserId = () => currentUser?._id || currentUser?.id;
  
  // Get likedBy names (for development, use mock names)
  const getLikedByNames = (likedBy) => {
    if (!likedBy || likedBy.length === 0) return [];
    return likedBy
      .map((u) => {
        if (!u) return null;
        if (typeof u === 'string') return u;
        return u.name || null;
      })
      .filter(Boolean);
  };
  
  const user = currentUser;

  useEffect(() => {
    fetchBlogs();
  }, [filterCategory]);

  // Listen for blog comment added events
  useEffect(() => {
    const handleBlogCommentAdded = (event) => {
      console.log('Blog comment added event:', event.detail); // Debug log
      fetchBlogs(); // Refresh blogs to get updated comment count
    };

    window.addEventListener('blogCommentAdded', handleBlogCommentAdded);
    return () => {
      window.removeEventListener('blogCommentAdded', handleBlogCommentAdded);
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = filterCategory !== 'all' ? { category: filterCategory } : {};
      const response = await getAllBlogs(filters);
      
      console.log('Blogs API response:', response); // Debug log
      
      // Ensure we always set an array, even if response is unexpected
      // API helper returns response.data from Axios, and backend returns { success, message, data: [...] }
      const blogsData = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

      setBlogs(blogsData);
    } catch (err) {
      setError('Failed to load blogs. Please try again.');
      console.error('Error fetching blogs:', err);
      console.error('Error details:', err.response?.data || err.message); // Debug log

      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = async (blog) => {
    try {
      const response = await getBlogBySlug(blog.slug);
      setSelectedBlog(response.data);
    } catch (err) {
      console.error('Error fetching blog details:', err);
    }
  };

  const handleLike = async (blogSlug, isDislike = false) => {
    try {
      const userId = getUserId();
      
      if (!token) {
        toast.error('Please sign in to like/dislike blogs');
        return;
      }
      
      const isCurrentlyLiked = likedBlogs.has(blogSlug);
      const isCurrentlyDisliked = dislikedBlogs.has(blogSlug);
      
      console.log('Like action:', { 
        blogSlug, 
        userId, 
        isCurrentlyLiked, 
        isCurrentlyDisliked, 
        isDislike,
        likedBlogs: Array.from(likedBlogs),
        dislikedBlogs: Array.from(dislikedBlogs)
      }); // Debug log
      
      // Call the real API
      const response = await likeBlog(token, blogSlug);
      console.log('Like API response:', response); // Debug log
      
      // Update likedBlogs state based on API response
      if (response && response.data) {
        const { liked, likes, likedBy } = response.data;
        
        console.log('Processing like response:', { liked, likes, likedBy }); // Debug log
        
        if (isDislike) {
          // Handle dislike - toggle based on API response
          if (liked) {
            // User liked the blog (dislike was removed)
            setDislikedBlogs(prev => {
              const newSet = new Set(prev);
              newSet.delete(blogSlug);
              return newSet;
            });
            setLikedBlogs(prev => new Set(prev).add(blogSlug));
            toast.success('Dislike removed and liked!');
          } else {
            // User disliked the blog
            setDislikedBlogs(prev => new Set(prev).add(blogSlug));
            setLikedBlogs(prev => {
              const newSet = new Set(prev);
              newSet.delete(blogSlug);
              return newSet;
            });
            toast.success('Blog disliked');
          }
        } else {
          // Handle like - toggle based on API response
          if (liked) {
            // User liked the blog
            setLikedBlogs(prev => new Set(prev).add(blogSlug));
            setDislikedBlogs(prev => {
              const newSet = new Set(prev);
              newSet.delete(blogSlug);
              return newSet;
            });
            toast.success('Blog liked!');
          } else {
            // User unliked the blog
            setLikedBlogs(prev => {
              const newSet = new Set(prev);
              newSet.delete(blogSlug);
              return newSet;
            });
            toast.success('Like removed');
          }
        }
        
        // Update blog counts with API response
        setBlogs(prev => prev.map(blog => {
          if (blog.slug === blogSlug) {
            return { 
              ...blog, 
              likes: likes || blog.likes,
              likedBy: likedBy || blog.likedBy
            };
          }
          return blog;
        }));
        
        // Update selectedBlog if it's the same blog
        if (selectedBlog && selectedBlog.slug === blogSlug) {
          setSelectedBlog(prev => ({ 
            ...prev, 
            likes: likes || prev.likes,
            likedBy: likedBy || prev.likedBy
          }));
        }
      }
      
    } catch (err) {
      console.error('Error liking/disliking blog:', err);
      toast.error('Failed to update like status');
    }
  };

  const handleComment = async (blogSlug, content) => {
    try {
      if (!token) {
        toast.error('Please sign in to comment');
        return;
      }
      
      console.log('Adding comment to blog:', blogSlug, 'Content:', content); // Debug log
      const response = await addComment(token, blogSlug, content);
      console.log('Comment API response:', response); // Debug log
      
      toast.success('Comment added successfully!');
      
      // Update the blog's commentCount and comments array locally for immediate UI feedback
      setBlogs(prev => prev.map(blog => {
        if (blog.slug === blogSlug) {
          const newCommentCount = (blog.commentCount || 0) + 1;
          const newComment = response.data;
          return { 
            ...blog, 
            commentCount: newCommentCount,
            comments: [...(blog.comments || []), newComment]
          };
        }
        return blog;
      }));
      
      // Update currentBlog if it's the same blog
      if (currentBlog && currentBlog.slug === blogSlug) {
        const newCommentCount = (currentBlog?.commentCount || 0) + 1;
        const newComment = response.data;
        setCurrentBlog(prev => ({ 
          ...prev, 
          commentCount: newCommentCount,
          comments: [...(prev?.comments || []), newComment]
        }));
      }
      
      if (selectedBlog) {
        handleBlogClick(selectedBlog); // Refresh blog details
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = (blog) => {
    console.log('Share clicked for blog:', blog);
    setCurrentBlog(blog);
    setShareDialogOpen(true);
  };

  const handleViewComments = (blog) => {
    console.log('Comments clicked for blog:', blog);
    setCurrentBlog(blog);
    setCommentSheetOpen(true);
  };

  const handleCreateBlog = () => {
    setEditorMode('create');
    setEditingBlog(null);
    setEditorOpen(true);
  };

  const handleEditBlog = (blog) => {
    setEditorMode('edit');
    setEditingBlog(blog);
    setEditorOpen(true);
  };

  const handleBlogSave = (savedBlog) => {
    if (savedBlog) {
      if (editorMode === 'edit') {
        // Update existing blog in the list
        setBlogs(prev => prev.map(blog => 
          blog.slug === savedBlog.slug ? savedBlog : blog
        ));
        toast.success('Blog updated successfully!');
      } else {
        // Add new blog to the beginning of the list
        setBlogs(prev => [savedBlog, ...prev]);
        toast.success('Blog created successfully!');
      }
      fetchBlogs(); // Also refresh from server to ensure consistency
    }
    setEditorOpen(false);
    setEditingBlog(null);
    setEditorMode('create');
  };

  const handleDeleteBlog = async (blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting blog with slug:', blogToDelete.slug); // Debug log
      console.log('Token being used for delete:', user.token); // Debug log
      console.log('User object:', user); // Debug log
      await deleteBlogPost(user.token, blogToDelete.slug);
      toast.success('Blog deleted successfully!');
      fetchBlogs(); // Refresh the blogs list
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(`Failed to delete blog: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Wrapper>
          <LoadingSpinner>
            <div>Loading blogs...</div>
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
        <HeaderContainer>
          <Title>Fitness & Nutrition Blog</Title>
          <CreateButton onClick={handleCreateBlog}>
            <Add />
            <span>Create Blog</span>
          </CreateButton>
        </HeaderContainer>
        
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' }}>
          {['all', 'workout', 'nutrition', 'recovery'].map(category => (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              style={{
                padding: '8px 16px',
                border: `1px solid ${filterCategory === category ? '#667eea' : '#ddd'}`,
                borderRadius: '20px',
                background: filterCategory === category ? '#667eea' : 'white',
                color: filterCategory === category ? 'white' : '#333',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <BlogGrid>
          {Array.isArray(blogs) && blogs.map((blog) => (
            <BlogCard 
              key={blog._id || blog.id} 
              onClick={() => handleBlogClick(blog)}
            >
              <BlogImage>
                {blog.featuredImage ? (
                  <img src={blog.featuredImage} alt={blog.title} />
                ) : (
                  <Article />
                )}
              </BlogImage>
              <BlogContent>
                <CategoryTag category={blog.category}>
                  {blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </CategoryTag>
                <BlogMeta>
                  <MetaItem>
                    <Person style={{ fontSize: '16px' }} />
                    {blog.author}
                  </MetaItem>
                  <MetaItem>
                    <CalendarToday style={{ fontSize: '16px' }} />
                    {new Date(blog.publishedAt).toLocaleDateString()}
                  </MetaItem>
                  <MetaItem>
                    <TrendingUp style={{ fontSize: '16px' }} />
                    {blog.readTime}
                  </MetaItem>
                </BlogMeta>
                <BlogTitle>{blog.title}</BlogTitle>
                <BlogExcerpt>{blog.excerpt}</BlogExcerpt>
                <ReadMore onClick={(e) => { 
                    e.stopPropagation(); 
                    if (selectedBlog?._id === blog._id) {
                      // If already expanded, close it
                      setSelectedBlog(null);
                    } else {
                      // If not expanded, open it
                      handleBlogClick(blog);
                    }
                  }}>
                  {selectedBlog?._id === blog._id ? 'Show less' : 'Read more'}
                </ReadMore>
                {selectedBlog?._id === blog._id && (
                  <FullBlogContent dangerouslySetInnerHTML={{ __html: blog.content }} />
                )}
                <BlogActions>
                  <ActionButton 
                    onClick={(e) => { e.stopPropagation(); handleLike(blog.slug, false); }}
                    className={likedBlogs.has(blog.slug) ? 'liked' : ''}
                  >
                    <Favorite 
                      style={{ 
                        fontSize: '16px',
                        color: likedBlogs.has(blog.slug) ? '#e91e63' : 'inherit'
                      }} 
                    />
                    {blog.likes || 0}
                  </ActionButton>
                  <ActionButton onClick={(e) => { e.stopPropagation(); handleViewComments(blog); }}>
                    <Message style={{ fontSize: '16px' }} />
                    {blog.commentCount || 0}
                  </ActionButton>
                  <ActionButton onClick={(e) => { e.stopPropagation(); handleShare(blog); }}>
                    <ShareOutlined style={{ fontSize: '16px' }} />
                    Share
                  </ActionButton>
                  {user && blog.authorId && String(blog.authorId) === String(getUserId()) && (
                    <>
                      <ActionButton onClick={(e) => { e.stopPropagation(); handleEditBlog(blog); }}>
                        <Edit style={{ fontSize: '16px' }} />
                        Edit
                      </ActionButton>
                      {/* <ActionButton 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleDeleteBlog(blog);
                        }} 
                        className="delete"
                      >
                        <Delete style={{ fontSize: '16px' }} />
                        Delete
                      </ActionButton> */}
                    </>
                  )}
                </BlogActions>
              </BlogContent>
            </BlogCard>
          ))}
        </BlogGrid>

        {blogs.length === 0 && !loading && (
          <EmptyState>
            <div className="empty-icon">📝</div>
            <div className="empty-title">No Blog Posts Found</div>
            <div className="empty-description">
              {filterCategory !== 'all' 
                ? "No blog posts match your selected category. Try exploring other categories."
                : "No blog posts are available at the moment. Check back soon for new fitness articles!"
              }
            </div>
            {filterCategory === 'all' && (
              <div className="empty-action">
                <button onClick={handleCreateBlog}>
                  Create Blog
                </button>
              </div>
            )}
            {filterCategory !== 'all' && (
              <div className="empty-action">
                <button onClick={() => setFilterCategory('all')}>
                  View All Categories
                </button>
              </div>
            )}
          </EmptyState>
        )}
      </Wrapper>
      
      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        item={currentBlog}
        type="blog"
      />
      
      <CommentSheet
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        item={currentBlog}
        type="blog"
        token={token}
        user={user}
      />
      
      <BlogEditor
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingBlog(null);
          setEditorMode('create');
        }}
        blog={editorMode === 'edit' ? editingBlog : null}
        onSave={handleBlogSave}
        token={token}
        user={user}
      />
      
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBlogToDelete(null);
        }}
        onConfirm={confirmDeleteBlog}
        itemName="blog"
        isLoading={isDeleting}
      />
    </Container>
  );
};

export default Blogs;
