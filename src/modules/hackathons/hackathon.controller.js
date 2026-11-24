import { createHackathonSchema, updateHackathonSchema, assignJudgeSchema } from './hackathon.schema.js';
import * as hackathonService from './hackathon.service.js';

export const create = async (req, res, next) => {
  try {
    const data = createHackathonSchema.parse(req.body);
    const hackathon = await hackathonService.createHackathon(data);
    res.status(201).json({ status: 'success', data: { hackathon } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const hackathons = await hackathonService.getAllHackathons();
    res.json({ status: 'success', data: { hackathons } });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const hackathon = await hackathonService.getHackathonById(req.params.id);
    res.json({ status: 'success', data: { hackathon } });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateHackathonSchema.parse(req.body);
    const hackathon = await hackathonService.updateHackathon(req.params.id, data);
    res.json({ status: 'success', data: { hackathon } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const assignJudge = async (req, res, next) => {
  try {
    const data = assignJudgeSchema.parse(req.body);
    const assignment = await hackathonService.assignJudge(req.params.id, data.userId);
    res.status(201).json({ status: 'success', data: { assignment } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};