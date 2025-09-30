# Mood AI Backend

A secure, personalized AI-powered mood tracking and guidance system.

## Features

### Phase 1 - Core Setup ✅
- **User Authentication**: JWT-based auth with Argon2id password hashing
- **Database Design**: MongoDB with three core collections:
  - `users`: User profiles and hashed credentials
  - `daily_logs`: Habits, mood, activities (AES-256 encrypted notes)
  - `chat_history`: AI conversations per user
- **Security**: Password hashing, data encryption, user isolation

### Phase 2 - Data Security ✅
- **Encryption**: Argon2id for passwords, AES-256 for personal logs
- **Access Control**: All queries filtered by user_id, no cross-user data leaks
- **Data Isolation**: Strict user-based data separation

### Phase 3 - AI Model 🔄
- **Current**: Rule-based NLP for quick replies
- **Planned**: ML/Deep Learning (LSTM/Transformers) for personalized recommendations
- **Features**: Mood-based guidance, sentiment analysis, context-aware responses

### Phase 4 - Personalization 🔄
- **Feedback Loop**: Unlimited log entries, periodic model retraining
- **Dashboard**: Mood analytics and progress visualization

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mood-ai-mongo mongo:latest

# Or install MongoDB locally
```

4. **Run the server:**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Daily Logs
- `POST /api/logs` - Create/update daily log
- `GET /api/logs` - Get user's daily logs (paginated)
- `GET /api/logs/:id` - Get specific daily log
- `PUT /api/logs/:id` - Update daily log
- `DELETE /api/logs/:id` - Delete daily log
- `GET /api/logs/analytics/mood` - Get mood analytics

### Chat/AI
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/session/:sessionId` - Get chat history
- `GET /api/chat/sessions` - Get all chat sessions
- `PUT /api/chat/session/:sessionId/end` - End chat session
- `DELETE /api/chat/session/:sessionId` - Delete chat session

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mood-ai-db
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-char-encryption-key-here!!
```

## Security Features

- **Password Security**: Argon2id hashing (strongest available)
- **Data Encryption**: AES-256 encryption for sensitive personal notes
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Joi schema validation for all inputs
- **CORS & Helmet**: Security headers and cross-origin protection

## Data Models

### User
- Profile information (name, email, username)
- Encrypted password hash
- Preferences (AI personality, reminder frequency)
- Account status and timestamps

### Daily Log
- Mood score (1-10) and description
- Habits tracking with completion status
- Activities with duration and enjoyment ratings
- Encrypted personal notes
- User isolation via userId

### Chat History
- Session-based conversation tracking
- AI responses with metadata
- Context awareness (recent mood, habits, activities)
- Suggested actions and confidence scores

## Development

### Project Structure
```
├── models/          # Database models
├── routes/          # API route handlers
├── middleware/      # Custom middleware (auth, error handling)
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
└── .env.example     # Environment variables template
```

### Testing
```bash
npm test
```

### Code Style
- ES6+ features
- Async/await for asynchronous operations
- Proper error handling and logging
- Input validation with Joi
- Security-first approach

## Roadmap

### Phase 3 - Enhanced AI
- [ ] Integrate with OpenAI/Claude API
- [ ] Implement sentiment analysis
- [ ] Add personalized recommendation engine
- [ ] Create mood prediction models

### Phase 4 - Personalization & Analytics
- [ ] Advanced mood analytics dashboard
- [ ] Habit correlation analysis
- [ ] Predictive mood modeling
- [ ] Custom goal setting and tracking
- [ ] Export data functionality

### Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Integration with wearables
- [ ] Group therapy features
- [ ] Professional therapist connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
