import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slot: z.string().min(1, 'Slot is required'),
  reason: z.string().min(1, 'Reason for visit is required'),
  consultationMode: z.enum(['In Person', 'Online']),
});

export const cancelAppointmentSchema = z.object({
  cancellationReason: z.string().min(1, 'Cancellation reason is required')
});

export const rescheduleAppointmentSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slot: z.string().min(1, 'Slot is required')
});
