DO $$ BEGIN
 CREATE TYPE "gender" AS ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "role" AS ENUM('Dietician', 'Patient');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback-module" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedback-module_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "survey_feedback_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"survey_preferences_id" integer NOT NULL,
	"feedback_module_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"feedback_below_recommended_level" text DEFAULT '' NOT NULL,
	"feedback_above_recommended_level" text DEFAULT '' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "survey_feedback_modules_survey_preferences_id_feedback_module_id_unique" UNIQUE("survey_preferences_id","feedback_module_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback_draft" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft" jsonb NOT NULL,
	"patient_id" integer NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "survey" (
	"id" serial PRIMARY KEY NOT NULL,
	"dietician_id" integer NOT NULL,
	"survey_name" text NOT NULL,
	"intake24_survey_id" text NOT NULL,
	"intake24_secret" text NOT NULL,
	"alias" text NOT NULL,
	"recall_submission_url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"preference" jsonb NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dietician" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text NOT NULL,
	"last_name" text NOT NULL,
	"mobile_number" text NOT NULL,
	"business_number" text NOT NULL,
	"business_address" text NOT NULL,
	"short_bio" text NOT NULL,
	"avatar" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dietician_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patient" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"survey_id" integer NOT NULL,
	"first_name" text NOT NULL,
	"middle_name" text NOT NULL,
	"last_name" text NOT NULL,
	"mobile_number" text NOT NULL,
	"address" text NOT NULL,
	"age" integer NOT NULL,
	"gender" "gender" NOT NULL,
	"height" integer NOT NULL,
	"weight" integer NOT NULL,
	"additional_details" jsonb,
	"additional_notes" text NOT NULL,
	"patient_goal" text NOT NULL,
	"avatar" text,
	"preference" jsonb NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"role" "role" NOT NULL,
	"deletion_date" timestamp (6) with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text NOT NULL,
	"action" jsonb NOT NULL,
	"expires_at" timestamp (6) with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "token_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "recall" (
	"id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"recall" jsonb NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nutrient_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nutrient_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"symbol" text,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "survey_feedback_modules" ADD CONSTRAINT "survey_feedback_modules_survey_preferences_id_survey_id_fk" FOREIGN KEY ("survey_preferences_id") REFERENCES "survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "survey_feedback_modules" ADD CONSTRAINT "survey_feedback_modules_feedback_module_id_feedback-module_id_fk" FOREIGN KEY ("feedback_module_id") REFERENCES "feedback-module"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "feedback_draft" ADD CONSTRAINT "feedback_draft_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "survey" ADD CONSTRAINT "survey_dietician_id_dietician_id_fk" FOREIGN KEY ("dietician_id") REFERENCES "dietician"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dietician" ADD CONSTRAINT "dietician_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient" ADD CONSTRAINT "patient_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patient" ADD CONSTRAINT "patient_survey_id_survey_id_fk" FOREIGN KEY ("survey_id") REFERENCES "survey"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token" ADD CONSTRAINT "token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recall" ADD CONSTRAINT "recall_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nutrient_types" ADD CONSTRAINT "nutrient_types_unit_id_nutrient_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "nutrient_units"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
