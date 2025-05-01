"use server";

import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function login(email: string, password: string) {
  try {
    const admin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .then((res) => res[0]);

    if (!admin) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    // In a real app, you should use proper password hashing
    if (admin.password !== password) {
      return {
        success: false,
        error: "Email ou mot de passe incorrect",
      };
    }

    // Set a simple cookie to track admin session
    (await cookies()).set("admin_id", admin.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

export async function logout() {
  (await cookies()).delete("admin_id");
  return { success: true };
}

export async function getAdminId() {
  const adminId = (await cookies()).get("admin_id")?.value;
  return adminId ? parseInt(adminId) : null;
}
