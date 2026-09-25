"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BrandMark from "@/components/BrandMark";
import { LicenseFormModal, LicenseView } from "@/components/LicenseModule";
import type { PlayerLicense, Team } from "@/lib/types";

export default function TeamPanel({
  teamId,
  teamName
}: {
  teamId: string;
  teamName: string;
}) {
  const router = useRouter();
  const [licenses, setLicenses] = useState<PlayerLicense[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = async () => {
    const [licenseRes, leagueRes] = await Promise.all([
      fetch("/api/licenses"),
      fetch("/api/league")
    ]);
    const licensePayload = await licenseRes.json();
    const leaguePayload = await leagueRes.json();

    if (!licenseRes.ok) {
      setToast(licensePayload.error || "Yüklenemedi");
      return;
    }
    if (!leagueRes.ok) {
      setToast(leaguePayload.error || "Yüklenemedi");
      return;
    }

    const allLicenses = (licensePayload.licenses || []) as PlayerLicense[];
    setLicenses(allLicenses.filter((item) => item.teamId === teamId));
    const found = ((leaguePayload.data?.teams || []) as Team[]).find(
      (item) => item.id === teamId
    );
    setTeam(found || null);
    setReady(true);
  };

  useEffect(() => {
    void refresh();
  }, [teamId]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const addLicense = async (license: PlayerLicense) => {
    const response = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ license: { ...license, teamId } })
    });
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error || "Kayıt başarısız.");
      return;
    }
    setModalOpen(false);
    setToast("Lisans kaydedildi.");
    await refresh();
  };

  const deleteLicense = async (id: string) => {
    if (!window.confirm("Bu lisans silinsin mi?")) return;
    const response = await fetch(`/api/licenses?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error || "Silinemedi.");
      return;
    }
    setToast("Lisans silindi.");
    await refresh();
  };

  if (!ready) {
    return <div className="login-shell">Takım paneli yükleniyor...</div>;
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-brand">
            <BrandMark />
            <span>
              <strong>{teamName || team?.name || "Takım paneli"}</strong>
              <small>Oyuncu lisansları</small>
            </span>
          </div>
          <nav className="site-nav">
            <Link href="/">Site</Link>
            <button className="site-nav__login" onClick={logout}>
              <LogOut size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Çıkış
            </button>
          </nav>
        </div>
      </header>

      <main className="site-main">
        <section className="site-hero">
          <span className="eyebrow">Takım paneli</span>
          <h1>Oyuncu lisansları</h1>
          <p>Yalnızca kendi takımınızın lisanslarını görüntüleyebilir ve ekleyebilirsiniz.</p>
        </section>

        <LicenseView
          licenses={licenses}
          onAdd={() => setModalOpen(true)}
          onDelete={deleteLicense}
          notify={setToast}
        />
      </main>

      {toast && <div className="toast">{toast}</div>}

      <LicenseFormModal
        open={modalOpen}
        teams={team ? [team] : []}
        licenseCount={licenses.length}
        lockedTeamId={teamId}
        onClose={() => setModalOpen(false)}
        onSave={addLicense}
      />
    </div>
  );
}
