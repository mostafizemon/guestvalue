import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET() {
  try {
    // Fetch all three tables in parallel
    const [massageRecords, recRecords, clientRecords] = await Promise.all([
      Tables.Massage.select().all(),
      Tables.Recommendation.select().all(),
      Tables.Clients.select().all(),
    ]);

    // Build lookup maps
    const clientsMap = new Map(clientRecords.map((c) => [c.id, c.get("Name") as string]));

    // Build recommendation → client name map
    const recToClientName = new Map<string, string>();
    for (const rec of recRecords) {
      const clientIds = rec.get("Clients") as string[];
      if (clientIds && clientIds.length > 0) {
        recToClientName.set(rec.id, clientsMap.get(clientIds[0]) || "Client inconnu");
      } else {
        recToClientName.set(rec.id, "Client inconnu");
      }
    }

    const messages = massageRecords.map((record) => {
      let recommendationId: string | null = null;
      let clientName = "Client inconnu";
      const recIds = record.get("Recommendation") as string[];
      if (recIds && recIds.length > 0) {
        recommendationId = recIds[0];
        clientName = recToClientName.get(recommendationId) || "Client inconnu";
      }

      return {
        id: record.id,
        clientName,
        draftEN: (record.get("Draft EN") as string) || "",
        draftFN: (record.get("Draft FN") as string) || "",
        link: (record.get("Link") as string) || "",
        recommendationId,
      };
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** PATCH — admin edits Draft EN and/or Draft FN on a Massage record */
export async function PATCH(request: Request) {
  try {
    const { id, draftEN, draftFN } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const fields: Record<string, string> = {};
    if (draftEN !== undefined) fields["Draft EN"] = draftEN;
    if (draftFN !== undefined) fields["Draft FN"] = draftFN;

    await Tables.Massage.update(id, fields);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
