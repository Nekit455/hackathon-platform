import { z } from 'zod';

export const createCriterionSchema = z.object({
  name: z.string().min(2),
  maxScore: z.number().int().positive(),
});

export const updateCriterionSchema = z.object({
  name: z.string().min(2).optional(),
  maxScore: z.number().int().positive().optional(),
});
