import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
export const gender = pgEnum("gender", ["male", "female"]);
export const category = pgEnum("category", [
  "AIT",
  "AVC ischémique",
  "AVC hémorragique",
  "TVC",
  "Inconnue",
]);
export const diagnosis = pgEnum("diagnosis", [
  "AVC ischémique thrombotique",
  "AVC ischémique embolique",
  "AVC ischémique lacunaire",
  "AVC hémorragique intra-parenchymateux",
  "Hémorragie méningée (sous-arachnoïdienne)",
  "AVC hémorragique intraventriculaire",
  "Infarctus cérébelleux",
  "Thrombose des sinus veineux cérébraux",
  "Dissection artérielle (carotide ou vertébrale)",
  "Non classé / Autre"
]);

export const incidents = pgTable("incidents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  IP: integer(),
  fullName: varchar({ length: 255 }).notNull(),
  gender: gender("gender"),
  incidentDate: date().notNull(),
  incidentTime: text().notNull(),
  place: varchar({ length: 255 }).notNull(),
  category: category("category"),
  diagnosis: diagnosis("diagnosis"),
  additionalInfo: text(),
  doctor_name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
});

export type Incident = typeof incidents.$inferSelect;
