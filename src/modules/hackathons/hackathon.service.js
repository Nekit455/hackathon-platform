import prisma from '../../prisma.js';

export const createHackathon = async (data) => {
  return prisma.hackathon.create({ data });
};

export const getAllHackathons = async () => {
  return prisma.hackathon.findMany({
    orderBy: { startDate: 'desc' },
  });
};

export const getHackathonById = async (id) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      criteria: true,
      teams: { select: { id: true, name: true } },
    },
  });

  if (!hackathon) {
    const error = new Error('Hackathon not found');
    error.status = 404;
    throw error;
  }

  return hackathon;
};

export const updateHackathon = async (id, data) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) {
    const error = new Error('Hackathon not found');
    error.status = 404;
    throw error;
  }

  return prisma.hackathon.update({
    where: { id },
    data,
  });
};

export const assignJudge = async (hackathonId, userId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    const error = new Error('Hackathon not found');
    error.status = 404;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  if (user.role !== 'JUDGE') {
    const error = new Error('User must have JUDGE role');
    error.status = 400;
    throw error;
  }

  const existingAssignment = await prisma.hackathonJudge.findUnique({
    where: { hackathonId_userId: { hackathonId, userId } },
  });
  if (existingAssignment) {
    const error = new Error('User is already a judge for this hackathon');
    error.status = 409;
    throw error;
  }

  return prisma.hackathonJudge.create({
    data: { hackathonId, userId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });
};