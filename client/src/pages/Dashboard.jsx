import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentNews, setRecentNews] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get carbon analytics
        const analyticsResponse = await axios.get('/api/carbon/analytics');
        setAnalytics(analyticsResponse.data);

        // Get recent news
        const newsResponse = await axios.get('/api/news/articles?limit=5');
        setRecentNews(newsResponse.data);

        // Get recent posts
        const postsResponse = await axios.get('/api/community/posts?limit=5');
        setRecentPosts(postsResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart data for carbon by category
  const categoryData = {
    labels: analytics?.total_by_category?.map(item => item.category) || [],
    datasets: [
      {
        label: 'CO2 Emissions (kg)',
        data: analytics?.total_by_category?.map(item => parseFloat(item.total_emissions)) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for monthly emissions
  const monthlyData = {
    labels: analytics?.monthly_emissions?.map(item => new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })) || [],
    datasets: [
      {
        label: 'Monthly Emissions (kg)',
        data: analytics?.monthly_emissions?.map(item => parseFloat(item.total_emissions)) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Carbon Footprint</h3>
          <p className="text-3xl font-bold text-green-600">
            {analytics?.total_footprint ? parseFloat(analytics.total_footprint).toFixed(2) : 0} kg
          </p>
          <p className="text-gray-600 mt-2">CO2 equivalent</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Activity</h3>
          <p className="text-3xl font-bold text-blue-600">
            {recentPosts.length + recentNews.length}
          </p>
          <p className="text-gray-600 mt-2">News & Community</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Engagement</h3>
          <p className="text-3xl font-bold text-purple-600">
            {recentPosts.length}
          </p>
          <p className="text-gray-600 mt-2">Recent discussions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Emissions by Category</h3>
          <div className="h-80">
            <Pie data={categoryData} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Emissions Trend</h3>
          <div className="h-80">
            <Line data={monthlyData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Climate News</h3>
            <button 
              onClick={() => navigate('/news')}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentNews.map((article) => (
              <div key={article.id} className="border-b pb-3 last:border-b-0">
                <h4 className="font-medium text-gray-800">{article.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{article.source} • {new Date(article.published_at).toLocaleDateString()}</p>
              </div>
            ))}
            {recentNews.length === 0 && (
              <p className="text-gray-500 italic">No recent news available</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Community Posts</h3>
            <button 
              onClick={() => navigate('/community')}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="border-b pb-3 last:border-b-0">
                <h4 className="font-medium text-gray-800">{post.title}</h4>
                <p className="text-sm text-gray-600 mt-1">by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-gray-500 italic">No recent posts available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;