const {createChapter, getChapter, getAllChaptersForCourse, updateChapter,deleteChapter} = require('../../controllers/chapter.controller')
const { restrict } = require('../../middlewares/auth.middleware')
const router = require('express').Router()

router.post('/courses/:courseId/chapters',restrict,createChapter)
router.put('/courses/:courseId/chapters/:id',restrict,updateChapter)
router.delete('/courses/:courseId/chapters/:id',restrict,deleteChapter)
router.get('/courses/:courseId/chapters/:chapterId',getChapter)
router.get('/courses/:courseId/chapters',getAllChaptersForCourse)



module.exports = router