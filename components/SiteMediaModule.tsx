"use client";

import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { resizeImage } from "@/lib/image";
import type { SiteBanner, SiteSlide } from "@/lib/types";

type Props = {
  slides: SiteSlide[];
  banners: SiteBanner[];
  onSaveSlide: (slide: SiteSlide) => Promise<void>;
  onDeleteSlide: (id: string) => Promise<void>;
  onSaveBanner: (banner: SiteBanner) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
};

function sortByOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.sortOrder);
}

async function pickImage(
  file: File | undefined,
  maxSize: number,
  onError: (message: string) => void
) {
  if (!file) return null;
  try {
    return await resizeImage(file, maxSize, true);
  } catch {
    onError("Seçilen görsel okunamadı. PNG veya JPG deneyin.");
    return null;
  }
}

function MediaRow({
  imageUrl,
  href,
  sortOrder,
  enabled,
  onToggle,
  onEdit,
  onDelete
}: {
  imageUrl: string;
  href: string;
  sortOrder: number;
  enabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="site-media-admin__row">
      <div
        className="site-media-admin__thumb"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="site-media-admin__meta">
        <strong>{href || "/"}</strong>
        <span>Sıra {sortOrder}</span>
        <span className={enabled ? "badge badge--ok" : "badge"}>
          {enabled ? "Aktif" : "Pasif"}
        </span>
      </div>
      <div className="site-media-admin__actions">
        <button
          className="button button--quiet"
          type="button"
          onClick={onToggle}
          title={enabled ? "Pasifleştir" : "Aktifleştir"}
        >
          {enabled ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button className="button button--quiet" type="button" onClick={onEdit}>
          <Pencil size={16} />
        </button>
        <button className="button button--quiet" type="button" onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      </div>
    </article>
  );
}

export default function SiteMediaModule({
  slides,
  banners,
  onSaveSlide,
  onDeleteSlide,
  onSaveBanner,
  onDeleteBanner
}: Props) {
  const [slideModalOpen, setSlideModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<SiteSlide | null>(null);
  const [editingBanner, setEditingBanner] = useState<SiteBanner | null>(null);
  const [formError, setFormError] = useState("");

  const sortedSlides = sortByOrder(slides);
  const sortedBanners = sortByOrder(banners);

  return (
    <div className="site-media-admin">
      <aside className="site-media-admin__guide" aria-label="Yükleme notları">
        <strong>Yükleme notları</strong>
        <ul>
          <li>
            <b>Ne eklenir:</b> Sadece görsel, tıklanınca gidilecek link, sıra ve
            aktif/pasif. Metin overlay yok — yazı görselin içinde olsun.
          </li>
          <li>
            <b>Konum:</b> Slider anasayfanın en üstünde. Bannerlar hemen altında, 2
            sütun.
          </li>
          <li>
            <b>Sıra:</b> Küçük sayı önce (0, 1, 2…).
          </li>
          <li>
            <b>Aktif / Pasif:</b> Yalnızca aktif olanlar sitede görünür. Hiç aktif
            slayt yoksa slider gizlenir.
          </li>
          <li>
            <b>Slider görseli:</b> Dosya önerisi 1920×1080 (16:9). Sitede yükseklik
            yaklaşık 320–460px.
          </li>
          <li>
            <b>Banner görseli:</b> Dosya önerisi 1200×800. Kart yüksekliği yaklaşık
            210px.
          </li>
          <li>
            <b>Dosya:</b> PNG veya JPG. Sistem otomatik küçültür.
          </li>
        </ul>
      </aside>

      <section className="content-section">
        <div className="panel-heading">
          <h2>Ana slider</h2>
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              setEditingSlide(null);
              setFormError("");
              setSlideModalOpen(true);
            }}
          >
            <Plus size={16} />
            Slayt ekle
          </button>
        </div>
        <p className="site-media-admin__hint">
          Görsel + link. Birden fazla aktif slayt otomatik kayar.
        </p>
        <div className="site-panel site-media-admin__panel">
          {sortedSlides.length === 0 ? (
            <div className="site-empty">Henüz slayt yok.</div>
          ) : (
            <div className="site-media-admin__list">
              {sortedSlides.map((slide) => (
                <MediaRow
                  key={slide.id}
                  imageUrl={slide.imageUrl}
                  href={slide.href}
                  sortOrder={slide.sortOrder}
                  enabled={slide.enabled}
                  onToggle={() => void onSaveSlide({ ...slide, enabled: !slide.enabled })}
                  onEdit={() => {
                    setEditingSlide(slide);
                    setFormError("");
                    setSlideModalOpen(true);
                  }}
                  onDelete={() => {
                    if (window.confirm("Slayt silinsin mi?")) void onDeleteSlide(slide.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="panel-heading">
          <h2>Öne çıkan bannerlar</h2>
          <button
            className="button button--primary"
            type="button"
            onClick={() => {
              setEditingBanner(null);
              setFormError("");
              setBannerModalOpen(true);
            }}
          >
            <Plus size={16} />
            Banner ekle
          </button>
        </div>
        <p className="site-media-admin__hint">
          Görsel + link. 4 aktif banner idealdir.
        </p>
        <div className="site-panel site-media-admin__panel">
          {sortedBanners.length === 0 ? (
            <div className="site-empty">Henüz banner yok.</div>
          ) : (
            <div className="site-media-admin__list">
              {sortedBanners.map((banner) => (
                <MediaRow
                  key={banner.id}
                  imageUrl={banner.imageUrl}
                  href={banner.href}
                  sortOrder={banner.sortOrder}
                  enabled={banner.enabled}
                  onToggle={() =>
                    void onSaveBanner({ ...banner, enabled: !banner.enabled })
                  }
                  onEdit={() => {
                    setEditingBanner(banner);
                    setFormError("");
                    setBannerModalOpen(true);
                  }}
                  onDelete={() => {
                    if (window.confirm("Banner silinsin mi?")) void onDeleteBanner(banner.id);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <MediaFormModal
        open={slideModalOpen}
        kind="slide"
        item={editingSlide}
        nextOrder={sortedSlides.length}
        error={formError}
        imageMaxSize={1600}
        imageNote="Öneri: 1920×1080 (16:9), yatay."
        onClose={() => {
          setSlideModalOpen(false);
          setEditingSlide(null);
          setFormError("");
        }}
        onError={setFormError}
        onSave={async (item) => {
          await onSaveSlide(item);
          setSlideModalOpen(false);
          setEditingSlide(null);
        }}
      />

      <MediaFormModal
        open={bannerModalOpen}
        kind="banner"
        item={editingBanner}
        nextOrder={sortedBanners.length}
        error={formError}
        imageMaxSize={1200}
        imageNote="Öneri: 1200×800, yatay."
        onClose={() => {
          setBannerModalOpen(false);
          setEditingBanner(null);
          setFormError("");
        }}
        onError={setFormError}
        onSave={async (item) => {
          await onSaveBanner(item);
          setBannerModalOpen(false);
          setEditingBanner(null);
        }}
      />
    </div>
  );
}

function MediaFormModal({
  open,
  kind,
  item,
  nextOrder,
  error,
  imageMaxSize,
  imageNote,
  onClose,
  onError,
  onSave
}: {
  open: boolean;
  kind: "slide" | "banner";
  item: SiteSlide | SiteBanner | null;
  nextOrder: number;
  error: string;
  imageMaxSize: number;
  imageNote: string;
  onClose: () => void;
  onError: (message: string) => void;
  onSave: (item: SiteSlide | SiteBanner) => Promise<void>;
}) {
  const [href, setHref] = useState("/");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setHref(item?.href || "/");
    setImageUrl(item?.imageUrl || "");
    setSortOrder(item?.sortOrder ?? nextOrder);
    setEnabled(item?.enabled ?? true);
  }, [open, item, nextOrder]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageUrl) {
      onError("Görsel zorunlu.");
      return;
    }
    if (!href.trim()) {
      onError("Link zorunlu.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: item?.id || crypto.randomUUID(),
        imageUrl,
        href: href.trim(),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        enabled
      });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        item
          ? kind === "slide"
            ? "Slayt düzenle"
            : "Banner düzenle"
          : kind === "slide"
            ? "Yeni slayt"
            : "Yeni banner"
      }
      eyebrow={kind === "slide" ? "Ana slider" : "Öne çıkan"}
      onClose={onClose}
    >
      <form className="form" onSubmit={submit}>
        <label className="form-field">
          <span>Link</span>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            required
            placeholder="/fixtures"
          />
        </label>

        <div className="form-grid">
          <label className="form-field">
            <span>Sıra</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
            />
          </label>
          <label className="form-field form-field--checkbox">
            <span>Anasayfada göster</span>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </label>
        </div>

        <label className="form-field">
          <span>Görsel</span>
          <small className="site-media-admin__field-note">{imageNote}</small>
          <div className="site-media-admin__upload">
            {imageUrl ? (
              <div
                className="site-media-admin__preview"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            ) : (
              <div className="site-media-admin__preview site-media-admin__preview--empty">
                <ImagePlus size={28} />
              </div>
            )}
            <label className="button button--quiet">
              <Upload size={16} />
              Görsel seç
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={async (e) => {
                  const dataUrl = await pickImage(e.target.files?.[0], imageMaxSize, onError);
                  if (dataUrl) setImageUrl(dataUrl);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="button button--quiet" type="button" onClick={onClose}>
            Vazgeç
          </button>
          <button className="button button--primary" type="submit" disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
