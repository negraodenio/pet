import type { Tables } from "@/lib/supabase/database.types";

export type CompanionAction = Tables<"companion_actions">;

export interface DevicePlugin {
  name: string;
  supports(actionType: string): boolean;
  execute(action: CompanionAction): Promise<{
    success: boolean;
    executionTimeMs: number;
    errorMessage?: string;
  }>;
  health(): Promise<{ status: "online" | "offline" | "degraded" }>;
  capabilities(): string[];
}

/** 1. Tablet Plugin */
export class TabletPlugin implements DevicePlugin {
  name = "TabletPlugin";
  supports(actionType: string): boolean {
    return ["PLAY_GUARDIAN_VOICE", "SHOW_FACE_ON_AI_STATION", "DISPLAY_MESSAGE"].includes(actionType);
  }
  async execute(action: CompanionAction) {
    const start = Date.now();
    // Simulate tablet hardware dispatch
    await new Promise((r) => setTimeout(r, 45));
    return { success: true, executionTimeMs: Date.now() - start };
  }
  async health() {
    return { status: "online" as const };
  }
  capabilities() {
    return ["audio_playback", "display_screen", "ai_station"];
  }
}

/** 2. Notification Plugin */
export class NotificationPlugin implements DevicePlugin {
  name = "NotificationPlugin";
  supports(actionType: string): boolean {
    return ["SEND_PUSH", "SEND_EMAIL", "SEND_SMS", "CALL_GUARDIAN"].includes(actionType);
  }
  async execute(action: CompanionAction) {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 30));
    return { success: true, executionTimeMs: Date.now() - start };
  }
  async health() {
    return { status: "online" as const };
  }
  capabilities() {
    return ["push_notification", "email_dispatch", "sms_dispatch"];
  }
}

/** 3. Mock Matter Plugin */
export class MockMatterPlugin implements DevicePlugin {
  name = "MatterPlugin";
  supports(actionType: string): boolean {
    return ["TURN_ON_LIGHT", "TURN_OFF_LIGHT", "PLAY_CALMING_SOUND", "ACTIVATE_WATER_ALERT"].includes(actionType);
  }
  async execute(action: CompanionAction) {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 60));
    return { success: true, executionTimeMs: Date.now() - start };
  }
  async health() {
    return { status: "online" as const };
  }
  capabilities() {
    return ["smart_lights", "acoustic_speaker", "matter_bridge"];
  }
}

/** 4. Mock ONVIF Plugin */
export class MockONVIFPlugin implements DevicePlugin {
  name = "ONVIFPlugin";
  supports(actionType: string): boolean {
    return ["START_RECORDING", "STOP_RECORDING", "START_OBSERVATION_MODE", "STOP_OBSERVATION_MODE"].includes(actionType);
  }
  async execute(action: CompanionAction) {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 80));
    return { success: true, executionTimeMs: Date.now() - start };
  }
  async health() {
    return { status: "online" as const };
  }
  capabilities() {
    return ["rtsp_stream", "onvif_ptz", "hd_video_recording"];
  }
}

/** 5. Mock Feeder Plugin */
export class MockFeederPlugin implements DevicePlugin {
  name = "FeederPlugin";
  supports(actionType: string): boolean {
    return ["OPEN_FEEDER", "SPEAK_TO_COMPANION", "START_EMERGENCY_PROTOCOL", "CALL_VETERINARY"].includes(actionType);
  }
  async execute(action: CompanionAction) {
    const start = Date.now();
    await new Promise((r) => setTimeout(r, 50));
    return { success: true, executionTimeMs: Date.now() - start };
  }
  async health() {
    return { status: "online" as const };
  }
  capabilities() {
    return ["food_dispensing", "water_monitoring", "emergency_dispatch"];
  }
}
