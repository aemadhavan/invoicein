CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"description" text NOT NULL,
	"createTs" timestamp DEFAULT now() NOT NULL
);
