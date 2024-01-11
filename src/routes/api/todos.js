import express from 'express';
import { Todo } from '../../models/index.js'

const router = express.Router();

router.get('/todos', async (req, res) => {
  if (!req.user) {
    return res.json({
      error: 'user not logged in'
    });
  }
  let todos = await Todo.findAll({
    where: {
      userId: req.user.id
    }
  })
  res.json(todos.map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed
  })));
})

router.post('/todo', async (req, res) => {
  if (!req.user) {
    return res.json({
      error: 'user not logged in'
    });
  }

  if (!req.body.title) {
    return res.json({
      error: 'no todo title'
    });
  }

  const todo = await Todo.create({
    userId: req.user.id,
    title: req.body.title.trim(),
    completed: false,
  })

  res.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed
  })
})

router.get('/todo/:id', async (req, res, next) => {
  if (!req.user) {
    return next(new Error('not logged in'))
  }
  let todo = await Todo.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
  }})

  if (!todo) {
    return res.json({
      error: "Invalid Todo"
    })
  }

  return res.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed
  });
})

router.patch('/todo/:id/completed', async (req, res, next) => {
  if (!req.user) {
    return next(new Error('not logged in'))
  }
  let todo = await Todo.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
  }})

  if (!todo) {
    return res.json({
      error: "Invalid Todo"
    })
  }
  
  if (req.body.completed === null) {
    return res.json({
      error: "No completed field"
    })
  }

  todo.completed = req.body.completed;
  await todo.save();
  todo = await todo.reload();

  return res.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed
  })
})

router.delete('/todo/:id', async(req, res) => {
  if (!req.user) {
    return res.json({error: 'not logged in'});
  }

  let todo = await Todo.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id,
  }})

  if (!todo) {
    return res.json({
      error: "Todo does not exist"
    })
  }

  await todo.destroy();

  return res.json("Successfully deleted");
})

export default router;