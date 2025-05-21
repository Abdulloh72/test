  const express = require('express');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcrypt');
  const multer = require('multer');
  const { Pool } = require('pg');
  const cors = require("cors");
  const app = express();
  const path = require('path');

  app.use(express.json());
  app.use(cors());
  
  const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "twitter_mini_project",
    password: "1234",
    port: 5432,
  });
  const upload = multer({ dest: 'uploads/' });
  app.use('/uploads', express.static('uploads'));
  const SECRET_KEY = 'your_secret_key';
  

  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Token kerak');
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).send('Token vaqti tugab qoldi');
      req.user = user;
      next();
    });
  };


app.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { text } = req.body;
    const image = req.file ? req.file.path : null;
    await pool.query(
      'INSERT INTO posts(user_id, text, image) VALUES($1, $2, $3)',
      [req.user.id, text, image]
    );
    res.status(201).send('Post joylandi');
  } catch (error) {
    res.status(500).send('Xato: ' + error.message);
  }
});





  app.post('/signup', upload.single('profilePic'), async (req, res) => {
    const { name, username, password } = req.body;
    const profilePic = req.file ? req.file.path : null;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      await pool.query('INSERT INTO users(name, username, password, profile_pic) VALUES($1, $2, $3, $4)', [name, username, hashedPassword, profilePic]);
      res.status(201).send('Ro‘yxatdan o‘tdi');
    } catch (err) {
      res.status(400).send('Username band');
    }
  });


  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Login yoki parol xato');
    }
  });


  app.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
    const { text } = req.body;
    const image = req.file ? req.file.path : null;
    await pool.query('INSERT INTO posts(user_id, text, image) VALUES($1, $2, $3)', [req.user.id, text, image]);
    res.status(201).send('Post joylandi');
  });





  app.get('/posts', authenticateToken, async (req, res) => {
    const result = await pool.query('SELECT p.*, u.username, COUNT(l.id) as likes FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN likes l ON p.id = l.post_id GROUP BY p.id, u.username ORDER BY p.created_at DESC');
    res.json(result.rows);
  });

  
  app.get('/my-posts', authenticateToken, async (req, res) => {
    const result = await pool.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  });

 
  app.post('/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    const check = await pool.query('SELECT * FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
      res.send('Unlike qilindi');
    } else {
      await pool.query('INSERT INTO likes(user_id, post_id) VALUES($1, $2)', [userId, postId]);
      res.send('Like qo‘yildi');
    }
  });

  
  app.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    const { text } = req.body;
    await pool.query('INSERT INTO comments(user_id, post_id, text) VALUES($1, $2, $3)', [req.user.id, req.params.id, text]);
    res.status(201).send('Kommentariya qo‘shildi');
  });




  app.post('/comments/:id/like', authenticateToken, async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;
    const check = await pool.query('SELECT * FROM comment_likes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM comment_likes WHERE user_id = $1 AND comment_id = $2', [userId, commentId]);
      res.send('Unlike qilindi');
    } else {
      await pool.query('INSERT INTO comment_likes(user_id, comment_id) VALUES($1, $2)', [userId, commentId]);
      res.send('Like qo‘yildi');
    }
  });


  app.get('/my-likes', authenticateToken, async (req, res) => {
    const result = await pool.query('SELECT p.*, u.username FROM posts p JOIN likes l ON p.id = l.post_id JOIN users u ON p.user_id = u.id WHERE l.user_id = $1 ORDER BY p.created_at DESC', [req.user.id]);
    res.json(result.rows);
  });

 
  app.post('/logout', authenticateToken, (req, res) => {
    res.send('Tizimdan chiqildi');
  });


  app.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);
    
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});



  app.listen(3000, () => console.log('Server 3000-portda ishlayapti'));