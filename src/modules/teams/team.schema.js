import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
});
