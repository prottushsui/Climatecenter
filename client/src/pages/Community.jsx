import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/community/posts');
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/community/posts', newPost);
      setNewPost({ title: '', content: '', category: 'general' });
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;
    
    try {
      await axios.post('/api/community/comments', {
        post_id: postId,
        content: newComment
      });
      setNewComment('');
      
      // Refresh the selected post
      if (selectedPost && selectedPost.id === postId) {
        const response = await axios.get(`/api/community/posts/${postId}`);
        setSelectedPost(response.data);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      await axios.post('/api/community/votes', {
        post_id: postId,
        vote_type: voteType
      });
      
      // Refresh posts
      fetchPosts();
      
      // If there's a selected post, refresh it too
      if (selectedPost && selectedPost.id === postId) {
        const response = await axios.get(`/api/community/posts/${postId}`);
        setSelectedPost(response.data);
      }
    } catch (error) {
      console.error('Error recording vote:', error);
    }
  };

  // Calculate vote score for a post
  const getVoteScore = (post) => {
    return post.vote_score || 0;
  };

  // Get unique categories
  const categories = ['all', ...new Set(posts.map(post => post.category || 'general'))];

  // Filter posts based on category and search term
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Community</h2>
        <p className="text-gray-600">Join discussions about climate action and environmental issues</p>
      </div>

      {/* Create Post Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h3>
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Post title..."
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-md"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <textarea
                placeholder="What's on your mind?"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-md"
                required
              ></textarea>
            </div>
            
            <div>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="general">General</option>
                <option value="discussions">Discussions</option>
                <option value="solutions">Solutions</option>
                <option value="events">Events</option>
                <option value="resources">Resources</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Post
            </button>
          </div>
        </form>
      </div>

      {/* Posts Filter */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-md flex-grow"
          />
        </div>
        
        <div className="text-sm text-gray-600">
          {filteredPosts.length} posts
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded mb-2">
                    {post.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleVote(post.id, 'up')}
                    className="text-gray-500 hover:text-green-600"
                  >
                    ↑
                  </button>
                  <span className="font-medium">{getVoteScore(post)}</span>
                  <button 
                    onClick={() => handleVote(post.id, 'down')}
                    className="text-gray-500 hover:text-red-600"
                  >
                    ↓
                  </button>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>By {post.author_name}</span>
                <span className="mx-2">•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              
              <p className="text-gray-700 mb-4">{post.content}</p>
              
              <button
                onClick={() => {
                  if (selectedPost && selectedPost.id === post.id) {
                    setSelectedPost(null);
                  } else {
                    axios.get(`/api/community/posts/${post.id}`)
                      .then(response => setSelectedPost(response.data))
                      .catch(error => console.error('Error fetching post:', error));
                  }
                }}
                className="text-green-600 hover:text-green-800 font-medium"
              >
                {selectedPost && selectedPost.id === post.id ? 'Hide Comments' : `View Comments (${post.comments?.length || 0})`}
              </button>
            </div>
            
            {/* Comments Section */}
            {selectedPost && selectedPost.id === post.id && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="space-y-4">
                  {selectedPost.comments && selectedPost.comments.map(comment => (
                    <div key={comment.id} className="bg-white p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-gray-800">{comment.author_name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {comment.author_role === 'admin' && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                  
                  {(!selectedPost.comments || selectedPost.comments.length === 0) && (
                    <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-grow p-2 border border-gray-300 rounded-md"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(selectedPost.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(selectedPost.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No posts found. Be the first to start a discussion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;