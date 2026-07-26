import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventName, eventId, eventUrl, params, clientIp, userAgent } = body;

    const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      // If token is missing, just ignore the server-side event rather than failing the app
      return NextResponse.json({ success: false, reason: 'Missing FB credentials' });
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const data = [
      {
        event_name: eventName,
        event_time: currentTimestamp,
        event_id: eventId,
        event_source_url: eventUrl,
        action_source: 'website',
        user_data: {
          client_ip_address: clientIp || '',
          client_user_agent: userAgent || '',
        },
        custom_data: {
          currency: params?.currency,
          value: params?.value,
          content_ids: params?.content_ids,
          content_name: params?.content_name,
          content_type: params?.content_type,
          contents: params?.contents,
          num_items: params?.num_items,
          search_string: params?.search_string,
        },
      },
    ];

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data,
      }),
    });

    const result = await response.json();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('FB CAPI Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
