# YKS E-Kitap — TYT/AYT konu notları

Statik GitHub Pages sitesi: https://titanlion72.github.io/yks-ebook/

Derleme adımı yok. Düz HTML, CSS ve JS kullanılır. Bütün yollar göreli olduğu için alt dizinde (`/yks-ebook/`) de yerelde de çalışır.

## Yapı
```
index.html                      Ana sayfa (ders kartları + arama)
assets/style.css                Kağıt-mürekkep tema, açık/koyu
assets/app.js                   Ana sayfa listesi + konu sayfası render, notlar, ilerleme
content/index.json              Ders → ünite → konu kataloğu
content/<ders>/<konu>.json      Konu içeriği
ders/<ders>/index.html          Ders sayfası
ders/<ders>/<ünite>/<konu>/index.html   Konu sayfası (içeriği JSON'dan çeker)
```

## Yeni konu ekleme
1. `content/tyt-matematik/isci-problemleri.json` dosyasını kopyalayıp örneğin `content/tyt-matematik/havuz-problemleri.json` yap. Alanları doldur: `topicId` (benzersiz olmalı), `title`, `breadcrumb`, `goals`, `sections`, `slides`, `video`, `outOfCurriculum`, `questions`, `officialNotes`, `related`. `diagram` alanı işçi şemasına özeldir; başka konuda bu alanı uyarlaman ya da `app.js` içindeki şema bloğunu genelleştirmen gerekir.
2. `ders/tyt-matematik/problemler/isci-problemleri/index.html` dosyasını yeni klasöre kopyala, örneğin `ders/tyt-matematik/problemler/havuz-problemleri/index.html`. Sonra `<body>` etiketindeki `data-topic` değerini yeni JSON yoluyla değiştir. Klasör derinliği aynı kalırsa `data-base` değerine dokunma.
3. `content/index.json` dosyasında ilgili ünitenin `topics` listesine `{id, title, href, keywords}` ekle.
4. Diğer konuların `related` alanında bu konunun `href` değeri `#` duruyorsa gerçek yolla değiştir.
5. Değişiklikleri commit edip push et. Pages birkaç dakika içinde günceller.

## Tarayıcıda saklanan veriler (localStorage)
- `yks-ebook:notes:{topicId}`: `{topicId, text, updatedAt}`. Notlar yazmayı bıraktıktan 600 ms sonra otomatik kaydedilir. Dışa ve içe aktarma JSON dosyasıyla yapılır.
- `yks-ebook:progress:{topicId}`: `{read, done}`.
- `yks-ebook:theme`: `light` veya `dark`.

## Video
`video.src` alanı boşsa sayfada "MP4 yakında" yer tutucusu görünür. MP4 dosyasını `assets/video/` altına koyup yolunu (sayfaya göre değil, site köküne göre göreli, örn. `assets/video/x.mp4`) yazarsan oynatıcı gelir.
