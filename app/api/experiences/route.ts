import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query: any = {
      sort: [{ field: "Luxury Rank", direction: "desc" }],
    };

    if (category && category !== "All") {
      query.filterByFormula = `{Category} = '${category}'`;
    }

    const records = await Tables.Experiences.select(query).all();

    const experiences = records.map((record) => ({
      id: record.id,
      name: record.get("Name") as string,
      basePrice: record.get("Base Price") as number,
      category: record.get("Category") as string,
      luxuryRank: record.get("Luxury Rank") as number,
    }));

    return NextResponse.json(experiences);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
