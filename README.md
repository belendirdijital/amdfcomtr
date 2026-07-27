# V3 Ajans Masaüstü Uygulaması

V3 Ajans'ın farklı iş alanlarının modüller halinde yönetilebilmesi için hazırlanan
macOS ve Windows masaüstü uygulaması.

İlk modül Veteranlar Ligi yönetimidir:

- Takım ekleme, düzenleme ve silme
- Çift devre fikstür üretimi
- Maç programı ve skor girişi
- Sonuçlardan otomatik hesaplanan puan tablosu
- Takım ve oyuncu bazlı sarı/kırmızı kart kaydı
- Fair play sıralaması
- Uygulama içinde kalıcı veri saklama ve JSON dışa aktarma

## Geliştirme

```bash
npm install
npm run dev
```

## Masaüstü paketleri

```bash
npm run dist:mac
npm run dist:win
```

Oluşturulan kurulum dosyaları `release/` klasörüne yazılır.

## Kontroller

```bash
npm run lint
npm run build
npm run test:desktop
```
