import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  bio: z.string().optional(),
  experience: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  languages: z.array(z.string()).optional(),
  consultationMode: z.array(z.enum(['In Person', 'Online', 'Both'])).optional(),
});

export const updateAvailabilitySchema = z.object({
  workingDays: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  workingHours: z.object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
  }).optional(),
  breakTime: z.object({
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
  }).optional(),
  slotDuration: z.enum([15, 20, 30, 45, 60]).optional(),
});
