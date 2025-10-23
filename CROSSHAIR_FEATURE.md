# ✨ قابلیت جدید: افزودن نقطه با Crosshair

**تاریخ پیاده‌سازی:** ۲۲ اکتبر ۲۰۲۵  
**وضعیت:** ✅ فعال و آماده استفاده

---

## 📋 خلاصه تغییرات

به جای کلیک مستقیم روی نقشه برای افزودن نقاط، اکنون کاربران می‌توانند:
1. **نقشه را حرکت دهند** و علامت + (crosshair) را روی مکان دلخواه قرار دهند
2. **دکمه "افزودن نقطه" را بزنند** تا نقطه در مرکز نقشه ثبت شود
3. این روش بسیار راحت‌تر و دقیق‌تر است، به خصوص روی موبایل

---

## 🎯 تغییرات انجام شده

### 1. فایل تغییر یافته
- **مسیر:** `/app/frontend/src/pages/SubmitRoadPage.js`

### 2. کامپوننت‌های جدید

#### MapCenterTracker
```javascript
function MapCenterTracker({ mapRef }) {
  const map = useMap();
  if (mapRef) {
    mapRef.current = map;
  }
  return null;
}
```
- این کامپوننت مرجع نقشه را ذخیره می‌کند تا بتوانیم مرکز نقشه را دریافت کنیم

### 3. Handler جدید

#### handleAddPoint
```javascript
const handleAddPoint = () => {
  if (mapRef.current) {
    const center = mapRef.current.getCenter();
    const newPoint = [center.lat, center.lng];
    setCoordinates([...coordinates, newPoint]);
    toast.success(`نقطه ${coordinates.length + 1} اضافه شد`);
  }
};
```
- این تابع مرکز فعلی نقشه را می‌گیرد و به لیست coordinates اضافه می‌کند
- یک پیام موفقیت نیز نمایش می‌دهد

### 4. UI Elements جدید

#### Crosshair (علامت + در مرکز نقشه)
```jsx
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] pointer-events-none">
  <div className="relative">
    <div className="w-16 h-16 rounded-full border-4 border-teal-500 bg-teal-500/10 flex items-center justify-center">
      <Plus className="w-8 h-8 text-teal-600 stroke-[3]" />
    </div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-teal-600 rounded-full"></div>
  </div>
</div>
```

#### دکمه افزودن نقطه
```jsx
<Button
  onClick={handleAddPoint}
  data-testid="add-point-button"
  className="flex-1 bg-gradient-to-l from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
>
  <Plus className="w-4 h-4 ml-1" />
  افزودن نقطه
</Button>
```

---

## 🎨 طراحی UI

### Crosshair Design
- **دایره بیرونی:** border 4px با رنگ teal (#0d9488)
- **پس‌زمینه:** شفاف با opacity 10%
- **علامت +:** سایز 32px با stroke ضخیم
- **نقطه مرکزی:** دایره کوچک 8px برای دقت بیشتر

### Button Design
- **رنگ:** گرادیانت سبز (green-600 to emerald-600)
- **ایکون:** علامت + کنار متن
- **متن:** "افزودن نقطه"

---

## 💡 مزایای روش جدید

1. **راحتی استفاده:** نیازی به کلیک دقیق روی نقشه نیست
2. **دقت بیشتر:** می‌توان با زوم و حرکت نقشه، مکان دقیق را پیدا کرد
3. **موبایل فرندلی:** روی موبایل بسیار راحت‌تر از کلیک است
4. **Visual Feedback:** کاربر همیشه می‌بیند که چه نقطه‌ای اضافه می‌شود
5. **پیام موفقیت:** بعد از اضافه کردن هر نقطه، toast نمایش داده می‌شود

---

## 🧪 نحوه تست

### تست دستی
1. به صفحه "ثبت مسیر جدید" بروید
2. روی "شروع ثبت مسیر" کلیک کنید
3. علامت + را در مرکز نقشه ببینید
4. نقشه را حرکت دهید
5. دکمه "افزودن نقطه" را بزنید
6. ببینید که marker اضافه شده است
7. این کار را چند بار تکرار کنید
8. "بعدی" را بزنید و فرم را پر کنید

### خروجی مورد انتظار
- ✅ Crosshair در مرکز نقشه نمایش داده می‌شود
- ✅ با حرکت نقشه، crosshair ثابت می‌ماند
- ✅ با کلیک "افزودن نقطه"، یک marker در مرکز اضافه می‌شود
- ✅ Toast notification نمایش داده می‌شود
- ✅ تعداد نقاط در کارت بالای صفحه به‌روز می‌شود

---

## 📝 راهنمای استفاده به‌روز شده

متن راهنما در صفحه اصلی نیز به‌روز شده است:

```
چگونه کار می‌کند؟
۱. نقشه را حرکت دهید و علامت + را روی جاده قرار دهید
۲. دکمه "افزودن نقطه" را بزنید تا نقطه ثبت شود
۳. نام و نوع جاده را وارد کرده و ثبت کنید
۴. بعد از تایید مدیر، سکه دریافت کنید
```

---

## 🔧 تغییرات فنی

### State Management
- اضافه شدن `mapRef = useRef(null)` برای نگهداری مرجع نقشه

### Event Handlers
- حذف `MapClickHandler` component
- اضافه `MapCenterTracker` component
- تغییر `handleMapClick` به `handleAddPoint`

### UI Components
- اضافه Crosshair overlay
- تغییر دستورالعمل‌ها از "روی نقشه کلیک کنید" به "نقشه را حرکت دهید"
- اضافه دکمه جدید "افزودن نقطه" با رنگ سبز

---

## 📊 وضعیت

- **Backend:** ✅ تغییری لازم نبود
- **Frontend:** ✅ به‌روزرسانی شد
- **تست:** ✅ قابلیت کامل است
- **مستندات:** ✅ به‌روز شد

---

## 🚀 نکات برای توسعه آینده

1. می‌توان animation به crosshair اضافه کرد
2. می‌توان vibration feedback برای موبایل اضافه کرد
3. می‌توان preview خط بین آخرین نقطه و مرکز فعلی نمایش داد
4. می‌توان دکمه undo برای حذف آخرین نقطه اضافه کرد

---

**ساخته شده با ❤️ برای تجربه کاربری بهتر**
