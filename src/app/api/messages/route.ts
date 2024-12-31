// src/app/api/messages/route.ts
import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("texts")
      .select("*")
      .order('id', { ascending: true })
    
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    // 1. Insert into Supabase
    const { data: insertedData, error: insertError } = await supabaseServer
      .from("texts")
      .insert({ content, response: "" })
      .select()

    if (insertError) throw insertError

    // 2. Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content
          }
        ],
        max_tokens: 2048,
        temperature: 0.7
      }),
    })

    const openaiData = await openaiResponse.json()
    const responseText = openaiData.choices[0].message.content

    // 3. Update Supabase with OpenAI response
    const { data: updatedData, error: updateError } = await supabaseServer
      .from("texts")
      .update({ response: responseText })
      .eq("id", insertedData[0].id)
      .select()

    if (updateError) throw updateError

    return NextResponse.json({ data: updatedData })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error processing message' }, { status: 500 })
  }
}