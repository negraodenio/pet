"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/* =========================================================================
   S1-01: Device Registration Server Actions
   WHY: Without devices, there is no data. Without data, no intelligence.
   ========================================================================= */

const deviceTypes = [
  "camera",
  "tablet",
  "collar",
  "feeder",
  "water_station",
  "scale",
] as const;

const registerDeviceSchema = z.object({
  name: z.string().min(1, "Device name is required").max(100),
  serialNumber: z.string().min(1, "Serial number is required").max(100),
  deviceType: z.enum(deviceTypes),
  locationName: z.string().optional(),
  firmwareVersion: z.string().optional(),
});

const updateDeviceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  locationName: z.string().optional(),
  status: z.enum(["online", "offline", "updating", "error"]).optional(),
});

export type DeviceActionState = {
  error?: string;
  success?: boolean;
  deviceId?: string;
};

/**
 * Register a new device to the guardian's organization.
 * Creates the device record and optionally assigns a location.
 */
export async function registerDeviceAction(
  _prevState: DeviceActionState,
  formData: FormData,
): Promise<DeviceActionState> {
  const parsed = registerDeviceSchema.safeParse({
    name: formData.get("name"),
    serialNumber: formData.get("serialNumber"),
    deviceType: formData.get("deviceType"),
    locationName: formData.get("locationName") || undefined,
    firmwareVersion: formData.get("firmwareVersion") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();

  // Get user's org_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .single();

  if (!profile) {
    return { error: "Unable to find your organization" };
  }

  // Insert device
  const { data: device, error } = await supabase
    .from("devices")
    .insert({
      org_id: profile.org_id,
      name: parsed.data.name,
      serial_number: parsed.data.serialNumber,
      device_type: parsed.data.deviceType,
      firmware_version: parsed.data.firmwareVersion ?? null,
      status: "offline",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A device with this serial number already exists" };
    }
    return { error: error.message };
  }

  // Optionally assign location
  if (parsed.data.locationName) {
    await supabase.from("device_locations").insert({
      device_id: device.id,
      location_name: parsed.data.locationName,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/devices");

  return { success: true, deviceId: device.id };
}

/**
 * Update device name, location, or status.
 */
export async function updateDeviceAction(
  _prevState: DeviceActionState,
  formData: FormData,
): Promise<DeviceActionState> {
  const parsed = updateDeviceSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    locationName: formData.get("locationName") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { id, locationName, ...updates } = parsed.data;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("devices")
      .update(updates)
      .eq("id", id);

    if (error) return { error: error.message };
  }

  // Update location if provided
  if (locationName !== undefined) {
    // Upsert: delete old + insert new
    await supabase.from("device_locations").delete().eq("device_id", id);
    if (locationName) {
      await supabase.from("device_locations").insert({
        device_id: id,
        location_name: locationName,
      });
    }
  }

  revalidatePath("/dashboard/devices");
  return { success: true, deviceId: id };
}

/**
 * Remove a device from the organization.
 */
export async function removeDeviceAction(
  deviceId: string,
): Promise<DeviceActionState> {
  const supabase = await createClient();

  const { error } = await supabase.from("devices").delete().eq("id", deviceId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/devices");

  return { success: true };
}
