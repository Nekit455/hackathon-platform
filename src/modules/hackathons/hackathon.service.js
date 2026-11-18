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
