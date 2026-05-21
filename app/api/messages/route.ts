import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await Tables.Massage.select().all();
    
    const messages = await Promise.all(
      records.map(async (record) => {
        let recommendationId = null;
        const recIds = record.get("Recommendation") as string[];
        if (recIds && recIds.length > 0) {
          recommendationId = recIds[0];
        }

        return {
          id: record.id,
          draftEN: record.get("Draft EN") as string,
          draftFN: record.get("Draft FN") as string,
          link: record.get("Link") as string,
          recommendationId,
        };
      })
    );

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
