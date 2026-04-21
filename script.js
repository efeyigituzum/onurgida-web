/* ═══════════════════════════════════════════════════════════
   ONUR GIDA – script.js
═══════════════════════════════════════════════════════════ */

/* ── Navbar scroll shadow ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

/* ── Mobile hamburger ── */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

// Close menu on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

/* ── Smooth scroll with offset ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
  });
});

/* ── Tabs (products) ── */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const name = tab.dataset.tab;

    // deactivate all
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    // activate selected
    tab.classList.add('active');
    const panel = document.getElementById('panel-' + name);
    if (panel) {
      panel.classList.add('active');
      // slight fade-in
      panel.style.opacity = '0';
      requestAnimationFrame(() => {
        panel.style.transition = 'opacity 0.3s ease';
        panel.style.opacity = '1';
      });
    }
  });
});

/* ── Scroll animation (data-aos) ── */
const aosEls = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = parseInt(el.dataset.aosDelay) || 0;
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.12 });

aosEls.forEach(el => observer.observe(el));

/* ── Contact form submit ── */
function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.textContent = '✅ Talebiniz Alındı!';
  btn.style.background = '#27ae60';
  setTimeout(() => {
    btn.innerHTML = '🚀 Teklif Gönder';
    btn.style.background = '';
  }, 4000);
}

/* ── WhatsApp float tooltip pulse on load ── */
window.addEventListener('load', () => {
  const wa = document.querySelector('.wa-float');
  if (!wa) return;
  // brief scale pop after 2 seconds to draw attention
  setTimeout(() => {
    wa.style.transition = 'transform 0.3s ease';
    wa.style.transform = 'scale(1.2)';
    setTimeout(() => { wa.style.transform = ''; }, 350);
  }, 2000);
});

/* ═══════════════════════════════════════════════════════════
   GOOGLE SHEETS'TEN VERİ ÇEKME (API SİMÜLASYONU)
═══════════════════════════════════════════════════════════ */

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEPm_LybLlPOM7_ioUTGDhEis9ZLNMq1-TJbRHcCdwZ4llhD8HJW46Z83QmmmSdVGHrksFB71c20J_/pub?gid=0&single=true&output=csv";

// Sayfa yüklendiğinde verileri çekmeye başla
document.addEventListener('DOMContentLoaded', () => {
  Papa.parse(csvUrl, {
    download: true,
    header: true, // İlk satırın başlık olduğunu belirtir
    complete: function (results) {
      // results.data bize Excel'deki satırları JavaScript dizisi (array) olarak verir
      urunleriTablolaraBas(results.data);
    },
    error: function (error) {
      console.error("Veri çekilirken hata oluştu:", error);
    }
  });
});

function urunleriTablolaraBas(urunler) {
  // 1. Önce tabloların içini garanti olsun diye tamamen temizle
  document.querySelector('#panel-tostlar tbody').innerHTML = '';
  document.querySelector('#panel-sandvicler tbody').innerHTML = '';
  document.querySelector('#panel-pizzalar tbody').innerHTML = '';

  // 2. Excel'den gelen her bir ürün için döngüye gir
  urunler.forEach(urun => {
    // Eğer Excel'de boş bir satır okunursa onu atla
    if (!urun.Kategori || !urun.Kod) return;

    // Excel'deki kategori adını küçük harfe çevir (Örn: "Tostlar" -> "tostlar")
    const kategoriId = urun.Kategori.toLowerCase().trim();

    // Doğru tablonun <tbody> etiketini bul
    const tbody = document.querySelector(`#panel-${kategoriId} tbody`);

    if (tbody) {
      // Yeni bir <tr> (satır) oluştur
      const tr = document.createElement('tr');

      // --- Alt Kategori (Artizan vb.) İşlemleri ---
      let altKategoriHTML = "";
      if (urun.Alt_Kategori && urun.Alt_Kategori.trim() !== "") {
        let catClass = "cat";
        // Ekşi maya tasarımı farklı olduğu için onu yakalıyoruz
        if (urun.Alt_Kategori.toLowerCase().includes("ekşi maya")) {
          catClass = "cat cat-art";
        }
        altKategoriHTML = `<td><span class="${catClass}">${urun.Alt_Kategori}</span></td>`;
      } else if (kategoriId !== 'tostlar') {
        // Tostlar hariç diğerlerinde alt kategori boşsa bile sütun kaymasın diye boş <td> ekliyoruz
        altKategoriHTML = `<td></td>`;
      }

      // --- Sütunları Oluşturma ---
      // HTML'deki tablo yapına göre Tostlar'da Kategori sütunu yoktu, diğerlerinde var.
      if (kategoriId === 'tostlar') {
        tr.innerHTML = `
            <td class="code">${urun.Kod}</td>
            <td>${urun.Urun_Adi}</td>
            <td><span class="gram">${urun.Gramaj}</span></td>
            <td>${urun.Koli_Adedi}</td>
            <td class="price">${urun.Birim_Fiyat}</td>
            <td class="kprice">${urun.Koli_Fiyati}</td>
          `;
      } else {
        tr.innerHTML = `
            <td class="code">${urun.Kod}</td>
            <td>${urun.Urun_Adi}</td>
            ${altKategoriHTML}
            <td><span class="gram">${urun.Gramaj}</span></td>
            <td>${urun.Koli_Adedi}</td>
            <td class="price">${urun.Birim_Fiyat}</td>
            <td class="kprice">${urun.Koli_Fiyati}</td>
          `;
      }

      // Hazırladığımız satırı tabloya ekle
      tbody.appendChild(tr);
    }
  });
}

