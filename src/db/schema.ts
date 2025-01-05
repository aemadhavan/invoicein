import { desc } from 'drizzle-orm';
import {integer, pgTable, serial, text, timestamp} from 'drizzle-orm/pg-core';

export const Invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),  
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'cancelled'] }).notNull().default('pending'),
  description: text('description').notNull(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId'),
  createTs: timestamp('createTs').notNull().defaultNow(),
  customerId: integer('customerId').references(() => Customers.id),
});

export const Customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  createTs: timestamp('createTs').notNull().defaultNow(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId'),
});