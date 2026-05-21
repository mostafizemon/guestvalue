import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";
import { anthropic } from "@/lib/anthropic";

export async function GET() {
  try {
    const records = await Tables.Recommendation.select().all();
    
    const recommendations = await Promise.all(
      records.map(async (record) => {
        // Resolve linked client names
        let clientName = "Unknown";
        const clientIds = record.get("Clients") as string[];
        if (clientIds && clientIds.length > 0) {
          try {
            const clientRecord = await Tables.Clients.find(clientIds[0]);
            clientName = clientRecord.get("Name") as string;
          } catch (e) {}
        }

        // Resolve linked experience
        let selectedExperience = "Unknown";
        const expIds = record.get("Selected Experience") as string[];
        if (expIds && expIds.length > 0) {
          try {
            const expRecord = await Tables.Experiences.find(expIds[0]);
            selectedExperience = expRecord.get("Name") as string;
          } catch (e) {}
        }

        // Resolve linked sales
        let sales = 0;
        const salesIds = record.get("Sales") as string[];
        if (salesIds && salesIds.length > 0) {
          try {
            const salesRecord = await Tables.Sales.find(salesIds[0]);
            sales = (salesRecord.get("Final Quote") as number) || 0;
          } catch (e) {}
        }

        return {
          id: record.id,
          clientName,
          selectedExperience,
          matchScore: record.get("Match Score") as number,
          aiInsight: record.get("AI Insight") as string,
          sales,
        };
      })
    );

    return NextResponse.json(recommendations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { clientId } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }

    const clientRecord = await Tables.Clients.find(clientId);
    const clientProfile = {
      name: clientRecord.get("Name"),
      budget: clientRecord.get("Budget"),
      stayDuration: clientRecord.get("Stay Duration"),
      destination: clientRecord.get("Destination"),
    };

    const expRecords = await Tables.Experiences.select().all();
    const experiences = expRecords.map((record) => ({
      name: record.get("Name"),
      basePrice: record.get("Base Price"),
      category: record.get("Category"),
      luxuryRank: record.get("Luxury Rank"),
    }));

    const prompt = `You are a luxury concierge AI assistant for GuestValue. Given a client profile and a list of available experiences, return the top 3 experience recommendations. Respond ONLY with a valid JSON array, no markdown, no explanation. Each item must have: experienceName (string), matchScore (number 0-100), reasoning (string, max 2 sentences), suggestedPrice (number).
User message: Client profile: ${JSON.stringify(clientProfile)}\n\nAvailable experiences: ${JSON.stringify(experiences)}`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    // Parse text block content
    let textResponse = "";
    if (response.content[0].type === "text") {
      textResponse = response.content[0].text;
    }

    const recommendationsArray = JSON.parse(textResponse);

    return NextResponse.json(recommendationsArray);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
