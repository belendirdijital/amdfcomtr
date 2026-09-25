# amdfcomtr — Veteranlar Ligi Web

Halka açık lig sitesi, admin paneli ve takım panelleri.

## Hızlı başlangıç (Supabase olmadan)

Supabase kurmadan hemen deneyebilirsin — veriler `data/store.json` dosyasında tutulur.

```bash
npm install
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)  
Giriş: [http://localhost:3000/login](http://localhost:3000/login)

`.env.local` içinde `AMDF_ADMIN_EMAIL` / `AMDF_ADMIN_PASSWORD` ayarla.  
Demo seed için: `AMDF_SEED_DEMO=1`

Admin ile giriş → takım ekle, fikstür üret, skor/gol gir, takım hesapları aç.  
Takım hesabı ile giriş → sadece kendi oyuncu lisansları.

## Production: Supabase

Domain / canlı ortam için Supabase önerilir.

1. [supabase.com](https://supabase.com) üzerinde proje oluştur
2. SQL Editor’de [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) çalıştır
3. `.env.example` → `.env.local` kopyala, API anahtarlarını doldur
4. Auth → Users’tan admin kullanıcı ekle, sonra:

```sql
insert into public.profiles (id, role, team_id)
values ('USER_UUID_BURAYA', 'admin', null)
on conflict (id) do update set role = 'admin';
```

`.env.local` doluysa uygulama otomatik Supabase moduna geçer.

```bash
cp .env.example .env.local
npm run dev
```

### Deploy

Vercel’e deploy et, env değişkenlerini ekle, domain bağla.  
Supabase Auth → URL Configuration’a production URL’ini yaz.

## Komutlar

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notlar

- Lisans (TC, foto) halka açık değildir; sadece admin + ilgili takım görür
- Gol kralı, maçlara girilen oyuncu gollerinden hesaplanır
- Yerel mod geliştirme / demo içindir; canlıda Supabase kullan
