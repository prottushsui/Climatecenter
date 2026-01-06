# Climate Engagement Platform

A full-stack climate engagement web platform that combines a personal carbon footprint tracker, a real-time climate news aggregator, and a community discussion forum into a single, cohesive user experience with shared authentication, analytics, and dashboards.

## Features

- **Carbon Tracker**: Log and visualize your carbon footprint across different categories (transport, food, energy)
- **Climate News**: Access curated environmental news with bookmarking capabilities
- **Community Forum**: Participate in discussions about climate solutions and environmental initiatives
- **Dashboard**: Unified view with analytics and insights
- **Authentication**: Secure user authentication and authorization

## Tech Stack

- **Frontend**: React, React Router, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL with normalized relational schemas
- **Authentication**: JWT-based authentication

## Database Schema

The application uses PostgreSQL with the following tables:
- `users` - User accounts and profiles
- `carbon_entries` - Personal carbon footprint data
- `news_articles` - Climate news articles
- `bookmarks` - User bookmarks for news articles
- `posts` - Community forum posts
- `comments` - Comments on posts
- `votes` - Post voting system
- `reports` - Content moderation reports

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Carbon Tracking
- `GET /api/carbon/entries` - Get user's carbon entries
- `POST /api/carbon/entries` - Add a new carbon entry
- `PUT /api/carbon/entries/:id` - Update a carbon entry
- `DELETE /api/carbon/entries/:id` - Delete a carbon entry
- `GET /api/carbon/analytics` - Get carbon analytics summary

### News
- `GET /api/news/articles` - Get all news articles
- `GET /api/news/articles/:id` - Get a specific article
- `POST /api/news/bookmarks` - Bookmark an article
- `GET /api/news/bookmarks` - Get user's bookmarks
- `DELETE /api/news/bookmarks/:id` - Remove a bookmark

### Community
- `GET /api/community/posts` - Get all posts
- `GET /api/community/posts/:id` - Get a specific post with comments
- `POST /api/community/posts` - Create a new post
- `PUT /api/community/posts/:id` - Update a post
- `DELETE /api/community/posts/:id` - Delete a post
- `POST /api/community/comments` - Add a comment
- `PUT /api/community/comments/:id` - Update a comment
- `DELETE /api/community/comments/:id` - Delete a comment
- `POST /api/community/votes` - Vote on a post

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd climate-engagement-platform
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Set up environment variables:
Create a `.env` file in the root directory with the following:
```
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=climate_platform
DB_PASSWORD=your_db_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Set up the database:
Run the SQL commands from `db_schema.sql` to create the necessary tables.

6. Start the development servers:
```bash
# In the root directory
npm run dev
```

This will start both the backend server on port 5000 and the frontend development server on port 3000 with proxy configuration.

## Running the Application

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## Architecture Overview

The application follows a monolithic architecture with clear separation of concerns:

- **Frontend**: React-based single-page application with component-driven architecture
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL with normalized relational schemas
- **Authentication**: JWT-based authentication with role-based access control
- **Security**: Input validation, rate limiting, and security middleware

## Data Models

- **User**: Stores user information and authentication data
- **CarbonEntry**: Tracks individual carbon footprint entries
- **NewsArticle**: Stores climate news articles from various sources
- **Post/Comment**: Community forum data models
- **Bookmark**: Links users to news articles they've saved
- **Vote**: Tracks user votes on community posts

## Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- Secure password hashing with bcrypt
- HTTP security headers

## Performance Considerations

- Database indexing on frequently queried fields
- Efficient API endpoints with pagination
- Client-side caching where appropriate
- Optimized chart rendering
- Responsive UI design

## Next Steps

To complete the setup:

1. Install Tailwind CSS in the client directory:
```bash
cd client
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Configure your database connection details in environment variables

3. Implement the news API integration (currently using mock data)

4. Add more sophisticated carbon calculation algorithms

5. Implement email notifications and additional user engagement features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License