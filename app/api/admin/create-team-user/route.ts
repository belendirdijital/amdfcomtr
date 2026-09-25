import { NextResponse } from "next/server";
import { getLocalSession } from "@/lib/local-auth";
import { readLocalStore, writeLocalStore } from "@/lib/local-store";
import { isSupabaseConfigured } from "@/lib/mode";
import { isValidPhone, normalizePhone, phoneToAuthEmail } from "@/lib/phone";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "").trim();
    const password = String(body.password || "");
    const teamId = String(body.teamId || "");
    const managerName = String(body.managerName || "").trim();

    if (!isValidPhone(phone) || password.length < 6 || !teamId || !managerName) {
      return NextResponse.json(
        {
          error:
            "Geçerli telefon, yönetici adı soyadı, en az 6 karakter şifre ve takım gerekli."
        },
        { status: 400 }
      );
    }

    const phoneDigits = normalizePhone(phone);

    if (!isSupabaseConfigured()) {
      const session = await getLocalSession();
      if (!session || session.role !== "admin") {
        return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
      }
      const store = readLocalStore();
      if (
        store.accounts.some(
          (account) => account.phone && normalizePhone(account.phone) === phoneDigits
        )
      ) {
        return NextResponse.json({ error: "Bu telefon zaten kayıtlı." }, { status: 400 });
      }

      const team = store.data.teams.find((item) => item.id === teamId);
      if (!team) {
        return NextResponse.json({ error: "Takım bulunamadı." }, { status: 400 });
      }

      store.accounts.push({
        id: crypto.randomUUID(),
        phone: phoneDigits,
        managerName,
        password,
        role: "team",
        teamId
      });
      store.data.teams = store.data.teams.map((item) =>
        item.id === teamId
          ? { ...item, manager: managerName, contactPhone: phoneDigits }
          : item
      );
      writeLocalStore(store);
      return NextResponse.json({ ok: true });
    }

    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Sadece admin takım hesabı oluşturabilir." },
        { status: 403 }
      );
    }

    const service = createServiceClient();
    const authEmail = phoneToAuthEmail(phoneDigits);
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        role: "team",
        team_id: teamId,
        phone: phoneDigits,
        manager_name: managerName
      }
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const { error: profileError } = await service.from("profiles").upsert({
      id: created.user.id,
      role: "team",
      team_id: teamId
    });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    await service
      .from("teams")
      .update({ manager: managerName, contact_phone: phoneDigits })
      .eq("id", teamId);

    return NextResponse.json({ ok: true, userId: created.user.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hesap oluşturulamadı." },
      { status: 500 }
    );
  }
}
