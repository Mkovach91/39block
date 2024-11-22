const express = require("express");
const prisma = require("../prisma");
const { authenticate } = require("./auth");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { ownerId: req.user.id },
    })
    res.json(tasks)
  } catch (error) {
    next(error)
  }
})

router.post("/", authenticate, async (req, res, next) =>{
  const { name } = req.body

  try {
    if(!name) {
      return res.status(400).json({ message: `Task name is required`});
    }

    const task = await prisma.task.create({
      data: {
        name,
        ownerId: req.user.id,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    next(error)
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: +id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You cant delete this task" });
    }

    await prisma.task.delete({
      where: { id: +id },
    });

    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, done } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: +id },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this task" });
    }

    if (typeof name === "undefined" || typeof done === "undefined") {
      return res.status(400).json({ message: "Both 'name' and 'done' fields are required" });
    }

    const updatedTask = await prisma.task.update({
      where: { id: +id },
      data: { name, done },
    });

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

module.exports = router;