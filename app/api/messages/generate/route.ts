import { NextResponse } from "next/server";
import { Tables } from "@/lib/airtable";
import { anthropic } from "@/lib/anthropic";

export async function POST(request: Request) {
  try {
    const { clientId, experienceIds } = await request.json();

    if (!clientId || !experienceIds || !Array.isArray(experienceIds)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    // Fetch Client
    const clientRecord = await Tables.Clients.find(clientId);
    const clientProfile = {
      name: clientRecord.get("Name"),
      budget: clientRecord.get("Budget"),
      stayType: clientRecord.get("Stay Type") || "Couple",
      stayDuration: clientRecord.get("Stay Duration"),
      destination: clientRecord.get("Destination"),
      preferences: clientRecord.get("Preferences") || "None specific",
    };

    // Fetch Selected Experiences
    const exps = await Promise.all(
      experienceIds.map(async (id) => {
        try {
          const exp = await Tables.Experiences.find(id);
          return {
            name: exp.get("Name"),
            category: exp.get("Category"),
            price: exp.get("Base Price"),
            location: exp.get("Location") || "Unknown",
            duration: exp.get("Duration") || "TBD",
            description: exp.get("Description") || "",
          };
        } catch (e) {
          return null;
        }
      })
    );

    const validExps = exps.filter(Boolean);

    if (validExps.length === 0) {
      return NextResponse.json({ error: "Could not fetch selected experiences" }, { status: 404 });
    }

    const prompt = `You are a luxury hotel concierge for GuestValue. Write an email to the client proposing a custom itinerary.
Client Profile: ${JSON.stringify(clientProfile)}
Selected Experiences to propose: ${JSON.stringify(validExps)}

Rules:
1. The tone must be extremely luxurious, warm, and professional.
2. Directly address the client by name.
3. Detail the selected experiences and highlight why they match the client's preferences or stay type (e.g. romantic for Couple, fun for Famille).
4. Do NOT include the prices in the text of the email (we show prices in a separate summary attachment).
5. You must return ONLY a JSON object with two keys: "draftEN" (the email in English) and "draftFR" (the email translated perfectly to French). No markdown wrapping around the JSON.`;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    let textResponse = "";
    if (response.content[0].type === "text") {
      textResponse = response.content[0].text;
    }

    const drafts = JSON.parse(textResponse);

    // Save to Airtable so it appears in the list (Optional, but good for persistence)
    try {
      await Tables.Massage.create([
        {
          fields: {
            "Draft EN": drafts.draftEN,
            "Draft FN": drafts.draftFR, // Assuming Airtable field is 'Draft FN' based on previous code
            // Link to client if field exists: "Client": [clientId]
          }
        }
      ]);
    } catch (e) {
      console.error("Failed to save draft to Airtable", e);
    }

    return NextResponse.json({
      draftEN: drafts.draftEN,
      draftFR: drafts.draftFR,
    });
  } catch (error: any) {
    console.error("Generate error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
