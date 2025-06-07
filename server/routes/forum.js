const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('@models/Global/User');
const UserLevel = require('@models/Global/UserLevel')
const ForumPost = require('@models/Forum/ForumPost');
const PostCategory = require('@models/Forum/PostCategory');
const ForumComment = require('@models/Forum/ForumComment');
const RecyclingActivity = require('@models/Global/RecyclingActivity');
const authMiddleware = require('@middleware/authMiddleware');
const { recalculateUserScore } = require('@utils/functions');


// función para dar mismo formato a todos los nombres de categoría de post
function normalizeCategoryName(name) {
  if (!name || typeof name !== 'string') return '';
  name = name.trim().toLowerCase(); // todo minúsculas
  return name.charAt(0).toUpperCase() + name.slice(1); // mayúscula primera letra
}

// obtener todos los posts
router.get('/posts', async (req, res) => {
    try {
      let posts = await ForumPost.find()
          .populate('createdBy', 'username fullname avatar score level')
          .populate('categories', 'name')
          .sort({ createdAt: -1 })  // ordena por fecha de creación más reciente
          .lean();

      // elimina duplicados en los niveles
      const levelIds = [...new Set(posts.map(p => p.createdBy.level).filter(Boolean))];

      // obtiene la información de los niveles
      const levels = await UserLevel.find({ _id: { $in: levelIds } }).lean();

      // creación de un diccionario para almacenar
      const levelMap = levels.reduce((acc, lvl) => {
        acc[lvl._id.toString()] = lvl;
        return acc;
      }, {});

      // almacena los datos de los niveles
      posts = posts.map(post => {
        const levelData = levelMap[post.createdBy.level?.toString()];
        return {
          ...post,
          createdBy: {
            ...post.createdBy,
            level: levelData || post.createdBy.level,
          }
        };
      });

      res.json(posts);
    } catch (error) {
        console.error('Error al recuperar los posts del foro:', error); 
        res.status(500).json({ error: "Error al recuperar los posts del foro" });
    }
});

