import prisma from '../../prisma.js';

export const createTeam = async (hackathonId, captainId, data) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    const error = new Error('Хакатон не найден');
    error.status = 404;
    throw error;
  }

  const existingTeam = await prisma.team.findFirst({
    where: { hackathonId, captainId },
  });
  if (existingTeam) {
    const error = new Error('Вы уже являетесь капитаном команды этого хакатона');
    error.status = 409;
    throw error;
  }

  return prisma.team.create({
    data: {
      name: data.name,
      hackathonId,
      captainId,
      members: {
        create: {
          userId: captainId,
          role: 'CAPTAIN',
          status: 'ACCEPTED',
        },
      },
    },
    include: {
      members: { include: { user: { select: { id: true, email: true, name: true } } } },
    },
  });
};

export const getTeamsByHackathon = async (hackathonId) => {
  const hackathon = await prisma.hackathon.findUnique({ where: { id: hackathonId } });
  if (!hackathon) {
    const error = new Error('Хакатон не найден');
    error.status = 404;
    throw error;
  }

  return prisma.team.findMany({
    where: { hackathonId },
    include: {
      members: { include: { user: { select: { id: true, email: true, name: true } } } },
      project: true,
    },
  });
};

export const getTeamById = async (id) => {
  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, email: true, name: true } } } },
      project: true,
      hackathon: true,
    },
  });

  if (!team) {
    const error = new Error('Команда не найдена');
    error.status = 404;
    throw error;
  }

  return team;
};

export const inviteMember = async (teamId, captainId, email) => {
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    const error = new Error('Команда не найдена');
    error.status = 404;
    throw error;
  }

  if (team.captainId !== captainId) {
    const error = new Error('Только капитан может приглашать участников');
    error.status = 403;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Пользователя с таким email не найдено');
    error.status = 404;
    throw error;
  }

  const existingMember = await prisma.member.findUnique({
    where: { teamId_userId: { teamId, userId: user.id } },
  });
  if (existingMember) {
    const error = new Error('Пользователь уже в команде');
    error.status = 409;
    throw error;
  }

  return prisma.member.create({
    data: {
      teamId,
      userId: user.id,
      role: 'MEMBER',
      status: 'PENDING',
    },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });
};

export const acceptInvitation = async (memberId, userId) => {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) {
    const error = new Error('Приглашение не найдено');
    error.status = 404;
    throw error;
  }

  if (member.userId !== userId) {
    const error = new Error('Это приглашение не для вас');
    error.status = 403;
    throw error;
  }

  if (member.status === 'ACCEPTED') {
    const error = new Error('Приглашение уже принято');
    error.status = 409;
    throw error;
  }

  return prisma.member.update({
    where: { id: memberId },
    data: { status: 'ACCEPTED' },
    include: {
      team: true,
      user: { select: { id: true, email: true, name: true } },
    },
  });
};
