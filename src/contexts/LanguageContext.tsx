import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type Language = "en" | "zh" | "ms";

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.marketplace": { en: "Marketplace", zh: "市场", ms: "Pasaran" },
  "nav.dashboard": { en: "Dashboard", zh: "仪表板", ms: "Papan Pemuka" },
  "nav.cart": { en: "Cart", zh: "购物车", ms: "Troli" },
  "nav.login": { en: "Login", zh: "登录", ms: "Log Masuk" },
  "nav.logout": { en: "Logout", zh: "登出", ms: "Log Keluar" },
  "nav.meal_planner": { en: "Smart Kitchen", zh: "智能厨房", ms: "Dapur Pintar" },

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
  "auth.email_placeholder": { en: "you@example.com", zh: "you@example.com", ms: "you@example.com" },
  "auth.password": { en: "Password", zh: "密码", ms: "Kata Laluan" },
  "auth.password_placeholder": { en: "Enter your password", zh: "输入您的密码", ms: "Masukkan kata laluan anda" },
  "auth.login_btn": { en: "Login", zh: "登录", ms: "Log Masuk" },
  "auth.signup_btn": { en: "Sign Up", zh: "注册", ms: "Daftar" },
  "auth.no_account": { en: "Don't have an account?", zh: "没有账户？", ms: "Tiada akaun?" },
  "auth.has_account": { en: "Already have an account?", zh: "已有账户？", ms: "Sudah ada akaun?" },
  "auth.signup_success_title": { en: "Sign Up Successful!", zh: "注册成功！", ms: "Pendaftaran Berjaya!" },
  "auth.signup_success_desc": { en: "Your account has been created. Please log in to continue.", zh: "您的账户已创建。请登录以继续。", ms: "Akaun anda telah dicipta. Sila log masuk untuk meneruskan." },
  "auth.forgot_password": { en: "Forgot Password?", zh: "忘记密码？", ms: "Lupa Kata Laluan?" },

  // Forgot password
  "forgot.back_to_login": { en: "Back to Login", zh: "返回登录", ms: "Kembali ke Log Masuk" },
  "forgot.title": { en: "Forgot Password?", zh: "忘记密码？", ms: "Lupa Kata Laluan?" },
  "forgot.desc": { en: "Enter your email and we'll send you a verification code", zh: "输入您的邮箱，我们将发送验证码", ms: "Masukkan e-mel anda dan kami akan menghantar kod pengesahan" },
  "forgot.email_label": { en: "Email Address", zh: "邮箱地址", ms: "Alamat E-mel" },
  "forgot.email_placeholder": { en: "Enter your email", zh: "输入您的邮箱", ms: "Masukkan e-mel anda" },
  "forgot.send_btn": { en: "Send Verification Code", zh: "发送验证码", ms: "Hantar Kod Pengesahan" },
  "forgot.sending": { en: "Sending...", zh: "发送中...", ms: "Menghantar..." },
  "forgot.code_sent_title": { en: "Code Sent!", zh: "验证码已发送！", ms: "Kod Dihantar!" },
  "forgot.code_sent_desc": { en: "Please check your email for the verification code.", zh: "请检查您的邮箱获取验证码。", ms: "Sila semak e-mel anda untuk kod pengesahan." },

  // Verify code
  "verify.title": { en: "Verify Your Email", zh: "验证您的邮箱", ms: "Sahkan E-mel Anda" },
  "verify.desc": { en: "We've sent a 4-digit code to", zh: "我们已发送4位验证码到", ms: "Kami telah menghantar kod 4 digit ke" },
  "verify.enter_code": { en: "Enter Verification Code", zh: "输入验证码", ms: "Masukkan Kod Pengesahan" },
  "verify.verify_btn": { en: "Verify Code", zh: "验证", ms: "Sahkan Kod" },
  "verify.verifying": { en: "Verifying...", zh: "验证中...", ms: "Mengesahkan..." },
  "verify.success_title": { en: "Verified!", zh: "验证成功！", ms: "Berjaya Disahkan!" },
  "verify.success_desc": { en: "Your password has been reset. Please log in with your new credentials.", zh: "您的密码已重置。请使用新凭据登录。", ms: "Kata laluan anda telah ditetapkan semula. Sila log masuk dengan kelayakan baharu." },
  "verify.no_code": { en: "Didn't receive the code?", zh: "没有收到验证码？", ms: "Tidak terima kod?" },
  "verify.resend": { en: "Resend", zh: "重新发送", ms: "Hantar Semula" },

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
  "market.no_crops_desc": { en: "Try adjusting your search or filters to find fresh produce.", zh: "尝试调整搜索或筛选条件以查找新鲜农产品。", ms: "Cuba laraskan carian atau penapis anda untuk mencari hasil segar." },
  "market.no_crops_in_state": { en: "No crops in {state} yet", zh: "{state}暂无农产品", ms: "Tiada tanaman di {state} lagi" },
  "market.no_crops_in_state_desc": { en: "There are no farmers listing crops in {state} at the moment.", zh: "目前{state}没有农民列出农产品。", ms: "Tiada petani yang menyenaraikan tanaman di {state} buat masa ini." },
  "market.browse_all": { en: "← Browse all states", zh: "← 浏览所有州", ms: "← Layari semua negeri" },
  "market.all_sellers": { en: "All Sellers", zh: "所有卖家", ms: "Semua Penjual" },
  "market.all_reasons": { en: "All Imperfections", zh: "所有不完美类型", ms: "Semua Ketidaksempurnaan" },
  "market.bundles": { en: "Bundles Only", zh: "仅套装", ms: "Hanya Bundle" },
  "market.crops_count": { en: "crops", zh: "个农产品", ms: "tanaman" },
  "market.crop_count": { en: "crop", zh: "个农产品", ms: "tanaman" },

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
  "product.mystery_box": { en: "Mystery Box", zh: "神秘盒子", ms: "Kotak Misteri" },
  "product.surprise": { en: "Surprise!", zh: "惊喜！", ms: "Kejutan!" },
  "product.surprise_desc": { en: "Contents are a mystery —", zh: "内容是个谜 —", ms: "Kandungan adalah misteri —" },
  "product.rescued_produce": { en: "of rescued produce!", zh: "的拯救农产品！", ms: "hasil yang diselamatkan!" },
  "product.expired": { en: "Expired", zh: "已过期", ms: "Tamat Tempoh" },

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

  // Checkout
  "checkout.title": { en: "Checkout 📦", zh: "结账 📦", ms: "Pembayaran 📦" },
  "checkout.order_summary": { en: "Order Summary", zh: "订单摘要", ms: "Ringkasan Pesanan" },
  "checkout.subtotal": { en: "Subtotal", zh: "小计", ms: "Jumlah Kecil" },
  "checkout.delivery_method": { en: "Delivery Method", zh: "配送方式", ms: "Kaedah Penghantaran" },
  "checkout.self_pickup": { en: "Self Pickup", zh: "自取", ms: "Ambil Sendiri" },
  "checkout.free": { en: "Free", zh: "免费", ms: "Percuma" },
  "checkout.delivery": { en: "Delivery", zh: "配送", ms: "Penghantaran" },
  "checkout.pickup_slot": { en: "Pickup Time Slot", zh: "取货时间段", ms: "Slot Masa Pengambilan" },
  "checkout.add_custom_slot": { en: "Add custom slot e.g. 7:30 PM – 8:30 PM", zh: "添加自定义时段，例如 7:30 PM – 8:30 PM", ms: "Tambah slot tersuai cth. 7:30 PM – 8:30 PM" },
  "checkout.distance": { en: "Distance (km)", zh: "距离（公里）", ms: "Jarak (km)" },
  "checkout.delivery_fee": { en: "Delivery Fee", zh: "配送费", ms: "Yuran Penghantaran" },
  "checkout.payment_method": { en: "Payment Method", zh: "付款方式", ms: "Kaedah Pembayaran" },
  "checkout.cash": { en: "Cash", zh: "现金", ms: "Tunai" },
  "checkout.ewallet": { en: "E-Wallet", zh: "电子钱包", ms: "E-Dompet" },
  "checkout.bank": { en: "Bank Transfer", zh: "银行转账", ms: "Pindahan Bank" },
  "checkout.confirm": { en: "Confirm Order", zh: "确认订单", ms: "Sahkan Pesanan" },
  "checkout.confirmed": { en: "Order Confirmed! 🎉", zh: "订单已确认！🎉", ms: "Pesanan Disahkan! 🎉" },
  "checkout.thank_you": { en: "Thank you for rescuing imperfect crops!", zh: "感谢您拯救不完美的农产品！", ms: "Terima kasih kerana menyelamatkan tanaman tidak sempurna!" },
  "checkout.pickup_msg": { en: "Please head to the farm for pickup. Slot:", zh: "请前往农场取货。时间段：", ms: "Sila pergi ke ladang untuk mengambil. Slot:" },
  "checkout.delivery_msg": { en: "A driver will deliver your order", zh: "司机将配送您的订单", ms: "Pemandu akan menghantar pesanan anda" },
  "checkout.payment": { en: "Payment", zh: "付款", ms: "Pembayaran" },
  "checkout.continue_shopping": { en: "Continue Shopping", zh: "继续购物", ms: "Teruskan Membeli-belah" },
  "checkout.your_address": { en: "Delivery Address", zh: "配送地址", ms: "Alamat Penghantaran" },
  "checkout.deliver_to": { en: "Deliver to", zh: "送到", ms: "Hantar ke" },
  "checkout.box": { en: "box", zh: "盒", ms: "kotak" },
  "checkout.no_address": { en: "No address saved. Please add your address in profile.", zh: "未保存地址。请在个人资料中添加地址。", ms: "Tiada alamat disimpan. Sila tambah alamat di profil." },
  "checkout.add_address": { en: "Go to Profile →", zh: "前往个人资料 →", ms: "Pergi ke Profil →" },

  // Farmer dashboard
  "farmer.title": { en: "Seller Dashboard 🌾", zh: "卖家仪表板 🌾", ms: "Papan Pemuka Penjual 🌾" },
  "farmer.subtitle": { en: "Manage your crop listings & impact", zh: "管理您的农产品列表和影响", ms: "Urus senarai tanaman & impak anda" },
  "farmer.add_crop": { en: "Add Crop", zh: "添加农产品", ms: "Tambah Tanaman" },
  "farmer.add_bundle": { en: "Add Bundle", zh: "添加套装", ms: "Tambah Bundle" },
  "farmer.add_mystery_box": { en: "Mystery Box", zh: "神秘盒子", ms: "Kotak Misteri" },
  "farmer.listed": { en: "Crops Listed", zh: "已列出农产品", ms: "Tanaman Disenarai" },
  "farmer.sold": { en: "Crops Sold", zh: "已售农产品", ms: "Tanaman Terjual" },
  "farmer.rescued": { en: "Crops Rescued (kg)", zh: "拯救农产品 (公斤)", ms: "Tanaman Diselamatkan (kg)" },
  "farmer.waste": { en: "Waste Prevented", zh: "减少浪费", ms: "Pembaziran Dicegah" },
  "farmer.view_sold": { en: "View Crops Sold", zh: "查看已售农产品", ms: "Lihat Tanaman Terjual" },
  "farmer.view_sold.desc": { en: "See all completed sales & revenue", zh: "查看所有已完成的销售和收入", ms: "Lihat semua jualan & hasil" },
  "farmer.impact": { en: "🎉 Amazing Impact!", zh: "🎉 了不起的影响！", ms: "🎉 Impak Hebat!" },
  "farmer.impact_desc1": { en: "You helped rescue", zh: "您帮助拯救了", ms: "Anda membantu menyelamatkan" },
  "farmer.impact_desc2": { en: "of crops from food waste. That's equivalent to preventing", zh: "的农产品免于浪费。相当于减少了", ms: "tanaman daripada pembaziran makanan. Itu bersamaan dengan mencegah" },
  "farmer.impact_desc3": { en: "of CO₂ emissions!", zh: "的二氧化碳排放！", ms: "pelepasan CO₂!" },
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
  "farmer.mystery_added": { en: "Mystery Box added!", zh: "神秘盒子已添加！", ms: "Kotak Misteri ditambah!" },
  "farmer.listing_updated": { en: "Listing updated!", zh: "列表已更新！", ms: "Senarai dikemas kini!" },
  "farmer.listing_removed": { en: "Listing removed!", zh: "列表已删除！", ms: "Senarai dipadamkan!" },
  "farmer.create_bundle": { en: "Create Crop Bundle", zh: "创建农产品套装", ms: "Cipta Bundle Tanaman" },
  "farmer.bundle_name": { en: "Bundle Name", zh: "套装名称", ms: "Nama Bundle" },
  "farmer.bundle_name_placeholder": { en: "e.g. Rescue Veggie Box", zh: "例如 拯救蔬菜箱", ms: "cth. Kotak Sayur Diselamatkan" },
  "farmer.bundle_contents": { en: "Contents (comma separated)", zh: "内容（逗号分隔）", ms: "Kandungan (pisah dengan koma)" },
  "farmer.bundle_contents_placeholder": { en: "Carrots, Cucumbers, Tomatoes", zh: "胡萝卜、黄瓜、番茄", ms: "Lobak Merah, Timun, Tomato" },
  "farmer.bundle_weight": { en: "Total Weight (kg)", zh: "总重量（公斤）", ms: "Jumlah Berat (kg)" },
  "farmer.active": { en: "Active", zh: "活跃", ms: "Aktif" },
  "farmer.sold_out": { en: "Sold Out", zh: "售罄", ms: "Habis" },
  "farmer.expiry": { en: "Expiry", zh: "过期", ms: "Tamat Tempoh" },
  "farmer.very_fresh": { en: "Very Fresh", zh: "非常新鲜", ms: "Sangat Segar" },
  "farmer.use_soon": { en: "Use Soon", zh: "尽快食用", ms: "Guna Segera" },
  "farmer.expiring": { en: "Expiring", zh: "即将过期", ms: "Akan Tamat Tempoh" },
  "farmer.today": { en: "Today", zh: "今天", ms: "Hari Ini" },
  "farmer.days_ago": { en: "days ago", zh: "天前", ms: "hari lepas" },
  "farmer.day_ago": { en: "day ago", zh: "天前", ms: "hari lepas" },
  "farmer.crop_name_placeholder": { en: "e.g. Tomatoes (Imperfect Shape)", zh: "例如 番茄（形状不规则）", ms: "cth. Tomato (Bentuk Tidak Sempurna)" },
  "farmer.location_placeholder": { en: "e.g. Ladang Pak Ali", zh: "例如 Ladang Pak Ali", ms: "cth. Ladang Pak Ali" },

  // Farmer sold crops
  "sold.title": { en: "Crops Sold 📦", zh: "已售农产品 📦", ms: "Tanaman Terjual 📦" },
  "sold.orders": { en: "orders", zh: "个订单", ms: "pesanan" },
  "sold.kg_sold": { en: "kg sold", zh: "公斤已售", ms: "kg terjual" },
  "sold.earned": { en: "earned", zh: "已赚取", ms: "diperolehi" },
  "sold.total_sold": { en: "Total Sold", zh: "总售出", ms: "Jumlah Terjual" },
  "sold.revenue": { en: "Revenue", zh: "收入", ms: "Hasil" },

  // Mystery box
  "mystery.title": { en: "Add Mystery Box", zh: "添加神秘盒子", ms: "Tambah Kotak Misteri" },
  "mystery.name": { en: "Mystery Box Name", zh: "神秘盒子名称", ms: "Nama Kotak Misteri" },
  "mystery.name_placeholder": { en: "e.g. Surprise Veggie Box", zh: "例如 惊喜蔬菜盒", ms: "cth. Kotak Sayur Kejutan" },
  "mystery.description": { en: "Description (optional)", zh: "描述（可选）", ms: "Penerangan (pilihan)" },
  "mystery.desc_placeholder": { en: "A surprise mix of fresh rescued produce!", zh: "新鲜拯救农产品的惊喜组合！", ms: "Campuran kejutan hasil segar yang diselamatkan!" },
  "mystery.weight": { en: "Weight (kg)", zh: "重量（公斤）", ms: "Berat (kg)" },
  "mystery.price": { en: "Price (RM/box)", zh: "价格（RM/盒）", ms: "Harga (RM/kotak)" },
  "mystery.quantity": { en: "Quantity (boxes)", zh: "数量（盒）", ms: "Kuantiti (kotak)" },
  "mystery.expiry": { en: "Estimated Expiry Date", zh: "预计过期日期", ms: "Tarikh Tamat Tempoh Anggaran" },
  "mystery.info_title": { en: "Mystery Box Info", zh: "神秘盒子信息", ms: "Info Kotak Misteri" },
  "mystery.info_desc": { en: "Contents will not be shown to buyers — they'll get a surprise mix of your rescued produce! A cute mystery box image will be used automatically.", zh: "内容不会显示给买家——他们将获得您拯救农产品的惊喜组合！将自动使用可爱的神秘盒子图片。", ms: "Kandungan tidak akan ditunjukkan kepada pembeli — mereka akan mendapat campuran kejutan hasil anda yang diselamatkan! Imej kotak misteri yang comel akan digunakan secara automatik." },
  "mystery.add_btn": { en: "Add Mystery Box", zh: "添加神秘盒子", ms: "Tambah Kotak Misteri" },

  // Common
  "common.back_dashboard": { en: "Back to Dashboard", zh: "返回仪表板", ms: "Kembali ke Papan Pemuka" },
  "common.back": { en: "Back", zh: "返回", ms: "Kembali" },
  "common.profile": { en: "Profile", zh: "个人资料", ms: "Profil" },
  "common.photos_max": { en: "Photos (max 5)", zh: "照片（最多5张）", ms: "Foto (maks 5)" },
  "common.add": { en: "Add", zh: "添加", ms: "Tambah" },
  "common.select_state": { en: "Select state", zh: "选择州", ms: "Pilih negeri" },
  "common.describe_crop": { en: "Describe your crop or click 'Generate with AI'", zh: "描述您的农产品或点击"AI生成"", ms: "Huraikan tanaman anda atau klik 'Jana dengan AI'" },
  "common.generate_ai": { en: "Generate with AI", zh: "AI 生成", ms: "Jana dengan AI" },
  "common.generating": { en: "Generating...", zh: "生成中...", ms: "Menjana..." },
  "common.ai_generated": { en: "AI Generated", zh: "AI 生成", ms: "Dijana AI" },
  "common.view_details": { en: "View Details", zh: "查看详情", ms: "Lihat Butiran" },
  "common.hide_details": { en: "Hide Details", zh: "隐藏详情", ms: "Sembunyikan Butiran" },
  "common.description": { en: "Description", zh: "描述", ms: "Penerangan" },
  "common.describe_bundle": { en: "Describe your bundle or click 'Generate with AI'", zh: "描述您的套装或点击"AI生成"", ms: "Huraikan bundle anda atau klik 'Jana dengan AI'" },

  // Bundle page
  "bundle.price": { en: "Bundle Price (RM/box)", zh: "套装价格（RM/盒）", ms: "Harga Bundle (RM/kotak)" },
  "checkout.rate_per_km": { en: "RM1/km", zh: "RM1/公里", ms: "RM1/km" },

  // Profile
  "profile.title": { en: "My Profile", zh: "我的个人资料", ms: "Profil Saya" },
  "profile.basic_info": { en: "Basic Information", zh: "基本信息", ms: "Maklumat Asas" },
  "profile.full_name": { en: "Full Name", zh: "全名", ms: "Nama Penuh" },
  "profile.email": { en: "Email", zh: "邮箱", ms: "E-mel" },
  "profile.phone": { en: "Phone Number", zh: "电话号码", ms: "Nombor Telefon" },
  "profile.phone_placeholder": { en: "+60 12-345 6789", zh: "+60 12-345 6789", ms: "+60 12-345 6789" },
  "profile.location": { en: "Location / City", zh: "位置 / 城市", ms: "Lokasi / Bandar" },
  "profile.location_placeholder": { en: "e.g. Petaling Jaya", zh: "例如 八打灵再也", ms: "cth. Petaling Jaya" },
  "profile.address": { en: "Full Address", zh: "完整地址", ms: "Alamat Penuh" },
  "profile.address_placeholder": { en: "e.g. No. 12, Jalan SS2/24, Petaling Jaya", zh: "例如 八打灵再也 SS2/24 路 12 号", ms: "cth. No. 12, Jalan SS2/24, Petaling Jaya" },
  "profile.address_section": { en: "Address Information", zh: "地址信息", ms: "Maklumat Alamat" },
  "profile.seller_details": { en: "Seller Details", zh: "卖家详情", ms: "Butiran Penjual" },
  "profile.farm_name": { en: "Farm Name", zh: "农场名称", ms: "Nama Ladang" },
  "profile.years_exp": { en: "Years of Experience", zh: "经验年数", ms: "Tahun Pengalaman" },
  "profile.crops_grown": { en: "Crops Grown (comma separated)", zh: "种植的农产品（逗号分隔）", ms: "Tanaman Ditanam (pisah dengan koma)" },
  "profile.crops_placeholder": { en: "Tomatoes, Carrots, Chili", zh: "番茄、胡萝卜、辣椒", ms: "Tomato, Lobak, Cili" },
  "profile.state": { en: "State", zh: "州", ms: "Negeri" },
  "profile.driver_details": { en: "Driver Details", zh: "司机详情", ms: "Butiran Pemandu" },
  "profile.vehicle_type": { en: "Vehicle Type", zh: "车辆类型", ms: "Jenis Kenderaan" },
  "profile.license_no": { en: "License Number", zh: "车牌号码", ms: "Nombor Lesen" },
  "profile.license_placeholder": { en: "e.g. ABC1234", zh: "例如 ABC1234", ms: "cth. ABC1234" },
  "profile.preferences": { en: "Preferences", zh: "偏好设置", ms: "Keutamaan" },
  "profile.preferred_area": { en: "Preferred Pickup Area", zh: "首选取货区域", ms: "Kawasan Pengambilan Pilihan" },
  "profile.area_placeholder": { en: "e.g. Petaling Jaya", zh: "例如 八打灵再也", ms: "cth. Petaling Jaya" },
  "profile.save": { en: "Save Profile", zh: "保存个人资料", ms: "Simpan Profil" },
  "profile.updated": { en: "Profile updated!", zh: "个人资料已更新！", ms: "Profil dikemas kini!" },
  "profile.photo_updated": { en: "Profile photo updated!", zh: "头像已更新！", ms: "Foto profil dikemas kini!" },
  "profile.seller": { en: "Seller", zh: "卖家", ms: "Penjual" },
  "profile.driver": { en: "Driver", zh: "司机", ms: "Pemandu" },
  "profile.buyer": { en: "Buyer", zh: "买家", ms: "Pembeli" },
  "profile.farm_seller": { en: "Farm Seller", zh: "农场卖家", ms: "Penjual Ladang" },
  "profile.community_grower": { en: "Community Grower", zh: "社区种植者", ms: "Penanam Komuniti" },
  "profile.motorcycle": { en: "Motorcycle", zh: "摩托车", ms: "Motosikal" },
  "profile.car": { en: "Car", zh: "汽车", ms: "Kereta" },
  "profile.van": { en: "Van", zh: "面包车", ms: "Van" },
  "profile.truck": { en: "Truck", zh: "卡车", ms: "Lori" },

  // Buyer dashboard
  "buyer.title": { en: "Buyer Dashboard 🛒", zh: "买家仪表板 🛒", ms: "Papan Pemuka Pembeli 🛒" },
  "buyer.subtitle": { en: "Your orders & environmental impact", zh: "您的订单和环境影响", ms: "Pesanan & impak alam sekitar anda" },
  "buyer.orders_completed": { en: "Orders Completed", zh: "已完成订单", ms: "Pesanan Selesai" },
  "buyer.crops_purchased": { en: "Crops Purchased (kg)", zh: "已购买农产品（公斤）", ms: "Tanaman Dibeli (kg)" },
  "buyer.crops_rescued": { en: "Crops Rescued (kg)", zh: "拯救农产品（公斤）", ms: "Tanaman Diselamatkan (kg)" },
  "buyer.impact_title": { en: "Your Environmental Impact 🌍", zh: "您的环境影响 🌍", ms: "Impak Alam Sekitar Anda 🌍" },
  "buyer.impact_desc1": { en: "You helped rescue", zh: "您帮助拯救了", ms: "Anda membantu menyelamatkan" },
  "buyer.impact_desc2": { en: "of crops from food waste!", zh: "的农产品免于浪费！", ms: "tanaman daripada pembaziran makanan!" },
  "buyer.water_saved": { en: "Water Saved", zh: "节约用水", ms: "Air Dijimatkan" },
  "buyer.co2_prevented": { en: "CO₂ Prevented", zh: "减少二氧化碳", ms: "CO₂ Dicegah" },
  "buyer.meals_saved": { en: "Meals Saved", zh: "节省餐食", ms: "Hidangan Dijimatkan" },
  "buyer.recent_orders": { en: "Recent Orders", zh: "最近订单", ms: "Pesanan Terbaru" },
  "buyer.kg_rescued": { en: "kg rescued", zh: "公斤已拯救", ms: "kg diselamatkan" },

  // Driver dashboard
  "driver.title": { en: "Driver Dashboard 🚗", zh: "司机仪表板 🚗", ms: "Papan Pemuka Pemandu 🚗" },
  "driver.subtitle": { en: "Accept delivery jobs and earn", zh: "接受配送任务并赚钱", ms: "Terima kerja penghantaran dan dapatkan pendapatan" },
  "driver.deliveries_completed": { en: "Deliveries Completed", zh: "已完成配送", ms: "Penghantaran Selesai" },
  "driver.total_distance": { en: "Total Distance (km)", zh: "总距离（公里）", ms: "Jumlah Jarak (km)" },
  "driver.total_earnings": { en: "Total Earnings (RM)", zh: "总收入（RM）", ms: "Jumlah Pendapatan (RM)" },
  "driver.available_requests": { en: "Available Delivery Requests", zh: "可用的配送请求", ms: "Permintaan Penghantaran Tersedia" },
  "driver.pickup": { en: "Pickup", zh: "取货", ms: "Pengambilan" },
  "driver.dropoff": { en: "Drop-off", zh: "送达", ms: "Penghantaran" },
  "driver.distance": { en: "Distance", zh: "距离", ms: "Jarak" },
  "driver.accept": { en: "Accept Delivery", zh: "接受配送", ms: "Terima Penghantaran" },
  "driver.accepted": { en: "Accepted", zh: "已接受", ms: "Diterima" },
  "driver.accepted_msg": { en: "accepted!", zh: "已接受！", ms: "diterima!" },
  "driver.reject": { en: "Reject Delivery", zh: "拒绝配送", ms: "Tolak Penghantaran" },
  "driver.rejected_msg": { en: "rejected!", zh: "已拒绝！", ms: "ditolak!" },
  "driver.delivery_rejected": { en: "Delivery Rejected", zh: "配送已拒绝", ms: "Penghantaran Ditolak" },
  "driver.rejected_desc": { en: "This delivery has been rejected. Returning to dashboard.", zh: "此配送已被拒绝。返回仪表板。", ms: "Penghantaran ini telah ditolak. Kembali ke papan pemuka." },

  // Driver deliveries
  "driver.completed_title": { en: "Completed Deliveries ✅", zh: "已完成配送 ✅", ms: "Penghantaran Selesai ✅" },
  "driver.completed_count": { en: "You have completed {count} deliveries", zh: "您已完成 {count} 次配送", ms: "Anda telah melengkapkan {count} penghantaran" },
  "driver.back_summary": { en: "Back to Summary", zh: "返回摘要", ms: "Kembali ke Ringkasan" },

  // Driver delivery detail
  "driver.not_found": { en: "Delivery not found 😕", zh: "未找到配送 😕", ms: "Penghantaran tidak ditemui 😕" },
  "driver.completed": { en: "Completed", zh: "已完成", ms: "Selesai" },
  "driver.in_progress": { en: "In Progress", zh: "进行中", ms: "Dalam Proses" },
  "driver.item": { en: "Item", zh: "物品", ms: "Item" },
  "driver.pickup_location": { en: "Pickup Location", zh: "取货地点", ms: "Lokasi Pengambilan" },
  "driver.dropoff_location": { en: "Drop-off Location", zh: "送达地点", ms: "Lokasi Penghantaran" },
  "driver.farmer": { en: "Farmer", zh: "农民", ms: "Petani" },
  "driver.buyer": { en: "Buyer", zh: "买家", ms: "Pembeli" },
  "driver.delivery_fee": { en: "Delivery Fee", zh: "配送费", ms: "Yuran Penghantaran" },
  "driver.date": { en: "Date", zh: "日期", ms: "Tarikh" },

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
  "seller.not_found": { en: "Seller not found", zh: "未找到卖家", ms: "Penjual tidak ditemui" },
  "seller.back_marketplace": { en: "← Back to Marketplace", zh: "← 返回市场", ms: "← Kembali ke Pasaran" },

  // Footer
  "footer.desc": { en: "Rescuing imperfect crops, one harvest at a time. 🌿 Malaysia's marketplace against food waste.", zh: "拯救不完美的农产品，一次一个收获。🌿 马来西亚对抗食物浪费的市场。", ms: "Menyelamatkan tanaman tidak sempurna, satu tuaian pada satu masa. 🌿 Pasaran Malaysia menentang pembaziran makanan." },

  // Not found
  "notfound.title": { en: "Oops! Page not found", zh: "哎呀！找不到页面", ms: "Oops! Halaman tidak ditemui" },
  "notfound.back_home": { en: "Return to Home", zh: "返回首页", ms: "Kembali ke Laman Utama" },

  // Language
  "lang.en": { en: "English", zh: "英语", ms: "Bahasa Inggeris" },
  "lang.zh": { en: "Chinese", zh: "中文", ms: "Bahasa Cina" },
  "lang.ms": { en: "Malay", zh: "马来语", ms: "Bahasa Melayu" },
  "lang.select": { en: "Language", zh: "语言", ms: "Bahasa" },

  // Order Detail
  "order.details": { en: "Order Details", zh: "订单详情", ms: "Butiran Pesanan" },
  "order.not_found": { en: "Order not found", zh: "订单未找到", ms: "Pesanan tidak ditemui" },
  "order.back_dashboard": { en: "Back to Dashboard", zh: "返回仪表板", ms: "Kembali ke Papan Pemuka" },
  "order.date": { en: "Date", zh: "日期", ms: "Tarikh" },
  "order.status": { en: "Status", zh: "状态", ms: "Status" },
  "order.total_rescued": { en: "Total Rescued", zh: "总拯救量", ms: "Jumlah Diselamatkan" },
  "order.total": { en: "Total", zh: "总计", ms: "Jumlah" },
  "order.rate_crop": { en: "Rate this crop", zh: "为此农产品评分", ms: "Nilai tanaman ini" },
  "order.rated": { en: "Rated", zh: "已评分", ms: "Dinilai" },
  "order.thank_you": { en: "Thank you!", zh: "谢谢！", ms: "Terima kasih!" },
  "order.submit": { en: "Submit", zh: "提交", ms: "Hantar" },
  "order.rating_submitted": { en: "Rating submitted for", zh: "已为以下提交评分：", ms: "Penilaian dihantar untuk" },
  "order.review_placeholder": { en: "Share your feedback on this product...", zh: "分享您对此产品的反馈...", ms: "Kongsi maklum balas anda tentang produk ini..." },
  "order.submit_review": { en: "Submit Review", zh: "提交评价", ms: "Hantar Ulasan" },
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
