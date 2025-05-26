const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const PostCategory = require('../models/PostCategory');
const ForumComment = require('../models/ForumComment');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// obtener todos los posts
router.get('/forum-posts', async (req, res) => {
    try {
        const posts = await ForumPost.find()
            .populate('createdBy', 'username fullname avatar score level')
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
            .populate('createdBy', 'username fullname avatar score level')
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
      .populate('user', 'username fullname avatar score level')
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

// búsqueda de categorías para la creación de post
router.get('/post-categories-search', async (req, res) => {
    const search = req.query.search || '';

    try {
        const categories = await PostCategory.find({
            // busca por coincidencia parcial, case-insensitive
            name: { $regex: search, $options: 'i' }
        }).sort({ name: 1 });

        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// Crear un nuevo post
router.post('/create-post', authMiddleware, async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const userId = req.userId; // obtenido del token a través del authMiddleware por seguridad

    if (!title || !content) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'Fallo de autenticación de usuario' });
    }

    const categoryIds = [];

    // nota: las categorías se reciben como un string de _id de categoría si
    // el usuario selecciona una categoría ya existente en el backend;
    // y como un objeto con el nombre de la categoría si es una nueva

    for (const cat of categories) {
      if (typeof cat === 'string') { // el formato es un _id
        // se incluye en el array
        categoryIds.push(cat);
      } else if (typeof cat === 'object' && cat.name) { // formato es objeto
        // se confirma si la categoría está en el backend
        let existing = await PostCategory.findOne({ name: cat.name });

        if (!existing) { // si es una categoría nueva
            // crea la nueva categoría
            existing = await PostCategory.create({ name: cat.name });
        }

        // se incluye el _id en el array
        categoryIds.push(existing._id);
      }
    }

    const newPost = new ForumPost({
        title,
        content,
        createdBy: userId,
        type: 'post',
        categories: categoryIds,
        // createdAt, lastReplyAt y replies toman sus valores por defecto
    });

    await newPost.save(); // se guarda el nuevo post

    res.status(201).json({ message: 'Post creado correctamente', post: newPost });
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ message: 'Error al crear post' });
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
