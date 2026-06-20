import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/login?error=${error || "no_code"}`, req.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) throw new Error("No access_token");

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userInfo = await userRes.json();
    if (!userInfo.email) throw new Error("No email");

    const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
        image: userInfo.picture,
        googleId: userInfo.id,
      }),
    });
    const backendData = await backendRes.json();
    if (!backendData.success) throw new Error("Backend auth failed");

    const res = NextResponse.redirect(new URL(`/login?token=${backendData.data.token}&name=${encodeURIComponent(backendData.data.user.name || "")}&email=${encodeURIComponent(backendData.data.user.email || "")}&image=${encodeURIComponent(backendData.data.user.image || "")}`, req.url));
    return res;
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(new URL(`/login?error=callback_failed`, req.url));
  }
}
