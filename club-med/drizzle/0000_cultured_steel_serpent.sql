CREATE TYPE "public"."category" AS ENUM('AIT', 'AVC ischémique', 'AVC hémorragique', 'TVC', 'Inconnue');--> statement-breakpoint
CREATE TYPE "public"."diagnosis" AS ENUM('AVC ischémique thrombotique', 'AVC ischémique embolique', 'AVC ischémique lacunaire', 'AVC hémorragique intra-parenchymateux', 'Hémorragie méningée (sous-arachnoïdienne)', 'AVC hémorragique intraventriculaire', 'Infarctus cérébelleux', 'Thrombose des sinus veineux cérébraux', 'Dissection artérielle (carotide ou vertébrale)', 'Non classé / Autre');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "incidents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"IP" integer,
	"fullName" varchar(255) NOT NULL,
	"gender" "gender",
	"incidentDate" date NOT NULL,
	"incidentTime" text NOT NULL,
	"place" varchar(255) NOT NULL,
	"category" "category",
	"diagnosis" "diagnosis",
	"additionalInfo" text NOT NULL,
	"doctor_name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
