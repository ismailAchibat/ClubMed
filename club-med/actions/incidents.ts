"use server";
import { db } from "@/db";
import { Incident, incidents } from "@/db/schema";
import { desc } from "drizzle-orm";

export const createIncident = async (incident: Omit<Incident, "id">) => {
  try {
    const result = await db.insert(incidents).values(incident).returning();
    return { success: true, data: result[0] };
  } catch (error) {
    console.error("Error creating incident:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'enregistrement",
    };
  }
};

export const getIncidents = async () => {
  try {
    const allIncidents = await db
      .select()
      .from(incidents)
      .orderBy(desc(incidents.createdAt));
    return { success: true, data: allIncidents };
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la récupération des incidents",
    };
  }
};

export const getDoctorNames = async () => {
  try {
    const doctors = await db
      .select({ doctor_name: incidents.doctor_name })
      .from(incidents)
      .groupBy(incidents.doctor_name)
      .orderBy(incidents.doctor_name);

    return {
      success: true,
      data: doctors.map((d) => d.doctor_name),
    };
  } catch (error) {
    console.error("Error fetching doctor names:", error);
    return {
      success: false,
      error:
        "Une erreur est survenue lors de la récupération des noms de médecins",
    };
  }
};
