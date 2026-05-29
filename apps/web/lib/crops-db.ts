export type CropDetail = {
  id: string;
  name: string;
  scientificName: string;
  category: "buah" | "sayuran" | "perkebunan";
  image: string;
  dusunSentra: string;
  ketinggian: string;
  suhu: string;
  deskripsi: string;
  masaTanam: string;
  jarakTanam: string;
  hama: {
    nama: string;
    gejala: string;
    solusiOrganik: string;
  }[];
  priceTrends: {
    bulan: string;
    harga: number; // Rp per kg
  }[];
};

export const CROPS_DATABASE: CropDetail[] = [
  {
    id: "stroberi",
    name: "Stroberi Sembalun",
    scientificName: "Fragaria ananassa",
    category: "buah",
    image: "/crops/strawberry.png",
    dusunSentra: "Sembalun Lawang, Sembalun Bumbung",
    ketinggian: "1.000 - 1.500 mdpl",
    suhu: "16°C - 22°C",
    deskripsi: "Stroberi merupakan ikon agrowisata utama di Sembalun. Dengan suhu pegunungan sejuk dan penyinaran matahari yang cukup, stroberi Sembalun menghasilkan buah berwarna merah pekat, padat, dengan rasa manis keasaman yang khas.",
    masaTanam: "4 - 5 bulan (mulai panen)",
    jarakTanam: "30 x 40 cm (bedengan)",
    hama: [
      {
        nama: "Kutu Daun (Aphids)",
        gejala: "Daun mengeriting, tumbuh kerdil, dan terdapat cairan lengket jelaga di permukaan bawah daun.",
        solusiOrganik: "Semprotkan air rebusan daun sirsak atau daun mimba yang dicampur sedikit sabun kelapa cair sebagai pelekat."
      },
      {
        nama: "Ulat Grayak",
        gejala: "Daun buah berlubang-lubang tidak beraturan, terutama pada malam hari saat hama aktif makan.",
        solusiOrganik: "Gunakan larutan bawang putih dan cabai rawit yang dihaluskan, saring lalu semprotkan pada sore hari."
      },
      {
        nama: "Penyakit Busuk Buah (Botrytis cinerea)",
        gejala: "Muncul lapisan abu-abu berbulu pada permukaan buah stroberi yang matang atau bunga, menyebabkan buah busuk melunak.",
        solusiOrganik: "Lakukan perempelan daun tua untuk memperbaiki sirkulasi udara, semprotkan agen hayati Trichoderma sp. secara berkala."
      }
    ],
    priceTrends: [
      { bulan: "Jan", harga: 40000 },
      { bulan: "Feb", harga: 42000 },
      { bulan: "Mar", harga: 38000 },
      { bulan: "Apr", harga: 45000 },
      { bulan: "Mei", harga: 50000 },
      { bulan: "Jun", harga: 55000 },
      { bulan: "Jul", harga: 60000 },
      { bulan: "Agu", harga: 58000 },
      { bulan: "Sep", harga: 48000 },
      { bulan: "Okt", harga: 45000 },
      { bulan: "Nov", harga: 42000 },
      { bulan: "Des", harga: 55000 }
    ]
  },
  {
    id: "bawang_merah",
    name: "Bawang Merah Lombok",
    scientificName: "Allium cepa var. aggregatum",
    category: "sayuran",
    image: "/crops/shallot.png",
    dusunSentra: "Sembalun Lawang, Sembalun Bumbung",
    ketinggian: "800 - 1.300 mdpl",
    suhu: "18°C - 25°C",
    deskripsi: "Bawang merah varietas lokal yang dibudidayakan di Sembalun memiliki keunggulan berupa umbi yang padat, aroma yang sangat kuat, warna merah menyala, serta kadar air yang rendah sehingga lebih tahan lama disimpan pasca panen.",
    masaTanam: "60 - 70 hari",
    jarakTanam: "15 x 15 cm",
    hama: [
      {
        nama: "Ulat Bawang (Spodoptera exigua)",
        gejala: "Daun bawang berlubang dan di dalamnya terdapat ulat kecil hijau. Ujung daun tampak memutih transparan.",
        solusiOrganik: "Pasang perangkap lampu (light trap) di malam hari untuk menangkap ngengat dewasa, semprotkan ekstrak daun nimba."
      },
      {
        nama: "Penyakit Layu Fusarium (Moler)",
        gejala: "Daun bawang menguning, melintir layu tiba-tiba, dan pangkal batang membusuk berwarna putih keunguan.",
        solusiOrganik: "Gunakan benih sehat bebas patogen, aplikasi Trichoderma harzianum pada pupuk kompos sebelum tanam."
      },
      {
        nama: "Tritip (Thrips)",
        gejala: "Daun bawang bercak keperakan akibat cairan daun dihisap serangga kecil, lama-kelamaan daun layu mengering.",
        solusiOrganik: "Semprotkan air rebusan tembakau ditambah deterjen organik ringan secara berkala."
      }
    ],
    priceTrends: [
      { bulan: "Jan", harga: 11667 },
      { bulan: "Feb", harga: 12667 },
      { bulan: "Mar", harga: 15667 },
      { bulan: "Apr", harga: 20333 },
      { bulan: "Mei", harga: 29000 },
      { bulan: "Jun", harga: 26667 },
      { bulan: "Jul", harga: 15000 },
      { bulan: "Agu", harga: 15000 },
      { bulan: "Sep", harga: 14500 },
      { bulan: "Okt", harga: 16667 },
      { bulan: "Nov", harga: 23333 },
      { bulan: "Des", harga: 28667 }
    ]
  },
  {
    id: "kentang",
    name: "Kentang Granola Sembalun",
    scientificName: "Solanum tuberosum",
    category: "sayuran",
    image: "/crops/potato.png",
    dusunSentra: "Sembalun Bumbung",
    ketinggian: "1.100 - 1.400 mdpl",
    suhu: "15°C - 20°C",
    deskripsi: "Sembalun Bumbung merupakan salah satu produsen kentang Granola terbesar di NTB. Jenis kentang ini memiliki tekstur daging yang pulen kekuningan, kulit bersih, ukuran umbi yang besar, serta kandungan karbohidrat yang optimal karena tanah vulkanis andosol yang subur.",
    masaTanam: "90 - 100 hari",
    jarakTanam: "30 x 70 cm (guludan)",
    hama: [
      {
        nama: "Busuk Daun (Phytophthora infestans)",
        gejala: "Bercak basah kehitaman di tepi daun yang meluas dengan cepat disertai lapisan putih seperti beludru di bawah daun.",
        solusiOrganik: "Semprotkan biofungisida berbahan bakteri Bacillus subtilis atau ekstrak kunyit dicampur lengkuas."
      },
      {
        nama: "Layu Bakteri (Ralstonia solanacearum)",
        gejala: "Daun layu mendadak dimulai dari pucuk daun muda namun daun tetap berwarna hijau segar, umbi membusuk basah.",
        solusiOrganik: "Lakukan rotasi tanaman dengan tanaman non-solanaceae (jagung/padi), taburkan kapur pertanian dolomit untuk menaikkan pH tanah."
      },
      {
        nama: "Ulat Tanah (Agrotis ipsilon)",
        gejala: "Batang tanaman kentang muda terpotong/patah tepat di dekat permukaan tanah di pagi hari.",
        solusiOrganik: "Kumpulkan ulat secara manual di sekitar pangkal tanaman yang rusak pada malam hari, semprotkan air perasan air jahe."
      }
    ],
    priceTrends: [
      { bulan: "Jan", harga: 20000 },
      { bulan: "Feb", harga: 18333 },
      { bulan: "Mar", harga: 20000 },
      { bulan: "Apr", harga: 20000 },
      { bulan: "Mei", harga: 20000 },
      { bulan: "Jun", harga: 20000 },
      { bulan: "Jul", harga: 21333 },
      { bulan: "Agu", harga: 22333 },
      { bulan: "Sep", harga: 21333 },
      { bulan: "Okt", harga: 18667 },
      { bulan: "Nov", harga: 19000 },
      { bulan: "Des", harga: 18250 }
    ]
  },
  {
    id: "wortel",
    name: "Wortel Sembalun",
    scientificName: "Daucus carota",
    category: "sayuran",
    image: "/crops/carrot.png",
    dusunSentra: "Sajang, Sembalun Bumbung",
    ketinggian: "1.000 - 1.450 mdpl",
    suhu: "15°C - 21°C",
    deskripsi: "Wortel yang ditanam di lereng Sembalun terkenal sangat manis, renyah, dan memiliki warna orange cerah yang pekat (kaya akan beta-karoten). Tanahnya yang berpasir vulkanik gembur memungkinkan umbi wortel tumbuh lurus sempurna tanpa hambatan fisik.",
    masaTanam: "100 - 110 hari",
    jarakTanam: "5 x 20 cm (sebar di alur larikan)",
    hama: [
      {
        nama: "Kutu Daun Wortel",
        gejala: "Daun wortel menguning, mengering mengkerut, dan pertumbuhan umbi terhambat menjadi kerdil.",
        solusiOrganik: "Semprotkan air rebusan daun pepaya dicampur sedikit deterjen organik atau abu kayu."
      },
      {
        nama: "Ulat Daun",
        gejala: "Daun wortel tampak compang-camping termakan menyisakan tulang daun saja.",
        solusiOrganik: "Semprotkan larutan daun tembakau kering yang direndam semalaman."
      },
      {
        nama: "Busuk Akar Nematoda",
        gejala: "Akar wortel bercabang banyak, terdapat bintil-bintil kecil, dan umbi wortel tumbuh bengkok/cacat.",
        solusiOrganik: "Tumpang sari atau tanam bunga marigold (tagetes) di sekitar bedengan wortel sebagai nematisida alami."
      }
    ],
    priceTrends: [
      { bulan: "Jan", harga: 16800 },
      { bulan: "Feb", harga: 15000 },
      { bulan: "Mar", harga: 14400 },
      { bulan: "Apr", harga: 15200 },
      { bulan: "Mei", harga: 18200 },
      { bulan: "Jun", harga: 20000 },
      { bulan: "Jul", harga: 18400 },
      { bulan: "Agu", harga: 16000 },
      { bulan: "Sep", harga: 12400 },
      { bulan: "Okt", harga: 14000 },
      { bulan: "Nov", harga: 15000 },
      { bulan: "Des", harga: 14200 }
    ]
  },
  {
    id: "kopi",
    name: "Kopi Arabika Sembalun",
    scientificName: "Coffea arabica",
    category: "perkebunan",
    image: "/crops/coffee.png",
    dusunSentra: "Sajang",
    ketinggian: "900 - 1.400 mdpl",
    suhu: "16°C - 22°C",
    deskripsi: "Kopi Arabika Sembalun tumbuh subur di lereng bukit Sajang. Terkenal memiliki cita rasa kompleks dengan keasaman citrus yang bersih, aroma floral, dan bodi sedang yang khas karena ditanam di bawah naungan pohon hutan pegunungan vulkanik Rinjani.",
    masaTanam: "2 - 3 tahun (mulai berbuah komersial)",
    jarakTanam: "2.5 x 2.5 m",
    hama: [
      {
        nama: "Bubuk Buah Kopi (Hypothenemus hampei)",
        gejala: "Buah kopi berlubang kecil, rontok sebelum matang, dan biji kopi di dalamnya hancur membusuk.",
        solusiOrganik: "Pasang perangkap botol plastik berisi cairan penarik serangga berbahan campuran etanol, metanol, dan air (perbandingan 1:1:1)."
      },
      {
        nama: "Karat Daun (Hemileia vastatrix)",
        gejala: "Muncul bercak jingga seperti tepung di permukaan bawah daun kopi, menyebabkan daun gugur prematur.",
        solusiOrganik: "Lakukan pemangkasan pohon pelindung agar sinar matahari masuk, semprotkan biofungisida ekstrak daun sirih merah."
      },
      {
        nama: "Kutu Putih (Mealybugs)",
        gejala: "Kumpulan massa putih seperti kapas di ketiak daun, buah, atau pangkal tangkai bunga, menyebabkan buah mengerut.",
        solusiOrganik: "Gunakan semprotan larutan minyak neem/minyak goreng dicampur sabun cuci piring alami sebagai emulgator."
      }
    ],
    priceTrends: [
      { bulan: "Jan", harga: 135000 },
      { bulan: "Feb", harga: 55000 },
      { bulan: "Mar", harga: 180000 },
      { bulan: "Apr", harga: 185000 },
      { bulan: "Mei", harga: 200000 },
      { bulan: "Jun", harga: 230000 },
      { bulan: "Jul", harga: 150000 },
      { bulan: "Agu", harga: 145000 },
      { bulan: "Sep", harga: 170000 },
      { bulan: "Okt", harga: 150000 },
      { bulan: "Nov", harga: 155000 },
      { bulan: "Des", harga: 130000 }
    ]
  }
];
