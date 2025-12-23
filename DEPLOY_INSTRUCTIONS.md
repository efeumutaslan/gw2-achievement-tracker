# 🚀 Hızlı Deployment Talimatları

## Adım 1: GitHub Repository Oluştur

1. https://github.com/new adresine git
2. Repository name: **gw2-achievement-tracker**
3. Public seç
4. **Create repository** butonuna tıkla

## Adım 2: Kodu GitHub'a Pushla

Terminalde bu komutları çalıştır:

```bash
cd c:\Users\31437\Desktop\gw2-achi-track

# Remote ekle (kendi kullanıcı adınla değiştir)
git remote add origin https://github.com/KULLANICI_ADINIZ/gw2-achievement-tracker.git

# Push et
git branch -M main
git push -u origin main
```

## Adım 3: Vercel'e Deploy Et

### Yöntem A: Web UI (En Kolay)

1. https://vercel.com adresine git
2. **Sign up with GitHub** butonuna tıkla
3. GitHub'la giriş yap
4. **Add New** → **Project**
5. Repository seç: **gw2-achievement-tracker**
6. Ayarlar otomatik algılanacak - Değiştirme!
7. **Deploy** butonuna tıkla
8. 2-3 dakika bekle

### Yöntem B: CLI (Hızlı)

```bash
# Vercel CLI kur (global)
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## Adım 4: Test Et

Deploy bitince:

1. Vercel'in verdiği URL'i aç
2. **Settings** sayfasına git
3. GW2 API key ekle
4. Test et!

## Sorun Giderme

### Build Hatası Alırsan

Vercel Dashboard → Project → Deployments → Tıkla en son deployment → **View Function Logs**

Hata loglarını bana gönder, yardımcı olurum!

### Yaygın Hatalar

**"Module not found"**: package.json eksik - `git add package.json && git commit && git push`

**"Build failed"**: Build logs'u bana gönder

**"404 on refresh"**: vercel.json var, sorun olmamalı

## Deployment Sonrası

URL'i bana gönder, birlikte test edelim! 🎉
