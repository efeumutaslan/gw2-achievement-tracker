# Deployment Guide - Vercel

Bu dosya GW2 Achievement Tracker projesini Vercel'e deploy etme adımlarını içerir.

## Ön Hazırlık

### 1. Git Repository Oluşturma

Projeyi GitHub'a yükleyin:

```bash
# Git repository başlat
git init

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: GW2 Achievement Tracker

- Multi-user API key management
- IndexedDB data storage
- GW2 API integration with rate limiting
- Achievement tracking infrastructure
- Settings page with user management
- Shadcn UI + Tailwind CSS"

# GitHub repository oluşturun (github.com'da)
# Sonra remote ekleyin
git remote add origin https://github.com/KULLANICI_ADINIZ/gw2-achievement-tracker.git

# Push edin
git branch -M main
git push -u origin main
```

## Vercel ile Deploy

### Yöntem 1: Vercel Dashboard (Önerilen)

1. **Vercel'e Giriş Yapın**
   - [https://vercel.com](https://vercel.com) adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Yeni Proje Oluşturun**
   - "Add New" > "Project" butonuna tıklayın
   - GitHub repository'nizi seçin (`gw2-achievement-tracker`)

3. **Proje Ayarları**
   - **Framework Preset**: Vite (otomatik algılanmalı)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (otomatik)
   - **Output Directory**: `dist` (otomatik)
   - **Install Command**: `npm install` (otomatik)

4. **Deploy**
   - "Deploy" butonuna tıklayın
   - 2-3 dakika içinde deploy tamamlanacak
   - Deploy URL'i: `https://gw2-achievement-tracker.vercel.app`

### Yöntem 2: Vercel CLI

```bash
# Vercel CLI'yi global olarak yükleyin
npm install -g vercel

# Proje dizininde
vercel login

# İlk deploy
vercel

# Production deploy
vercel --prod
```

## Önemli Notlar

### ⚠️ IndexedDB - Browser Storage

Bu uygulama **client-side** çalışır ve tüm veriler kullanıcının browser'ında saklanır:

- ✅ API keys IndexedDB'de local olarak saklanır
- ✅ Achievement data browser'da cache'lenir
- ✅ Hiçbir veri sunucuya gönderilmez
- ⚠️ Browser data temizlenirse tüm veriler kaybolur

### 🔒 Güvenlik

- API keys **plain text** olarak browser'da saklanır
- Shared computers'da kullanımı önerilmez
- Private/incognito mode kullanılabilir
- HTTPS üzerinden çalışır (Vercel otomatik sağlar)

### 🌐 Domain Ayarları

Vercel'de custom domain eklemek için:

1. Project Settings > Domains
2. Domain adınızı ekleyin
3. DNS kayıtlarını güncelleyin

### 📊 Environment Variables

Bu proje environment variable gerektirmez çünkü:
- API keys kullanıcılar tarafından girilir
- Tüm konfigürasyon client-side'dır
- Backend/server yok

## Vercel Konfigürasyonu

Proje `vercel.json` ile konfigüre edilmiştir:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Bu konfigürasyon:
- React Router'ın client-side routing'ini destekler
- Tüm route'ları index.html'e yönlendirir
- SPA (Single Page Application) olarak çalışır

## Build Optimizasyonu

`vite.config.ts` production için optimize edilmiştir:

- ✅ Code splitting (vendor chunks)
- ✅ Tree shaking
- ✅ Minification
- ✅ No sourcemaps in production
- ✅ Optimized bundle size

### Bundle Chunks:
- `react-vendor`: React, React DOM, React Router
- `ui-vendor`: Lucide icons, UI utilities
- `data-vendor`: Zustand, Dexie, Axios

## Deploy Sonrası Test

1. **Settings Sayfası**
   - API key ekleyebildiğinizi test edin
   - User management çalıştığını doğrulayın

2. **IndexedDB**
   - Browser DevTools > Application > IndexedDB
   - `GW2AchievementTracker` database'ini görmelisiniz

3. **Network**
   - DevTools > Network
   - GW2 API çağrılarını kontrol edin
   - Rate limiting çalıştığını doğrulayın

4. **Console Errors**
   - DevTools > Console
   - Hata olmadığından emin olun

## Troubleshooting

### Build Hatası

**Hata**: "Node.js version X.X.X not supported"

**Çözüm**: Vercel Node.js 20.x kullanır, bu yeterli. Local'de hata varsa Vercel'de çalışacaktır.

### Routing Hatası (404)

**Hata**: Refresh'te 404

**Çözüm**: `vercel.json` rewrites konfigürasyonu eklenmiş, çalışmalı.

### API Key Kayboluyor

**Neden**: Browser cache/data temizlendi

**Çözüm**: Normal davranış, kullanıcılar yeniden girecek.

### Deployment Fails

1. GitHub repository public olmalı (veya Vercel team'de)
2. `package.json` ve `package-lock.json` commit edilmeli
3. Build command doğru olmalı

## Automatic Deployments

Vercel otomatik olarak:
- ✅ Her `git push` ile preview deployment
- ✅ `main` branch'e merge ile production deployment
- ✅ Pull request'lerde preview URL

## Performance

Vercel CDN özellikleri:
- ✅ Global CDN edge network
- ✅ Automatic SSL/HTTPS
- ✅ Brotli compression
- ✅ HTTP/2
- ✅ Smart caching

## Monitoring

Vercel Dashboard'da:
- 📊 Analytics (sayfa görüntüleme, users)
- 🚀 Web Vitals (Core Web Vitals)
- 📈 Function logs (eğer kullanırsanız)
- ⏱️ Build times

## Next Steps

Deploy sonrası:

1. ✅ URL'i test edin
2. ✅ GW2 API key'inizi ekleyin
3. ✅ Achievement sync test edin
4. ✅ Arkadaşlarınızla paylaşın
5. 🎮 Guild Wars 2 oynayın!

---

**Support**: GitHub Issues
**Docs**: README.md
**API**: https://wiki.guildwars2.com/wiki/API:Main
