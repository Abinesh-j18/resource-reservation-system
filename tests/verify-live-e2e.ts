/**
 * Live End-to-End API and Integration Verification
 * Runs against the active Next.js server at http://localhost:3000
 */
async function runLiveVerification() {
  console.log("================================================================================");
  console.log("   PRIMEWAVE LAB ASSESSMENT — LIVE END-TO-END HTTP API VERIFICATION             ");
  console.log("================================================================================\n");

  const baseUrl = "http://localhost:3000";

  // 1. Verify resources
  console.log("1. Fetching Resource Catalog from API...");
  const resResources = await fetch(`${baseUrl}/api/resources`);
  const resourcesData = await resResources.json();
  if (!resourcesData.success || !resourcesData.data?.length) {
    throw new Error("Failed to load resources from API: " + JSON.stringify(resourcesData));
  }
  console.log(`   ✔ Loaded ${resourcesData.data.length} resources from live API.`);

  const availableResource = resourcesData.data.find((r: any) => r.status === "AVAILABLE");
  const maintenanceResource = resourcesData.data.find((r: any) => r.status === "MAINTENANCE");

  if (!availableResource) throw new Error("No available resource found.");
  console.log(`   ✔ Selected test resource: "${availableResource.name}" (${availableResource.id})`);

  // 2. Query available users
  const tomorrow = new Date(Date.now() + 86400000 * 2);
  const start = new Date(tomorrow);
  start.setHours(9, 30, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(11, 0, 0, 0);

  // 3. Test Booking Creation
  console.log("\n2. Testing Booking Creation (POST /api/reservations)...");
  const createPayload = {
    title: "Client Evaluation & System Walkthrough",
    resourceId: availableResource.id,
    userId: "cmv6xjno40001wgyv3lguh1mr", // Sarah Connor
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    purpose: "Demonstrating system robustness to prospective client."
  };

  const createRes = await fetch(`${baseUrl}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createPayload),
  });
  const createData = await createRes.json();

  if (createRes.status !== 201 || !createData.success) {
    console.error("   ✖ Booking creation failed:", createData);
    process.exit(1);
  }
  const reservationId = createData.data.id;
  console.log(`   ✔ Created reservation successfully [HTTP 201 Created] (ID: ${reservationId})`);

  // 4. Test Overlapping Conflict (Same window)
  console.log("\n3. Testing Overlapping Conflict Detection (POST /api/reservations)...");
  const conflictPayload = {
    title: "Double-Booking Collision Attempt",
    resourceId: availableResource.id,
    userId: "cmv6xjnod0002wgyvbpnudug4", // David Miller
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };

  const conflictRes = await fetch(`${baseUrl}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conflictPayload),
  });
  const conflictData = await conflictRes.json();

  if (conflictRes.status === 409 && conflictData.conflictingReservation) {
    console.log(`   ✔ Correctly rejected with HTTP 409 Conflict: "${conflictData.error}"`);
    console.log(`   ✔ Conflicting Reservation Title: "${conflictData.conflictingReservation.title}"`);
  } else {
    console.error("   ✖ Conflict test failed! Status:", conflictRes.status, conflictData);
    process.exit(1);
  }

  // 5. Test Maintenance Restriction
  if (maintenanceResource) {
    console.log(`\n4. Testing Maintenance Block on "${maintenanceResource.name}"...`);
    const maintPayload = {
      title: "Illegal Maintenance Slot Booking",
      resourceId: maintenanceResource.id,
      userId: "cmv6xjno40001wgyv3lguh1mr",
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };

    const maintRes = await fetch(`${baseUrl}/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(maintPayload),
    });
    const maintData = await maintRes.json();

    if (maintRes.status === 400 && maintData.error.includes("maintenance")) {
      console.log(`   ✔ Correctly rejected booking for resource under maintenance [HTTP 400]: "${maintData.error}"`);
    } else {
      console.error("   ✖ Maintenance restriction test failed! Status:", maintRes.status, maintData);
      process.exit(1);
    }
  }

  // 6. Test GET by ID
  console.log(`\n5. Testing GET /api/reservations/${reservationId}...`);
  const getRes = await fetch(`${baseUrl}/api/reservations/${reservationId}`);
  const getData = await getRes.json();
  if (getRes.status === 200 && getData.data?.id === reservationId) {
    console.log(`   ✔ Fetched reservation details [HTTP 200]: "${getData.data.title}" (${getData.data.status})`);
  } else {
    console.error("   ✖ GET by ID failed:", getData);
    process.exit(1);
  }

  // 7. Test Slot Release via Cancellation (PATCH /api/reservations/:id)
  console.log(`\n6. Testing Slot Release on Cancellation (PATCH /api/reservations/${reservationId})...`);
  const cancelRes = await fetch(`${baseUrl}/api/reservations/${reservationId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "CANCELLED" }),
  });
  const cancelData = await cancelRes.json();
  if (cancelRes.status === 200 && cancelData.data?.status === "CANCELLED") {
    console.log(`   ✔ Successfully cancelled reservation [HTTP 200 OK]`);
  } else {
    console.error("   ✖ Cancellation failed:", cancelData);
    process.exit(1);
  }

  // 8. Re-booking the newly released slot (Should now succeed!)
  console.log("\n7. Re-booking the Previously Reserved Slot (Must Succeed without conflict)...");
  const rebookRes = await fetch(`${baseUrl}/api/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(conflictPayload), // David Miller can now book it!
  });
  const rebookData = await rebookRes.json();
  if (rebookRes.status === 201 && rebookData.success) {
    console.log(`   ✔ Re-booking succeeded cleanly [HTTP 201 Created] (ID: ${rebookData.data.id})`);
    // Clean up
    await fetch(`${baseUrl}/api/reservations/${rebookData.data.id}`, { method: "DELETE" });
  } else {
    console.error("   ✖ Re-booking slot failed:", rebookData);
    process.exit(1);
  }

  // Clean up original test reservation
  await fetch(`${baseUrl}/api/reservations/${reservationId}`, { method: "DELETE" });
  console.log("\n   ✔ Test records cleaned up cleanly.");

  console.log("\n================================================================================");
  console.log("   ALL LIVE HTTP E2E INTEGRATION TESTS PASSED (100% OPERATIONAL)                ");
  console.log("================================================================================\n");
}

runLiveVerification().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
