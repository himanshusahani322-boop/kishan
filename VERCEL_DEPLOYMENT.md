# 🚀 Kisan Saathi — Vercel Deployment Guide (डिप्लॉयमेंट गाइड)

यह प्रोजेक्ट अब **Vercel** पर डिप्लॉय करने के लिए 100% तैयार (Ready) है। इसमें क्लाइंट-साइड React SPA और सर्वर-साइड Express APIs दोनों को Vercel Serverless Architecture के अनुकूल कॉन्फ़िगर कर दिया गया है।

---

## 🛠️ क्या-क्या कॉन्फ़िगर किया गया है (Changes Made)

1. **`vercel.json`**:
   - `/api/*` के सभी कॉल्स ऑटोमैटिकली `api/index.ts` सर्वरलेस फ़ंक्शन पर रूट होते हैं।
   - बाकी सभी यूआरएल (`/farmer`, `/buyer`, `/login` आदि) React Router SPA (`dist/index.html`) पर रूट होते हैं।
2. **`api/index.ts`**:
   - Vercel Serverless Function एंट्री पॉइंट जो Express backend (`server/app.ts`) को कॉल करता है।
3. **`server/app.ts`**:
   - Express ऐप को मॉड्यूलर बनाया गया है ताकि यह लोकल सर्वर (`server.ts`) और Vercel Serverless (`api/index.ts`) दोनों में बिना किसी बदलाव के काम करे।
4. **Vercel `/tmp` Database Adapter**:
   - Vercel का सर्वरलेस फ़ाइल-सिस्टम Read-Only होता है। हमारा डेटाबेस और ऑथेंटिकेशन सिस्टम Vercel पर ऑटोमैटिकली `/tmp` डायरेक्टरी का उपयोग करता है और रेपो में मौजूद 30+ मॉडल्स का डेटा लोड कर लेता है। कोई `EROFS` एरर नहीं आएगा।

---

## 📌 डिप्लॉय करने के 2 आसान तरीके (2 Ways to Deploy)

### तरीका 1: GitHub के ज़रिए (सबसे आसान और रेकमेंडेड ⭐)

1. **कोड को GitHub पर पुश करें:**
   ```bash
   git add .
   git commit -m "feat: complete step 5 and prepare vercel deployment"
   git push origin main
   ```

2. **Vercel Dashboard पर जाएं:**
   - [vercel.com](https://vercel.com) पर लॉगिन करें।
   - **"Add New..."** &rarr; **"Project"** पर क्लिक करें।
   - अपना GitHub रिपॉजिटरी चुनें और **"Import"** दबाएं।

3. **Project Settings (प्रोजेक्ट सेटिंग्स):**
   - **Framework Preset:** `Vite` (Vercel इसे अपने आप डिटेक्ट कर लेगा)।
   - **Root Directory:** `./`
   - **Build Command:** `vite build` (या डिफ़ॉल्ट छोड़ें, `vercel.json` इसे हैंडल करेगा)।
   - **Output Directory:** `dist`

4. **Environment Variables (पर्यावरण चर सेट करें):**
   - `GEMINI_API_KEY`: अपना Google Gemini API Key डालें (Krishi AI Saathi के लिए)।
   - `SESSION_SECRET`: कोई भी रैंडम स्ट्रॉन्ग सीक्रेट की (जैसे `kisan-saathi-production-key-2026`).

5. **"Deploy" बटन दबाएं:**
   - 1-2 मिनट में आपकी वेबसाइट लाइव हो जाएगी और आपको एक लिंक मिल जाएगा:
     `https://your-project-name.vercel.app`

---

### तरीका 2: Vercel CLI के ज़रिए (टर्मिनल से डायरेक्ट)

1. **Vercel CLI इंस्टॉल करें (यदि पहले से नहीं है):**
   ```bash
   npm i -g vercel
   ```

2. **प्रोजेक्ट फोल्डर में कमांड चलाएं:**
   ```bash
   vercel
   ```
   - पहली बार लॉगिन करने के लिए पूछेगा (ईमेल/गिटहब से वेरिफाई करें)।
   - "Set up and deploy?" &rarr; `Y` दबाएं।
   - "Which scope?" &rarr; अपना अकाउंट चुनें।
   - "Link to existing project?" &rarr; `N` दबाएं।
   - "What's your project's name?" &rarr; `kisan-saathi` (या कोई भी नाम)।
   - "In which directory is your code located?" &rarr; `./`

3. **प्रोडक्शन डिप्लॉयमेंट के लिए:**
   ```bash
   vercel --prod
   ```

---

## 🔑 डिफ़ॉल्ट लॉगिन क्रेडेंशियल्स (Default Test Accounts)

डिप्लॉय होने के बाद आप इन खातों से तुरंत लॉगिन करके टेस्ट कर सकते हैं:

| रोल (Role) | ईमेल (Identifier) | पासवर्ड (Password) |
|---|---|---|
| 🌾 **किसान (Farmer)** | `rameshwar.patel@kisansaathi.in` | `Farmer@123` |
| 🌾 **किसान 2 (Farmer)** | `baldev.singh@malwaorganicfpo.org` | `Farmer@123` |
| 🏢 **खरीदार (Buyer)** | `vikram.aggarwal@bharatagroexports.com` | `Buyer@123` |
| 🛡️ **एडमिन (APMC Admin)**| `admin.compliance@kisansaathi.gov.in` | `Admin@123!` |

---

## ✅ डिप्लॉयमेंट चेकलिस्ट (Verification Checklist)

- [x] `npx tsc --noEmit` &rarr; 0 Errors (TypeScript पास)
- [x] `npm run build` &rarr; Production bundle तैयार
- [x] `vercel.json` कॉन्फ़िगरेशन मौजूद
- [x] `api/index.ts` सर्वरलेस फंक्शन तैयार
- [x] रिलेटिव `/api` रूट्स (No CORS issues)
- [x] Read-only फ़ाइल-सिस्टम से बचने के लिए `/tmp` स्टोरेज एडॉप्टर सक्रिय
