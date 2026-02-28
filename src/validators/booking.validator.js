import { z } from "zod";

export const createBookingSchema = z.object({
  user_id: z.number({
      required_error: 'User ID is required',
      invalid_type_error: 'User ID must be a number',
    })
    .int()
    .positive('User ID must be a positive integer'),

  hotel_id: z
    .number({
      required_error: 'Hotel ID is required',
      invalid_type_error: 'Hotel ID must be a number',
    })
    .int()
    .positive('Hotel ID must be a positive integer'),

  total_guests: z
    .number({
      required_error: 'Total guests is required',
      invalid_type_error: 'Total guests must be a number',
    })
    .int()
    .positive('Total guests must be at least 1')
    .optional()
    .default(1),

  booking_amount: z
    .union([
      z.number().positive('Booking amount must be positive'),
      z.string().refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
        'Booking amount must be a valid positive number'
      )
    ])
});

export const confirmBookingSchema = z.object({
  idempotencyKey: z
    .string({ required_error: 'Idempotency key is required' })
    .uuid('Invalid UUID format'),
});