// obtener posts por filtrado
router.get('/posts/filter', async (req, res) => {
  try {
    // parámetros aceptados:
    const page = parseInt(req.query.page) || 1; // número de página (default: 1)
    const limit = parseInt(req.query.limit) || 10; // cuántos posts por página (default: 10)
    const orderBy = req.query.orderBy || 'latest'; // cómo ordenar (latest, oldest, lastReply, replies)
    const categoryFilters = req.query.categories?.split(',').map(c => normalizeCategoryName(c)) || [];

    const match = {};

    // en caso de que se vaya a filtrar por categorías
    if (categoryFilters.length > 0) {
      const categoriesInDb = await PostCategory.find({ name: { $in: categoryFilters } }).lean();
      const categoryIds = categoriesInDb.map(cat => cat._id);
      match.categories = { $in: categoryIds };
    }

    // variables para la ordenación
    let total; // total de documentos con el filtro aplicado
    let posts; // posts que se recuperan con la ordenación, segúb la paginación
    
    if (orderBy === 'replies') { // caso especial: ordenación por número de replies
      const countPipeline = [
        { $match: match },
        {
          $addFields: {
            repliesCount: { $size: { $ifNull: ['$replies', []] } }
          }
        },
        { $count: 'totalCount' }
      ];

      const totalCountResult = await ForumPost.aggregate(countPipeline);
      total = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

      const aggregatePipeline = [
        { $match: match },
        {
          $addFields: {
            repliesCount: { $size: { $ifNull: ['$replies', []] } }
          }
        },
        { $sort: { repliesCount: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ];

      posts = await ForumPost.aggregate(aggregatePipeline);

      // populate manual de createdBy (autor del post)
      const createdByIds = posts.map(p => p.createdBy).filter(Boolean);
      const users = await User.find({ _id: { $in: createdByIds } }, 'username fullname avatar score level').lean();
      const userMap = {};
      users.forEach(u => { userMap[u._id.toString()] = u; });

      // populate manual de categories
      const categoryIds = posts.flatMap(p => p.categories || []);
      const categories = await PostCategory.find({ _id: { $in: categoryIds } }, 'name').lean();
      const categoryMap = {};
      categories.forEach(c => { categoryMap[c._id.toString()] = c; });

      // se agregan los populate al post
      posts = posts.map(post => ({
        ...post,
        createdBy: userMap[post.createdBy?.toString()] || post.createdBy,
        categories: (post.categories || []).map(catId => categoryMap[catId.toString()] || catId),
      }));

    } else { // ordenación para el resto de casos que no es por replies
      let sort = { createdAt: -1 }; // latest (default)
      if (orderBy === 'oldest') sort = { createdAt: 1 };
      else if (orderBy === 'lastReply') sort = { lastReplyAt: -1 };

      total = await ForumPost.countDocuments(match);
      posts = await ForumPost.find(match)
        .populate('createdBy', 'username fullname avatar score level')
        .populate('categories', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    }

    // let posts = await ForumPost.find(match)
    //   .populate('createdBy', 'username fullname avatar score level')
    //   .populate('categories', 'name')
    //   .sort(sort)
    //   .skip((page - 1) * limit)
    //   .limit(limit)
    //   .lean();

    // niveles duplicados (para insertar datos completos)
    const levelIds = [...new Set(posts.map(p => p.createdBy?.level).filter(Boolean).map(id => id.toString()))];
    const levels = await UserLevel.find({ _id: { $in: levelIds } }).lean();
    const levelMap = levels.reduce((acc, lvl) => {
      acc[lvl._id.toString()] = lvl;
      return acc;
    }, {});

    posts = posts.map(post => {
      const levelData = levelMap[post.createdBy?.level?.toString()];
      return {
        ...post,
        createdBy: {
          ...post.createdBy,
          level: levelData || post.createdBy.level,
        }
      };
    });

    res.json({
      posts,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Error al recuperar posts paginados:', error);
    res.status(500).json({ error: 'Error al recuperar los posts paginados' });
  }
});

// número de posts disponibles en BD para el foro
router.get('/posts/post-count', async (req, res) => {
  try {
    const count = await ForumPost.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener el número de posts:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// obtener las categorías para los posts
router.get('/posts/post-categories', async (req, res) => {
    try {
        const categories = await PostCategory.find()
                                            .sort({ name: 1 }) // orden alfabético
                                            .lean();
        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// obtener un post específico
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await ForumPost.findById(req.params.id)
            .populate('createdBy', 'username fullname avatar score level')
            .populate('categories', 'name')
            .lean();

        if (!post) return res.status(404).json({ error: 'Post no encontrado' });

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el post' });
    }
});

// obtener las respuestas de un post de forma progresiva
router.get('/posts/:id/replies', async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // 5 respuestas cada vez
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 5;

  try {
    let replies = await ForumComment.find({ post: req.params.id })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate('user', 'username fullname avatar score level')
      .sort({ createdAt: 1 })
      .lean();

    // elimina niveles duplicados
    const levelIds = [...new Set(
      replies
        .map(reply => reply.user?.level)
        .filter(Boolean)
        .map(levelId => levelId.toString())
    )];

    // obtiene los datos de los niveles
    const levels = await UserLevel.find({ _id: { $in: levelIds } }).lean();

    // crea un diccionario con los niveles
    const levelMap = levels.reduce((acc, lvl) => {
      acc[lvl._id.toString()] = lvl;
      return acc;
    }, {});

    // inserta los datos del nivel
    replies = replies.map(reply => {
      const levelData = levelMap[reply.user?.level?.toString()];
      return {
        ...reply,
        user: {
          ...reply.user,
          level: levelData || reply.user.level,
        }
      };
    });

    const totalReplies = await ForumComment.countDocuments({ post: req.params.id });

    res.json({
      replies,
      totalReplies,
      totalPages: Math.ceil(totalReplies / limitNumber),
      currentPage: pageNumber,
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
        }).sort({ name: 1 }).lean();

        res.json(categories);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
        // res.status(500).json({ error: 'Error al obtener las categorías' });
    }
});

// crear un nuevo post
router.post('/posts/create-post', authMiddleware, async (req, res) => {
  try {
    const { title, content, categories } = req.body;
    const userId = req.userId; // obtenido del token a través del authMiddleware por seguridad

    if (!title || !content) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    if (!userId) {
        return res.status(400).json({ error: 'Fallo de autenticación de usuario' });
    }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categorías inválidas' });
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
        const normalizedCat = normalizeCategoryName(cat.name);

        // se confirma si la categoría está en el backend
        let existing = await PostCategory.findOne({ name: normalizedCat });

        if (!existing) { // si es una categoría nueva
            // crea la nueva categoría
            existing = await PostCategory.create({ name: normalizedCat, postsCount: 1 });
        }

        // se incluye el _id en el array
        categoryIds.push(existing._id.toString());
      }
    }

    // elimina posibles duplicados en la lista de categorías
    const uniqueCategoryIds = [...new Set(categoryIds)];

    const newPost = new ForumPost({
        title,
        content,
        createdBy: userId,
        type: 'post',
        categories: uniqueCategoryIds,
        // createdAt, lastReplyAt y replies toman sus valores por defecto
    });

    await newPost.save(); // se guarda el nuevo post

    // añade el post al array de mensajes del usuario
    await User.findByIdAndUpdate(userId, {
      $push: {
        messages: {
          _id: newPost._id,
          model: 'ForumPost',
          type: 'post',
        },
      },
    });

    const populatedNewPost = await ForumPost.findById(newPost._id)
                                            .populate('createdBy', 'fullname')
                                            .populate('categories', 'name')
                                            .lean();

    res.status(201).json({ message: 'Post creado correctamente', post: populatedNewPost });
  } catch (error) {
    console.error('Error al crear post:', error);
    res.status(500).json({ error: 'Error al crear post' });
  }
});

// crear un comentario para un post específico
router.post('/posts/:id/create-comment', authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id; // de la ruta de post a la API
    const userId = req.userId; // del middleware de auth
    const { text } = req.body;

    // comprobación de que el contenido de la respuesta no está vacío
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'El texto del comentario es obligatorio' });
    }

    // verifica que el id del post dado existe
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // creación de objeto comentario según el modelo
    const newComment = new ForumComment({
      post: postId,
      user: userId,
      text,
    }); // responseTo toma valor el defecto null, createdAt toma el defecto que es now

    // guarda el comentario en BD
    const savedComment = await newComment.save();

    // actualiza el post con el nuevo comentario y fecha de última respuesta
    post.replies.push(savedComment._id); // añade el id del comentario nuevo al array de respuestas del post
    post.lastReplyAt = savedComment.createdAt; // actualiza fecha de última edición del post
    await post.save(); // guarda los cambios

    // se añade la respuesta al perfil del usuario
    await User.findByIdAndUpdate(userId, {
      $push: {
        messages: {
          _id: savedComment._id,
          model: 'ForumComment',
          type: 'reply',
        },
      },
    });

    const populatedComment = await ForumComment.findById(savedComment._id)
                                               .populate('user', 'fullname')
                                               .lean();

    return res.status(201).json({ message: 'Comentario creado correctamente', comment: populatedComment });
  } catch (error) {
    console.error('Error creando comentario:', error);
    return res.status(500).json({ error: 'Error creando comentario' });
  }
});

