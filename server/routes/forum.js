const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const PostCategory = require('../models/PostCategory')
const ForumComment = require('../models/ForumComment');
const mongoose = require('mongoose');

// obtener todos los posts
router.get('/forum-posts', async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate('createdBy', 'username')
            .populate('categories', 'name')
            .sort({ createdAt: -1 });  // ordena por fecha de creación más reciente
        res.json(posts);
    } catch (error) {
        console.error('Error al recuperar los posts del foro:', error); 
        res.status(500).json({ error: "Error al recuperar los posts del foro" });
    }
});

// obtener las categorías para los posts
router.get('/post-categories', async (req, res) => {
    try {
        const categories = await PostCategory.find().sort({ name: 1 }); // orden alfabético
        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// obtener un post específico
router.get('/forum-posts/:id', async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('categories', 'name');

        if (!post) return res.status(404).json({ message: 'Post no encontrado' });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el post' });
    }
});

// obtener las respuestas de un post de forma progresiva
router.get('/forum-posts/:id/replies', async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // 5 respuestas cada vez

  try {
    const replies = await ForumComment.find({ post: req.params.id })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'username')
      .sort({ createdAt: 1 });

    const totalReplies = await ForumComment.countDocuments({ post: req.params.id });

    res.json({
      replies,
      totalReplies,
      totalPages: Math.ceil(totalReplies / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las respuestas al post' });
  }
});

// Crear un nuevo post
router.post('/posts', async (req, res) => {
  const { title, content, createdBy, categories, type } = req.body;

  const newPost = new Post({
    title,
    content,
    createdBy,
    categories,
    type
  });

  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Crear un comentario para un post específico
router.post('/posts/:id/comments', async (req, res) => {
  const { text, createdBy, responseTo } = req.body;
  const postId = req.params.id;

  const newComment = new ForumComment({
    text,
    post: postId,
    user: createdBy,
    responseTo
  });

  try {
    const savedComment = await newComment.save();

    // Añadir el comentario a la lista de respuestas del post
    await Post.findByIdAndUpdate(postId, {
      $push: { replies: savedComment._id },
      $set: { lastReplyAt: savedComment.createdAt }
    });

    res.status(201).json(savedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


module.exports = router;
