import type { Category, StoreSettings } from "./types";

export const defaultSettings: StoreSettings = {
  brandName: "Smart craft corner",
  brandTagline: "বাংলাদেশি নারীদের জন্য লাক্সারি ফ্যাশন",
  brandTaglineEn: "Luxury fashion for Bangladeshi women",
  defaultMarkupPercent: 35,
  pricingMode: "markup",
  deliveryRules: [
    { id: "d1", district: "Dhaka", fee: 80, minOrderForFree: 7000, active: true },
    { id: "d2", district: "*", fee: 150, minOrderForFree: 10000, active: true },
  ],
  heroTitle: "সহজ luxury, refined style, modern Bangladesh.",
  heroTitleEn: "Effortless luxury, refined style, modern Bangladesh.",
  heroSubtitle: "বাংলাদেশি নারীদের জন্য curated premium fashion destination",
  heroSubtitleEn: "A curated premium fashion destination for Bangladeshi women",
  heroDescription:
    "Smart craft corner এমন একটি e-commerce experience যেখানে premium fabric, soft color palette, festive elegance, আর daily sophistication—সবকিছু একসাথে পাওয়া যায়।",
  heroDescriptionEn:
    "Smart craft corner is an e-commerce experience where premium fabric, a soft color palette, festive elegance, and daily sophistication come together.",
  heroCtaPrimaryLabel: "কালেকশন দেখুন",
  heroCtaPrimaryLabelEn: "Shop collections",
  heroCtaPrimaryHref: "/collections",
  heroCtaSecondaryLabel: "ফিচার্ড প্রোডাক্ট",
  heroCtaSecondaryLabelEn: "Featured product",
  heroCtaSecondaryHref: "/collections",
  heroStat1Value: "150+",
  heroStat1Label: "কিউরেটেড লাক্সারি পিস",
  heroStat1LabelEn: "Curated luxury pieces",
  heroStat2Value: "৬৪ জেলা",
  heroStat2Label: "সারা দেশে ডেলিভারি",
  heroStat2LabelEn: "Nationwide delivery",
  heroStat3Value: "4.9/5",
  heroStat3Label: "কাস্টমার রেটিং",
  heroStat3LabelEn: "Customer rating",
  contactEmail: "hello@smartcraftcorner.com",
  contactPhone: "+880 1XXX-XXXXXX",
  whatsapp: "8801700000000",
  supportNote: "ঢাকা ডেলিভারি + সারা দেশে কুরিয়ার",
  supportNoteEn: "Dhaka delivery + nationwide courier",
  facebookUrl: "",
  instagramUrl: "",
  footerText:
    "বাংলাদেশি নারীদের জন্য curated luxury fashion—effortless browsing, premium presentation, এবং trusted delivery experience।",
  footerTextEn:
    "Curated luxury fashion for Bangladeshi women—effortless browsing, premium presentation, and trusted delivery.",
  aboutTitle: "বাংলাদেশি নারীদের জন্য স্বাভাবিক লাক্সারি",
  aboutTitleEn: "Luxury that feels natural for Bangladeshi women",
  aboutSubtitle: "আমাদের গল্প",
  aboutSubtitleEn: "Our story",
  aboutText:
    "Smart craft corner শুরু হয়েছিল একটি সহজ বিশ্বাস থেকে—premium fashion-এর experience বাংলাদেশি নারীদের কাছে সহজ ও elegant করে তোলা।",
  aboutTextEn:
    "Smart craft corner began with a simple belief—making premium fashion feel easy and elegant for Bangladeshi women.",
  aboutPillars: [
    {
      title: "কিউরেটেড, crowded নয়",
      body: "আমরা quantity-র চেয়ে quality, fabric feel, এবং styling clarity-তে focus করি।",
    },
    {
      title: "বাংলাদেশ-first সার্ভিস",
      body: "COD, bKash, Nagad, ঢাকা fast delivery, এবং nationwide courier support standard।",
    },
    {
      title: "নারী-first অভিজ্ঞতা",
      body: "Size guidance, styling help, festive packaging, এবং thoughtful post-purchase care।",
    },
  ],
  aboutPillarsEn: [
    {
      title: "Curated, not crowded",
      body: "We focus on quality, fabric feel, and styling clarity over quantity.",
    },
    {
      title: "Bangladesh-first service",
      body: "COD, bKash, Nagad, fast Dhaka delivery, and nationwide courier support are standard.",
    },
    {
      title: "Women-first experience",
      body: "Size guidance, styling help, festive packaging, and thoughtful post-purchase care.",
    },
  ],
  freeShippingNote: "নির্দিষ্ট অর্ডারে ফ্রি ডেলিভারি",
  freeShippingNoteEn: "Free delivery on selected orders",
  announcementEnabled: false,
  announcementText: "",
  announcementTextEn: "",
  featuresTitle: "লাক্সারি জটিল হওয়ার দরকার নেই",
  featuresTitleEn: "Luxury doesn't have to feel complicated",
  featuresBody:
    "এই স্টোরের UI, product selection, payment options, এবং post-purchase communication—সবকিছু এমনভাবে সাজানো যাতে high-end shopping feel থাকে, কিন্তু ব্যবহার করা একদম সহজ হয়।",
  featuresBodyEn:
    "UI, product selection, payment options, and post-purchase communication are designed for a high-end feel that's still easy to use.",
  serviceHighlights: [
    "ঢাকা সিটিতে দ্রুত ডেলিভারি এবং সারা বাংলাদেশে কুরিয়ার সাপোর্ট",
    "Cash on Delivery, bKash, Nagad এবং কার্ড পেমেন্ট",
    "সাইজ গাইড, স্টাইলিং হেল্প, এবং WhatsApp কনসাল্টেশন",
    "গিফট বক্স, ফেস্টিভ প্যাকেজিং, এবং curated bundle offers",
  ],
  serviceHighlightsEn: [
    "Fast Dhaka delivery and nationwide courier support",
    "Cash on Delivery, bKash, Nagad and card payments",
    "Size guide, styling help, and WhatsApp consultation",
    "Gift boxes, festive packaging, and curated bundle offers",
  ],
  testimonials: [],
  faqs: [
    {
      question: "সাইজ ঠিকমতো বুঝবো কীভাবে?",
      answer:
        "প্রতিটি প্রোডাক্টের সাথে detailed size chart, fabric note, এবং fitting suggestion দেওয়া আছে। চাইলে WhatsApp styling support-ও পাওয়া যাবে।",
    },
    {
      question: "রিটার্ন বা এক্সচেঞ্জ আছে?",
      answer:
        "ডেলিভারির ৩ দিনের মধ্যে size exchange support থাকবে, আর damaged item হলে priority replacement করা হবে।",
    },
    {
      question: "বিয়ের/ফেস্টিভ collections কি custom order করা যাবে?",
      answer:
        "হ্যাঁ, selected festive pieces-এর জন্য custom measurement consultation এবং preorder slot রাখা হয়েছে।",
    },
  ],
  faqsEn: [
    {
      question: "How do I choose the right size?",
      answer:
        "Every product includes a detailed size chart, fabric notes, and fitting suggestions. WhatsApp styling support is also available.",
    },
    {
      question: "Do you offer returns or exchanges?",
      answer:
        "Size exchange is available within 3 days of delivery, and damaged items get priority replacement.",
    },
    {
      question: "Can festive collections be custom ordered?",
      answer:
        "Yes — selected festive pieces include custom measurement consultation and preorder slots.",
    },
  ],
  showCouponsOnHome: true,
  showNewProducts: true,
  showOffers: true,
  showFeatures: true,
  showTestimonials: false,
  showFaq: true,
  metaTitle: "Smart craft corner — বাংলাদেশি নারীদের লাক্সারি ফ্যাশন",
  metaTitleEn: "Smart craft corner — Luxury fashion for Bangladeshi women",
  metaDescription:
    "প্রিমিয়াম জামদানি, ফেস্টিভ ও ডেইলি এলিগেন্স কালেকশন—সারা বাংলাদেশে ডেলিভারি।",
  metaDescriptionEn:
    "Premium jamdani, festive, and daily elegance collections with nationwide delivery across Bangladesh.",
  promoBanners: [],
  availableSizes: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"],
  websiteChatEnabled: true,
  vipEnabled: true,
  vipMinSpend: 20000,
  vipDiscountPercent: 5,
  adminUsername: "founder",
  adminEmail: "hello@smartcraftcorner.com",
  adminPhone: "8801700000000",
};

export const defaultCategories: Category[] = [
  {
    id: "jamdani",
    slug: "jamdani",
    title: "Luxury Jamdani",
    titleBn: "লাক্সারি জামদানি",
    subtitle: "ঐতিহ্য ও আধুনিক কাটের ফিউশন",
    accent: "from-[#f5e8dc] via-[#fffaf6] to-[#ead5c3]",
    description: "Hand-inspired jamdani textures and modern silhouettes.",
  },
  {
    id: "festive",
    slug: "festive",
    title: "Modest Festive Edit",
    titleBn: "মডেস্ট ফেস্টিভ এডিট",
    subtitle: "ঈদ, দাওয়াত, হলুদ, রিসেপশন",
    accent: "from-[#e6d7cf] via-[#f8efea] to-[#d9c0b3]",
    description: "Statement festive pieces with modest coverage.",
  },
  {
    id: "daily",
    slug: "daily",
    title: "Daily Elegance",
    titleBn: "ডেইলি এলিগেন্স",
    subtitle: "অফিস, ইউনিভার্সিটি, ক্যাফে ডে",
    accent: "from-[#efe4dd] via-[#fffaf7] to-[#e3d0c5]",
    description: "Effortless premium daywear.",
  },
];
