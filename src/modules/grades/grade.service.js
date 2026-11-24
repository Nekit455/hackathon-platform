import prisma from '../../prisma.js';

export const createGrade = async (projectId, judgeId, data) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { team: { include: { hackathon: true } } },
  });

  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }

  const hackathon = project.team.hackathon;

  if (hackathon.status !== 'ONGOING') {
    const error = new Error('Оценивание доступно, если хакатон имеет статус "ONGOING"');
    error.status = 400;
    throw error;
  }

  const judgeAssignment = await prisma.hackathonJudge.findUnique({
    where: { hackathonId_userId: { hackathonId: hackathon.id, userId: judgeId } },
  });

  if (!judgeAssignment) {
    const error = new Error('Вы не являетесь судьей этого хакатона');
    error.status = 403;
    throw error;
  }

  const criterion = await prisma.criterion.findUnique({
    where: { id: data.criterionId },
  });

  if (!criterion) {
    const error = new Error('Критерий не найден');
    error.status = 404;
    throw error;
  }

  if (criterion.hackathonId !== hackathon.id) {
    const error = new Error('Критерий не относится к этому хакатону');
    error.status = 400;
    throw error;
  }

  if (data.score > criterion.maxScore) {
    const error = new Error(`Оценка не может превышать максимальный балл (${criterion.maxScore})`);
    error.status = 400;
    throw error;
  }

  // Защита от повторного оценивания: проверка на уровне сервиса
  const existingGrade = await prisma.grade.findUnique({
    where: {
      projectId_judgeId_criterionId: {
        projectId,
        judgeId,
        criterionId: data.criterionId,
      },
    },
  });

  if (existingGrade) {
    const error = new Error('Вы уже оценили этот проект по данному критерию');
    error.status = 409;
    throw error;
  }

  return prisma.grade.create({
    data: {
      projectId,
      judgeId,
      criterionId: data.criterionId,
      score: data.score,
    },
    include: {
      criterion: true,
      judge: { select: { id: true, email: true, name: true } },
    },
  });
};

export const getGradesByProject = async (projectId, userId, userRole) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { team: { include: { hackathon: true } } },
  });

  if (!project) {
    const error = new Error('Проект не найден');
    error.status = 404;
    throw error;
  }

  const hackathon = project.team.hackathon;

  // Если хакатон еще не завершен, судья видит только свои оценки,
  // а участники и остальные — не видят оценок вообще (кроме админа)
  if (hackathon.status !== 'FINISHED' && userRole !== 'ADMIN') {
    if (userRole === 'JUDGE') {
      return prisma.grade.findMany({
        where: { projectId, judgeId: userId },
        include: { 
          criterion: true,
          judge: { select: { id: true, email: true, name: true } }, 
        },
      });
    }
    const error = new Error('Оценки будут видны только после завершения хакатона');
    error.status = 403;
    throw error;
  }

  return prisma.grade.findMany({
    where: { projectId },
    include: {
      criterion: true,
      judge: { select: { id: true, email: true, name: true } },
    },
  });
};
