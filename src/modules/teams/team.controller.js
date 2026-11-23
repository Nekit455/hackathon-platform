import { createTeamSchema, inviteMemberSchema } from './team.schema.js';
import * as teamService from './team.service.js';

export const create = async (req, res, next) => {
  try {
    const data = createTeamSchema.parse(req.body);
    const team = await teamService.createTeam(req.params.hackathonId, req.user.id, data);
    res.status(201).json({ status: 'success', data: { team } });
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
    const teams = await teamService.getTeamsByHackathon(req.params.hackathonId);
    res.json({ status: 'success', data: { teams } });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.json({ status: 'success', data: { team } });
  } catch (error) {
    next(error);
  }
};

export const invite = async (req, res, next) => {
  try {
    const data = inviteMemberSchema.parse(req.body);
    const member = await teamService.inviteMember(req.params.id, req.user.id, data.email);
    res.status(201).json({ status: 'success', data: { member } });
  } catch (error) {
    if (error.name === 'ZodError') {
      error.status = 400;
      error.message = error.issues.map(e => e.message).join(', ');
    }
    next(error);
  }
};

export const accept = async (req, res, next) => {
  try {
    const member = await teamService.acceptInvitation(req.params.id, req.user.id);
    res.json({ status: 'success', data: { member } });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const member = await teamService.acceptInvitation(req.params.id, req.user.id);
    res.json({ status: 'success', data: { member } });
  } catch (error) {
    next(error);
  }
};

export const listMyInvitations = async (req, res, next) => {
  try {
    const invitations = await teamService.getMyInvitations(req.user.id);
    res.json({ status: 'success', data: { invitations } });
  } catch (error) {
    next(error);
  }
};