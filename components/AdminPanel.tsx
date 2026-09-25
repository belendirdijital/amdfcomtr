"use client";

import {
  CalendarDays,
  Crosshair,
  FileBadge2,
  Images,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  TableProperties,
  Trophy,
  UsersRound
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import LeagueMetrics from "@/components/LeagueMetrics";
import Modal from "@/components/Modal";
import SiteMediaModule from "@/components/SiteMediaModule";
import TeamBadge from "@/components/TeamBadge";
import { LicenseFormModal, LicenseView } from "@/components/LicenseModule";
import {
  TEAM_COLORS,
  createTeamShortName,
  formatDate,
  generateFixtures,
  getCardTotals,
  getStandings,
  getTopScorers,
  matchIsPlayed
} from "@/lib/league";
import type {
  CardRecord,
  LeagueData,
  Match,
  MatchGoal,
  PlayerLicense,
  SiteBanner,
  SiteSlide,
  Team
} from "@/lib/types";

type AdminView =
  | "overview"
  | "teams"
  | "fixtures"
  | "standings"
  | "scorers"
  | "fairplay"
  | "media"
  | "licenses"
  | "accounts";

const NAV: Array<{ view: AdminView; label: string; icon: typeof LayoutDashboard }> = [
  { view: "overview", label: "Özet", icon: LayoutDashboard },
  { view: "teams", label: "Takımlar", icon: UsersRound },
  { view: "fixtures", label: "Fikstür", icon: CalendarDays },
  { view: "standings", label: "Puan Durumu", icon: TableProperties },
  { view: "scorers", label: "Gol Kralı", icon: Crosshair },
  { view: "fairplay", label: "Fair Play", icon: ShieldCheck },
  { view: "media", label: "Slider & Banner", icon: Images },
  { view: "licenses", label: "Lisanslar", icon: FileBadge2 },
  { view: "accounts", label: "Takım Hesapları", icon: Trophy }
];

const ADMIN_VIEWS = new Set<AdminView>(NAV.map((item) => item.view));

function parseAdminView(value: string | null): AdminView {
  if (value && ADMIN_VIEWS.has(value as AdminView)) return value as AdminView;
  return "overview";
}

export default function AdminPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = parseAdminView(searchParams.get("view"));
  const setView = (next: AdminView) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overview") params.delete("view");
    else params.set("view", next);
    const query = params.toString();
    router.replace(query ? `/admin?${query}` : "/admin", { scroll: false });
  };
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [goals, setGoals] = useState<MatchGoal[]>([]);
  const [cards, setCards] = useState<CardRecord[]>([]);
  const [licenses, setLicenses] = useState<PlayerLicense[]>([]);
  const [slides, setSlides] = useState<SiteSlide[]>([]);
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState("");
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [goalMatch, setGoalMatch] = useState<Match | null>(null);
  const [accountPhone, setAccountPhone] = useState("");
  const [accountManagerName, setAccountManagerName] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountTeamId, setAccountTeamId] = useState("");

  const applyData = (data: LeagueData) => {
    setTeams(data.teams);
    setMatches(data.matches);
    setGoals(data.goals);
    setCards(data.cards);
    setLicenses(data.licenses);
    setSlides(data.slides || []);
    setBanners(data.banners || []);
  };

  const persist = async (data: LeagueData) => {
    const response = await fetch("/api/league", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Kayıt başarısız.");
    applyData(data);
  };

  const refresh = async () => {
    const response = await fetch("/api/league");
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error || "Veri yüklenemedi");
      return;
    }
    applyData(payload.data as LeagueData);
    setReady(true);
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const standings = useMemo(() => getStandings(teams, matches), [teams, matches]);
  const scorers = useMemo(() => getTopScorers(teams, goals), [teams, goals]);
  const fairPlay = useMemo(() => getCardTotals(teams, cards), [teams, cards]);
  const teamMap = useMemo(() => new Map(teams.map((team) => [team.id, team])), [teams]);
  const overviewData = useMemo(
    () => ({ teams, matches, goals, cards }),
    [teams, matches, goals, cards]
  );

  const currentData = (): LeagueData => ({
    teams,
    matches,
    goals,
    cards,
    licenses,
    slides,
    banners
  });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const saveTeam = async (team: Team) => {
    try {
      const exists = teams.some((item) => item.id === team.id);
      const nextTeams = exists
        ? teams.map((item) => (item.id === team.id ? team : item))
        : [...teams, team];
      await persist({ ...currentData(), teams: nextTeams });
      setTeamModalOpen(false);
      setEditingTeam(null);
      setToast(editingTeam ? "Takım güncellendi." : "Takım eklendi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
    }
  };

  const deleteTeam = async (team: Team) => {
    if (!window.confirm(`${team.name} silinsin mi? Bağlı maç/kart/lisanslar da silinir.`)) return;
    try {
      await persist({
        ...currentData(),
        teams: teams.filter((item) => item.id !== team.id),
        matches: matches.filter(
          (match) => match.homeId !== team.id && match.awayId !== team.id
        ),
        goals: goals.filter((goal) => goal.teamId !== team.id),
        cards: cards.filter((card) => card.teamId !== team.id),
        licenses: licenses.filter((license) => license.teamId !== team.id)
      });
      setToast("Takım silindi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Silinemedi.");
    }
  };

  const regenerateFixtures = async () => {
    const hasResults = matches.some(matchIsPlayed);
    if (
      hasResults &&
      !window.confirm("Mevcut maç sonuçları ve goller silinecek. Devam?")
    ) {
      return;
    }
    try {
      await persist({
        ...currentData(),
        matches: generateFixtures(teams),
        goals: []
      });
      setToast("Fikstür oluşturuldu.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Fikstür oluşturulamadı.");
    }
  };

  const openAddMatch = () => {
    if (teams.length < 2) {
      setToast("Önce en az iki takım ekleyin.");
      return;
    }
    setEditingMatch(null);
    setMatchModalOpen(true);
  };

  const openEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchModalOpen(true);
  };

  const closeMatchModal = () => {
    setMatchModalOpen(false);
    setEditingMatch(null);
  };

  const saveMatch = async (next: Match) => {
    if (next.homeId === next.awayId) {
      setToast("Aynı takım kendisiyle eşleşemez.");
      return;
    }
    if (!next.round || next.round < 1) {
      setToast("Hafta numarası en az 1 olmalı.");
      return;
    }
    const isEdit = matches.some((match) => match.id === next.id);
    try {
      if (isEdit) {
        const nextGoals = goals.filter(
          (goal) =>
            goal.matchId !== next.id ||
            goal.teamId === next.homeId ||
            goal.teamId === next.awayId
        );
        await persist({
          ...currentData(),
          matches: matches.map((match) => (match.id === next.id ? next : match)),
          goals: nextGoals
        });
        setToast("Maç kaydedildi.");
      } else {
        await persist({ ...currentData(), matches: [...matches, next] });
        setToast("Maç eklendi.");
      }
      closeMatchModal();
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
    }
  };

  const deleteMatch = async (match: Match) => {
    if (!window.confirm(`${match.round}. hafta maçı silinsin mi?`)) return;
    try {
      await persist({
        ...currentData(),
        matches: matches.filter((item) => item.id !== match.id),
        goals: goals.filter((goal) => goal.matchId !== match.id)
      });
      if (goalMatch?.id === match.id) setGoalMatch(null);
      if (editingMatch?.id === match.id) closeMatchModal();
      setToast("Maç silindi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Silinemedi.");
    }
  };

  const saveGoalsForMatch = async (matchId: string, nextGoals: MatchGoal[]) => {
    try {
      await persist({
        ...currentData(),
        goals: [...goals.filter((goal) => goal.matchId !== matchId), ...nextGoals]
      });
      setGoalMatch(null);
      setToast("Gol kayıtları güncellendi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
    }
  };

  const addCard = async (record: CardRecord) => {
    try {
      await persist({ ...currentData(), cards: [record, ...cards] });
      setCardModalOpen(false);
      setToast("Kart eklendi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await persist({ ...currentData(), cards: cards.filter((card) => card.id !== id) });
      setToast("Kart silindi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Silinemedi.");
    }
  };

  const addLicense = async (license: PlayerLicense) => {
    try {
      await persist({ ...currentData(), licenses: [license, ...licenses] });
      setLicenseModalOpen(false);
      setToast("Lisans kaydedildi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
    }
  };

  const deleteLicense = async (id: string) => {
    if (!window.confirm("Lisans silinsin mi?")) return;
    try {
      await persist({
        ...currentData(),
        licenses: licenses.filter((license) => license.id !== id)
      });
      setToast("Lisans silindi.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Silinemedi.");
    }
  };

  const saveSlide = async (slide: SiteSlide) => {
    const exists = slides.some((item) => item.id === slide.id);
    const nextSlides = exists
      ? slides.map((item) => (item.id === slide.id ? slide : item))
      : [...slides, slide];
    await persist({ ...currentData(), slides: nextSlides });
    setToast(exists ? "Slayt güncellendi." : "Slayt eklendi.");
  };

  const deleteSlide = async (id: string) => {
    await persist({
      ...currentData(),
      slides: slides.filter((slide) => slide.id !== id)
    });
    setToast("Slayt silindi.");
  };

  const saveBanner = async (banner: SiteBanner) => {
    const exists = banners.some((item) => item.id === banner.id);
    const nextBanners = exists
      ? banners.map((item) => (item.id === banner.id ? banner : item))
      : [...banners, banner];
    await persist({ ...currentData(), banners: nextBanners });
    setToast(exists ? "Banner güncellendi." : "Banner eklendi.");
  };

  const deleteBanner = async (id: string) => {
    await persist({
      ...currentData(),
      banners: banners.filter((banner) => banner.id !== id)
    });
    setToast("Banner silindi.");
  };

  const createTeamAccount = async (event: FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/admin/create-team-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: accountPhone,
        managerName: accountManagerName,
        password: accountPassword,
        teamId: accountTeamId
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      setToast(payload.error || "Hesap oluşturulamadı.");
      return;
    }
    setAccountPhone("");
    setAccountManagerName("");
    setAccountPassword("");
    setToast("Takım hesabı oluşturuldu.");
    void refresh();
  };

  if (!ready) {
    return <div className="login-shell">Admin paneli yükleniyor...</div>;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar sidebar--open">
        <div className="brand">
          <BrandMark className="brand__mark" size={56} />
          <span className="brand__text">
            <strong>Admin Panel</strong>
            <small>Veteranlar Ligi</small>
          </span>
        </div>
        <nav className="main-nav" aria-label="Admin menü">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                className={
                  view === item.view
                    ? "agency-home-link agency-home-link--active"
                    : "agency-home-link"
                }
                onClick={() => setView(item.view)}
              >
                <span className="workspace-card__icon">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{item.label}</strong>
                </span>
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          <Link href="/" className="agency-home-link">
            <span>
              <strong>Siteye dön</strong>
            </span>
          </Link>
          <button className="agency-home-link" onClick={logout}>
            <span className="workspace-card__icon">
              <LogOut size={18} />
            </span>
            <span>
              <strong>Çıkış</strong>
            </span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <span className="eyebrow">Yönetim</span>
            <h1>{NAV.find((item) => item.view === view)?.label}</h1>
          </div>
        </header>

        {view === "overview" && <LeagueMetrics data={overviewData} />}

        {view === "teams" && (
          <section className="content-section">
            <div className="panel-heading">
              <h2>Takımlar</h2>
              <button
                className="button button--primary"
                onClick={() => {
                  setEditingTeam(null);
                  setTeamModalOpen(true);
                }}
              >
                <Plus size={16} /> Takım ekle
              </button>
            </div>
            <div className="team-grid">
              {teams.map((team) => (
                <article className="team-card" key={team.id}>
                  <TeamBadge team={team} size="lg" />
                  <p>{team.manager || "Sorumlu yok"}</p>
                  <div className="form-actions">
                    <button
                      className="button button--quiet"
                      onClick={() => {
                        setEditingTeam(team);
                        setTeamModalOpen(true);
                      }}
                    >
                      Düzenle
                    </button>
                    <button className="button button--quiet" onClick={() => deleteTeam(team)}>
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "fixtures" && (
          <section className="content-section">
            <div className="panel-heading">
              <h2>Fikstür</h2>
              <div className="panel-heading__actions">
                <button className="button button--quiet" onClick={openAddMatch}>
                  <Plus size={16} /> Maç ekle
                </button>
                <button className="button button--primary" onClick={() => void regenerateFixtures()}>
                  Fikstür üret
                </button>
              </div>
            </div>
            {!matches.length && (
              <div className="site-empty">
                Fikstür yok. Otomatik üretebilir veya maç ekleyerek manuel oluşturabilirsiniz.
              </div>
            )}
            <div className="fixture-stack">
              {[...matches]
                .sort((a, b) => a.round - b.round || a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map((match) => {
                const home = teamMap.get(match.homeId);
                const away = teamMap.get(match.awayId);
                if (!home || !away) return null;
                const played = matchIsPlayed(match);
                return (
                  <article className="fixture-card" key={match.id}>
                    <div className="fixture-card__round">
                      <span>{match.round}. hafta</span>
                      <strong>{formatDate(match.date)}</strong>
                      <button
                        className="button button--quiet"
                        onClick={() => setGoalMatch(match)}
                      >
                        Goller
                      </button>
                    </div>
                    <div className="fixture-card__matchup">
                      <div className="fixture-team fixture-team--home">
                        <TeamBadge team={home} size="sm" />
                      </div>
                      <strong className="fixture-score">
                        {played ? `${match.homeScore} - ${match.awayScore}` : "vs"}
                      </strong>
                      <div className="fixture-team">
                        <TeamBadge team={away} size="sm" />
                      </div>
                    </div>
                    <div className="fixture-card__details fixture-card__details--readonly">
                      <div className="fixture-detail">
                        <span>Tarih</span>
                        <strong>{formatDate(match.date)}</strong>
                      </div>
                      <div className="fixture-detail">
                        <span>Saat</span>
                        <strong>{match.time}</strong>
                      </div>
                      <div className="fixture-detail">
                        <span>Saha</span>
                        <strong>{match.venue}</strong>
                      </div>
                      <div className="fixture-card__actions">
                        <button
                          className="button button--primary"
                          onClick={() => openEditMatch(match)}
                        >
                          Düzenle
                        </button>
                        <button
                          className="button button--quiet"
                          onClick={() => void deleteMatch(match)}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {view === "standings" && (
          <section className="content-section site-panel">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Takım</th>
                    <th>O</th>
                    <th>G</th>
                    <th>B</th>
                    <th>M</th>
                    <th>AV</th>
                    <th>P</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, index) => (
                    <tr key={row.team.id}>
                      <td>{index + 1}</td>
                      <td>
                        <TeamBadge team={row.team} size="sm" />
                      </td>
                      <td>{row.played}</td>
                      <td>{row.won}</td>
                      <td>{row.drawn}</td>
                      <td>{row.lost}</td>
                      <td>{row.gd}</td>
                      <td>
                        <strong>{row.points}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "scorers" && (
          <section className="content-section site-panel">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Oyuncu</th>
                    <th>Takım</th>
                    <th>Gol</th>
                  </tr>
                </thead>
                <tbody>
                  {scorers.map((row, index) => (
                    <tr key={`${row.team.id}-${row.playerName}`}>
                      <td>{index + 1}</td>
                      <td>{row.playerName}</td>
                      <td>
                        <TeamBadge team={row.team} size="sm" />
                      </td>
                      <td>
                        <strong>{row.goals}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!scorers.length && <div className="site-empty">Gol kaydı yok. Fikstürden maça gol ekleyin.</div>}
            </div>
          </section>
        )}

        {view === "fairplay" && (
          <section className="content-section">
            <div className="panel-heading">
              <h2>Fair play</h2>
              <button className="button button--primary" onClick={() => setCardModalOpen(true)}>
                <Plus size={16} /> Kart ekle
              </button>
            </div>
            <div className="site-panel" style={{ marginBottom: 16 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Takım</th>
                    <th>Sarı</th>
                    <th>Kırmızı</th>
                    <th>Ceza</th>
                  </tr>
                </thead>
                <tbody>
                  {fairPlay.map((row, index) => (
                    <tr key={row.team.id}>
                      <td>{index + 1}</td>
                      <td>
                        <TeamBadge team={row.team} size="sm" />
                      </td>
                      <td>{row.yellow}</td>
                      <td>{row.red}</td>
                      <td>{row.penalty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="card-list">
              {cards.map((card) => (
                <article className="card-item" key={card.id}>
                  <div>
                    <strong>{card.player || "Oyuncu"}</strong>
                    <p>{teamMap.get(card.teamId)?.name}</p>
                    <small>{card.note}</small>
                  </div>
                  <div>
                    <span>
                      S{card.yellow} / K{card.red}
                    </span>
                    <button className="button button--quiet" onClick={() => deleteCard(card.id)}>
                      Sil
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {view === "media" && (
          <SiteMediaModule
            slides={slides}
            banners={banners}
            onSaveSlide={async (slide) => {
              try {
                await saveSlide(slide);
              } catch (error) {
                setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
                throw error;
              }
            }}
            onDeleteSlide={async (id) => {
              try {
                await deleteSlide(id);
              } catch (error) {
                setToast(error instanceof Error ? error.message : "Silinemedi.");
              }
            }}
            onSaveBanner={async (banner) => {
              try {
                await saveBanner(banner);
              } catch (error) {
                setToast(error instanceof Error ? error.message : "Kayıt başarısız.");
                throw error;
              }
            }}
            onDeleteBanner={async (id) => {
              try {
                await deleteBanner(id);
              } catch (error) {
                setToast(error instanceof Error ? error.message : "Silinemedi.");
              }
            }}
          />
        )}

        {view === "licenses" && (
          <section className="content-section">
            <LicenseView
              licenses={licenses}
              onAdd={() => setLicenseModalOpen(true)}
              onDelete={deleteLicense}
              notify={setToast}
            />
          </section>
        )}

        {view === "accounts" && (
          <section className="content-section site-panel">
            <h2 style={{ marginTop: 0 }}>Takım paneli hesabı oluştur</h2>
            <p style={{ color: "var(--muted)" }}>
              Her takıma telefon/şifre ve yönetici adı verin. Takım yalnızca kendi
              lisanslarını görür ve ekler.
            </p>
            <form className="form" onSubmit={createTeamAccount}>
              <label className="form-field">
                <span>Takım</span>
                <select
                  value={accountTeamId}
                  onChange={(event) => setAccountTeamId(event.target.value)}
                  required
                >
                  <option value="">Seçin</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Yönetici adı soyadı</span>
                <input
                  type="text"
                  value={accountManagerName}
                  onChange={(event) => setAccountManagerName(event.target.value)}
                  required
                  placeholder="Ad Soyad"
                />
              </label>
              <label className="form-field">
                <span>Telefon</span>
                <input
                  type="tel"
                  value={accountPhone}
                  onChange={(event) => setAccountPhone(event.target.value)}
                  required
                  placeholder="05xx xxx xx xx"
                  autoComplete="tel"
                />
              </label>
              <label className="form-field">
                <span>Şifre</span>
                <input
                  type="text"
                  value={accountPassword}
                  onChange={(event) => setAccountPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </label>
              <button className="button button--primary" type="submit">
                Hesap oluştur
              </button>
            </form>
          </section>
        )}
      </main>

      {toast && <div className="toast">{toast}</div>}

      <TeamFormModal
        open={teamModalOpen}
        team={editingTeam}
        teamCount={teams.length}
        onClose={() => {
          setTeamModalOpen(false);
          setEditingTeam(null);
        }}
        onSave={saveTeam}
      />

      <MatchFormModal
        open={matchModalOpen}
        match={editingMatch}
        teams={teams}
        defaultRound={matches.reduce((max, match) => Math.max(max, match.round), 0) + 1 || 1}
        onClose={closeMatchModal}
        onSave={saveMatch}
      />

      <CardFormModal
        open={cardModalOpen}
        teams={teams}
        onClose={() => setCardModalOpen(false)}
        onSave={addCard}
      />

      <LicenseFormModal
        open={licenseModalOpen}
        teams={teams}
        licenseCount={licenses.length}
        onClose={() => setLicenseModalOpen(false)}
        onSave={addLicense}
      />

      <GoalEditorModal
        open={Boolean(goalMatch)}
        match={goalMatch}
        teams={teams}
        goals={goals.filter((goal) => goal.matchId === goalMatch?.id)}
        onClose={() => setGoalMatch(null)}
        onSave={saveGoalsForMatch}
      />
    </div>
  );
}

function MatchFormModal({
  open,
  match,
  teams,
  defaultRound,
  onClose,
  onSave
}: {
  open: boolean;
  match: Match | null;
  teams: Team[];
  defaultRound: number;
  onClose: () => void;
  onSave: (match: Match) => void;
}) {
  const [round, setRound] = useState(1);
  const [homeId, setHomeId] = useState("");
  const [awayId, setAwayId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("18:00");
  const [venue, setVenue] = useState("AMDF Arena");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  useEffect(() => {
    if (!open) return;
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setRound(Math.max(1, match?.round ?? defaultRound));
    setHomeId(match?.homeId || teams[0]?.id || "");
    setAwayId(match?.awayId || teams[1]?.id || teams[0]?.id || "");
    setDate(match?.date || todayIso);
    setTime(match?.time || "18:00");
    setVenue(match?.venue || "AMDF Arena");
    setHomeScore(match?.homeScore == null ? "" : String(match.homeScore));
    setAwayScore(match?.awayScore == null ? "" : String(match.awayScore));
  }, [open, match, teams, defaultRound]);

  return (
    <Modal
      open={open}
      title={match ? "Maçı düzenle" : "Yeni maç"}
      eyebrow="Fikstür"
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (!homeId || !awayId) return;
          if (homeId === awayId) return;
          onSave({
            id: match?.id || crypto.randomUUID(),
            round: Math.max(1, round),
            homeId,
            awayId,
            date,
            time,
            venue: venue.trim() || "AMDF Arena",
            homeScore: homeScore === "" ? null : Number(homeScore),
            awayScore: awayScore === "" ? null : Number(awayScore)
          });
        }}
      >
        <div className="form-row">
          <label className="form-field">
            <span>Hafta</span>
            <input
              type="number"
              min={1}
              value={round}
              onChange={(event) => setRound(Math.max(1, Number(event.target.value) || 1))}
              required
            />
          </label>
          <label className="form-field">
            <span>Tarih</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>Saat</span>
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Saha</span>
            <input value={venue} onChange={(event) => setVenue(event.target.value)} required />
          </label>
        </div>
        <label className="form-field">
          <span>Ev sahibi</span>
          <select
            value={homeId}
            onChange={(event) => setHomeId(event.target.value)}
            required
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Deplasman</span>
          <select
            value={awayId}
            onChange={(event) => setAwayId(event.target.value)}
            required
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Ev skoru (opsiyonel)</span>
            <input
              type="number"
              min={0}
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
              placeholder="—"
            />
          </label>
          <label className="form-field">
            <span>Deplasman skoru (opsiyonel)</span>
            <input
              type="number"
              min={0}
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
              placeholder="—"
            />
          </label>
        </div>
        {homeId && awayId && homeId === awayId && (
          <p className="form-hint form-hint--error">Aynı takım kendisiyle eşleşemez.</p>
        )}
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="submit"
            className="button button--primary"
            disabled={!homeId || !awayId || homeId === awayId}
          >
            {match ? "Kaydet" : "Maçı ekle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TeamFormModal({
  open,
  team,
  teamCount,
  onClose,
  onSave
}: {
  open: boolean;
  team: Team | null;
  teamCount: number;
  onClose: () => void;
  onSave: (team: Team) => void;
}) {
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [secondaryColor, setSecondaryColor] = useState(TEAM_COLORS[1]);

  useEffect(() => {
    if (!open) return;
    setName(team?.name || "");
    setManager(team?.manager || "");
    setContactPhone(team?.contactPhone || "");
    setColor(team?.color || TEAM_COLORS[teamCount % TEAM_COLORS.length]);
    setSecondaryColor(
      team?.secondaryColor || TEAM_COLORS[(teamCount + 1) % TEAM_COLORS.length]
    );
  }, [open, team, teamCount]);

  return (
    <Modal
      open={open}
      title={team ? "Takımı düzenle" : "Yeni takım"}
      eyebrow="Takım bilgileri"
      onClose={onClose}
    >
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            id: team?.id || crypto.randomUUID(),
            name: name.trim(),
            shortName: createTeamShortName(name),
            color,
            secondaryColor,
            manager: manager.trim(),
            contactPhone: contactPhone.trim()
          });
        }}
      >
        <label className="form-field">
          <span>Takım adı</span>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label className="form-field">
          <span>Sorumlu</span>
          <input value={manager} onChange={(event) => setManager(event.target.value)} />
        </label>
        <label className="form-field">
          <span>Telefon</span>
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
          />
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Ana renk</span>
            <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
          </label>
          <label className="form-field">
            <span>İkinci renk</span>
            <input
              type="color"
              value={secondaryColor}
              onChange={(event) => setSecondaryColor(event.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" className="button button--primary">
            Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CardFormModal({
  open,
  teams,
  onClose,
  onSave
}: {
  open: boolean;
  teams: Team[];
  onClose: () => void;
  onSave: (card: CardRecord) => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [player, setPlayer] = useState("");
  const [yellow, setYellow] = useState(1);
  const [red, setRed] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setTeamId(teams[0]?.id || "");
    setPlayer("");
    setYellow(1);
    setRed(0);
    setNote("");
  }, [open, teams]);

  return (
    <Modal open={open} title="Kart kaydı" eyebrow="Fair play" onClose={onClose}>
      <form
        className="form"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            id: crypto.randomUUID(),
            teamId,
            player: player.trim(),
            yellow,
            red,
            note: note.trim(),
            createdAt: new Date().toISOString().slice(0, 10)
          });
        }}
      >
        <label className="form-field">
          <span>Takım</span>
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} required>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Oyuncu</span>
          <input value={player} onChange={(event) => setPlayer(event.target.value)} />
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Sarı</span>
            <input
              type="number"
              min={0}
              value={yellow}
              onChange={(event) => setYellow(Number(event.target.value))}
            />
          </label>
          <label className="form-field">
            <span>Kırmızı</span>
            <input
              type="number"
              min={0}
              value={red}
              onChange={(event) => setRed(Number(event.target.value))}
            />
          </label>
        </div>
        <label className="form-field">
          <span>Not</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
        </label>
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            Vazgeç
          </button>
          <button type="submit" className="button button--primary">
            Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
}

function GoalEditorModal({
  open,
  match,
  teams,
  goals,
  onClose,
  onSave
}: {
  open: boolean;
  match: Match | null;
  teams: Team[];
  goals: MatchGoal[];
  onClose: () => void;
  onSave: (matchId: string, goals: MatchGoal[]) => void;
}) {
  const [rows, setRows] = useState<MatchGoal[]>([]);

  useEffect(() => {
    if (!open || !match) return;
    setRows(
      goals.length
        ? goals
        : [
            {
              id: crypto.randomUUID(),
              matchId: match.id,
              teamId: match.homeId,
              playerName: "",
              minute: null,
              count: 1
            }
          ]
    );
  }, [open, match, goals]);

  if (!match) return null;
  const home = teams.find((team) => team.id === match.homeId);
  const away = teams.find((team) => team.id === match.awayId);

  return (
    <Modal open={open} title="Maç golleri" eyebrow="Gol kralı kaydı" onClose={onClose}>
      <div className="goal-editor">
        <p>
          {home?.name} vs {away?.name}
        </p>
        {rows.map((row, index) => (
          <div className="goal-row" key={row.id}>
            <label className="form-field">
              <span>Oyuncu</span>
              <input
                value={row.playerName}
                onChange={(event) =>
                  setRows((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, playerName: event.target.value } : item
                    )
                  )
                }
              />
            </label>
            <label className="form-field">
              <span>Takım</span>
              <select
                value={row.teamId}
                onChange={(event) =>
                  setRows((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, teamId: event.target.value } : item
                    )
                  )
                }
              >
                <option value={match.homeId}>{home?.name}</option>
                <option value={match.awayId}>{away?.name}</option>
              </select>
            </label>
            <label className="form-field">
              <span>Dk</span>
              <input
                type="number"
                min={1}
                max={120}
                value={row.minute ?? ""}
                onChange={(event) =>
                  setRows((current) =>
                    current.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            minute:
                              event.target.value === "" ? null : Number(event.target.value)
                          }
                        : item
                    )
                  )
                }
              />
            </label>
            <label className="form-field">
              <span>Adet</span>
              <input
                type="number"
                min={1}
                value={row.count}
                onChange={(event) =>
                  setRows((current) =>
                    current.map((item, i) =>
                      i === index ? { ...item, count: Number(event.target.value) || 1 } : item
                    )
                  )
                }
              />
            </label>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setRows((current) => current.filter((_, i) => i !== index))}
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button--quiet"
          onClick={() =>
            setRows((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                matchId: match.id,
                teamId: match.homeId,
                playerName: "",
                minute: null,
                count: 1
              }
            ])
          }
        >
          <Plus size={16} /> Gol satırı
        </button>
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() =>
              onSave(
                match.id,
                rows.filter((row) => row.playerName.trim())
              )
            }
          >
            Kaydet
          </button>
        </div>
      </div>
    </Modal>
  );
}
