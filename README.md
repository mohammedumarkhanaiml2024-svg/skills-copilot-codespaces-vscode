# 🧠 Mood AI - Personal Assistant Application# Mood AI Backend



A sophisticated mood-based AI personal assistant with dual database support, advanced AI features, and a modern React dashboard.A secure, personalized AI-powered mood tracking and guidance system.



## 🌟 Key Features## Features



- 🔐 **Dual Database Authentication**: MongoDB & SQL (SQLite/PostgreSQL) support### Phase 1 - Core Setup ✅

- 🤖 **AI-Powered**: Sentiment analysis, mood predictions, personalized recommendations- **User Authentication**: JWT-based auth with Argon2id password hashing

- 📊 **Rich Dashboard**: Interactive charts and analytics with Material-UI- **Database Design**: MongoDB with three core collections:

- 🔒 **Enterprise Security**: JWT auth, AES-256 encryption, rate limiting  - `users`: User profiles and hashed credentials

- 🚀 **Deployment Ready**: Environment configs, Docker support, automated scripts  - `daily_logs`: Habits, mood, activities (AES-256 encrypted notes)

  - `chat_history`: AI conversations per user

## 🚀 Quick Start- **Security**: Password hashing, data encryption, user isolation



### SQL Database (Recommended)### Phase 2 - Data Security ✅

```bash- **Encryption**: Argon2id for passwords, AES-256 for personal logs

npm install && cd frontend && npm install && cd ..- **Access Control**: All queries filtered by user_id, no cross-user data leaks

npm run dev-all-sql- **Data Isolation**: Strict user-based data separation

```

### Phase 3 - AI Model 🔄

### MongoDB- **Current**: Rule-based NLP for quick replies

```bash- **Planned**: ML/Deep Learning (LSTM/Transformers) for personalized recommendations

npm install && cd frontend && npm install && cd ..- **Features**: Mood-based guidance, sentiment analysis, context-aware responses

npm run start-all

```### Phase 4 - Personalization 🔄

- **Feedback Loop**: Unlimited log entries, periodic model retraining

## 🌐 Access URLs- **Dashboard**: Mood analytics and progress visualization



- **Frontend**: http://localhost:3001## Installation

- **Backend API**: http://localhost:3000

- **Health Check**: http://localhost:3000/health1. **Clone and install dependencies:**

```bash

## 🧪 Demo Credentialsnpm install

```

**Username**: `demo_user`  

**Email**: `demo@moodai.com`  2. **Set up environment variables:**

**Password**: `DemoPass123!````bash

cp .env.example .env

## 🛠️ Available Commands# Edit .env with your actual values

```

| Command | Description |

|---------|-------------|3. **Start MongoDB:**

| `npm run start-all` | MongoDB + Backend + Frontend |```bash

| `npm run dev-all-sql` | SQL + Backend + Frontend |# Using Docker

| `npm run setup` | Install all dependencies |docker run -d -p 27017:27017 --name mood-ai-mongo mongo:latest

| `./start-all.sh` | One-command startup |

# Or install MongoDB locally

## 🏗️ Tech Stack```



**Backend**: Node.js, Express, MongoDB/SQLite, JWT, Sequelize/Mongoose  4. **Run the server:**

**Frontend**: React 18, Material-UI, Recharts, Context API  ```bash

**AI/ML**: Natural language processing, Sentiment analysis  # Development

**Security**: Argon2id/bcrypt, AES-256, CORS, Helmet  npm run dev



## 📁 Project Structure# Production

npm start

``````

mood-ai/

├── config/          # Database configurations## API Endpoints

├── models/          # Data models (MongoDB & SQL)

├── routes/          # API routes (auth, logs, chat)### Authentication

├── middleware/      # Auth & error handling- `POST /api/auth/register` - Register new user

├── ai/              # AI modules- `POST /api/auth/login` - User login

├── frontend/        # React application- `GET /api/auth/profile` - Get user profile

├── server.js        # MongoDB server- `PUT /api/auth/profile` - Update user profile

├── server_sql.js    # SQL server- `POST /api/auth/logout` - User logout

└── start-all.sh     # Startup script

```### Daily Logs

- `POST /api/logs` - Create/update daily log

## 🚀 Deployment Ready- `GET /api/logs` - Get user's daily logs (paginated)

- `GET /api/logs/:id` - Get specific daily log

✅ Comprehensive documentation  - `PUT /api/logs/:id` - Update daily log

✅ Environment templates  - `DELETE /api/logs/:id` - Delete daily log

✅ Automated scripts  - `GET /api/logs/analytics/mood` - Get mood analytics

✅ Security best practices  

✅ Docker support ready  ### Chat/AI

✅ Cloud deployment ready  - `POST /api/chat/message` - Send message to AI

- `GET /api/chat/session/:sessionId` - Get chat history

## 📖 Documentation- `GET /api/chat/sessions` - Get all chat sessions

- `PUT /api/chat/session/:sessionId/end` - End chat session

- [Startup Guide](STARTUP_GUIDE.md) - Detailed setup instructions- `DELETE /api/chat/session/:sessionId` - Delete chat session

- [Implementation Status](IMPLEMENTATION_STATUS.md) - Feature checklist

## Environment Variables

---

```env

**Made with ❤️ for better mental health and mood tracking**NODE_ENV=development
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
