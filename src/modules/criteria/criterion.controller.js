import { createCriterionSchema, updateCriterionSchema } from './criterion.schema.js';
import * as criterionService from './criterion.service.js';

export const create = async (req, res, next) => {
  try {
    const data = createCriterionSchema.parse(req.body);
    const criterion = await criterionService.createCriterion(req.params.hackathonId, data);
    res.status(201).json({ status: 'success', data: { criterion } });
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
    const criteria = await criterionService.getCriteriaByHackathon(req.params.hackathonId);
    res.json({ status: 'success', data: { criteria } });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateCriterionSchema.parse(req.body);
    const criterion = await criterionService.updateCriterion(req.params.id, data);
    res.json({ status: 'success', data: { criterion } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await criterionService.deleteCriterion(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
