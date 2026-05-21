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
    }));
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, budget, stayDuration, destination } = body;

    const createdRecords = await Tables.Clients.create([
      {
        fields: {
          Name: name,
          Budget: budget,
          "Stay Duration": stayDuration,
          Destination: destination,
        },
      },
    ]);

    const record = createdRecords[0];
    return NextResponse.json({
      id: record.id,
      name: record.get("Name"),
      budget: record.get("Budget"),
      stayDuration: record.get("Stay Duration"),
      destination: record.get("Destination"),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
