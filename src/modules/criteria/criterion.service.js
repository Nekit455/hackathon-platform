import prisma from '../../prisma.js';

export const createCriterion = async (hackathonId, data) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    const error = new Error('Hackathon not found');
    error.status = 404;
    throw error;
  }

  return prisma.criterion.create({
    data: { ...data, hackathonId },
  });
};

export const getCriteriaByHackathon = async (hackathonId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    const error = new Error('Hackathon not found');
    error.status = 404;
    throw error;
  }

  return prisma.criterion.findMany({
    where: { hackathonId },
    orderBy: { name: 'asc' },
  });
};

export const updateCriterion = async (id, data) => {
  const criterion = await prisma.criterion.findUnique({ where: { id } });
  if (!criterion) {
    const error = new Error('Criterion not found');
    error.status = 404;
    throw error;
  }

  return prisma.criterion.update({
    where: { id },
    data,
  });
};

export const deleteCriterion = async (id) => {
  const criterion = await prisma.criterion.findUnique({ where: { id } });
  if (!criterion) {
    const error = new Error('Criterion not found');
    error.status = 404;
    throw error;
  }

  await prisma.criterion.delete({ where: { id } });
};
