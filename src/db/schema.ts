import { desc } from 'drizzle-orm';
import {integer, pgTable, serial, text, timestamp} from 'drizzle-orm/pg-core';

export const Inovices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  //customerId: integer('customer_id').references(() => customers.id),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'cancelled'] }).notNull().default('pending'),
  description: text('description').notNull(),
  createTs: timestamp('createTs').notNull().defaultNow(),
});