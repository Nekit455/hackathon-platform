import prisma from '../../prisma.js';

export const createProject = async (teamId, userId, data) => {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: { where: { status: 'ACCEPTED' } },
      project: true,
    },
  });

  if (!team) {
    const error = new Error('Команда не найдена');
    error.status = 404;
    throw error;
  }

  if (team.captainId !== userId) {
    const error = new Error('Только капитан может представлять проект');
    error.status = 403;
    throw error;
  }

  if (team.project) {
    const error = new Error('Команда уже представила проект');
    error.status = 409;
    throw error;
  }

  // Проверка: минимум 2 принятых участника
  if (team.members.length < 2) {
    const error = new Error('Команда должна иметь хотя бы 2 участника, чтобы представить проект');
    error.status = 400;
    throw error;
  }

  return prisma.project.create({
    data: {
      ...data,
      teamId,
    },
  });
};

export const getProjectById = async (id) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      team: {
        include: {
          members: {
            where: { status: 'ACCEPTED' },
            include: { user: { select: { id: true, email: true, name: true } } },
          },
        },
      },
      grades: {
        include: {
          judge: { select: { id: true, email: true, name: true } },
          criterion: true,
        },
      },
    },
  });

  if (!project) {
    const error = new Error('Проект не найден');
    error.status = 404;
    throw error;
  }

  return project;
};

export const updateProject = async (id, userId, data) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { team: true },
  });

  if (!project) {
    const error = new Error('Проект не найден');
    error.status = 404;
    throw error;
  }

  if (project.team.captainId !== userId) {
    const error = new Error('Только капитан может обновлять проект');
    error.status = 403;
    throw error;
  }

  return prisma.project.update({
    where: { id },
    data,
  });
};
