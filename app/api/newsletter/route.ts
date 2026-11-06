import { accountClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const data = await request.json().catch(() => null);
  const signup = data?.source === "signup";
  let email = typeof data?.email === "string" ? data.email.trim() : "";

  if (signup) {
    const client = await accountClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user?.email || Date.now() - Date.parse(user.created_at) > 15 * 60 * 1000) {
      return Response.json({ message: "가입 정보를 확인할 수 없어요." }, { status: 401 });
    }
    email = user.email;
  }

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ message: "이메일 주소를 확인해 주세요." }, { status: 400 });
  }

  const webhookUrl = process.env.BLOOM_WEBHOOK_URL;
  const secret = process.env.BLOOM_WEBHOOK_SECRET;
  const failure = { message: "지금은 제출할 수 없어요. 잠시 후 다시 시도해 주세요." };
  if (!webhookUrl || !secret) {
    return Response.json(failure, { status: 503 });
  }

  try {
    const result = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, email, source: signup ? "signup" : "newsletter" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) return Response.json(failure, { status: 502 });
    const body = await result.json();
    if (body?.ok !== true) return Response.json(failure, { status: 502 });
    return Response.json({ message: "이메일이 등록됐어요." });
  } catch {
    return Response.json(failure, { status: 502 });
  }
}
