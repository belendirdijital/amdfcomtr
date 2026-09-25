"use client";

import { Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { resizeImage } from "@/lib/image";
import type { SiteBanner, SiteSlide, SlideFeature } from "@/lib/types";

type Props = {
  slides: SiteSlide[];
  banners: SiteBanner[];
  onSaveSlide: (slide: SiteSlide) => Promise<void>;
  onDeleteSlide: (id: string) => Promise<void>;
  onSaveBanner: (banner: SiteBanner) => Promise<void>;
  onDeleteBanner: (id: string) => Promise<void>;
};

const emptyFeatures = (): SlideFeature[] => [
  { title: "", subtitle: "" },
  { title: "", subtitle: "" },
  { title: "", subtitle: "" }
];

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

  const openNewSlide = () => {
    setEditingSlide(null);
    setFormError("");
    setSlideModalOpen(true);
  };

  const openEditSlide = (slide: SiteSlide) => {
    setEditingSlide(slide);
    setFormError("");
    setSlideModalOpen(true);
  };

  const openNewBanner = () => {
    setEditingBanner(null);
    setFormError("");
    setBannerModalOpen(true);
  };

  const openEditBanner = (banner: SiteBanner) => {
    setEditingBanner(banner);
    setFormError("");
    setBannerModalOpen(true);
  };

  return (
    <div className="site-media-admin">
      <aside className="site-media-admin__guide" aria-label="Yükleme notları">
        <strong>Yükleme notları</strong>
        <ul>
          <li>
            <b>Konum:</b> Slider anasayfanın en üstünde çıkar. Bannerlar hemen altında,
            2 sütunlu grid olarak dizilir.
          </li>
          <li>
            <b>Sıra:</b> Küçük sayı önce görünür (0, 1, 2…). Aynı alanda birden fazla
            öğe varsa sıraya göre soldan sağa / yukarıdan aşağıya gider.
          </li>
          <li>
            <b>Aktif / Pasif:</b> Yalnızca aktif olanlar sitede görünür. Hiç aktif
            slayt yoksa slider tamamen gizlenir; metin hero geri gelir.
          </li>
          <li>
            <b>İki ölçü karışmasın:</b> Büyük rakamlar (ör. 1920×1080){" "}
            <em>yükleyeceğin dosyanın</em> önerilen çözünürlüğüdür. Küçük rakamlar
            (ör. 320–460px) sitede <em>görünen kutu yüksekliğidir</em>. Görsel
            kutuyu doldurur; kenarlar kırpılabilir.
          </li>
          <li>
            <b>Slider görseli:</b> Yatay geniş fotoğraf. Dosya önerisi: 1920×1080
            (16:9) veya daha geniş. Önemli yüz / logo merkeze yakın olsun.
          </li>
          <li>
            <b>Banner görseli:</b> Dosya önerisi: 1200×800. Metin sol altta olduğu
            için sağ üstte boş / sade alan bırakın.
          </li>
          <li>
            <b>Dosya:</b> PNG veya JPG. Sistem otomatik küçültür; çok ağır dosya
            yüklemeyin.
          </li>
        </ul>
      </aside>

      <section className="content-section">
        <div className="panel-heading">
          <h2>Ana slider</h2>
          <button className="button button--primary" type="button" onClick={openNewSlide}>
            <Plus size={16} />
            Slayt ekle
          </button>
        </div>
        <p className="site-media-admin__hint">
          Anasayfa üst bandı · tam genişlik · sitede görünen yükseklik yaklaşık
          320–460px (ekrana göre). Yüklenecek dosya önerisi: 1920×1080. Birden fazla
          aktif slayt varsa otomatik kayar.
        </p>
        <div className="site-panel site-media-admin__panel">
          {sortedSlides.length === 0 ? (
            <div className="site-empty">Henüz slayt yok.</div>
          ) : (
            <div className="site-media-admin__list">
              {sortedSlides.map((slide) => (
                <article key={slide.id} className="site-media-admin__row">
                  <div
                    className="site-media-admin__thumb"
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                  />
                  <div className="site-media-admin__meta">
                    <strong>{slide.title || "Başlıksız slayt"}</strong>
                    <span>
                      Sıra {slide.sortOrder}
                      {slide.eyebrow ? ` · ${slide.eyebrow}` : ""}
                    </span>
                    <span className={slide.enabled ? "badge badge--ok" : "badge"}>
                      {slide.enabled ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="site-media-admin__actions">
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() =>
                        void onSaveSlide({ ...slide, enabled: !slide.enabled })
                      }
                      title={slide.enabled ? "Pasifleştir" : "Aktifleştir"}
                    >
                      {slide.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => openEditSlide(slide)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => {
                        if (window.confirm("Slayt silinsin mi?")) void onDeleteSlide(slide.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="content-section">
        <div className="panel-heading">
          <h2>Öne çıkan bannerlar</h2>
          <button className="button button--primary" type="button" onClick={openNewBanner}>
            <Plus size={16} />
            Banner ekle
          </button>
        </div>
        <p className="site-media-admin__hint">
          Slider’ın altında · 2 sütun · sitede kart yüksekliği yaklaşık 210px.
          Yüklenecek dosya önerisi: 1200×800. 4 aktif banner idealdir; fazlası alt
          satırlara devam eder.
        </p>
        <div className="site-panel site-media-admin__panel">
          {sortedBanners.length === 0 ? (
            <div className="site-empty">Henüz banner yok.</div>
          ) : (
            <div className="site-media-admin__list">
              {sortedBanners.map((banner) => (
                <article key={banner.id} className="site-media-admin__row">
                  <div
                    className="site-media-admin__thumb"
                    style={{ backgroundImage: `url(${banner.imageUrl})` }}
                  />
                  <div className="site-media-admin__meta">
                    <strong>{banner.title || "Başlıksız banner"}</strong>
                    <span>
                      Sıra {banner.sortOrder}
                      {banner.category ? ` · ${banner.category}` : ""}
                    </span>
                    <span className={banner.enabled ? "badge badge--ok" : "badge"}>
                      {banner.enabled ? "Aktif" : "Pasif"}
                    </span>
                  </div>
                  <div className="site-media-admin__actions">
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() =>
                        void onSaveBanner({ ...banner, enabled: !banner.enabled })
                      }
                      title={banner.enabled ? "Pasifleştir" : "Aktifleştir"}
                    >
                      {banner.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => openEditBanner(banner)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="button button--quiet"
                      type="button"
                      onClick={() => {
                        if (window.confirm("Banner silinsin mi?")) void onDeleteBanner(banner.id);
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <SlideFormModal
        open={slideModalOpen}
        slide={editingSlide}
        nextOrder={sortedSlides.length}
        error={formError}
        onClose={() => {
          setSlideModalOpen(false);
          setEditingSlide(null);
          setFormError("");
        }}
        onError={setFormError}
        onSave={async (slide) => {
          await onSaveSlide(slide);
          setSlideModalOpen(false);
          setEditingSlide(null);
        }}
      />

      <BannerFormModal
        open={bannerModalOpen}
        banner={editingBanner}
        nextOrder={sortedBanners.length}
        error={formError}
        onClose={() => {
          setBannerModalOpen(false);
          setEditingBanner(null);
          setFormError("");
        }}
        onError={setFormError}
        onSave={async (banner) => {
          await onSaveBanner(banner);
          setBannerModalOpen(false);
          setEditingBanner(null);
        }}
      />
    </div>
  );
}

function SlideFormModal({
  open,
  slide,
  nextOrder,
  error,
  onClose,
  onError,
  onSave
}: {
  open: boolean;
  slide: SiteSlide | null;
  nextOrder: number;
  error: string;
  onClose: () => void;
  onError: (message: string) => void;
  onSave: (slide: SiteSlide) => Promise<void>;
}) {
  const [eyebrow, setEyebrow] = useState("");
  const [title, setTitle] = useState("");
  const [titleHighlight, setTitleHighlight] = useState("");
  const [description, setDescription] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [features, setFeatures] = useState<SlideFeature[]>(emptyFeatures());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEyebrow(slide?.eyebrow || "");
    setTitle(slide?.title || "");
    setTitleHighlight(slide?.titleHighlight || "");
    setDescription(slide?.description || "");
    setCtaLabel(slide?.ctaLabel || "");
    setCtaHref(slide?.ctaHref || "");
    setImageUrl(slide?.imageUrl || "");
    setSortOrder(slide?.sortOrder ?? nextOrder);
    setEnabled(slide?.enabled ?? true);
    const next = emptyFeatures();
    (slide?.features || []).slice(0, 3).forEach((item, index) => {
      next[index] = { title: item.title, subtitle: item.subtitle };
    });
    setFeatures(next);
  }, [open, slide, nextOrder]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      onError("Başlık zorunlu.");
      return;
    }
    if (!imageUrl) {
      onError("Görsel zorunlu.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: slide?.id || crypto.randomUUID(),
        eyebrow: eyebrow.trim(),
        title: title.trim(),
        titleHighlight: titleHighlight.trim(),
        description: description.trim(),
        ctaLabel: ctaLabel.trim(),
        ctaHref: ctaHref.trim() || "/",
        imageUrl,
        features: features.filter((item) => item.title.trim()),
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
      title={slide ? "Slayt düzenle" : "Yeni slayt"}
      eyebrow="Ana slider"
      onClose={onClose}
    >
      <form className="form" onSubmit={submit}>
        <label className="form-field">
          <span>Üst etiket</span>
          <input
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            placeholder="Veteranlar Ligi · 2026"
          />
        </label>
        <label className="form-field">
          <span>Başlık</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Dostluk için Sahadayız"
          />
        </label>
        <label className="form-field">
          <span>Vurgulanacak kelime</span>
          <input
            value={titleHighlight}
            onChange={(e) => setTitleHighlight(e.target.value)}
            placeholder="Sahadayız"
          />
        </label>
        <label className="form-field">
          <span>Açıklama</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Kısa destek metni"
          />
        </label>
        <div className="form-grid">
          <label className="form-field">
            <span>Buton metni</span>
            <input
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              placeholder="Fikstürü Görüntüle"
            />
          </label>
          <label className="form-field">
            <span>Buton linki</span>
            <input
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              placeholder="/fixtures"
            />
          </label>
        </div>
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

        <fieldset className="site-media-admin__features">
          <legend>Yan özellikler (en fazla 3)</legend>
          {features.map((feature, index) => (
            <div key={index} className="form-grid">
              <label className="form-field">
                <span>Başlık {index + 1}</span>
                <input
                  value={feature.title}
                  onChange={(e) => {
                    const next = [...features];
                    next[index] = { ...next[index], title: e.target.value };
                    setFeatures(next);
                  }}
                  placeholder="Tecrübe"
                />
              </label>
              <label className="form-field">
                <span>Alt metin {index + 1}</span>
                <input
                  value={feature.subtitle}
                  onChange={(e) => {
                    const next = [...features];
                    next[index] = { ...next[index], subtitle: e.target.value };
                    setFeatures(next);
                  }}
                  placeholder="Yılların deneyimi"
                />
              </label>
            </div>
          ))}
        </fieldset>

        <label className="form-field">
          <span>Arka plan görseli</span>
          <small className="site-media-admin__field-note">
            Öneri: 1920×1080 (16:9), yatay. Önemli içerik merkeze yakın olsun.
          </small>
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
                  const dataUrl = await pickImage(e.target.files?.[0], 1600, onError);
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

function BannerFormModal({
  open,
  banner,
  nextOrder,
  error,
  onClose,
  onError,
  onSave
}: {
  open: boolean;
  banner: SiteBanner | null;
  nextOrder: number;
  error: string;
  onClose: () => void;
  onError: (message: string) => void;
  onSave: (banner: SiteBanner) => Promise<void>;
}) {
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonLabel, setButtonLabel] = useState("");
  const [href, setHref] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCategory(banner?.category || "");
    setTitle(banner?.title || "");
    setDescription(banner?.description || "");
    setButtonLabel(banner?.buttonLabel || "");
    setHref(banner?.href || "");
    setImageUrl(banner?.imageUrl || "");
    setSortOrder(banner?.sortOrder ?? nextOrder);
    setEnabled(banner?.enabled ?? true);
  }, [open, banner, nextOrder]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      onError("Başlık zorunlu.");
      return;
    }
    if (!imageUrl) {
      onError("Görsel zorunlu.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        id: banner?.id || crypto.randomUUID(),
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        buttonLabel: buttonLabel.trim(),
        href: href.trim() || "/",
        imageUrl,
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
      title={banner ? "Banner düzenle" : "Yeni banner"}
      eyebrow="Öne çıkan"
      onClose={onClose}
    >
      <form className="form" onSubmit={submit}>
        <label className="form-field">
          <span>Kategori</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Fikstür"
          />
        </label>
        <label className="form-field">
          <span>Başlık</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Bu haftanın maçları"
          />
        </label>
        <label className="form-field">
          <span>Açıklama</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </label>
        <div className="form-grid">
          <label className="form-field">
            <span>Buton metni</span>
            <input
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              placeholder="Sıralamayı Gör"
            />
          </label>
          <label className="form-field">
            <span>Link</span>
            <input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/standings"
            />
          </label>
        </div>
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
          <span>Arka plan görseli</span>
          <small className="site-media-admin__field-note">
            Öneri: 1200×800, yatay. Metin sol altta; sağ üstte sade alan bırakın.
          </small>
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
                  const dataUrl = await pickImage(e.target.files?.[0], 1200, onError);
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
