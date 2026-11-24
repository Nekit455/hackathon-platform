import prisma from '../../prisma.js';

export const getLeaderboard = async (hackathonId) => {
  const hackathon = await prisma.hackathon.findUnique({
    where: { id: hackathonId },
    include: {
      criteria: true,
    },
  });

  if (!hackathon) {
    const error = new Error('Хакатон не найден');
    error.status = 404;
    throw error;
  }

  // Статус хакатона должен быть FINISHED
  if (hackathon.status !== 'FINISHED') {
    const error = new Error('Лидерборд будет доступен только после завершения хакатона');
    error.status = 403;
    throw error;
  }
  
  // Дата окончания хакатона в прошлом
  if (new Date() < new Date(hackathon.endDate)) {
    const error = new Error('Дата окончания хакатона должна быть в прошлом');
    error.status = 403;
    throw error;
  }

  // Получаем все проекты хакатона с оценками
  const projects = await prisma.project.findMany({
    where: { team: { hackathonId } },
    include: {
      team: { select: { id: true, name: true } },
      grades: {
        include: {
          criterion: true,
          judge: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Считаем итоговые баллы
  const leaderboard = projects.map((project) => {
    const criteriaBreakdown = hackathon.criteria.map((criterion) => {
      const gradesForCriterion = project.grades.filter(
        (g) => g.criterionId === criterion.id
      );

      const sum = gradesForCriterion.reduce((acc, g) => acc + g.score, 0);
      const judgesCount = gradesForCriterion.length;
      const average = judgesCount > 0 ? sum / judgesCount : 0;

      return {
        criterionId: criterion.id,
        criterionName: criterion.name,
        maxScore: criterion.maxScore,
        averageScore: Number(average.toFixed(2)),
        judgesCount,
        grades: gradesForCriterion.map((g) => ({
          judgeId: g.judge.id,
          judgeName: g.judge.name,
          score: g.score,
        })),
      };
    });

    const totalScore = criteriaBreakdown.reduce(
      (acc, c) => acc + c.averageScore,
      0
    );

    return {
      projectId: project.id,
      projectTitle: project.title,
      teamId: project.team.id,
      teamName: project.team.name,
      totalScore: Number(totalScore.toFixed(2)),
      criteriaBreakdown,
    };
  });

  leaderboard.sort((a, b) => b.totalScore - a.totalScore);

  return leaderboard;
};