// crear un comentario para un comentario específico
router.post('/comments/:id/create-comment', authMiddleware, async (req, res) => {
  try {
    const parentCommentId = req.params.id; // de la ruta de post a la API
    const userId = req.userId; // del middleware de auth
    const { postId, text } = req.body;

    // valida el id de referencia al comentario
    if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
      return res.status(400).json({ error: 'ID de referencia al comentario no válido' });
    }

    // valida el id de referencia al post
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'ID de referencia al post no válido' });
    }

    // comprobación de que el contenido de la respuesta no está vacío
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'El texto del comentario es obligatorio' });
    }

    // verifica que el comentario original al que se responde existe
    const parentComment = await ForumComment.findById(parentCommentId);
    if (!parentComment) {
      return res.status(404).json({ error: 'Comentario original no encontrado' });
    }

    // verifica que el post relacionado existe
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post de referencia no encontrado' });
    }

    // nuevo comentario como respuesta al anterior
    const newReply = new ForumComment({
      post: postId, // _id del post padre
      user: userId, // _id del usuario que escribe la respuesta
      text, // contenido de la respuesta
      responseTo: parentCommentId, // _id de a qué comentario responde
    }); // createdat toma el valor por defecto now

    // se guarda la respuesta en BD
    const savedReply = await newReply.save();

    // agrega la respuesta al array de respuestas del post
    post.replies.push(savedReply._id);
    post.lastReplyAt = savedReply.createdAt;
    await post.save();

    // agregar la respuesta al array de mensajes del usuario
    await User.findByIdAndUpdate(userId, {
      $push: {
        messages: {
          _id: savedReply._id,
          model: 'ForumComment',
          type: 'reply',
        },
      },
    });

    const populatedReply = await ForumComment.findById(savedReply._id)
                                             .populate('user', 'fullname')
                                             .lean();

    res.status(201).json({ reply: populatedReply });
  } catch (error) {
    console.error('Error al crear respuesta al comentario:', error);
    res.status(500).json({ error: 'Error al crear respuesta' });
  }
});

