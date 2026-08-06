const required = [
  "INSTALL_SMOKE_APP_URL",
  "INSTALL_SMOKE_COOKIE",
  "INSTALL_SMOKE_ACCESS_TOKEN",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(JSON.stringify({
    ok: false,
    error: `Missing required environment variables: ${missing.join(", ")}`,
  }));
  process.exit(1);
}

const appUrl = process.env.INSTALL_SMOKE_APP_URL.replace(/\/$/, "");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const headers = {
  apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${process.env.INSTALL_SMOKE_ACCESS_TOKEN}`,
};

async function rest(path) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers });
  if (!response.ok) throw new Error(`Supabase query failed (${response.status}).`);
  return response.json();
}

async function waitFor(check, description) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`Timed out waiting for ${description}.`);
}

try {
  const pets = await rest("pets?select=id&order=created_at.asc&limit=1");
  const pet = pets[0];
  if (!pet) throw new Error("No pilot companion is registered for the smoke-test account.");

  const ingest = async () => {
    const response = await fetch(`${appUrl}/api/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: process.env.INSTALL_SMOKE_COOKIE,
      },
      body: JSON.stringify({
        pet_id: pet.id,
        event_type: "barking",
        severity: "warning",
        confidence: 0.95,
      }),
    });

    if (!response.ok) throw new Error(`Timeline ingestion failed (${response.status}): ${await response.text()}`);
    return response.json();
  };

  const firstIngestion = await ingest();
  const secondIngestion = await ingest();
  const eventIds = [...firstIngestion.events, ...secondIngestion.events].map((event) => event.id);

  const lcm = await waitFor(async () => {
    const states = await rest(`living_companion_models?pet_id=eq.${pet.id}&select=last_processed_event_id,version`);
    return states.find((state) => eventIds.includes(state.last_processed_event_id));
  }, "LCM update");

  const reasoning = await waitFor(async () => {
    const results = await rest(`cognitive_reasoning_results?pet_id=eq.${pet.id}&select=id,originating_event_id,reasoning_type&order=created_at.desc&limit=10`);
    return results.find((result) => eventIds.includes(result.originating_event_id));
  }, "CRE result");

  const action = await waitFor(async () => {
    const actions = await rest(`companion_actions?pet_id=eq.${pet.id}&reasoning_id=eq.${reasoning.id}&select=id,action_type,status&limit=1`);
    return actions[0];
  }, "allowlisted companion action");

  const feedback = await waitFor(async () => {
    const events = await rest(`pet_events?pet_id=eq.${pet.id}&source=eq.automation&category=eq.reasoning&select=id,causation_id,severity&order=created_at.desc&limit=10`);
    return events.find((event) => event.causation_id === reasoning.originating_event_id);
  }, "Timeline action feedback");

  if (feedback.severity !== "warning") {
    throw new Error(`Action feedback severity must map high priority to warning, received ${feedback.severity}.`);
  }

  const dashboardResponse = await fetch(`${appUrl}/dashboard`, {
    headers: { Cookie: process.env.INSTALL_SMOKE_COOKIE },
  });
  const dashboardHtml = await dashboardResponse.text();
  if (!dashboardResponse.ok || !dashboardHtml.includes("Barking")) {
    throw new Error("Dashboard did not render the newly ingested Timeline event.");
  }

  console.log(JSON.stringify({
    ok: true,
    petId: pet.id,
    timelineEventIds: eventIds,
    lcmVersion: lcm.version,
    reasoningId: reasoning.id,
    actionId: action.id,
    actionType: action.action_type,
    actionStatus: action.status,
    feedbackEventId: feedback.id,
    feedbackSeverity: feedback.severity,
    dashboardUpdated: true,
  }, null, 2));
} catch (error) {
  console.error(JSON.stringify({
    ok: false,
    error: error instanceof Error ? error.message : "Install smoke test failed.",
  }, null, 2));
  process.exit(1);
}
