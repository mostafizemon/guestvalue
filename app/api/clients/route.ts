import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await Tables.Clients.select().all();
    
    const clients = records.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
      budget: record.get("Budget") as string,
      stayDuration: record.get("Stay Duration") as number,
      destination: record.get("Destination") as string,
      stayType: (record.get("Stay Type") as string) || "Couple",
      language: (record.get("Language") as string) || "FR",
      preferences: (record.get("Preferences") as string) || "",
    }));

    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const createdRecords = await Tables.Clients.create([
      {
        fields: {
          "Name": body.name,
          "Budget": body.budget,
          "Stay Duration": body.stayDuration,
          "Destination": body.destination,
          "Stay Type": body.stayType || "Couple",
          "Language": body.language || "FR",
          "Preferences": body.preferences || "",
        }
      }
    ]);

    return NextResponse.json(createdRecords[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
