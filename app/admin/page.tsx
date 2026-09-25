import { Suspense } from "react";
import AdminPanel from "@/components/AdminPanel";
import { getLocalSession } from "@/lib/local-auth";
import { isSupabaseConfigured } from "@/lib/mode";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Panel" };

export default async function AdminPage() {
  if (!isSupabaseConfigured()) {
    const session = await getLocalSession();
    if (!session) redirect("/login?next=/admin");
    if (session.role !== "admin") redirect("/login");
    return (
      <Suspense fallback={null}>
        <AdminPanel />
      </Suspense>
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/login");

  return (
    <Suspense fallback={null}>
      <AdminPanel />
    </Suspense>
  );
}