// borrar post completamente
router.delete('/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;

    // 1. se busca el post por id en la colección de posts del foro
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    // se extraen los datos necesarios del post
    const creatorId = post.createdBy; // _id del usuario creador del post
    const categoriesIds = post.categories; // array de ObjectId de categorías

    // 2. busca y borrar recycling activities relacionadas con el post
    // buscando el _id del post en postRef de las recycling activities
    const recyclingActivities = await RecyclingActivity.find({ postRef: postId });
    const recyclingActivityIds = recyclingActivities.map(ra => ra._id);

    // se borran esas recycling activities
    await RecyclingActivity.deleteMany({ _id: { $in: recyclingActivityIds } });

    // 3. se busca al usuario creador del post en la colección users
    const user = await User.findById(creatorId);
    if (!user) {
      return res.status(404).json({ error: 'No se ha encontrado al usuario creador del post' });
    }

    // 4. borra recycling activities del usuario que coincidan con las borradas antes
    user.recyclingActivities = user.recyclingActivities.filter(
      raId => !recyclingActivityIds.some(id => id.equals(raId))
    );

    // 5. recalcula el score del usuario
    user.score = await recalculateUserScore(user._id);

    // 6. borra referencias al post en messages del usuario
    // (messages es un array de objetos, cada uno con un _id que es el id del post)
    user.messages = user.messages.filter(
      messageObj => !messageObj._id.equals(postId)
    );

    // guarda los cambios hechos en el usuario
    await user.save();

    // 7. se actualizan las categorías de post
    if (categoriesIds && categoriesIds.length > 0) { // si el post tenía categorías
      for (const categoryId of categoriesIds) {
        const category = await PostCategory.findById(categoryId);
        if (!category) continue;

        if (category.postsCount === 1) {
          // si solo tiene ese post, elimina la categoría
          await PostCategory.deleteOne({ _id: categoryId });
        } else if (category.postsCount > 1) {
          // si tiene más posts, restar 1 al contador
          category.postsCount -= 1;
          await category.save();
        }
      }
    }

    // 8. finalmente, se borra el post
    await ForumPost.deleteOne({ _id: postId });

    return res.status(200).json({ message: 'Post borrado correctamente' });
  } catch (error) {
    console.error('Error borrando post:', error);
    return res.status(500).json({ error: 'Error el servidor borrando el post' });
  }
});

// baneo de post por admin (sólo oculta el contenido del post, pero el post se queda en BD)
router.patch('/posts/:postId/visibility', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { banned } = req.body; // true para baneo, false para restaurar

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post no encontrado' });
    }

    post.banned = banned;
    await post.save();

    return res.status(200).json({ message: banned ? 'Post ocultado' : 'Post restaurado' });
  } catch (err) {
    console.error('Error actualizando visibilidad del post:', err);
    return res.status(500).json({ error: 'Error del servidor actualizando visibilidad del post' });
  }
});

// borrar comentario

module.exports = router;
