const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.post('/scrape', articleController.scrapeAndStore);
router.get('/original', articleController.getOriginalArticles);
router.get('/updated', articleController.getUpdatedArticles);
router.post('/', articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;