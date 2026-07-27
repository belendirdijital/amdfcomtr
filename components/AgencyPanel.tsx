"use client";

import {
  Award,
  CalendarDays,
  ChevronRight,
  CircleGauge,
  Download,
  LayoutDashboard,
  Menu,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Trash2,
  Trophy,
  UsersRound,
  X
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  TEAM_COLORS,
  formatDate,
  generateFixtures,
  getCardTotals,
  getStandings,
  matchIsPlayed,
  seedData
} from "@/lib/league";
import type { CardRecord, LeagueData, Match, Team, View } from "@/lib/types";
import Modal from "./Modal";
import TeamBadge from "./TeamBadge";

const STORAGE_KEY = "v3-ajans-veteranlar-ligi-v1";

const NAV_ITEMS: Array<{
  view: View;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { view: "overview", label: "Genel Bakış", icon: LayoutDashboard },
  { view: "teams", label: "Takımlar", icon: UsersRound },
  { view: "fixtures", label: "Fikstür", icon: CalendarDays },
  { view: "standings", label: "Puan Durumu", icon: TableProperties },
  { view: "fairplay", label: "Fair Play", icon: ShieldCheck }
];

const PAGE_INFO: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: {
    eyebrow: "Veteranlar Ligi · 2026",
    title: "Lig merkezi",
    description: "Turnuvanın tüm hareketini tek ekrandan takip edin."
  },
  teams: {
    eyebrow: "Lig yönetimi",
    title: "Takımlar",
    description: "Lige katılan takımları ekleyin, düzenleyin ve yönetin."
  },
  fixtures: {
    eyebrow: "Çift devre lig usulü",
    title: "Fikstür",
    description: "Maç programını ve sonuçları hafta hafta yönetin."
  },
  standings: {
    eyebrow: "Otomatik hesaplama",
    title: "Puan durumu",
    description: "Girilen sonuçlara göre güncellenen lig sıralaması."
  },
  fairplay: {
    eyebrow: "Disiplin merkezi",
    title: "Fair Play",
    description: "Sarı ve kırmızı kartları takım bazında takip edin."
  }
};

function cloneSeedData(): LeagueData {
  return JSON.parse(JSON.stringify(seedData)) as LeagueData;
}