/* ── Akıllı Arama (Gelişmiş Global Filtreleme) ── */
const aramaKutusu = document.getElementById('aramaKutusu');
const tabBar = document.querySelector('.tab-bar');
const tabPaneller = document.querySelectorAll('.tab-panel');

if (aramaKutusu) {
  aramaKutusu.addEventListener('keyup', function () {
    const arananKelime = this.value.toLowerCase().trim();
    const aramaYapiliyor = arananKelime.length > 0;

    // Arama yapılıyorsa sekme butonlarını gizle, bittiğinde geri getir
    if (aramaYapiliyor) {
      tabBar.style.display = 'none';
    } else {
      tabBar.style.display = '';
    }

    tabPaneller.forEach(panel => {
      // Arama varken tüm panelleri zorla görünür yap, arama yoksa eski haline (CSS kontrolüne) bırak
      panel.style.display = aramaYapiliyor ? 'block' : '';

      let eslesenUrunSayisi = 0;

      // 1. Tablolardaki ürünleri filtrele (Tost, Sandviç, Pizza için)
      const satirlar = panel.querySelectorAll('.price-table tbody tr');
      if (satirlar.length > 0) {
        satirlar.forEach(satir => {
          const urunAdi = satir.querySelector('td:nth-child(2)').textContent.toLowerCase();
          if (urunAdi.includes(arananKelime)) {
            satir.style.display = '';
            eslesenUrunSayisi++;
          } else {
            satir.style.display = 'none';
          }
        });
      }

      // 2. Et ürünlerindeki listeyi filtrele (Köfteler, Dönerler vb. için)
      const etListesi = panel.querySelectorAll('.et-list li');
      if (etListesi.length > 0) {
        etListesi.forEach(li => {
          const urunAdi = li.textContent.toLowerCase();
          if (urunAdi.includes(arananKelime)) {
            li.style.display = '';
            // Ürün bulunduysa, o ürünün ait olduğu kutuyu (Örn: Köfteler div'ini) görünür yap
            li.closest('.et-category').style.display = 'block';
            eslesenUrunSayisi++;
          } else {
            li.style.display = 'none';
          }
        });

        // İçi boşalan et kategorisi kutularını gizle
        const etKategorileri = panel.querySelectorAll('.et-category');
        etKategorileri.forEach(kat => {
          // Görünür durumda olan <li> var mı diye kontrol et
          const gorunenLi = Array.from(kat.querySelectorAll('.et-list li')).filter(li => li.style.display !== 'none');
          if (aramaYapiliyor && gorunenLi.length === 0) {
            kat.style.display = 'none';
          } else if (!aramaYapiliyor) {
            kat.style.display = 'block';
          }
        });
      }

      // 3. Eğer panelin içinde hiçbir eşleşme bulunamadıysa, o koca paneli (ve boş tabloyu) komple gizle
      if (aramaYapiliyor && eslesenUrunSayisi === 0) {
        panel.style.display = 'none';
      }
    });
  });
}
