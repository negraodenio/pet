"use server";

import { ActionEngine } from "@/lib/services/ActionEngine";
import { revalidatePath } from "next/cache";

export async function approveActionServer(actionId: string) {
  try {
    await ActionEngine.approveAction(actionId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Approval failed";
    return { success: false, error: errorMsg };
  }
}

export async function rejectActionServer(actionId: string) {
  try {
    await ActionEngine.rejectAction(actionId);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Rejection failed";
    return { success: false, error: errorMsg };
  }
}
