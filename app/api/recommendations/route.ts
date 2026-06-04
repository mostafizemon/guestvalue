import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET() {
  try {
    const records = await Tables.Recommendation.select().all();

    const [clientsRecords, experiencesRecords, salesRecords] = await Promise.all([
      Tables.Clients.select().all(),
      Tables.Experiences.select().all(),
      Tables.Sales.select().all(),
    ]);

    const clientsMap = new Map(clientsRecords.map((c) => [c.id, c.get("Name") as string]));
    const experiencesMap = new Map(experiencesRecords.map((e) => [
      e.id,
      {
        name: e.get("Name") as string,
        imageUrls: ((e.get("Image URL") as string) || "")
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean),
        basePrice: (e.get("Base Price") as number) || 0,
        category: (e.get("Category") as string) || "Unknown",
      },
    ]));
    const salesMap = new Map(salesRecords.map((s) => [s.id, (s.get("Final Quote") as number) || 0]));

    const recommendations = records.map((record) => {
      let clientName = "Unknown";
      const clientIds = record.get("Clients") as string[];
      if (clientIds && clientIds.length > 0) clientName = clientsMap.get(clientIds[0]) || "Unknown";

      let selectedExperience = "Unknown";
      let expImageUrls: string[] = [];
      let expBasePrice = 0;
      let expCategory = "Unknown";
      
      const expIds = record.get("Selected Experience") as string[];
      if (expIds && expIds.length > 0) {
        const exp = experiencesMap.get(expIds[0]);
        if (exp) {
          selectedExperience = exp.name;
          expImageUrls = exp.imageUrls;
          expBasePrice = exp.basePrice;
          expCategory = exp.category;
        }
      }

      let sales = 0;
      const salesIds = record.get("Sales") as string[];
      if (salesIds && salesIds.length > 0) sales = salesMap.get(salesIds[0]) || 0;

      return {
        id: record.id,
        clientName,
        selectedExperience,
        expImageUrls,
        expBasePrice,
        expCategory,
        matchScore: record.get("Match Score") as number,
        aiInsight: (record.get("AI Insight") as string) || "",
        sales,
      };
    });

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Recommendations GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** PATCH — admin edits AI Insight and saves it to Airtable */
export async function PATCH(request: Request) {
  try {
    const { id, aiInsight } = await request.json();
    if (!id || aiInsight === undefined) {
      return NextResponse.json({ error: "Missing id or aiInsight" }, { status: 400 });
    }
    await Tables.Recommendation.update(id, { "AI Insight": aiInsight });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Recommendations PATCH Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

