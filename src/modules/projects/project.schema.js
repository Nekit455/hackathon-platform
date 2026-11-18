import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  repoUrl: z.string().url(),
});

export const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  repoUrl: z.string().url().optional(),
});
