import { NextResponse } from "next/server";
import { getLocalSession } from "@/lib/local-auth";
import { isSupabaseConfigured } from "@/lib/mode";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) return NextResponse.json({ user: null });
    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email || null,
        phone: session.phone || null,
        managerName: session.managerName || null,
        role: session.role,
        teamId: session.teamId
      },
      mode: "local"
    });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ user: null });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, team_id")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.user_metadata?.phone || null,
      managerName: user.user_metadata?.manager_name || null,
      role: profile?.role || null,
      teamId: profile?.team_id || null
    },
    mode: "supabase"
  });
}