function downloadJson(data: LeagueData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `v3-veteranlar-ligi-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function AgencyPanel() {
  const [data, setData] = useState<LeagueData>(() => cloneSeedData());
  const [ready, setReady] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setData(JSON.parse(stored) as LeagueData);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, ready]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const standings = useMemo(() => getStandings(data.teams, data.matches), [data]);
  const cardTotals = useMemo(() => getCardTotals(data.teams, data.cards), [data]);
  const playedCount = data.matches.filter(matchIsPlayed).length;
  const nextMatches = data.matches.filter((match) => !matchIsPlayed(match)).slice(0, 3);
  const info = PAGE_INFO[view];

  const changeView = (nextView: View) => {
    setView(nextView);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveTeam = (team: Team) => {
    setData((current) => {
      const exists = current.teams.some((item) => item.id === team.id);
      return {
        ...current,
        teams: exists
          ? current.teams.map((item) => (item.id === team.id ? team : item))
          : [...current.teams, team]
      };
    });
    setTeamModalOpen(false);
    setEditingTeam(null);
    setToast(editingTeam ? "Takım bilgileri güncellendi." : "Takım lige eklendi.");
  };

  const deleteTeam = (team: Team) => {
    if (!window.confirm(`${team.name} ve takıma bağlı maç/kart kayıtları silinsin mi?`)) return;
    setData((current) => ({
      teams: current.teams.filter((item) => item.id !== team.id),
      matches: current.matches.filter(
        (match) => match.homeId !== team.id && match.awayId !== team.id
      ),
      cards: current.cards.filter((card) => card.teamId !== team.id)
    }));
    setToast("Takım ve bağlı kayıtlar silindi.");
  };

  const regenerateFixtures = () => {
    const hasResults = data.matches.some(matchIsPlayed);
    if (
      hasResults &&
      !window.confirm("Mevcut maç sonuçları silinecek. Fikstür yeniden oluşturulsun mu?")
    ) {
      return;
    }
    setData((current) => ({
      ...current,
      matches: generateFixtures(current.teams)
    }));
    setToast("Çift devre fikstür oluşturuldu.");
  };

  const updateMatch = (updated: Match) => {
    setData((current) => ({
      ...current,
      matches: current.matches.map((match) => (match.id === updated.id ? updated : match))
    }));
    setToast("Maç bilgileri kaydedildi.");
  };

  const addCard = (record: CardRecord) => {
    setData((current) => ({ ...current, cards: [record, ...current.cards] }));
    setCardModalOpen(false);
    setToast("Kart kaydı eklendi.");
  };

  const deleteCard = (id: string) => {
    setData((current) => ({
      ...current,
      cards: current.cards.filter((card) => card.id !== id)
    }));
    setToast("Kart kaydı silindi.");
  };

  const resetDemo = () => {
    if (!window.confirm("Tüm değişiklikler silinip örnek veriler geri yüklensin mi?")) return;
    setData(cloneSeedData());
    setToast("Örnek veriler geri yüklendi.");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
        <div className="brand">
          <span className="brand__mark">V3</span>
          <span className="brand__text">
            <strong>V3 Ajans</strong>
            <small>Operasyon Paneli</small>
          </span>
          <button
            className="sidebar__close icon-button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Menüyü kapat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">Çalışma alanı</div>
        <div className="workspace-card">
          <span className="workspace-card__icon">
            <Trophy size={20} />
          </span>
          <span>
            <strong>Veteranlar Ligi</strong>
            <small>2026 Sezonu</small>
          </span>
        </div>

        <nav className="main-nav" aria-label="Ana menü">
          <span className="nav-section-title">Lig menüsü</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.view}
                className={view === item.view ? "nav-item nav-item--active" : "nav-item"}
                onClick={() => changeView(item.view)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.view === "fairplay" && data.cards.length > 0 && (
                  <em>{data.cards.length}</em>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <span className="nav-section-title">Yeni modüller</span>
          <div className="coming-soon">
            <span><Sparkles size={16} /> Geliştirmeye açık</span>
            <small>V3 Ajans&apos;ın diğer işleri buraya modül olarak eklenebilir.</small>
          </div>
          <button className="text-action" onClick={resetDemo}>
            <RotateCcw size={15} />
            Örnek verileri sıfırla
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-label="Menüyü kapat"
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={21} />
          </button>
          <div className="topbar__path">
            <span>V3 Ajans</span>
            <ChevronRight size={14} />
            <strong>Veteranlar Ligi</strong>
          </div>
          <div className="topbar__actions">
            <button className="button button--quiet export-button" onClick={() => downloadJson(data)}>
              <Download size={17} />
              Verileri indir
            </button>
            <div className="profile-chip">
              <span>V3</span>
              <div>
                <strong>Yönetici</strong>
                <small>Tam yetki</small>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <span className="eyebrow">{info.eyebrow}</span>
              <h1>{info.title}</h1>
              <p>{info.description}</p>
            </div>
            {view === "teams" && (
              <button
                className="button button--primary"
                onClick={() => {
                  setEditingTeam(null);
                  setTeamModalOpen(true);
                }}
              >
                <Plus size={18} /> Takım ekle
              </button>
            )}
            {view === "fixtures" && (
              <button className="button button--primary" onClick={regenerateFixtures}>
                <RotateCcw size={17} /> Fikstürü oluştur
              </button>
            )}
            {view === "fairplay" && (
              <button
                className="button button--primary"
                onClick={() => setCardModalOpen(true)}
                disabled={!data.teams.length}
              >
                <Plus size={18} /> Kart kaydı ekle
              </button>
            )}
          </section>

          {view === "overview" && (
            <Overview
              teams={data.teams}
              matches={data.matches}
              playedCount={playedCount}
              standings={standings}
              cardTotals={cardTotals}
              nextMatches={nextMatches}
              changeView={changeView}
              onAddTeam={() => {
                setEditingTeam(null);
                setTeamModalOpen(true);
              }}
            />
          )}
          {view === "teams" && (
            <TeamsView
              teams={data.teams}
              matches={data.matches}
              cards={data.cards}
              onEdit={(team) => {
                setEditingTeam(team);
                setTeamModalOpen(true);
              }}
              onDelete={deleteTeam}
              onAdd={() => {
                setEditingTeam(null);
                setTeamModalOpen(true);
              }}
            />
          )}
          {view === "fixtures" && (
            <FixturesView
              teams={data.teams}
              matches={data.matches}
              onUpdate={updateMatch}
              onGenerate={regenerateFixtures}
            />
          )}
          {view === "standings" && (
            <StandingsView
              standings={standings}
              playedCount={playedCount}
              totalMatches={data.matches.length}
            />
          )}
          {view === "fairplay" && (
            <FairPlayView
              totals={cardTotals}
              cards={data.cards}
              teams={data.teams}
              onAdd={() => setCardModalOpen(true)}
              onDelete={deleteCard}
            />
          )}
        </div>
      </main>

      <TeamFormModal
        open={teamModalOpen}
        team={editingTeam}
        teamCount={data.teams.length}
        onClose={() => {
          setTeamModalOpen(false);
          setEditingTeam(null);
        }}
        onSave={saveTeam}
      />
      <CardFormModal
        open={cardModalOpen}
        teams={data.teams}
        onClose={() => setCardModalOpen(false)}
        onSave={addCard}
      />
      {toast && <div className="toast"><CircleGauge size={17} /> {toast}</div>}
    </div>
  );
}

function Overview({
  teams,
  matches,
  playedCount,
  standings,
  cardTotals,
  nextMatches,
  changeView,
  onAddTeam
}: {
  teams: Team[];
  matches: Match[];
  playedCount: number;
  standings: ReturnType<typeof getStandings>;
  cardTotals: ReturnType<typeof getCardTotals>;
  nextMatches: Match[];
  changeView: (view: View) => void;
  onAddTeam: () => void;
}) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const yellowCount = cardTotals.reduce((sum, item) => sum + item.yellow, 0);
  const redCount = cardTotals.reduce((sum, item) => sum + item.red, 0);
  const progress = matches.length ? Math.round((playedCount / matches.length) * 100) : 0;

  return (
    <div className="view-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="hero-panel__tag"><span /> LİG AKTİF</span>
          <h2>Veteranlar sahada,<br /><em>kontrol sizde.</em></h2>
          <p>Takımlardan fikstüre, puan durumundan fair play takibine kadar tüm lig tek merkezde.</p>
          <div className="hero-panel__actions">
            <button className="button button--light" onClick={() => changeView("fixtures")}>
              Fikstüre git <ChevronRight size={17} />
            </button>
            <button className="button button--ghost-light" onClick={onAddTeam}>
              <Plus size={17} /> Takım ekle
            </button>
          </div>
        </div>
        <div className="hero-score">
          <span className="hero-score__label">SEZON İLERLEMESİ</span>
          <strong>{progress}<small>%</small></strong>
          <div className="hero-score__bar"><span style={{ width: `${progress}%` }} /></div>
          <p>{playedCount} maç tamamlandı · {matches.length - playedCount} maç kaldı</p>
          <div className="hero-score__season">2026 <span>ÇİFT DEVRE</span></div>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="Toplam takım" value={teams.length} meta="Aktif katılımcı" icon={UsersRound} tone="blue" />
        <MetricCard label="Toplam maç" value={matches.length} meta={`${playedCount} tamamlandı`} icon={CalendarDays} tone="orange" />
        <MetricCard label="Sarı kart" value={yellowCount} meta="Fair play kaydı" icon={Award} tone="yellow" />
        <MetricCard label="Kırmızı kart" value={redCount} meta="Fair play kaydı" icon={ShieldCheck} tone="red" />
      </section>

      <section className="dashboard-grid">
        <div className="panel panel--wide">
          <PanelHeading
            eyebrow="Sıradaki karşılaşmalar"
            title="Yaklaşan maçlar"
            action="Tüm fikstür"
            onAction={() => changeView("fixtures")}
          />
          {nextMatches.length ? (
            <div className="upcoming-list">
              {nextMatches.map((match) => {
                const home = teamMap.get(match.homeId);
                const away = teamMap.get(match.awayId);
                if (!home || !away) return null;
                return (
                  <div className="upcoming-match" key={match.id}>
                    <div className="upcoming-match__date">
                      <strong>{new Date(`${match.date}T12:00:00`).getDate()}</strong>
                      <span>{new Intl.DateTimeFormat("tr-TR", { month: "short" }).format(new Date(`${match.date}T12:00:00`))}</span>
                    </div>
                    <div className="upcoming-match__teams">
                      <TeamBadge team={home} size="sm" />
                      <span className="versus">VS</span>
                      <TeamBadge team={away} size="sm" />
                    </div>
                    <div className="upcoming-match__meta">
                      <strong>{match.time}</strong>
                      <span>{match.venue} · {match.round}. Hafta</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="Planlanmış maç yok" text="Takımları ekleyip fikstürü oluşturabilirsiniz." />
          )}
        </div>

        <div className="panel">
          <PanelHeading
            eyebrow="İlk 5"
            title="Puan durumu"
            action="Tablonun tamamı"
            onAction={() => changeView("standings")}
          />
          <div className="mini-table">
            <div className="mini-table__head">
              <span>#</span><span>Takım</span><span>O</span><span>AV</span><span>P</span>
            </div>
            {standings.slice(0, 5).map((row, index) => (
              <div className="mini-table__row" key={row.team.id}>
                <span className={index < 3 ? "rank rank--top" : "rank"}>{index + 1}</span>
                <TeamBadge team={row.team} size="sm" />
                <span>{row.played}</span>
                <span>{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                <strong>{row.points}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  meta,
  icon: Icon,
  tone
}: {
  label: string;
  value: number;
  meta: string;
  icon: typeof UsersRound;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <span className={`metric-card__icon metric-card__icon--${tone}`}><Icon size={21} /></span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
    </article>
  );
}

function PanelHeading({
  eyebrow,
  title,
  action,
  onAction
}: {
  eyebrow: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel-heading">
      <div>
        <span>{eyebrow}</span>
        <h3>{title}</h3>
      </div>
      {action && <button onClick={onAction}>{action} <ChevronRight size={15} /></button>}
    </div>
  );
}

function TeamsView({
  teams,
  matches,
  cards,
  onEdit,
  onDelete,
  onAdd
}: {
  teams: Team[];
  matches: Match[];
  cards: CardRecord[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onAdd: () => void;
}) {
  if (!teams.length) {
    return <EmptyState title="Henüz takım yok" text="Ligi başlatmak için ilk takımı ekleyin." action="İlk takımı ekle" onAction={onAdd} />;
  }

  return (
    <section className="team-grid">
      {teams.map((team, index) => {
        const played = matches.filter(
          (match) =>
            matchIsPlayed(match) && (match.homeId === team.id || match.awayId === team.id)
        ).length;
        const teamCards = cards.filter((card) => card.teamId === team.id);
        const yellow = teamCards.reduce((sum, card) => sum + card.yellow, 0);
        const red = teamCards.reduce((sum, card) => sum + card.red, 0);
        return (
          <article className="team-card" key={team.id}>
            <div className="team-card__number">{String(index + 1).padStart(2, "0")}</div>
            <div className="team-card__top">
              <TeamBadge team={team} size="lg" showName={false} />
              <span className="team-card__short">{team.shortName}</span>
            </div>
            <div className="team-card__body">
              <h3>{team.name}</h3>
              <p>{team.manager || "Takım sorumlusu eklenmedi"}</p>
            </div>
            <div className="team-card__stats">
              <span><strong>{played}</strong> Maç</span>
              <span><strong>{yellow}</strong> Sarı</span>
              <span><strong>{red}</strong> Kırmızı</span>
            </div>
            <div className="team-card__actions">
              <button className="button button--quiet" onClick={() => onEdit(team)}>Düzenle</button>
              <button className="icon-button icon-button--danger" onClick={() => onDelete(team)} aria-label={`${team.name} takımını sil`}>
                <Trash2 size={17} />
              </button>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function FixturesView({
  teams,
  matches,
  onUpdate,
  onGenerate
}: {
  teams: Team[];
  matches: Match[];
  onUpdate: (match: Match) => void;
  onGenerate: () => void;
}) {
  const rounds = [...new Set(matches.map((match) => match.round))].sort((a, b) => a - b);
  const firstUnplayedRound = rounds.find((round) =>
    matches.some((match) => match.round === round && !matchIsPlayed(match))
  );
  const [activeRound, setActiveRound] = useState<number | "all">(firstUnplayedRound || rounds[0] || "all");

  useEffect(() => {
    if (activeRound !== "all" && !rounds.includes(activeRound)) {
      setActiveRound(rounds[0] || "all");
    }
  }, [activeRound, rounds]);

  if (teams.length < 2) {
    return <EmptyState title="Fikstür için en az 2 takım gerekli" text="Takımlar menüsünden lige katılımcı ekleyin." />;
  }
  if (!matches.length) {
    return <EmptyState title="Fikstür henüz oluşturulmadı" text="Tüm takımlar birbirleriyle iç ve dış saha olmak üzere iki kez karşılaşacak." action="Çift devre fikstür oluştur" onAction={onGenerate} />;
  }

  const visibleMatches = activeRound === "all"
    ? matches
    : matches.filter((match) => match.round === activeRound);

  return (
    <div className="view-stack">
      <div className="round-scroller" role="tablist" aria-label="Fikstür haftaları">
        <button className={activeRound === "all" ? "round-tab round-tab--active" : "round-tab"} onClick={() => setActiveRound("all")}>Tümü</button>
        {rounds.map((round) => (
          <button
            key={round}
            className={activeRound === round ? "round-tab round-tab--active" : "round-tab"}
            onClick={() => setActiveRound(round)}
          >
            {round}. Hafta
          </button>
        ))}
      </div>
      <div className="fixture-list">
        {visibleMatches.map((match) => (
          <MatchEditor
            key={match.id}
            match={match}
            home={teams.find((team) => team.id === match.homeId)}
            away={teams.find((team) => team.id === match.awayId)}
            onSave={onUpdate}
          />
        ))}
      </div>
      <div className="formula-note">
        <CircleGauge size={18} />
        <span><strong>Puan hesabı:</strong> Galibiyet 3, beraberlik 1, mağlubiyet 0 puan. Eşitlikte sırasıyla averaj ve atılan gol dikkate alınır.</span>
      </div>
    </div>
  );
}

function MatchEditor({
  match,
  home,
  away,
  onSave
}: {
  match: Match;
  home?: Team;
  away?: Team;
  onSave: (match: Match) => void;
}) {
  const [draft, setDraft] = useState(match);

  useEffect(() => setDraft(match), [match]);
  if (!home || !away) return null;
  const isPlayed = matchIsPlayed(match);

  const scoreChange = (side: "homeScore" | "awayScore", value: string) => {
    const number = value === "" ? null : Math.max(0, Number.parseInt(value, 10) || 0);
    setDraft((current) => ({ ...current, [side]: number }));
  };

  return (
    <article className="fixture-card">
      <div className="fixture-card__round">
        <span>{match.round}. HAFTA</span>
        <strong>{formatDate(draft.date)}</strong>
        <em className={isPlayed ? "status-pill status-pill--done" : "status-pill"}>
          {isPlayed ? "Tamamlandı" : "Planlandı"}
        </em>
      </div>
      <div className="fixture-card__matchup">
        <div className="fixture-team fixture-team--home">
          <TeamBadge team={home} size="md" />
        </div>
        <div className="score-editor" aria-label={`${home.name} ve ${away.name} maç skoru`}>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.homeScore ?? ""}
            placeholder="–"
            onChange={(event) => scoreChange("homeScore", event.target.value)}
            aria-label={`${home.name} skoru`}
          />
          <span>:</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={draft.awayScore ?? ""}
            placeholder="–"
            onChange={(event) => scoreChange("awayScore", event.target.value)}
            aria-label={`${away.name} skoru`}
          />
        </div>
        <div className="fixture-team fixture-team--away">
          <TeamBadge team={away} size="md" />
        </div>
      </div>
      <div className="fixture-card__details">
        <label>
          <span>Tarih</span>
          <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
        </label>
        <label>
          <span>Saat</span>
          <input type="time" value={draft.time} onChange={(event) => setDraft({ ...draft, time: event.target.value })} />
        </label>
        <label>
          <span>Saha</span>
          <input value={draft.venue} onChange={(event) => setDraft({ ...draft, venue: event.target.value })} />
        </label>
        <button className="button button--dark" onClick={() => onSave(draft)}>Kaydet</button>
      </div>
    </article>
  );
}

function StandingsView({
  standings,
  playedCount,
  totalMatches
}: {
  standings: ReturnType<typeof getStandings>;
  playedCount: number;
  totalMatches: number;
}) {
  if (!standings.length) {
    return <EmptyState title="Puan tablosu boş" text="Takımlar eklendiğinde lig tablosu burada oluşur." />;
  }

  return (
    <div className="view-stack">
      <section className="table-summary">
        <div>
          <span>Lig lideri</span>
          <TeamBadge team={standings[0].team} size="md" />
        </div>
        <div><span>Oynanan maç</span><strong>{playedCount}<small> / {totalMatches}</small></strong></div>
        <div><span>Lider puanı</span><strong>{standings[0].points}</strong></div>
        <div><span>Lider averajı</span><strong>{standings[0].gd > 0 ? "+" : ""}{standings[0].gd}</strong></div>
      </section>
      <section className="standings-panel">
        <div className="standings-table-wrap">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Sıra</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AG</th><th>YG</th><th>AV</th><th>Puan</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.team.id}>
                  <td><span className={index < 3 ? "rank rank--top" : "rank"}>{index + 1}</span></td>
                  <td><TeamBadge team={row.team} size="sm" /></td>
                  <td>{row.played}</td>
                  <td>{row.won}</td>
                  <td>{row.drawn}</td>
                  <td>{row.lost}</td>
                  <td>{row.gf}</td>
                  <td>{row.ga}</td>
                  <td>{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                  <td><strong className="points-cell">{row.points}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="standings-legend">
          <span><i className="legend-dot legend-dot--orange" /> İlk 3 sıra</span>
          <span><strong>O</strong> Oynanan</span>
          <span><strong>G</strong> Galibiyet</span>
          <span><strong>B</strong> Beraberlik</span>
          <span><strong>M</strong> Mağlubiyet</span>
          <span><strong>AV</strong> Averaj</span>
        </div>
      </section>
    </div>
  );
}

function FairPlayView({
  totals,
  cards,
  teams,
  onAdd,
  onDelete
}: {
  totals: ReturnType<typeof getCardTotals>;
  cards: CardRecord[];
  teams: Team[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  if (!teams.length) {
    return <EmptyState title="Fair play takibi için takım gerekli" text="Önce lige en az bir takım ekleyin." />;
  }

  return (
    <div className="view-stack">
      <section className="fairplay-hero">
        <div className="fairplay-hero__icon"><ShieldCheck size={36} /></div>
        <div>
          <span>Fair Play Lideri</span>
          <h2>{totals[0]?.team.name || "Henüz veri yok"}</h2>
          <p>En düşük ceza puanına sahip takım · Sarı kart 1, kırmızı kart 3 ceza puanı.</p>
        </div>
        <strong>{totals[0]?.penalty || 0}<small> ceza puanı</small></strong>
      </section>

      <section className="fairplay-grid">
        {totals.map((item, index) => (
          <article className="fairplay-card" key={item.team.id}>
            <div className="fairplay-card__rank">{index + 1}</div>
            <TeamBadge team={item.team} size="md" />
            <div className="card-count card-count--yellow"><i /> <strong>{item.yellow}</strong><span>Sarı</span></div>
            <div className="card-count card-count--red"><i /> <strong>{item.red}</strong><span>Kırmızı</span></div>
            <div className="penalty-score"><strong>{item.penalty}</strong><span>Ceza puanı</span></div>
          </article>
        ))}
      </section>

      <section className="panel">
        <PanelHeading eyebrow="Hareketler" title="Kart kayıtları" action="Yeni kayıt" onAction={onAdd} />
        {cards.length ? (
          <div className="records-list">
            {cards.map((card) => {
              const team = teamMap.get(card.teamId);
              if (!team) return null;
              return (
                <div className="record-row" key={card.id}>
                  <TeamBadge team={team} size="sm" />
                  <div className="record-row__person">
                    <strong>{card.player || "Oyuncu belirtilmedi"}</strong>
                    <span>{card.note || "Açıklama yok"}</span>
                  </div>
                  <span className="record-row__date">{formatDate(card.createdAt)}</span>
                  <div className="record-row__cards">
                    {card.yellow > 0 && <span className="card-tag card-tag--yellow">{card.yellow} Sarı</span>}
                    {card.red > 0 && <span className="card-tag card-tag--red">{card.red} Kırmızı</span>}
                  </div>
                  <button className="icon-button icon-button--danger" onClick={() => onDelete(card.id)} aria-label="Kart kaydını sil">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="Henüz kart kaydı yok" text="İlk disiplin kaydını ekleyerek fair play takibini başlatın." action="Kart kaydı ekle" onAction={onAdd} compact />
        )}
      </section>
    </div>
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
  const [shortName, setShortName] = useState("");
  const [manager, setManager] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);

  useEffect(() => {
    setName(team?.name || "");
    setShortName(team?.shortName || "");
    setManager(team?.manager || "");
    setColor(team?.color || TEAM_COLORS[teamCount % TEAM_COLORS.length]);
  }, [team, teamCount, open]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: team?.id || `team-${Date.now()}`,
      name: name.trim(),
      shortName: (shortName.trim() || name.replace(/\s/g, "").slice(0, 3)).toLocaleUpperCase("tr-TR").slice(0, 4),
      manager: manager.trim(),
      color
    });
  };

  return (
    <Modal open={open} title={team ? "Takımı düzenle" : "Yeni takım ekle"} eyebrow="Takım bilgileri" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="form-field">
          <span>Takım adı *</span>
          <input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Örn. V3 Veteranlar" required />
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Kısa ad</span>
            <input value={shortName} onChange={(event) => setShortName(event.target.value)} placeholder="V3V" maxLength={4} />
          </label>
          <label className="form-field">
            <span>Takım sorumlusu</span>
            <input value={manager} onChange={(event) => setManager(event.target.value)} placeholder="Ad soyad" />
          </label>
        </div>
        <fieldset className="color-picker">
          <legend>Takım rengi</legend>
          <div>
            {TEAM_COLORS.map((item) => (
              <button
                type="button"
                key={item}
                className={color === item ? "color-dot color-dot--active" : "color-dot"}
                style={{ background: item }}
                onClick={() => setColor(item)}
                aria-label={`${item} rengini seç`}
              />
            ))}
          </div>
        </fieldset>
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="button button--primary">{team ? "Değişiklikleri kaydet" : "Takımı ekle"}</button>
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
  onSave: (record: CardRecord) => void;
}) {
  const [teamId, setTeamId] = useState("");
  const [player, setPlayer] = useState("");
  const [yellow, setYellow] = useState(1);
  const [red, setRed] = useState(0);
  const [note, setNote] = useState("");
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      setTeamId(teams[0]?.id || "");
      setPlayer("");
      setYellow(1);
      setRed(0);
      setNote("");
      setCreatedAt(new Date().toISOString().slice(0, 10));
    }
  }, [open, teams]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!teamId || yellow + red < 1) return;
    onSave({
      id: `card-${Date.now()}`,
      teamId,
      player: player.trim(),
      yellow,
      red,
      note: note.trim(),
      createdAt
    });
  };

  return (
    <Modal open={open} title="Kart kaydı ekle" eyebrow="Fair play" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="form-field">
          <span>Takım *</span>
          <select value={teamId} onChange={(event) => setTeamId(event.target.value)} required>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
        <div className="form-row">
          <label className="form-field">
            <span>Oyuncu</span>
            <input value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="Ad soyad veya forma no" />
          </label>
          <label className="form-field">
            <span>Tarih</span>
            <input type="date" value={createdAt} onChange={(event) => setCreatedAt(event.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label className="form-field">
            <span>Sarı kart</span>
            <input type="number" min="0" max="10" value={yellow} onChange={(event) => setYellow(Math.max(0, Number(event.target.value)))} />
          </label>
          <label className="form-field">
            <span>Kırmızı kart</span>
            <input type="number" min="0" max="10" value={red} onChange={(event) => setRed(Math.max(0, Number(event.target.value)))} />
          </label>
        </div>
        <label className="form-field">
          <span>Açıklama</span>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Kart sebebi veya maç bilgisi..." rows={3} />
        </label>
        <div className="form-actions">
          <button type="button" className="button button--quiet" onClick={onClose}>Vazgeç</button>
          <button type="submit" className="button button--primary" disabled={yellow + red < 1}>Kaydı ekle</button>
        </div>
      </form>
    </Modal>
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
  compact = false
}: {
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "empty-state empty-state--compact" : "empty-state"}>
      <span><Trophy size={25} /></span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="button button--primary" onClick={onAction}>{action}</button>}
    </div>
  );
}
