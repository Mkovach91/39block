const prisma = require("../prisma");

const seed = async (numTasks = 3) => {
  const user = await prisma.user.create({
    data: {
      userName: "test",
      password: "testpw",
    },
  });
  const tasks = Array.from({ length: numTasks }, (_, i) => ({
    name: `Task ${i + 1}`,
    ownerId: user.id,
  }));
  await prisma.task.createMany({ data: tasks });
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });