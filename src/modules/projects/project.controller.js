import { createProjectSchema, updateProjectSchema } from './project.schema.js';
import * as projectService from './project.service.js';

export const create = async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(req.params.teamId, req.user.id, data);
    res.status(201).json({ status: 'success', data: { project } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ status: 'success', data: { project } });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id, req.user.id, data);
    res.json({ status: 'success', data: { project } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};
