import { getLeaderboard } from './leaderboard.service.js';

export const getLeaderboardHandler = async (req, res, next) => {
  try {
    const leaderboard = await getLeaderboard(req.params.hackathonId);
    res.json({ status: 'success', data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};
