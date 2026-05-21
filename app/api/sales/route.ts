import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await Tables.Sales.select().all();
    
    let totalPipeline = 0;

    const sales = records.map((record) => {
      const finalQuote = (record.get("Final Quote") as number) || 0;
      totalPipeline += finalQuote;

      let recommendationId = null;
      const recIds = record.get("Recommendation") as string[];
      if (recIds && recIds.length > 0) {
        recommendationId = recIds[0];
      }

      return {
        id: record.id,
        finalQuote,
        status: record.get("Status") as string,
        recommendationId,
      };
    });

    return NextResponse.json({ sales, totalPipeline });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
