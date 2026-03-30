import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api/",
});

// Intercept all responses to globally map old broken image/video URLs 
// so they correctly load from the Netlify public folder
API.interceptors.response.use((response) => {
  if (response.data) {
    try {
      let dataStr = JSON.stringify(response.data);
      dataStr = dataStr
        .replace(/http:\/\/localhost:8080\/uploads/g, '/uploads')
        .replace(/https:\/\/fitness-nine-taupe\.vercel\.app\/api\/uploads/g, '/uploads')
        .replace(/https:\/\/fitness-nine-taupe\.vercel\.app\/uploads/g, '/uploads');
      response.data = JSON.parse(dataStr);
    } catch (e) {
      // ignore parse errors
    }
  }
  return response;
});

export const UserSignUp = async (data) => API.post("/user/signup", data);
export const UserSignIn = async (data) => API.post("/user/signin", data);

export const getDashboardDetails = async (token) => {
  const response = await API.get("/user/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteWorkout = async (token, id) => {
  const response = await API.delete(`/user/workout/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateWorkout = async (token, id, data) => {
  const response = await API.put(`/user/workout/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getWorkouts = async (token, date) => {
  const response = await API.get(`/user/workout${date}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addWorkout = async (token, data) => {
  const response = await API.post(`/user/workout`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Tutorial API functions
export const getAllTutorials = async (filters = {}) => {
  const response = await API.get("/tutorials/", { params: filters });
  return response.data;
};

export const getTutorialById = async (id) => {
  const response = await API.get(`/tutorials/${id}`);
  return response.data;
};

export const getTutorialStats = async () => {
  const response = await API.get("/tutorials/stats");
  return response.data;
};

// Blog API functions
export const getAllBlogs = async (filters = {}) => {
  const response = await API.get("/blogs/", { params: filters });
  return response.data;
};

export const getBlogBySlug = async (slug) => {
  const response = await API.get(`/blogs/${slug}`);
  return response.data;
};

export const getPopularBlogs = async (token) => {
  const response = await API.get("/blogs/popular", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addComment = async (token, slug, content) => {
  const response = await API.post(`/blogs/${slug}/comment`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateComment = async (token, commentId, content) => {
  const response = await API.put(`/blogs/comment/${commentId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteComment = async (token, commentId) => {
  const response = await API.delete(`/blogs/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const addReply = async (token, commentId, content) => {
  const response = await API.post(`/blogs/comment/${commentId}/reply`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReply = async (token, commentId, replyId, content) => {
  const response = await API.put(`/blogs/comment/${commentId}/reply/${replyId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteReply = async (token, commentId, replyId) => {
  const response = await API.delete(`/blogs/comment/${commentId}/reply/${replyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};


// Contact API functions
export const submitContact = async (data) => {
  const response = await API.post("/contact/", data);
  return response.data;
};

export const getAllContacts = async (token, filters = {}) => {
  const response = await API.get("/contact/", { 
    params: filters,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getContactById = async (token, id) => {
  const response = await API.get(`/contact/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateContact = async (token, id, data) => {
  const response = await API.put(`/contact/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteContact = async (token, id) => {
  const response = await API.delete(`/contact/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getContactStats = async (token) => {
  const response = await API.get("/contact/stats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Tutorial interaction API functions
export const likeTutorial = async (token, tutorialId) => {
  const response = await API.post(`/tutorials/${tutorialId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const shareTutorial = async (token, tutorialId, platform) => {
  const response = await API.post(`/tutorials/${tutorialId}/share`, { platform }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Blog interaction API functions
export const likeBlog = async (token, blogSlug) => {
  const response = await API.post(`/blogs/${blogSlug}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const shareBlog = async (token, blogSlug, platform) => {
  const response = await API.post(`/blogs/${blogSlug}/share`, { platform }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Comment CRUD operations for blogs
export const getBlogComments = async (blogSlug) => {
  const response = await API.get(`/blogs/${blogSlug}/comments`);
  return response.data;
};

export const addBlogComment = async (token, blogSlug, content) => {
  const response = await API.post(`/blogs/${blogSlug}/comments`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateBlogComment = async (token, blogSlug, commentId, content) => {
  const response = await API.put(`/blogs/${blogSlug}/comments/${commentId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteBlogComment = async (token, blogSlug, commentId) => {
  const response = await API.delete(`/blogs/${blogSlug}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Comment CRUD operations for tutorials
export const getTutorialComments = async (tutorialId) => {
  const response = await API.get(`/tutorials/${tutorialId}/comments`);
  return response.data;
};

export const addTutorialComment = async (token, tutorialId, content) => {
  const response = await API.post(`/tutorials/${tutorialId}/comment`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateTutorialComment = async (token, commentId, content) => {
  const response = await API.put(`/tutorials/comment/${commentId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTutorialComment = async (token, commentId) => {
  const response = await API.delete(`/tutorials/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addTutorialReply = async (token, commentId, content) => {
  const response = await API.post(`/tutorials/comment/${commentId}/reply`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateTutorialReply = async (token, commentId, replyId, content) => {
  const response = await API.put(`/tutorials/comment/${commentId}/reply/${replyId}`, { content }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTutorialReply = async (token, commentId, replyId) => {
  const response = await API.delete(`/tutorials/comment/${commentId}/reply/${replyId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Blog CRUD operations
export const createBlog = async (token, blogData) => {
  try {
    console.log('Creating blog with token:', token); // Debug log
    console.log('Blog data:', blogData); // Debug log
    const response = await API.post('/blogs/', blogData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Create blog API response:', response); // Debug log
    return response.data;
  } catch (error) {
    console.error('Create blog error:', error); // Debug log
    throw error;
  }
};

export const updateBlogPost = async (token, slug, blogData) => {
  const response = await API.put(`/blogs/${slug}`, blogData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteBlogPost = async (token, slug) => {
  const response = await API.delete(`/blogs/${slug}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getBlogBySlugForEdit = async (slug) => {
  const response = await API.get(`/blogs/${slug}`);
  return response.data;
};

// Tutorial CRUD operations
export const createTutorial = async (token, tutorialData) => {
  const response = await API.post('/tutorials/', tutorialData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateTutorialPost = async (token, tutorialId, tutorialData) => {
  const response = await API.put(`/tutorials/${tutorialId}`, tutorialData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteTutorialPost = async (token, tutorialId) => {
  const response = await API.delete(`/tutorials/${tutorialId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getTutorialByIdForEdit = async (tutorialId) => {
  const response = await API.get(`/tutorials/${tutorialId}`);
  return response.data;
};
