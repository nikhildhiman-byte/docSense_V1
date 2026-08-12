import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, fileData, mimeType, timestamp, recordId } = body

    const N8N_WEBHOOK_URL =
      "https://sourabhkaushal.app.n8n.cloud/webhook/a63cecd0-f478-452b-b0e7-85a8ea8b9f02"

    // Forward request to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileData,
        mimeType,
        timestamp: timestamp ?? new Date().toISOString(),
        ...(recordId ? { recordId } : {}),
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] n8n webhook error:", errorText)
      return NextResponse.json({ error: "Failed to process PDF", detail: errorText }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Upload API error:", error)
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 })
  }
}
