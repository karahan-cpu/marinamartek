# Supabase Kurulum Rehberi

Bu proje artık Supabase kullanıyor (hem authentication hem de veritabanı için).

## 🚀 Hızlı Başlangıç

### 1. Supabase Projesi Oluşturma

1. https://supabase.com adresine gidin
2. "Start your project" ile kaydolun/giriş yapın
3. "New Project" tıklayın
4. Proje bilgilerini doldurun:
   - **Project Name**: `marinamartek`
   - **Database Password**: Güçlü bir şifre seçin (kaydedin!)
   - **Region**: Size en yakın bölge
5. "Create new project" tıklayın (2-3 dakika sürebilir)

### 2. API Keys'leri Alma

1. Proje oluştuktan sonra **Settings** (⚙️) > **API** seçin
2. Şu bilgileri kopyalayın:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` ve `VITE_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ GİZLİ TUTUN!)

### 3. Database Connection String Alma

1. **Settings** > **Database** seçin
2. **Connection string** bölümünde **URI** formatını seçin
3. Connection string'i kopyalayın → `DATABASE_URL`
   - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
   - Şifreyi proje oluştururken belirlediğiniz şifre ile değiştirin

### 4. OAuth Provider Yapılandırma (Google)

1. **Authentication** > **Providers** seçin
2. **Google** provider'ını açın
3. Google Cloud Console'da:
   - https://console.cloud.google.com
   - Yeni proje oluşturun
   - **APIs & Services** > **Credentials**
   - **Create Credentials** > **OAuth client ID**
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
   - **Client ID** ve **Client Secret** kopyalayın
4. Supabase'e geri dönün ve Client ID/Secret'ı yapıştırın
5. **Save** tıklayın

### 5. Vercel Environment Variables

Vercel Dashboard'da **Settings** > **Environment Variables** bölümüne gidin ve şunları ekleyin:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For Vite (client-side)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

**Önemli**: Her değişkeni **Production**, **Preview** ve **Development** için ekleyin.

### 6. Local Development (.env dosyası)

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# For Vite (client-side)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

### 7. Database Schema'yı Oluşturma

Supabase PostgreSQL'de tabloları oluşturmak için:

```bash
npm run db:push
```

Bu komut `shared/schema.ts` dosyasındaki şemayı Supabase veritabanına uygular.

## 📋 Checklist

- [ ] Supabase projesi oluşturuldu
- [ ] API keys kopyalandı
- [ ] Database connection string alındı
- [ ] Google OAuth yapılandırıldı (veya diğer provider)
- [ ] Vercel'de environment variables eklendi
- [ ] Local `.env` dosyası oluşturuldu
- [ ] `npm install` çalıştırıldı
- [ ] `npm run db:push` ile tablolar oluşturuldu
- [ ] Test edildi

## 🔧 Alternatif: Neon Database Kullanmaya Devam

Eğer Supabase PostgreSQL yerine mevcut Neon database'inizi kullanmaya devam etmek isterseniz:

- Sadece Supabase Auth için environment variables ekleyin
- `DATABASE_URL` değişkenini Neon connection string olarak tutun
- Supabase sadece authentication için kullanılır, veritabanı Neon'da kalır

## 🐛 Sorun Giderme

### "Supabase URL and Anon Key must be set" uyarısı
- Environment variables'ların doğru ayarlandığından emin olun
- Vercel'de redeploy yapın

### OAuth çalışmıyor
- Redirect URI'nin doğru olduğundan emin olun
- Google Cloud Console'da redirect URI'yi kontrol edin

### Database bağlantı hatası
- Connection string'de şifrenin doğru olduğundan emin olun
- Supabase Dashboard'dan connection string'i tekrar kopyalayın

## 📚 Daha Fazla Bilgi

- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Database: https://supabase.com/docs/guides/database

