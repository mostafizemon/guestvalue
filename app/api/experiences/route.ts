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

    const experiences = records.map((record) => {
      // Handle both URL field and Attachment field for images safely
      const imageUrlField = record.get("Image URL") as string;
      const imageAttachmentField = record.get("Image") as any[];
      const imageUrl = imageUrlField || (imageAttachmentField && imageAttachmentField.length > 0 ? imageAttachmentField[0].url : "");

      return {
        id: record.id,
        name: record.get("Name") as string,
        basePrice: record.get("Base Price") as number,
        category: record.get("Category") as string,
        luxuryRank: record.get("Luxury Rank") as number,
        imageUrl: imageUrl,
        location: (record.get("Location") as string) || "Unknown",
        duration: (record.get("Duration") as string) || "TBD",
        availability: (record.get("Availability") as string) || "Disponible",
        description: (record.get("Description") as string) || "",
      };
    });

    return NextResponse.json(experiences);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
