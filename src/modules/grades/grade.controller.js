import { createGradeSchema } from './grade.schema.js';
import * as gradeService from './grade.service.js';

export const create = async (req, res, next) => {
  try {
    const data = createGradeSchema.parse(req.body);
    const grade = await gradeService.createGrade(req.params.projectId, req.user.id, data);
    res.status(201).json({ status: 'success', data: { grade } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const getByProject = async (req, res, next) => {
  try {
    const grades = await gradeService.getGradesByProject(
      req.params.projectId,
      req.user.id,
      req.user.role
    );
    res.json({ status: 'success', data: { grades } });
  } catch (error) {
    next(error);
  }
};
