// Dynamic content translations for crop names, states, locations, descriptions, etc.
import { Language } from "@/contexts/LanguageContext";

const contentMap: Record<string, Record<Language, string>> = {
  // === CROP NAMES ===
  "Tomatoes (Imperfect Shape)": { en: "Tomatoes (Imperfect Shape)", zh: "番茄（形状不规则）", ms: "Tomato (Bentuk Tidak Sempurna)" },
  "Carrots (Imperfect Shape)": { en: "Carrots (Imperfect Shape)", zh: "胡萝卜（形状不规则）", ms: "Lobak Merah (Bentuk Tidak Sempurna)" },
  "Cucumbers (Oversized)": { en: "Cucumbers (Oversized)", zh: "黄瓜（超大）", ms: "Timun (Terlalu Besar)" },
  "Apples (Minor Blemishes)": { en: "Apples (Minor Blemishes)", zh: "苹果（轻微瑕疵）", ms: "Epal (Kecacatan Kecil)" },
  "Corn (Irregular Kernels)": { en: "Corn (Irregular Kernels)", zh: "玉米（颗粒不规则）", ms: "Jagung (Biji Tidak Sekata)" },
  "Bell Peppers (Mixed Colors)": { en: "Bell Peppers (Mixed Colors)", zh: "彩椒（混合颜色）", ms: "Lada Benggala (Warna Campuran)" },
  "Bananas (Short & Stubby)": { en: "Bananas (Short & Stubby)", zh: "香蕉（短小）", ms: "Pisang (Pendek & Gempal)" },
  "Spinach (Leafy Overgrowth)": { en: "Spinach (Leafy Overgrowth)", zh: "菠菜（叶片过大）", ms: "Bayam (Daun Terlalu Besar)" },
  "Cherry Tomatoes": { en: "Cherry Tomatoes", zh: "樱桃番茄", ms: "Tomato Ceri" },
  "Fresh Chili Padi": { en: "Fresh Chili Padi", zh: "新鲜小辣椒", ms: "Cili Padi Segar" },
  "Rescue Veggie Box": { en: "Rescue Veggie Box", zh: "拯救蔬菜箱", ms: "Kotak Sayur Diselamatkan" },
  "Garden Fresh Mix": { en: "Garden Fresh Mix", zh: "花园新鲜组合", ms: "Campuran Segar Taman" },
  "Surprise Veggie Box": { en: "Surprise Veggie Box", zh: "惊喜蔬菜箱", ms: "Kotak Sayur Kejutan" },
  "Mystery Fruit Box": { en: "Mystery Fruit Box", zh: "神秘水果箱", ms: "Kotak Buah Misteri" },

  // === DESCRIPTIONS ===
  "Slightly oddly shaped but perfectly ripe and delicious tomatoes.": { en: "Slightly oddly shaped but perfectly ripe and delicious tomatoes.", zh: "形状略有不同，但完全成熟且美味的番茄。", ms: "Bentuk sedikit berbeza tetapi masak sempurna dan tomato yang sedap." },
  "Curvy carrots that taste just as sweet.": { en: "Curvy carrots that taste just as sweet.", zh: "弯曲的胡萝卜，味道一样甜。", ms: "Lobak merah bengkok yang rasanya tetap manis." },
  "Bigger than usual but still crispy and refreshing.": { en: "Bigger than usual but still crispy and refreshing.", zh: "比平常大，但仍然脆嫩清爽。", ms: "Lebih besar daripada biasa tetapi masih rangup dan menyegarkan." },
  "Small surface marks but incredibly sweet and juicy.": { en: "Small surface marks but incredibly sweet and juicy.", zh: "表面有小标记，但非常甜且多汁。", ms: "Tanda kecil di permukaan tetapi sangat manis dan berair." },
  "Some gaps in kernels but still sweet.": { en: "Some gaps in kernels but still sweet.", zh: "颗粒有些间隙，但仍然甜。", ms: "Sedikit ruang antara biji tetapi masih manis." },
  "Slight color variations but bursting with flavor.": { en: "Slight color variations but bursting with flavor.", zh: "颜色略有变化，但风味十足。", ms: "Sedikit variasi warna tetapi penuh rasa." },
  "Shorter than average but extra sweet Malaysian bananas.": { en: "Shorter than average but extra sweet Malaysian bananas.", zh: "比一般短，但特别甜的马来西亚香蕉。", ms: "Lebih pendek daripada biasa tetapi pisang Malaysia yang lebih manis." },
  "Leaves grew a bit large but extra nutritious.": { en: "Leaves grew a bit large but extra nutritious.", zh: "叶子长得有点大，但营养更丰富。", ms: "Daun tumbuh agak besar tetapi lebih berkhasiat." },
  "Home-grown cherry tomatoes, slightly irregular.": { en: "Home-grown cherry tomatoes, slightly irregular.", zh: "自家种植的樱桃番茄，形状稍微不规则。", ms: "Tomato ceri ditanam di rumah, sedikit tidak sekata." },
  "Spicy chili padi grown in the backyard.": { en: "Spicy chili padi grown in the backyard.", zh: "后院种植的辣味小辣椒。", ms: "Cili padi pedas ditanam di halaman belakang." },
  "A mixed box of rescued veggies — perfect for weekly meals!": { en: "A mixed box of rescued veggies — perfect for weekly meals!", zh: "拯救蔬菜的混合箱——每周餐食的完美选择！", ms: "Kotak campuran sayur yang diselamatkan — sesuai untuk hidangan mingguan!" },
  "A mix of home-grown herbs and veggies.": { en: "A mix of home-grown herbs and veggies.", zh: "自家种植的香草和蔬菜的混合。", ms: "Campuran herba dan sayur ditanam di rumah." },
  "A surprise mix of fresh rescued veggies — you never know what you'll get!": { en: "A surprise mix of fresh rescued veggies — you never know what you'll get!", zh: "新鲜拯救蔬菜的惊喜组合——你永远不知道会得到什么！", ms: "Campuran kejutan sayur segar yang diselamatkan — anda tidak tahu apa yang akan dapat!" },
  "A delightful surprise of rescued fruits — sweet deals, sweeter taste!": { en: "A delightful surprise of rescued fruits — sweet deals, sweeter taste!", zh: "拯救水果的愉快惊喜——甜蜜的交易，更甜的味道！", ms: "Kejutan yang menggembirakan buah-buahan yang diselamatkan — tawaran manis, rasa lebih manis!" },

  // === MALAYSIAN STATES ===
  "Pahang": { en: "Pahang", zh: "彭亨", ms: "Pahang" },
  "Perak": { en: "Perak", zh: "霹雳", ms: "Perak" },
  "Kelantan": { en: "Kelantan", zh: "吉兰丹", ms: "Kelantan" },
  "Sabah": { en: "Sabah", zh: "沙巴", ms: "Sabah" },
  "Johor": { en: "Johor", zh: "柔佛", ms: "Johor" },
  "Selangor": { en: "Selangor", zh: "雪兰莪", ms: "Selangor" },
  "Penang": { en: "Penang", zh: "槟城", ms: "Pulau Pinang" },
  "Kedah": { en: "Kedah", zh: "吉打", ms: "Kedah" },
  "Terengganu": { en: "Terengganu", zh: "登嘉楼", ms: "Terengganu" },
  "Melaka": { en: "Melaka", zh: "马六甲", ms: "Melaka" },
  "Negeri Sembilan": { en: "Negeri Sembilan", zh: "森美兰", ms: "Negeri Sembilan" },
  "Perlis": { en: "Perlis", zh: "玻璃市", ms: "Perlis" },
  "Sarawak": { en: "Sarawak", zh: "砂拉越", ms: "Sarawak" },
  "Kuala Lumpur": { en: "Kuala Lumpur", zh: "吉隆坡", ms: "Kuala Lumpur" },
  "Putrajaya": { en: "Putrajaya", zh: "布城", ms: "Putrajaya" },
  "Labuan": { en: "Labuan", zh: "纳闽", ms: "Labuan" },
  "All": { en: "All", zh: "全部", ms: "Semua" },

  // === FARM LOCATIONS ===
  "Ladang Pak Ali, Cameron Highlands": { en: "Ladang Pak Ali, Cameron Highlands", zh: "巴里叔叔农场，金马仑高原", ms: "Ladang Pak Ali, Cameron Highlands" },
  "Kebun Mak Intan, Tanah Rata": { en: "Kebun Mak Intan, Tanah Rata", zh: "茵坦婶婶果园，丹那拉打", ms: "Kebun Mak Intan, Tanah Rata" },
  "Ladang Hijau, Ipoh": { en: "Ladang Hijau, Ipoh", zh: "绿色农场，怡保", ms: "Ladang Hijau, Ipoh" },
  "Kebun Buah, Cameron Highlands": { en: "Kebun Buah, Cameron Highlands", zh: "水果园，金马仑高原", ms: "Kebun Buah, Cameron Highlands" },
  "Ladang Jagung, Kota Bharu": { en: "Ladang Jagung, Kota Bharu", zh: "玉米农场，哥打巴鲁", ms: "Ladang Jagung, Kota Bharu" },
  "Kebun Organik, Kundasang": { en: "Kebun Organik, Kundasang", zh: "有机果园，昆达山", ms: "Kebun Organik, Kundasang" },
  "Ladang Pisang, Johor Bahru": { en: "Ladang Pisang, Johor Bahru", zh: "香蕉农场，新山", ms: "Ladang Pisang, Johor Bahru" },
  "Kebun Sayur, Serdang": { en: "Kebun Sayur, Serdang", zh: "蔬菜园，沙登", ms: "Kebun Sayur, Serdang" },
  "Home Garden, Petaling Jaya": { en: "Home Garden, Petaling Jaya", zh: "家庭花园，八打灵再也", ms: "Taman Rumah, Petaling Jaya" },
  "Home Garden, Kajang": { en: "Home Garden, Kajang", zh: "家庭花园，加影", ms: "Taman Rumah, Kajang" },

  // === FARMER NAMES ===
  "Pak Ali": { en: "Pak Ali", zh: "阿里叔叔", ms: "Pak Ali" },
  "Mak Intan": { en: "Mak Intan", zh: "茵坦婶婶", ms: "Mak Intan" },
  "Encik Hassan": { en: "Encik Hassan", zh: "哈桑先生", ms: "Encik Hassan" },
  "Puan Siti": { en: "Puan Siti", zh: "西蒂女士", ms: "Puan Siti" },
  "Pak Murad": { en: "Pak Murad", zh: "慕拉叔叔", ms: "Pak Murad" },
  "Encik Raju": { en: "Encik Raju", zh: "拉朱先生", ms: "Encik Raju" },
  "Puan Aminah": { en: "Puan Aminah", zh: "阿米娜女士", ms: "Puan Aminah" },
  "Encik Lim": { en: "Encik Lim", zh: "林先生", ms: "Encik Lim" },
  "Sarah": { en: "Sarah", zh: "莎拉", ms: "Sarah" },
  "Amir": { en: "Amir", zh: "阿米尔", ms: "Amir" },

  // === BUNDLE CONTENTS (individual items) ===
  "Carrots": { en: "Carrots", zh: "胡萝卜", ms: "Lobak Merah" },
  "Cucumbers": { en: "Cucumbers", zh: "黄瓜", ms: "Timun" },
  "Tomatoes": { en: "Tomatoes", zh: "番茄", ms: "Tomato" },
  "Eggplants": { en: "Eggplants", zh: "茄子", ms: "Terung" },
  "Mint": { en: "Mint", zh: "薄荷", ms: "Pudina" },
  "Basil": { en: "Basil", zh: "罗勒", ms: "Selasih" },
  "Chili": { en: "Chili", zh: "辣椒", ms: "Cili" },

  // === DELIVERY DATA ===
  "Tomatoes (5kg)": { en: "Tomatoes (5kg)", zh: "番茄（5公斤）", ms: "Tomato (5kg)" },
  "Carrots (3kg)": { en: "Carrots (3kg)", zh: "胡萝卜（3公斤）", ms: "Lobak Merah (3kg)" },
  "Corn (10kg)": { en: "Corn (10kg)", zh: "玉米（10公斤）", ms: "Jagung (10kg)" },
  "Spinach (4kg)": { en: "Spinach (4kg)", zh: "菠菜（4公斤）", ms: "Bayam (4kg)" },
  "Tomatoes (8kg)": { en: "Tomatoes (8kg)", zh: "番茄（8公斤）", ms: "Tomato (8kg)" },
  "Chillies (2kg)": { en: "Chillies (2kg)", zh: "辣椒（2公斤）", ms: "Cili (2kg)" },

  // Driver locations
  "Taman Melawati, KL": { en: "Taman Melawati, KL", zh: "美拉华蒂花园，吉隆坡", ms: "Taman Melawati, KL" },
  "Damansara, KL": { en: "Damansara, KL", zh: "达马萨拉，吉隆坡", ms: "Damansara, KL" },
  "Kuantan, Pahang": { en: "Kuantan, Pahang", zh: "关丹，彭亨", ms: "Kuantan, Pahang" },
  "Subang Jaya, Selangor": { en: "Subang Jaya, Selangor", zh: "梳邦再也，雪兰莪", ms: "Subang Jaya, Selangor" },
  "Petaling Jaya, Selangor": { en: "Petaling Jaya, Selangor", zh: "八打灵再也，雪兰莪", ms: "Petaling Jaya, Selangor" },
  "Kuala Terengganu": { en: "Kuala Terengganu", zh: "瓜拉登嘉楼", ms: "Kuala Terengganu" },
  "Kebun Tomat, Cameron Highlands": { en: "Kebun Tomat, Cameron Highlands", zh: "番茄园，金马仑高原", ms: "Kebun Tomat, Cameron Highlands" },
  "Ladang Cili, Kota Bharu": { en: "Ladang Cili, Kota Bharu", zh: "辣椒农场，哥打巴鲁", ms: "Ladang Cili, Kota Bharu" },

  // Buyer dashboard order items
  "Tomatoes, Carrots": { en: "Tomatoes, Carrots", zh: "番茄、胡萝卜", ms: "Tomato, Lobak Merah" },
  "Corn, Cucumbers": { en: "Corn, Cucumbers", zh: "玉米、黄瓜", ms: "Jagung, Timun" },
  "Apples, Bell Peppers": { en: "Apples, Bell Peppers", zh: "苹果、彩椒", ms: "Epal, Lada Benggala" },
  "Bananas, Spinach": { en: "Bananas, Spinach", zh: "香蕉、菠菜", ms: "Pisang, Bayam" },
  "Tomatoes, Corn": { en: "Tomatoes, Corn", zh: "番茄、玉米", ms: "Tomato, Jagung" },

  // Order statuses
  "Delivered": { en: "Delivered", zh: "已送达", ms: "Dihantar" },
  "Picked Up": { en: "Picked Up", zh: "已取货", ms: "Diambil" },
};

export function translateContent(text: string, language: Language): string {
  if (language === "en") return text;
  return contentMap[text]?.[language] ?? text;
}

// Translate an array of strings (e.g., bundleContents)
export function translateContentArray(items: string[], language: Language): string[] {
  return items.map((item) => translateContent(item, language));
}
