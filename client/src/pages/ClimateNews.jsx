import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClimateNews = () => {
  const [articles, setArticles] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [articlesResponse, bookmarksResponse] = await Promise.all([
        axios.get('/api/news/articles'),
        axios.get('/api/news/bookmarks')
      ]);
      
      setArticles(articlesResponse.data);
      setBookmarks(bookmarksResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news data:', error);
      setLoading(false);
    }
  };

  const handleBookmark = async (articleId) => {
    try {
      await axios.post('/api/news/bookmarks', { article_id: articleId });
      const newBookmarksResponse = await axios.get('/api/news/bookmarks');
      setBookmarks(newBookmarksResponse.data);
    } catch (error) {
      console.error('Error bookmarking article:', error);
    }
  };

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await axios.delete(`/api/news/bookmarks/${bookmarkId}`);
      const newBookmarksResponse = await axios.get('/api/news/bookmarks');
      setBookmarks(newBookmarksResponse.data);
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Get unique categories
  const categories = ['all', ...new Set(articles.map(article => article.category))];

  // Filter articles based on category and search term
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase());
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
        <h2 className="text-2xl font-bold text-gray-800">Climate News</h2>
        <p className="text-gray-600">Stay updated with the latest climate science and environmental news</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
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
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-md flex-grow"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredArticles.length} articles found
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => {
            const isBookmarked = bookmarks.some(b => b.article_id === article.id);
            
            return (
              <div key={article.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                      {article.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'News'}
                    </span>
                    <button
                      onClick={() => isBookmarked ? handleRemoveBookmark(bookmarks.find(b => b.article_id === article.id).id) : handleBookmark(article.id)}
                      className={`text-lg ${isBookmarked ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      {isBookmarked ? '★' : '☆'}
                    </button>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{article.title}</h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {article.summary || 'No summary available'}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{article.source}</span>
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                  </div>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Read full article →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredArticles.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p>No articles found matching your criteria.</p>
          </div>
        )}
      </div>

      {bookmarks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Bookmarks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="border rounded-lg p-3 flex justify-between items-center">
                <a 
                  href={bookmark.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline flex-grow"
                >
                  {bookmark.title}
                </a>
                <button
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClimateNews;