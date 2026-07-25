import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const systemPrompt = `You are SmartQueue Assistant, a helpful chatbot for the SmartQueue virtual queue management system.

You only answer questions related to SmartQueue. If someone asks about something unrelated, politely redirect them back to SmartQueue topics.

Key information about SmartQueue:
- SmartQueue lets students join virtual queues for college departments without standing in physical lines
- Available departments: Fees Counter, Admissions, Scholarship Section
- Students register with email and password, then join a queue to get a token number
- Token page shows real-time position, estimated wait time, and sends notifications when turn is near
- Browser notifications are sent when student is 3 positions away and when it is their turn
- Staff can call next token, mark complete, open or close queue, and reset queue
- Admin can view analytics — tokens issued, students served, average service time
- Students can leave the queue anytime from the token page
- Queue resets daily by staff

Common questions and answers:
- How to join queue: Login then go to Student Dashboard then click Join on your department
- How to leave queue: Go to Token Status page then click Cancel Ticket
- Token number: Sequential number assigned when you join
- Estimated wait: Calculated from real service history
- Notifications: Allow browser notifications when prompted
- Forgot password: Click Forgot password on login page and enter your email
- Staff login: Use staff credentials at the Staff Portal
- Queue closed: Staff has closed the queue for today, try again tomorrow

Keep responses very short and conversational — 1 sentence for greetings, max 2 sentences for answers. Be warm and friendly. Use simple English.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Groq API error:', err);
      return NextResponse.json({ error: 'AI service error. Please try again.' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}