import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Language = "en" | "zh" | "ms";

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.marketplace": { en: "Marketplace", zh: "市场", ms: "Pasaran" },
  "nav.dashboard": { en: "Dashboard", zh: "仪表板", ms: "Papan Pemuka" },
  "nav.cart": { en: "Cart", zh: "购物车", ms: "Troli" },
  "nav.login": { en: "Login", zh: "登录", ms: "Log Masuk" },
  "nav.logout": { en: "Logout", zh: "登出", ms: "Log Keluar" },

  // Index page
  "hero.title1": { en: "Perfectly Imperfect,", zh: "完美的不完美,", ms: "Sempurna Tidak Sempurna," },
  "hero.title2": { en: "Deliciously Affordable", zh: "美味又实惠", ms: "Lazat dan Berpatutan" },
  "hero.desc": { en: "Malaysia's marketplace for imperfect but edible crops. Help reduce food waste while saving money on fresh produce.", zh: "马来西亚不完美但可食用农产品市场。帮助减少食物浪费，同时节省新鲜农产品的开支。", ms: "Pasaran Malaysia untuk tanaman tidak sempurna tetapi boleh dimakan. Bantu kurangkan pembaziran makanan sambil menjimatkan wang." },
  "hero.browse": { en: "Browse Marketplace", zh: "浏览市场", ms: "Layari Pasaran" },
  "hero.join": { en: "Join Now", zh: "立即加入", ms: "Sertai Sekarang" },

  // Features
  "feat.waste.title": { en: "Reduce Food Waste", zh: "减少食物浪费", ms: "Kurangkan Pembaziran Makanan" },
  "feat.waste.desc": { en: "Give imperfect crops a second chance instead of going to landfills.", zh: "给不完美的农产品第二次机会，而不是送去垃圾填埋场。", ms: "Beri peluang kedua kepada tanaman tidak sempurna." },
  "feat.price.title": { en: "Discounted Prices", zh: "折扣价格", ms: "Harga Diskaun" },
  "feat.price.desc": { en: "Buy fresh produce at lower prices. Good for your wallet and the planet.", zh: "以更低的价格购买新鲜农产品。对你的钱包和地球都好。", ms: "Beli hasil segar pada harga lebih rendah." },
  "feat.delivery.title": { en: "Easy Delivery", zh: "轻松配送", ms: "Penghantaran Mudah" },
  "feat.delivery.desc": { en: "Get crops delivered to your door with our driver network.", zh: "通过我们的司机网络将农产品送到您家门口。", ms: "Dapatkan tanaman dihantar ke pintu anda." },
  "feat.support.title": { en: "Support Local Farmers", zh: "支持本地农民", ms: "Sokong Petani Tempatan" },
  "feat.support.desc": { en: "Help Malaysian farmers earn income from every harvest.", zh: "帮助马来西亚农民从每次收获中获得收入。", ms: "Bantu petani Malaysia memperoleh pendapatan." },

  // Section headers
  "section.why": { en: "Why OddHarvest? 🌱", zh: "为什么选择 OddHarvest？🌱", ms: "Kenapa OddHarvest? 🌱" },
  "section.why.desc": { en: "Every odd-looking crop deserves a home. Join thousands of Malaysians fighting food waste.", zh: "每一个长相奇特的农产品都值得一个家。加入数千名马来西亚人对抗食物浪费。", ms: "Setiap tanaman yang kelihatan pelik berhak mendapat rumah." },
  "section.how": { en: "How It Works 🚜", zh: "运作方式 🚜", ms: "Cara Ia Berfungsi 🚜" },
  "section.cta": { en: "Ready to Rescue Some Crops? 🥕", zh: "准备好拯救一些农产品了吗？🥕", ms: "Bersedia Menyelamatkan Tanaman? 🥕" },
  "section.cta.desc": { en: "Join OddHarvest today and be part of Malaysia's food waste solution.", zh: "今天就加入 OddHarvest，成为马来西亚食物浪费解决方案的一部分。", ms: "Sertai OddHarvest hari ini." },
  "section.cta.btn": { en: "Get Started", zh: "开始", ms: "Mula" },

  // How it works
  "how.1.title": { en: "Farmers List Crops", zh: "农民列出农产品", ms: "Petani Senarai Tanaman" },
  "how.1.desc": { en: "Upload imperfect but edible crops with discounted prices.", zh: "上传不完美但可食用的农产品，附带折扣价格。", ms: "Muat naik tanaman tidak sempurna dengan harga diskaun." },
  "how.2.title": { en: "Buyers Shop & Save", zh: "买家购物省钱", ms: "Pembeli Beli & Jimat" },
  "how.2.desc": { en: "Browse, compare prices, and add to cart at great discounts.", zh: "浏览、比较价格，并以优惠价格加入购物车。", ms: "Layari, bandingkan harga, dan tambah ke troli." },
  "how.3.title": { en: "Pickup or Delivery", zh: "自取或配送", ms: "Ambil Sendiri atau Penghantaran" },
  "how.3.desc": { en: "Self-pickup or let our drivers deliver fresh crops to you.", zh: "自取或让我们的司机为您送达新鲜农产品。", ms: "Ambil sendiri atau biar pemandu kami hantar." },

  // Marketplace
  "market.title": { en: "Marketplace 🛒", zh: "市场 🛒", ms: "Pasaran 🛒" },
  "market.subtitle": { en: "Fresh, imperfect produce at amazing prices", zh: "新鲜、不完美的农产品，价格惊人", ms: "Hasil segar, tidak sempurna pada harga menakjubkan" },
  "market.search": { en: "Search crops...", zh: "搜索农产品...", ms: "Cari tanaman..." },
  "market.nearby": { en: "Nearby Farms", zh: "附近农场", ms: "Ladang Berdekatan" },
  "market.sort": { en: "Sort by", zh: "排序方式", ms: "Susun mengikut" },
  "market.sort.price": { en: "Lowest Price", zh: "最低价格", ms: "Harga Terendah" },
  "market.sort.fresh": { en: "Most Fresh", zh: "最新鲜", ms: "Paling Segar" },
  "market.sort.near": { en: "Nearest", zh: "最近的", ms: "Terdekat" },
  "market.any_dist": { en: "Any distance", zh: "任何距离", ms: "Sebarang jarak" },
  "market.found": { en: "found", zh: "个结果", ms: "ditemui" },
  "market.no_crops": { en: "No crops found", zh: "未找到农产品", ms: "Tiada tanaman ditemui" },
  "market.browse_all": { en: "← Browse all states", zh: "← 浏览所有州", ms: "← Layari semua negeri" },

  // Product card
  "product.save": { en: "Save", zh: "节省", ms: "Jimat" },
  "product.left": { en: "kg left", zh: "公斤剩余", ms: "kg tinggal" },
  "product.harvested": { en: "Harvested", zh: "收获于", ms: "Dituai" },
  "product.from_you": { en: "km from you", zh: "公里", ms: "km dari anda" },
  "product.add": { en: "Add", zh: "添加", ms: "Tambah" },
  "product.added": { en: "added to cart!", zh: "已加入购物车！", ms: "ditambah ke troli!" },
  "product.qty": { en: "kg", zh: "公斤", ms: "kg" },
  "product.out_of_stock": { en: "Out of Stock", zh: "缺货", ms: "Habis Stok" },

  // Cart
  "cart.title": { en: "Your Cart 🛒", zh: "您的购物车 🛒", ms: "Troli Anda 🛒" },
  "cart.empty": { en: "Your cart is empty", zh: "您的购物车是空的", ms: "Troli anda kosong" },
  "cart.empty.desc": { en: "Start shopping for imperfect but delicious crops!", zh: "开始购买不完美但美味的农产品！", ms: "Mulakan membeli-belah tanaman!" },
  "cart.total": { en: "Total", zh: "总计", ms: "Jumlah" },
  "cart.checkout": { en: "Proceed to Checkout", zh: "前往结账", ms: "Teruskan ke Pembayaran" },
  "cart.items": { en: "Items", zh: "件商品", ms: "Item" },

  // Farmer dashboard
  "farmer.title": { en: "Farmer Dashboard 🌾", zh: "农民仪表板 🌾", ms: "Papan Pemuka Petani 🌾" },
  "farmer.subtitle": { en: "Manage your crop listings & impact", zh: "管理您的农产品列表和影响", ms: "Urus senarai tanaman & impak anda" },
  "farmer.add_crop": { en: "Add Crop", zh: "添加农产品", ms: "Tambah Tanaman" },
  "farmer.listed": { en: "Crops Listed", zh: "已列出农产品", ms: "Tanaman Disenarai" },
  "farmer.sold": { en: "Crops Sold", zh: "已售农产品", ms: "Tanaman Terjual" },
  "farmer.rescued": { en: "Crops Rescued (kg)", zh: "拯救农产品 (公斤)", ms: "Tanaman Diselamatkan (kg)" },
  "farmer.waste": { en: "Waste Prevented", zh: "减少浪费", ms: "Pembaziran Dicegah" },
  "farmer.view_sold": { en: "View Crops Sold", zh: "查看已售农产品", ms: "Lihat Tanaman Terjual" },
  "farmer.view_sold.desc": { en: "See all completed sales & revenue", zh: "查看所有已完成的销售和收入", ms: "Lihat semua jualan & hasil" },
  "farmer.impact": { en: "🎉 Amazing Impact!", zh: "🎉 了不起的影响！", ms: "🎉 Impak Hebat!" },
  "farmer.listings": { en: "Your Listings", zh: "您的列表", ms: "Senarai Anda" },
  "farmer.edit": { en: "Edit Crop Listing", zh: "编辑农产品列表", ms: "Edit Senarai Tanaman" },
  "farmer.save": { en: "Save Changes", zh: "保存更改", ms: "Simpan Perubahan" },
  "farmer.cancel": { en: "Cancel", zh: "取消", ms: "Batal" },
  "farmer.add_new": { en: "Add New Crop Listing", zh: "添加新农产品列表", ms: "Tambah Senarai Tanaman Baru" },
  "farmer.crop_name": { en: "Crop Name", zh: "农产品名称", ms: "Nama Tanaman" },
  "farmer.image_url": { en: "Crop Image URL", zh: "农产品图片 URL", ms: "URL Gambar Tanaman" },
  "farmer.qty": { en: "Quantity Available (kg)", zh: "可用数量 (公斤)", ms: "Kuantiti Tersedia (kg)" },
  "farmer.usual_price": { en: "Usual Price (RM/kg)", zh: "通常价格 (RM/公斤)", ms: "Harga Biasa (RM/kg)" },
  "farmer.disc_price": { en: "Discount Price (RM/kg)", zh: "折扣价格 (RM/公斤)", ms: "Harga Diskaun (RM/kg)" },
  "farmer.harvest_date": { en: "Harvest Date", zh: "收获日期", ms: "Tarikh Tuai" },
  "farmer.location": { en: "Farm Location", zh: "农场位置", ms: "Lokasi Ladang" },
  "farmer.state": { en: "State", zh: "州", ms: "Negeri" },
  "farmer.add_listing": { en: "Add Listing", zh: "添加列表", ms: "Tambah Senarai" },

  // Language
  "lang.en": { en: "English", zh: "英语", ms: "Bahasa Inggeris" },
  "lang.zh": { en: "Chinese", zh: "中文", ms: "Bahasa Cina" },
  "lang.ms": { en: "Malay", zh: "马来语", ms: "Bahasa Melayu" },
  "lang.select": { en: "Language", zh: "语言", ms: "Bahasa" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = useCallback(
    (key: string) => translations[key]?.[language] ?? key,
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
