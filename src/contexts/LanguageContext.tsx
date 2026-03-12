import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Language = "en" | "zh" | "ms";

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.marketplace": { en: "Marketplace", zh: "市场", ms: "Pasaran" },
  "nav.dashboard": { en: "Dashboard", zh: "仪表板", ms: "Papan Pemuka" },
  "nav.cart": { en: "Cart", zh: "购物车", ms: "Troli" },
  "nav.login": { en: "Login", zh: "登录", ms: "Log Masuk" },
  "nav.logout": { en: "Logout", zh: "登出", ms: "Log Keluar" },

  // Auth
  "auth.welcome": { en: "Welcome Back!", zh: "欢迎回来！", ms: "Selamat Kembali!" },
  "auth.join": { en: "Join OddHarvest", zh: "加入 OddHarvest", ms: "Sertai OddHarvest" },
  "auth.login_desc": { en: "Login to your account", zh: "登录您的账户", ms: "Log masuk ke akaun anda" },
  "auth.signup_desc": { en: "Create your account and start rescuing crops", zh: "创建账户并开始拯救农产品", ms: "Cipta akaun anda dan mula menyelamatkan tanaman" },
  "auth.iam": { en: "I am a...", zh: "我是...", ms: "Saya adalah..." },
  "auth.farmer": { en: "Seller", zh: "卖家", ms: "Penjual" },
  "auth.buyer": { en: "Buyer", zh: "买家", ms: "Pembeli" },
  "auth.driver": { en: "Driver", zh: "司机", ms: "Pemandu" },
  "auth.farmer_desc": { en: "Sell your imperfect crops", zh: "出售不完美的农产品", ms: "Jual tanaman tidak sempurna" },
  "auth.buyer_desc": { en: "Buy affordable fresh produce", zh: "购买实惠的新鲜农产品", ms: "Beli hasil segar pada harga berpatutan" },
  "auth.driver_desc": { en: "Deliver crops and earn", zh: "配送农产品并赚钱", ms: "Hantar tanaman dan dapatkan pendapatan" },
  "auth.seller_type": { en: "Seller Type", zh: "卖家类型", ms: "Jenis Penjual" },
  "auth.farm_desc": { en: "You run a farm and sell produce commercially", zh: "您经营农场并进行商业销售", ms: "Anda menjalankan ladang dan menjual secara komersial" },
  "auth.community_desc": { en: "You grow crops at home — garden, balcony, or rooftop", zh: "您在家种植农产品——花园、阳台或屋顶", ms: "Anda menanam di rumah — taman, balkoni, atau bumbung" },
  "auth.name": { en: "Full Name", zh: "全名", ms: "Nama Penuh" },
  "auth.name_placeholder": { en: "Your name", zh: "您的名字", ms: "Nama anda" },
  "auth.farm_name": { en: "Farm Name", zh: "农场名称", ms: "Nama Ladang" },
  "auth.farm_name_placeholder": { en: "e.g. Ladang Pak Ali", zh: "例如 Ladang Pak Ali", ms: "cth. Ladang Pak Ali" },
  "auth.email": { en: "Email", zh: "邮箱", ms: "E-mel" },
  "auth.password": { en: "Password", zh: "密码", ms: "Kata Laluan" },
  "auth.login_btn": { en: "Login", zh: "登录", ms: "Log Masuk" },
  "auth.signup_btn": { en: "Sign Up", zh: "注册", ms: "Daftar" },
  "auth.no_account": { en: "Don't have an account?", zh: "没有账户？", ms: "Tiada akaun?" },
  "auth.has_account": { en: "Already have an account?", zh: "已有账户？", ms: "Sudah ada akaun?" },

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
  "feat.support.title": { en: "Support Local Sellers", zh: "支持本地卖家", ms: "Sokong Penjual Tempatan" },
  "feat.support.desc": { en: "Help Malaysian sellers earn income from every harvest.", zh: "帮助马来西亚卖家从每次收获中获得收入。", ms: "Bantu penjual Malaysia memperoleh pendapatan." },

  // Section headers
  "section.why": { en: "Why OddHarvest? 🌱", zh: "为什么选择 OddHarvest？🌱", ms: "Kenapa OddHarvest? 🌱" },
  "section.why.desc": { en: "Every odd-looking crop deserves a home. Join thousands of Malaysians fighting food waste.", zh: "每一个长相奇特的农产品都值得一个家。加入数千名马来西亚人对抗食物浪费。", ms: "Setiap tanaman yang kelihatan pelik berhak mendapat rumah." },
  "section.how": { en: "How It Works 🚜", zh: "运作方式 🚜", ms: "Cara Ia Berfungsi 🚜" },
  "section.cta": { en: "Ready to Rescue Some Crops? 🥕", zh: "准备好拯救一些农产品了吗？🥕", ms: "Bersedia Menyelamatkan Tanaman? 🥕" },
  "section.cta.desc": { en: "Join OddHarvest today and be part of Malaysia's food waste solution.", zh: "今天就加入 OddHarvest，成为马来西亚食物浪费解决方案的一部分。", ms: "Sertai OddHarvest hari ini." },
  "section.cta.btn": { en: "Get Started", zh: "开始", ms: "Mula" },

  // How it works
  "how.1.title": { en: "Sellers List Crops", zh: "卖家列出农产品", ms: "Penjual Senarai Tanaman" },
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
  "market.all_sellers": { en: "All Sellers", zh: "所有卖家", ms: "Semua Penjual" },
  "market.all_reasons": { en: "All Imperfections", zh: "所有不完美类型", ms: "Semua Ketidaksempurnaan" },
  "market.bundles": { en: "Bundles Only", zh: "仅套装", ms: "Hanya Bundle" },

  // Product card
  "product.save": { en: "Save", zh: "节省", ms: "Jimat" },
  "product.left": { en: "kg left", zh: "公斤剩余", ms: "kg tinggal" },
  "product.boxes_left": { en: "boxes left", zh: "盒剩余", ms: "kotak tinggal" },
  "product.harvested": { en: "Harvested", zh: "收获于", ms: "Dituai" },
  "product.from_you": { en: "km from you", zh: "公里", ms: "km dari anda" },
  "product.add": { en: "Add", zh: "添加", ms: "Tambah" },
  "product.added": { en: "added to cart!", zh: "已加入购物车！", ms: "ditambah ke troli!" },
  "product.qty": { en: "kg", zh: "公斤", ms: "kg" },
  "product.out_of_stock": { en: "Out of Stock", zh: "缺货", ms: "Habis Stok" },
  "product.bundle": { en: "Bundle", zh: "套装", ms: "Bundle" },
  "product.includes": { en: "Includes", zh: "包含", ms: "Termasuk" },
  "product.community_grower": { en: "Community Grower", zh: "社区种植者", ms: "Penanam Komuniti" },

  // Imperfect reasons
  "imperfect.irregular_shape": { en: "Irregular Shape", zh: "形状不规则", ms: "Bentuk Tidak Sekata" },
  "imperfect.too_small": { en: "Too Small", zh: "太小", ms: "Terlalu Kecil" },
  "imperfect.too_large": { en: "Too Large", zh: "太大", ms: "Terlalu Besar" },
  "imperfect.cosmetic_blemish": { en: "Cosmetic Blemish", zh: "外观瑕疵", ms: "Kecacatan Kosmetik" },
  "imperfect.slight_discoloration": { en: "Slight Discoloration", zh: "轻微变色", ms: "Sedikit Perubahan Warna" },
  "imperfect.education": { en: "This produce may look unusual but has the same taste and nutrition as regular produce.", zh: "这些农产品可能看起来不寻常，但味道和营养与普通农产品相同。", ms: "Hasil ini mungkin kelihatan luar biasa tetapi mempunyai rasa dan nutrisi yang sama seperti hasil biasa." },

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
  "farmer.add_bundle": { en: "Add Bundle", zh: "添加套装", ms: "Tambah Bundle" },
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
  "farmer.description": { en: "Description", zh: "描述", ms: "Penerangan" },
  "farmer.qty": { en: "Quantity Available (kg)", zh: "可用数量 (公斤)", ms: "Kuantiti Tersedia (kg)" },
  "farmer.usual_price": { en: "Usual Price (RM/kg)", zh: "通常价格 (RM/公斤)", ms: "Harga Biasa (RM/kg)" },
  "farmer.disc_price": { en: "Discount Price (RM/kg)", zh: "折扣价格 (RM/公斤)", ms: "Harga Diskaun (RM/kg)" },
  "farmer.harvest_date": { en: "Harvest Date", zh: "收获日期", ms: "Tarikh Tuai" },
  "farmer.location": { en: "Farm Location", zh: "农场位置", ms: "Lokasi Ladang" },
  "farmer.state": { en: "State", zh: "州", ms: "Negeri" },
  "farmer.add_listing": { en: "Add Listing", zh: "添加列表", ms: "Tambah Senarai" },
  "farmer.imperfect_reason": { en: "Imperfect Reason", zh: "不完美原因", ms: "Sebab Ketidaksempurnaan" },
  "farmer.crop_added": { en: "Crop listing added!", zh: "农产品列表已添加！", ms: "Senarai tanaman ditambah!" },
  "farmer.bundle_added": { en: "Bundle created!", zh: "套装已创建！", ms: "Bundle dicipta!" },
  "farmer.listing_updated": { en: "Listing updated!", zh: "列表已更新！", ms: "Senarai dikemas kini!" },
  "farmer.listing_removed": { en: "Listing removed!", zh: "列表已删除！", ms: "Senarai dipadamkan!" },
  "farmer.create_bundle": { en: "Create Crop Bundle", zh: "创建农产品套装", ms: "Cipta Bundle Tanaman" },
  "farmer.bundle_name": { en: "Bundle Name", zh: "套装名称", ms: "Nama Bundle" },
  "farmer.bundle_contents": { en: "Contents (comma separated)", zh: "内容（逗号分隔）", ms: "Kandungan (pisah dengan koma)" },
  "farmer.bundle_weight": { en: "Total Weight (kg)", zh: "总重量（公斤）", ms: "Jumlah Berat (kg)" },

  // Seller profile
  "seller.farm": { en: "Farm Seller", zh: "农场卖家", ms: "Penjual Ladang" },
  "seller.community": { en: "Community Grower", zh: "社区种植者", ms: "Penanam Komuniti" },
  "seller.by": { en: "by", zh: "由", ms: "oleh" },
  "seller.years_exp": { en: "years experience", zh: "年经验", ms: "tahun pengalaman" },
  "seller.reviews": { en: "reviews", zh: "条评价", ms: "ulasan" },
  "seller.crops_sold": { en: "Crops Sold", zh: "已售农产品", ms: "Tanaman Terjual" },
  "seller.rescued": { en: "Crops Rescued", zh: "拯救农产品", ms: "Tanaman Diselamatkan" },
  "seller.orders": { en: "Orders Completed", zh: "已完成订单", ms: "Pesanan Selesai" },
  "seller.listings": { en: "Crop Listings", zh: "农产品列表", ms: "Senarai Tanaman" },
  "seller.no_listings": { en: "No listings yet.", zh: "暂无列表。", ms: "Tiada senarai lagi." },
  "seller.reviews_title": { en: "Reviews & Ratings", zh: "评价与评分", ms: "Ulasan & Penilaian" },
  "seller.leave_review": { en: "Leave a review", zh: "留下评价", ms: "Tinggalkan ulasan" },
  "seller.review_placeholder": { en: "Share your experience...", zh: "分享您的经验...", ms: "Kongsi pengalaman anda..." },
  "seller.submit": { en: "Submit", zh: "提交", ms: "Hantar" },
  "seller.review_submitted": { en: "Review submitted! Thank you.", zh: "评价已提交！谢谢。", ms: "Ulasan dihantar! Terima kasih." },
  "seller.no_reviews": { en: "No reviews yet.", zh: "暂无评价。", ms: "Tiada ulasan lagi." },

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
