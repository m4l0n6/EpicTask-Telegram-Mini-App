require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');  
const MongoStore = require('connect-mongo');  
const connectDB = require('./config/database');

 
connectDB();

const app = express();

 
app.use(cors());  
app.use(express.json());
app.use((err, req, res, next) => {
    console.error("💥 Lỗi Server:", err.stack || err); 
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error - Lỗi máy chủ nội bộ',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  });

 
const sessionStore = MongoStore.create({
  mongoUrl: process.env.MONGO_URI,  
  collectionName: 'sessions'  
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-very-strong-secret-key', 
    resave: false,
    saveUninitialized: false,  
    store: sessionStore,  
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,  
      httpOnly: true,  
     
    }
  })
);


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const badgeRoutes = require('./routes/badgeRoutes');



app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/leaderboard', leaderboardRoutes);
app.use('/api/v1/badges', badgeRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});