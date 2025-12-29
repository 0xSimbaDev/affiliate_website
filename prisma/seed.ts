import { PrismaClient, ContentStatus, ArticleType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'

// Load environment variables
config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // ============================================
  // GAMING NICHE
  // ============================================
  const gamingNiche = await prisma.niche.upsert({
    where: { slug: 'gaming' },
    update: {},
    create: {
      slug: 'gaming',
      name: 'Gaming',
      description: 'Gaming affiliate niche covering hardware, peripherals, and gaming accessories.',
      productTypes: [
        { slug: 'keyboard', label: 'Keyboard', labelPlural: 'Keyboards', icon: 'Keyboard' },
        { slug: 'mouse', label: 'Mouse', labelPlural: 'Mice', icon: 'Mouse' },
        { slug: 'headset', label: 'Headset', labelPlural: 'Headsets', icon: 'Headphones' },
        { slug: 'monitor', label: 'Monitor', labelPlural: 'Monitors', icon: 'Monitor' },
        { slug: 'chair', label: 'Chair', labelPlural: 'Chairs', icon: 'Armchair' },
      ],
      categoryTypes: [
        { slug: 'product-type', label: 'Product Type', labelPlural: 'Product Types', hierarchical: false },
        { slug: 'brand', label: 'Brand', labelPlural: 'Brands', hierarchical: false },
      ],
      partners: [
        { name: 'Amazon', slug: 'amazon', commission: '4-10%', cookieDuration: 24 },
        { name: 'Best Buy', slug: 'bestbuy', commission: '1-5%', cookieDuration: 1 },
        { name: 'Newegg', slug: 'newegg', commission: '2-4%', cookieDuration: 7 },
      ],
    },
  })

  console.log('Created niche:', gamingNiche.name)

  // ============================================
  // TECH NICHE
  // ============================================
  const techNiche = await prisma.niche.upsert({
    where: { slug: 'tech' },
    update: {},
    create: {
      slug: 'tech',
      name: 'Technology',
      description: 'Tech affiliate niche covering laptops, phones, tablets, smartwatches, and accessories.',
      productTypes: [
        { slug: 'laptop', label: 'Laptop', labelPlural: 'Laptops', icon: 'Laptop' },
        { slug: 'phone', label: 'Phone', labelPlural: 'Phones', icon: 'Smartphone' },
        { slug: 'tablet', label: 'Tablet', labelPlural: 'Tablets', icon: 'Tablet' },
        { slug: 'smartwatch', label: 'Smartwatch', labelPlural: 'Smartwatches', icon: 'Watch' },
        { slug: 'accessory', label: 'Accessory', labelPlural: 'Accessories', icon: 'Cable' },
      ],
      categoryTypes: [
        { slug: 'category', label: 'Category', labelPlural: 'Categories', hierarchical: true },
        { slug: 'brand', label: 'Brand', labelPlural: 'Brands', hierarchical: false },
      ],
      partners: [
        { name: 'Amazon', slug: 'amazon', commission: '4-10%', cookieDuration: 24 },
        { name: 'B&H Photo', slug: 'bhphoto', commission: '2-8%', cookieDuration: 30 },
        { name: 'Apple', slug: 'apple', commission: '1-7%', cookieDuration: 7 },
      ],
    },
  })

  console.log('Created niche:', techNiche.name)

  // ============================================
  // GAMING SITE
  // ============================================
  const gamingSite = await prisma.site.upsert({
    where: { slug: 'demo-gaming' },
    update: { contentSlug: 'reviews' },
    create: {
      nicheId: gamingNiche.id,
      slug: 'demo-gaming',
      name: 'ProGamer Hub',
      domain: 'demo-gaming.localhost',
      tagline: 'Level Up Your Gaming Experience',
      description: 'Your ultimate destination for gaming hardware reviews, deals, and recommendations.',
      theme: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#06B6D4',
        accentColor: '#F59E0B',
      },
      social: {
        twitter: 'progamerhub',
        youtube: 'progamerhub',
        discord: 'progamerhub',
      },
      contentSlug: 'reviews',
      isActive: true,
    },
  })

  console.log('Created site:', gamingSite.name)

  // ============================================
  // TECH SITE
  // ============================================
  const techSite = await prisma.site.upsert({
    where: { slug: 'demo-tech' },
    update: { contentSlug: 'articles' },
    create: {
      nicheId: techNiche.id,
      slug: 'demo-tech',
      name: 'TechFlow',
      domain: 'demo-tech.localhost',
      tagline: 'Smart Tech for Modern Life',
      description: 'Discover the best tech products with honest reviews and expert recommendations.',
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#EC4899',
      },
      social: {
        twitter: 'techflow',
        youtube: 'techflow',
        linkedin: 'techflow',
      },
      contentSlug: 'articles',
      isActive: true,
    },
  })

  console.log('Created site:', techSite.name)

  // ============================================
  // ARTICLE CATEGORIES - GAMING
  // These organize articles by content type (separate from product categories)
  // ============================================
  const gamingBuyingGuidesCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'buying-guides' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      slug: 'buying-guides',
      name: 'Buying Guides',
      description: 'Expert advice on choosing the right gaming gear for your needs and budget.',
      icon: 'BookOpen',
      isActive: true,
      sortOrder: 1,
    },
  })

  const gamingRoundupsCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'roundups' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      slug: 'roundups',
      name: 'Best Of Roundups',
      description: 'Curated lists of the best gaming products across every category.',
      icon: 'Trophy',
      isActive: true,
      sortOrder: 2,
    },
  })

  await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'product-reviews' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      slug: 'product-reviews',
      name: 'Product Reviews',
      description: 'In-depth reviews of individual gaming products with hands-on testing.',
      icon: 'Star',
      isActive: true,
      sortOrder: 3,
    },
  })

  await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'how-to' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      slug: 'how-to',
      name: 'How-To Guides',
      description: 'Step-by-step tutorials for gaming setup, optimization, and troubleshooting.',
      icon: 'HelpCircle',
      isActive: true,
      sortOrder: 4,
    },
  })

  const gamingComparisonsCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'comparisons' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      slug: 'comparisons',
      name: 'Comparisons',
      description: 'Head-to-head comparisons to help you decide between top products.',
      icon: 'Scale',
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log('Created gaming article categories')

  // ============================================
  // ARTICLE CATEGORIES - TECH
  // ============================================
  const techBuyingGuidesCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'buying-guides' } },
    update: {},
    create: {
      siteId: techSite.id,
      slug: 'buying-guides',
      name: 'Buying Guides',
      description: 'Expert advice on choosing the right tech products for your lifestyle.',
      icon: 'BookOpen',
      isActive: true,
      sortOrder: 1,
    },
  })

  const techRoundupsCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'roundups' } },
    update: {},
    create: {
      siteId: techSite.id,
      slug: 'roundups',
      name: 'Best Of Roundups',
      description: 'Curated lists of the best tech products across every category.',
      icon: 'Trophy',
      isActive: true,
      sortOrder: 2,
    },
  })

  await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'product-reviews' } },
    update: {},
    create: {
      siteId: techSite.id,
      slug: 'product-reviews',
      name: 'Product Reviews',
      description: 'In-depth reviews of individual tech products with hands-on testing.',
      icon: 'Star',
      isActive: true,
      sortOrder: 3,
    },
  })

  await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'how-to' } },
    update: {},
    create: {
      siteId: techSite.id,
      slug: 'how-to',
      name: 'How-To Guides',
      description: 'Step-by-step tutorials for tech setup, optimization, and troubleshooting.',
      icon: 'HelpCircle',
      isActive: true,
      sortOrder: 4,
    },
  })

  const techComparisonsCategory = await prisma.articleCategory.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'comparisons' } },
    update: {},
    create: {
      siteId: techSite.id,
      slug: 'comparisons',
      name: 'Comparisons',
      description: 'Head-to-head comparisons to help you decide between top products.',
      icon: 'Scale',
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log('Created tech article categories')

  // ============================================
  // GAMING CATEGORIES (Product Categories)
  // ============================================
  const keyboardsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: gamingSite.id, categoryType: 'product-type', slug: 'gaming-keyboards' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      categoryType: 'product-type',
      slug: 'gaming-keyboards',
      name: 'Gaming Keyboards',
      description: 'Mechanical and membrane keyboards built for competitive gaming with RGB lighting and programmable keys.',
      icon: 'Keyboard',
      featuredImage: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800',
      isActive: true,
      sortOrder: 1,
    },
  })

  const miceCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: gamingSite.id, categoryType: 'product-type', slug: 'gaming-mice' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      categoryType: 'product-type',
      slug: 'gaming-mice',
      name: 'Gaming Mice',
      description: 'High-precision gaming mice with adjustable DPI, ergonomic designs, and ultra-low latency.',
      icon: 'Mouse',
      featuredImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800',
      isActive: true,
      sortOrder: 2,
    },
  })

  const headsetsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: gamingSite.id, categoryType: 'product-type', slug: 'gaming-headsets' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      categoryType: 'product-type',
      slug: 'gaming-headsets',
      name: 'Gaming Headsets',
      description: 'Immersive audio headsets with surround sound, noise cancellation, and crystal-clear microphones.',
      icon: 'Headphones',
      featuredImage: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800',
      isActive: true,
      sortOrder: 3,
    },
  })

  const monitorsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: gamingSite.id, categoryType: 'product-type', slug: 'gaming-monitors' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      categoryType: 'product-type',
      slug: 'gaming-monitors',
      name: 'Gaming Monitors',
      description: 'High refresh rate monitors with low response times for competitive gaming advantage.',
      icon: 'Monitor',
      featuredImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      isActive: true,
      sortOrder: 4,
    },
  })

  const chairsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: gamingSite.id, categoryType: 'product-type', slug: 'gaming-chairs' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      categoryType: 'product-type',
      slug: 'gaming-chairs',
      name: 'Gaming Chairs',
      description: 'Ergonomic gaming chairs designed for long sessions with lumbar support and adjustable features.',
      icon: 'Armchair',
      featuredImage: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800',
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log('Created gaming categories')

  // ============================================
  // TECH CATEGORIES
  // ============================================
  const laptopsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: techSite.id, categoryType: 'category', slug: 'laptops' } },
    update: {},
    create: {
      siteId: techSite.id,
      categoryType: 'category',
      slug: 'laptops',
      name: 'Laptops',
      description: 'Portable computing power from ultrabooks to workstations for every need and budget.',
      icon: 'Laptop',
      featuredImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      isActive: true,
      sortOrder: 1,
    },
  })

  const phonesCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: techSite.id, categoryType: 'category', slug: 'smartphones' } },
    update: {},
    create: {
      siteId: techSite.id,
      categoryType: 'category',
      slug: 'smartphones',
      name: 'Smartphones',
      description: 'The latest smartphones from Apple, Samsung, Google, and more with in-depth reviews.',
      icon: 'Smartphone',
      featuredImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
      isActive: true,
      sortOrder: 2,
    },
  })

  const tabletsCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: techSite.id, categoryType: 'category', slug: 'tablets' } },
    update: {},
    create: {
      siteId: techSite.id,
      categoryType: 'category',
      slug: 'tablets',
      name: 'Tablets',
      description: 'Tablets for productivity, entertainment, and creativity from leading manufacturers.',
      icon: 'Tablet',
      featuredImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      isActive: true,
      sortOrder: 3,
    },
  })

  const smartwatchesCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: techSite.id, categoryType: 'category', slug: 'smartwatches' } },
    update: {},
    create: {
      siteId: techSite.id,
      categoryType: 'category',
      slug: 'smartwatches',
      name: 'Smartwatches',
      description: 'Smartwatches and fitness trackers to monitor health and stay connected on the go.',
      icon: 'Watch',
      featuredImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      isActive: true,
      sortOrder: 4,
    },
  })

  const accessoriesCategory = await prisma.category.upsert({
    where: { siteId_categoryType_slug: { siteId: techSite.id, categoryType: 'category', slug: 'accessories' } },
    update: {},
    create: {
      siteId: techSite.id,
      categoryType: 'category',
      slug: 'accessories',
      name: 'Accessories',
      description: 'Essential tech accessories including chargers, cases, cables, and audio gear.',
      icon: 'Cable',
      featuredImage: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
      isActive: true,
      sortOrder: 5,
    },
  })

  console.log('Created tech categories')

  // ============================================
  // GAMING PRODUCTS - KEYBOARDS
  // ============================================
  const logitechG915 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'logitech-g915-tkl' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'keyboard',
      slug: 'logitech-g915-tkl',
      title: 'Logitech G915 TKL Wireless',
      excerpt: 'Ultra-slim wireless mechanical keyboard with low-profile GL switches and LIGHTSPEED technology.',
      description: 'The Logitech G915 TKL combines sleek design with professional-grade performance. Its low-profile mechanical switches deliver satisfying tactile feedback while maintaining a slim form factor.',
      featuredImage: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'],
      priceFrom: 229,
      priceCurrency: 'USD',
      priceText: '$229',
      rating: 4.7,
      reviewCount: 3420,
      affiliateLinks: [
        { partner: 'amazon', url: 'https://affiliate.example.com/logitech-g915-tkl', label: 'Amazon', isPrimary: true },
        { partner: 'bestbuy', url: 'https://affiliate.example.com/bestbuy/logitech-g915-tkl', label: 'Best Buy' },
        { partner: 'newegg', url: 'https://affiliate.example.com/newegg/logitech-g915-tkl', label: 'Newegg' },
      ],
      primaryAffiliateUrl: 'https://affiliate.example.com/logitech-g915-tkl',
      metadata: {
        brand: 'Logitech',
        switchType: 'GL Tactile',
        connectivity: 'Wireless (LIGHTSPEED), Bluetooth',
        batteryLife: '40 hours',
        pros: ['Ultra-slim profile', 'LIGHTSPEED wireless with no lag', 'Premium aluminum build', 'Dedicated media controls', 'Long battery life'],
        cons: ['Expensive', 'ABS keycaps', 'No wrist rest included'],
        features: ['Low-profile GL mechanical switches', 'RGB LIGHTSYNC', 'LIGHTSPEED wireless technology', 'Bluetooth connectivity', 'USB-C charging', 'Aircraft-grade aluminum'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const razerHuntsman = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'razer-huntsman-v3-pro' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'keyboard',
      slug: 'razer-huntsman-v3-pro',
      title: 'Razer Huntsman V3 Pro',
      excerpt: 'Flagship esports keyboard with analog optical switches and rapid trigger technology.',
      description: 'The Razer Huntsman V3 Pro is designed for competitive gamers who demand the fastest response times. Its analog optical switches with adjustable actuation points give you a competitive edge.',
      featuredImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800'],
      priceFrom: 249,
      priceCurrency: 'USD',
      priceText: '$249',
      rating: 4.8,
      reviewCount: 1850,
      affiliateLinks: [
        { partner: 'amazon', url: 'https://affiliate.example.com/razer-huntsman-v3-pro', label: 'Amazon', isPrimary: true },
        { partner: 'bestbuy', url: 'https://affiliate.example.com/bestbuy/razer-huntsman-v3-pro', label: 'Best Buy' },
      ],
      primaryAffiliateUrl: 'https://affiliate.example.com/razer-huntsman-v3-pro',
      metadata: {
        brand: 'Razer',
        switchType: 'Analog Optical',
        connectivity: 'Wired USB-C',
        features: ['Rapid Trigger mode', 'Adjustable actuation 0.1-4.0mm', 'Razer Chroma RGB'],
        pros: ['Fastest actuation available', 'Rapid Trigger technology', 'Premium build quality', 'Comfortable magnetic wrist rest'],
        cons: ['Wired only', 'Premium price', 'Learning curve for analog features'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // GAMING PRODUCTS - MICE
  // ============================================
  // Full product data for Logitech G Pro X Superlight 2
  const superlight2Data = {
    siteId: gamingSite.id,
    productType: 'mouse',
    slug: 'logitech-g-pro-x-superlight-2',
    title: 'Logitech G Pro X Superlight 2',
    excerpt: 'The ultimate wireless esports mouse at just 60g with HERO 2 sensor and LIGHTSPEED technology. Used by professional esports players worldwide.',
    description: 'Building on the legendary Superlight, the Superlight 2 features the new HERO 2 sensor with 32K DPI, improved LIGHTSPEED wireless, and the same featherweight 60g design that made it a pro gaming staple.',
    featuredImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
    galleryImages: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800',
      'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=800',
      'https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800',
      'https://images.unsplash.com/photo-1613141411244-0e4ac259d217?w=800',
    ],
    priceFrom: 159,
    priceCurrency: 'USD',
    priceText: '$159',
    rating: 4.9,
    reviewCount: 5230,
    affiliateLinks: [
      { partner: 'amazon', url: 'https://affiliate.example.com/g-pro-x-superlight-2', label: 'Buy on Amazon', isPrimary: true },
      { partner: 'bestbuy', url: 'https://affiliate.example.com/bestbuy/g-pro-x-superlight-2', label: 'Best Buy' },
      { partner: 'newegg', url: 'https://affiliate.example.com/newegg/g-pro-x-superlight-2', label: 'Newegg' },
    ],
    primaryAffiliateUrl: 'https://affiliate.example.com/g-pro-x-superlight-2',
    content: `
<h2>Design & Build Quality</h2>
<p>The Logitech G Pro X Superlight 2 is a masterclass in minimalist design. Weighing in at just <strong>60 grams</strong>, it's one of the lightest wireless gaming mice ever made, yet it doesn't sacrifice build quality to achieve this feat. The shell is made from a high-quality polymer that feels solid despite its featherweight construction.</p>

<p>The ambidextrous shape works well for most grip styles, though palm grip users with larger hands might find it slightly small. Claw and fingertip grip users will find this mouse absolutely perfect. The PTFE feet glide effortlessly across any mousepad surface.</p>

<h2>HERO 2 Sensor Performance</h2>
<p>The new HERO 2 sensor is the star of the show. Capable of tracking up to <strong>32,000 DPI</strong> with zero smoothing, filtering, or acceleration, it delivers pixel-perfect precision that competitive gamers demand. In our testing across CS2, Valorant, and Apex Legends, the tracking was absolutely flawless.</p>

<p>The sensor also features improved power efficiency, contributing to the impressive 95-hour battery life. You can go weeks between charges with regular use.</p>

<h2>LIGHTSPEED Wireless Technology</h2>
<p>Logitech's LIGHTSPEED wireless technology delivers a <strong>1ms report rate</strong>, making it indistinguishable from a wired connection. We tested latency extensively and found zero perceptible difference compared to wired alternatives. For competitive gaming, this is essential.</p>

<h2>Battery Life & Charging</h2>
<p>The 95-hour battery life is exceptional. We used the mouse for 3 weeks of heavy gaming (4-6 hours daily) before needing to charge. The USB-C charging is convenient, and a quick 15-minute charge provides about 10 hours of use.</p>

<h2>Gaming Performance</h2>
<p>In competitive FPS titles, the Superlight 2 excels. The combination of ultra-low weight, flawless sensor, and zero-latency wireless creates an experience where the mouse becomes an extension of your hand. Flick shots, tracking, and micro-adjustments all feel natural and precise.</p>

<h2>Who Should Buy This?</h2>
<p>The G Pro X Superlight 2 is ideal for:</p>
<ul>
  <li><strong>Competitive FPS players</strong> who need every advantage</li>
  <li><strong>Esports professionals</strong> (it's one of the most used mice in pro tournaments)</li>
  <li><strong>Gamers with wrist/arm fatigue</strong> from heavier mice</li>
  <li><strong>Anyone seeking the best</strong> wireless gaming mouse available</li>
</ul>

<h2>The Verdict</h2>
<p>At $159, the Logitech G Pro X Superlight 2 is expensive, but it delivers on its promise of being the ultimate competitive gaming mouse. If you're serious about gaming performance and want a wireless mouse that truly rivals wired options, this is the one to get.</p>
    `.trim(),
    metadata: {
      brand: 'Logitech',
      sensor: 'HERO 2',
      dpi: '32,000',
      weight: '60g',
      batteryLife: '95 hours',
      pros: [
        'Incredibly light at just 60 grams',
        'Flawless HERO 2 sensor with 32K DPI',
        '95-hour battery life on single charge',
        'Zero-latency LIGHTSPEED wireless',
        'Perfect for competitive FPS gaming',
        'Premium PTFE feet for smooth gliding',
      ],
      cons: [
        'No RGB lighting (for purists, this is a pro)',
        'Premium price at $159',
        'May be too light for some users',
        'Only 5 programmable buttons',
        'Ambidextrous shape may not suit everyone',
      ],
      features: [
        'HERO 2 32K sensor',
        'LIGHTSPEED wireless',
        'PTFE feet',
        'Ambidextrous design',
        '5 programmable buttons',
        'USB-C charging',
        'On-board memory',
      ],
      specifications: {
        'Sensor': 'HERO 2',
        'Max DPI': '32,000',
        'Max Acceleration': '40 G',
        'Max Speed': '400+ IPS',
        'Polling Rate': '1000 Hz (1ms)',
        'Buttons': '5 programmable',
        'Weight': '60g',
        'Battery Life': 'Up to 95 hours',
        'Connectivity': 'LIGHTSPEED 2.4GHz wireless',
        'Charging': 'USB-C',
        'Dimensions': '125 x 63.5 x 40mm',
        'Feet': 'PTFE (zero additives)',
        'Cable': '1.8m charging cable',
        'Compatibility': 'Windows, macOS',
        'Warranty': '2 years',
      },
      benchmarks: [
        { name: 'Sensor Accuracy', score: 99, maxScore: 100, unit: '%' },
        { name: 'Click Latency', score: 0.7, maxScore: 10, unit: 'ms' },
        { name: 'Build Quality', score: 92, maxScore: 100, unit: '%' },
        { name: 'Comfort', score: 90, maxScore: 100, unit: '%' },
        { name: 'Value for Money', score: 85, maxScore: 100, unit: '%' },
      ],
    },
    status: ContentStatus.PUBLISHED,
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
    publishedAt: new Date(),
  }

  const logitechSuperlight2 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'logitech-g-pro-x-superlight-2' } },
    update: superlight2Data,
    create: superlight2Data,
  })

  const razerDeathAdder = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'razer-deathadder-v3-pro' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'mouse',
      slug: 'razer-deathadder-v3-pro',
      title: 'Razer DeathAdder V3 Pro',
      excerpt: 'Iconic ergonomic shape perfected with Focus Pro 30K sensor and 63g wireless design.',
      description: 'The DeathAdder V3 Pro takes the legendary ergonomic shape and strips it down to essentials. At 63g with pro-grade internals, its the ultimate palm grip mouse.',
      featuredImage: 'https://images.unsplash.com/photo-1623820919239-0d0ff10797a1?w=800',
      galleryImages: [],
      priceFrom: 149,
      priceCurrency: 'USD',
      priceText: '$149',
      rating: 4.8,
      reviewCount: 2890,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/deathadder-v3-pro', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/deathadder-v3-pro',
      metadata: {
        brand: 'Razer',
        sensor: 'Focus Pro 30K',
        dpi: '30,000',
        weight: '63g',
        batteryLife: '90 hours',
        pros: ['Best ergonomic shape', 'Ultra-lightweight', 'Excellent sensor', 'Great for palm grip'],
        cons: ['Right-handed only', 'No RGB', 'Premium price'],
        features: ['Focus Pro 30K optical sensor', 'HyperSpeed wireless', 'Optical mouse switches Gen-3', '90-hour battery', 'On-mouse DPI controls'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // GAMING PRODUCTS - HEADSETS
  // ============================================
  const steelSeriesArctis = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'steelseries-arctis-nova-pro' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'headset',
      slug: 'steelseries-arctis-nova-pro',
      title: 'SteelSeries Arctis Nova Pro Wireless',
      excerpt: 'Premium wireless gaming headset with hot-swappable batteries and Hi-Res audio.',
      description: 'The Arctis Nova Pro Wireless is SteelSeries flagship headset featuring active noise cancellation, hot-swappable battery system, and audiophile-grade drivers.',
      featuredImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'],
      priceFrom: 349,
      priceCurrency: 'USD',
      priceText: '$349',
      rating: 4.6,
      reviewCount: 1920,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/arctis-nova-pro', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/arctis-nova-pro',
      metadata: {
        brand: 'SteelSeries',
        driver: '40mm Premium Hi-Res',
        connectivity: '2.4GHz Wireless, Bluetooth',
        batteryLife: '22 hours per battery',
        pros: ['Hot-swappable batteries', 'Excellent ANC', 'Premium audio quality', 'Multi-device connectivity', 'Comfortable for long sessions'],
        cons: ['Very expensive', 'Complex setup', 'Base station required'],
        features: ['Active Noise Cancellation', 'Hot-swap battery system', '360 Spatial Audio', 'Retractable mic', 'Aluminum and steel construction'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const hyperXCloud3 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'hyperx-cloud-iii-wireless' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'headset',
      slug: 'hyperx-cloud-iii-wireless',
      title: 'HyperX Cloud III Wireless',
      excerpt: 'Legendary comfort meets wireless freedom with 120-hour battery life.',
      description: 'The Cloud III Wireless delivers the signature HyperX comfort with an incredible 120-hour battery life, making it perfect for marathon gaming sessions.',
      featuredImage: 'https://images.unsplash.com/photo-1606400082777-ef05f3c5cde2?w=800',
      galleryImages: [],
      priceFrom: 169,
      priceCurrency: 'USD',
      priceText: '$169',
      rating: 4.7,
      reviewCount: 3150,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/cloud-iii-wireless', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/cloud-iii-wireless',
      metadata: {
        brand: 'HyperX',
        driver: '53mm with neodymium magnets',
        connectivity: '2.4GHz Wireless',
        batteryLife: '120 hours',
        pros: ['120-hour battery life', 'Extremely comfortable', 'Great value', 'Durable build'],
        cons: ['No Bluetooth', 'No ANC', 'Bulky design'],
        features: ['53mm drivers', 'DTS Headphone:X Spatial Audio', 'Memory foam ear cushions', 'Detachable noise-cancelling mic'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // GAMING PRODUCTS - MONITORS
  // ============================================
  const samsungOdyssey = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'samsung-odyssey-g7-32' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'monitor',
      slug: 'samsung-odyssey-g7-32',
      title: 'Samsung Odyssey G7 32"',
      excerpt: '240Hz curved gaming monitor with stunning VA panel and 1ms response time.',
      description: 'The Samsung Odyssey G7 combines a 1000R curve with 240Hz refresh rate and deep VA blacks for an immersive gaming experience thats hard to match.',
      featuredImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800'],
      priceFrom: 549,
      priceCurrency: 'USD',
      priceText: '$549',
      rating: 4.5,
      reviewCount: 4280,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/odyssey-g7', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/odyssey-g7',
      metadata: {
        brand: 'Samsung',
        panelType: 'VA',
        resolution: '2560x1440',
        refreshRate: '240Hz',
        responseTime: '1ms',
        pros: ['240Hz at 1440p', 'Deep blacks and contrast', 'Immersive 1000R curve', 'G-Sync and FreeSync'],
        cons: ['Aggressive curve not for everyone', 'Some black smearing', 'Limited ergonomics'],
        features: ['1000R curved display', 'QLED technology', 'HDR600', 'G-Sync Compatible', 'FreeSync Premium Pro'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const lg27gp950 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'lg-27gp950-b' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'monitor',
      slug: 'lg-27gp950-b',
      title: 'LG 27GP950-B UltraGear',
      excerpt: '4K 144Hz gaming monitor with HDMI 2.1 for next-gen console and PC gaming.',
      description: 'The LG 27GP950-B brings true 4K gaming at 144Hz with HDMI 2.1 support, making it perfect for both PS5/Xbox Series X and high-end PC gaming.',
      featuredImage: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800',
      galleryImages: [],
      priceFrom: 699,
      priceCurrency: 'USD',
      priceText: '$699',
      rating: 4.6,
      reviewCount: 2650,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/lg-27gp950', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/lg-27gp950',
      metadata: {
        brand: 'LG',
        panelType: 'Nano IPS',
        resolution: '3840x2160',
        refreshRate: '144Hz (160Hz OC)',
        responseTime: '1ms',
        pros: ['True 4K at 144Hz', 'HDMI 2.1 for consoles', 'Excellent color accuracy', 'Great HDR performance'],
        cons: ['Expensive', '27" may be small for 4K', 'Limited contrast ratio'],
        features: ['Nano IPS panel', 'HDMI 2.1', 'DisplayHDR 600', 'G-Sync Compatible', 'AMD FreeSync Premium Pro'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // GAMING PRODUCTS - CHAIRS
  // ============================================
  const secretlabTitan = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'secretlab-titan-evo-2024' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'chair',
      slug: 'secretlab-titan-evo-2024',
      title: 'Secretlab Titan Evo 2024',
      excerpt: 'Award-winning ergonomic gaming chair with 4-way lumbar support and premium materials.',
      description: 'The Secretlab Titan Evo 2024 sets the standard for gaming chairs with its innovative 4-way L-ADAPT lumbar system, cold-cure foam, and premium Neo Hybrid Leatherette.',
      featuredImage: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800',
      galleryImages: [],
      priceFrom: 519,
      priceCurrency: 'USD',
      priceText: 'From $519',
      rating: 4.8,
      reviewCount: 8920,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/titan-evo-2024', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/titan-evo-2024',
      metadata: {
        brand: 'Secretlab',
        material: 'Neo Hybrid Leatherette / SoftWeave Plus',
        maxWeight: '395 lbs',
        warranty: '5 years',
        pros: ['Best-in-class lumbar support', 'Premium build quality', 'Wide range of sizes', 'Excellent warranty'],
        cons: ['Expensive', 'Firm seat padding', 'Armrests could be better'],
        features: ['4-way L-ADAPT Lumbar System', 'Cold-cure foam', 'Pebble seat base', 'Magnetic memory foam head pillow', 'CloudSwap armrest system'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const hermanMillerEmbody = await prisma.product.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'herman-miller-embody-gaming' } },
    update: {},
    create: {
      siteId: gamingSite.id,
      productType: 'chair',
      slug: 'herman-miller-embody-gaming',
      title: 'Herman Miller x Logitech G Embody',
      excerpt: 'Premium ergonomic office chair tuned for gamers with 12-year warranty.',
      description: 'The Herman Miller Embody Gaming Edition combines decades of ergonomic research with gaming-specific enhancements, including additional cooling foam and a longer seat.',
      featuredImage: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
      galleryImages: [],
      priceFrom: 1795,
      priceCurrency: 'USD',
      priceText: '$1,795',
      rating: 4.7,
      reviewCount: 1240,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/embody-gaming', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/embody-gaming',
      metadata: {
        brand: 'Herman Miller',
        material: 'Sync fabric',
        maxWeight: '300 lbs',
        warranty: '12 years',
        pros: ['Exceptional ergonomics', 'Breathable design', 'Industry-leading warranty', 'No pressure points'],
        cons: ['Very expensive', 'No headrest', 'Limited adjustability for some'],
        features: ['Pixelated support system', 'Copper-infused cooling foam', 'BackFit adjustment', 'Tilt limiter', '4 adjustable seat positions'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  console.log('Created gaming products')

  // ============================================
  // TECH PRODUCTS - LAPTOPS
  // ============================================
  const macbookPro = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'macbook-pro-14-m3-pro' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'laptop',
      slug: 'macbook-pro-14-m3-pro',
      title: 'MacBook Pro 14" M3 Pro',
      excerpt: 'Apples powerhouse laptop with M3 Pro chip, stunning XDR display, and all-day battery.',
      description: 'The 14-inch MacBook Pro with M3 Pro delivers desktop-class performance for professionals. With up to 18 hours of battery life and a gorgeous Liquid Retina XDR display, it handles any creative workflow.',
      featuredImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
      priceFrom: 1999,
      priceCurrency: 'USD',
      priceText: 'From $1,999',
      rating: 4.9,
      reviewCount: 3840,
      affiliateLinks: [
        { partner: 'apple', url: 'https://affiliate.example.com/macbook-pro-m3-pro', label: 'Apple', isPrimary: true },
        { partner: 'amazon', url: 'https://affiliate.example.com/amazon/macbook-pro-m3-pro', label: 'Amazon' },
        { partner: 'bh-photo', url: 'https://affiliate.example.com/bhphoto/macbook-pro-m3-pro', label: 'B&H Photo' },
      ],
      primaryAffiliateUrl: 'https://affiliate.example.com/macbook-pro-m3-pro',
      metadata: {
        brand: 'Apple',
        processor: 'Apple M3 Pro (12-core CPU, 18-core GPU)',
        memory: '18GB - 36GB',
        storage: '512GB - 4TB SSD',
        display: '14.2" Liquid Retina XDR',
        pros: ['Incredible performance', 'Best-in-class display', 'Excellent battery life', 'Great speakers', 'Premium build'],
        cons: ['Expensive', 'Limited ports for some', 'No touchscreen'],
        features: ['M3 Pro chip', 'Liquid Retina XDR display', '18-hour battery', '3x Thunderbolt 4', 'HDMI', 'MagSafe', 'SD card slot'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const dellXPS15 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'dell-xps-15-2024' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'laptop',
      slug: 'dell-xps-15-2024',
      title: 'Dell XPS 15 (2024)',
      excerpt: 'Premium Windows laptop with stunning OLED display and Intel Core Ultra.',
      description: 'The Dell XPS 15 2024 features Intel Core Ultra processors, a beautiful 15.6" OLED display, and Dells signature InfinityEdge bezels in a sleek aluminum chassis.',
      featuredImage: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
      galleryImages: [],
      priceFrom: 1499,
      priceCurrency: 'USD',
      priceText: 'From $1,499',
      rating: 4.6,
      reviewCount: 2150,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/dell-xps-15-2024', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/dell-xps-15-2024',
      metadata: {
        brand: 'Dell',
        processor: 'Intel Core Ultra 7/9',
        memory: '16GB - 64GB',
        storage: '512GB - 2TB SSD',
        display: '15.6" 3.5K OLED',
        pros: ['Gorgeous OLED display', 'Premium build quality', 'Thin bezels', 'Good performance'],
        cons: ['Can run hot', 'Webcam placement', 'Pricey upgrades'],
        features: ['Intel Core Ultra', '3.5K OLED touchscreen', 'NVIDIA RTX 4070', 'Thunderbolt 4', 'Up to 13hr battery'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // TECH PRODUCTS - PHONES
  // ============================================
  const iPhone15Pro = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'iphone-15-pro-max' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'phone',
      slug: 'iphone-15-pro-max',
      title: 'iPhone 15 Pro Max',
      excerpt: 'Apples most advanced iPhone with A17 Pro chip, titanium design, and 5x optical zoom.',
      description: 'The iPhone 15 Pro Max represents the pinnacle of smartphone technology with its aerospace-grade titanium frame, A17 Pro chip, and the most advanced camera system ever in an iPhone.',
      featuredImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800'],
      priceFrom: 1199,
      priceCurrency: 'USD',
      priceText: 'From $1,199',
      rating: 4.8,
      reviewCount: 12500,
      affiliateLinks: [{ partner: 'apple', url: 'https://affiliate.example.com/iphone-15-pro-max', label: 'Buy from Apple', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/iphone-15-pro-max',
      metadata: {
        brand: 'Apple',
        processor: 'A17 Pro',
        storage: '256GB - 1TB',
        display: '6.7" Super Retina XDR',
        camera: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto',
        pros: ['Best smartphone camera', 'Titanium design', 'A17 Pro performance', 'USB-C finally', 'Action Button'],
        cons: ['Very expensive', 'Heavy', 'Slow charging vs competitors'],
        features: ['A17 Pro chip', '5x optical zoom', 'Titanium frame', 'USB-C with USB 3', 'Action Button', 'ProRes video'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const samsungS24Ultra = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'samsung-galaxy-s24-ultra' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'phone',
      slug: 'samsung-galaxy-s24-ultra',
      title: 'Samsung Galaxy S24 Ultra',
      excerpt: 'Ultimate Android flagship with Galaxy AI, S Pen, and 200MP camera.',
      description: 'The Galaxy S24 Ultra leads the AI smartphone revolution with Galaxy AI features, a stunning 200MP camera, and the productivity of the built-in S Pen.',
      featuredImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
      galleryImages: [],
      priceFrom: 1299,
      priceCurrency: 'USD',
      priceText: 'From $1,299',
      rating: 4.7,
      reviewCount: 8700,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/galaxy-s24-ultra', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/galaxy-s24-ultra',
      metadata: {
        brand: 'Samsung',
        processor: 'Snapdragon 8 Gen 3',
        storage: '256GB - 1TB',
        display: '6.8" Dynamic AMOLED 2X',
        camera: '200MP Main + 12MP Ultra Wide + 50MP 5x + 10MP 3x',
        pros: ['Galaxy AI features', '200MP camera', 'Built-in S Pen', 'Titanium frame', '7 years of updates'],
        cons: ['Very expensive', 'Huge and heavy', 'Flat display may not appeal to all'],
        features: ['Galaxy AI', 'S Pen included', '200MP sensor', 'Titanium frame', '100x Space Zoom', 'QHD+ 120Hz display'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // TECH PRODUCTS - TABLETS
  // ============================================
  const iPadPro = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'ipad-pro-13-m4' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'tablet',
      slug: 'ipad-pro-13-m4',
      title: 'iPad Pro 13" M4',
      excerpt: 'The thinnest Apple product ever with M4 chip and stunning OLED display.',
      description: 'The new iPad Pro with M4 is impossibly thin at just 5.1mm while delivering unprecedented performance. Its Ultra Retina XDR OLED display is the best on any Apple device.',
      featuredImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      galleryImages: ['https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'],
      priceFrom: 1299,
      priceCurrency: 'USD',
      priceText: 'From $1,299',
      rating: 4.8,
      reviewCount: 2890,
      affiliateLinks: [{ partner: 'apple', url: 'https://affiliate.example.com/ipad-pro-m4', label: 'Buy from Apple', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/ipad-pro-m4',
      metadata: {
        brand: 'Apple',
        processor: 'Apple M4',
        storage: '256GB - 2TB',
        display: '13" Ultra Retina XDR OLED',
        pros: ['Incredibly thin and light', 'M4 performance', 'Best tablet display', 'Apple Pencil Pro support'],
        cons: ['Very expensive', 'iPadOS limitations', 'Accessories cost extra'],
        features: ['M4 chip', 'Ultra Retina XDR OLED', '5.1mm thin', 'Thunderbolt/USB 4', 'Face ID', 'Apple Pencil Pro support'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const samsungTabS9 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'samsung-galaxy-tab-s9-ultra' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'tablet',
      slug: 'samsung-galaxy-tab-s9-ultra',
      title: 'Samsung Galaxy Tab S9 Ultra',
      excerpt: 'Massive 14.6" AMOLED tablet with S Pen and DeX desktop mode.',
      description: 'The Galaxy Tab S9 Ultra offers a massive 14.6" Dynamic AMOLED 2X display, powerful Snapdragon 8 Gen 2, and the full DeX desktop experience for productivity.',
      featuredImage: 'https://images.unsplash.com/photo-1632634686786-2776a9291d07?w=800',
      galleryImages: [],
      priceFrom: 1199,
      priceCurrency: 'USD',
      priceText: 'From $1,199',
      rating: 4.6,
      reviewCount: 1650,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/tab-s9-ultra', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/tab-s9-ultra',
      metadata: {
        brand: 'Samsung',
        processor: 'Snapdragon 8 Gen 2',
        storage: '256GB - 1TB',
        display: '14.6" Dynamic AMOLED 2X',
        pros: ['Huge immersive display', 'S Pen included', 'DeX mode', 'IP68 water resistance', 'Great for multitasking'],
        cons: ['Very large and heavy', 'Expensive', 'Android tablet app gap'],
        features: ['14.6" 120Hz AMOLED', 'S Pen included', 'Samsung DeX', 'IP68 rating', '11200mAh battery', 'Quad speakers'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // TECH PRODUCTS - SMARTWATCHES
  // ============================================
  const appleWatchUltra2 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'apple-watch-ultra-2' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'smartwatch',
      slug: 'apple-watch-ultra-2',
      title: 'Apple Watch Ultra 2',
      excerpt: 'The most rugged and capable Apple Watch with 36-hour battery and precision GPS.',
      description: 'Built for endurance athletes and adventurers, the Apple Watch Ultra 2 features a titanium case, precision dual-frequency GPS, and up to 36 hours of battery life.',
      featuredImage: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
      galleryImages: [],
      priceFrom: 799,
      priceCurrency: 'USD',
      priceText: '$799',
      rating: 4.8,
      reviewCount: 4200,
      affiliateLinks: [{ partner: 'apple', url: 'https://affiliate.example.com/watch-ultra-2', label: 'Buy from Apple', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/watch-ultra-2',
      metadata: {
        brand: 'Apple',
        processor: 'S9 SiP',
        display: '49mm LTPO OLED',
        batteryLife: '36 hours (72 in low power)',
        waterResistance: '100m + EN13319',
        pros: ['Incredible durability', 'Best GPS accuracy', 'Brightest Apple Watch display', 'Action Button', 'Long battery life'],
        cons: ['Very expensive', 'Large for smaller wrists', 'Overkill for casual users'],
        features: ['Titanium case', 'Dual-frequency GPS', '3000 nit display', 'Action Button', 'Depth gauge', 'Siren'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const samsungWatch6 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'samsung-galaxy-watch-6-classic' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'smartwatch',
      slug: 'samsung-galaxy-watch-6-classic',
      title: 'Samsung Galaxy Watch 6 Classic',
      excerpt: 'Premium Android smartwatch with rotating bezel and comprehensive health tracking.',
      description: 'The Galaxy Watch 6 Classic brings back the beloved rotating bezel with comprehensive health features including sleep coaching, body composition, and heart monitoring.',
      featuredImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
      galleryImages: [],
      priceFrom: 399,
      priceCurrency: 'USD',
      priceText: 'From $399',
      rating: 4.5,
      reviewCount: 2890,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/galaxy-watch-6-classic', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/galaxy-watch-6-classic',
      metadata: {
        brand: 'Samsung',
        processor: 'Exynos W930',
        display: '1.5" Super AMOLED',
        batteryLife: 'Up to 40 hours',
        waterResistance: '5ATM + IP68',
        pros: ['Rotating bezel', 'Great display', 'Comprehensive health features', 'Good value'],
        cons: ['Limited third-party apps', 'Battery could be better', 'Best with Samsung phones'],
        features: ['Rotating bezel', 'BioActive sensor', 'Body composition', 'Sleep coaching', 'Wear OS 4', 'Sapphire crystal'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  // ============================================
  // TECH PRODUCTS - ACCESSORIES
  // ============================================
  const airpodsPro2 = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'airpods-pro-2' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'accessory',
      slug: 'airpods-pro-2',
      title: 'AirPods Pro 2 (USB-C)',
      excerpt: 'Apples premium earbuds with adaptive audio and USB-C charging case.',
      description: 'The AirPods Pro 2 deliver incredible active noise cancellation, adaptive audio that adjusts to your environment, and seamless integration with the Apple ecosystem.',
      featuredImage: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=800',
      galleryImages: [],
      priceFrom: 249,
      priceCurrency: 'USD',
      priceText: '$249',
      rating: 4.8,
      reviewCount: 18500,
      affiliateLinks: [{ partner: 'apple', url: 'https://affiliate.example.com/airpods-pro-2', label: 'Buy from Apple', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/airpods-pro-2',
      metadata: {
        brand: 'Apple',
        driver: 'Apple H2 chip',
        batteryLife: '6hrs (30hrs with case)',
        features: ['Active Noise Cancellation', 'Adaptive Audio', 'Personalized Spatial Audio', 'USB-C charging', 'Find My with Precision Finding'],
        pros: ['Best ANC in earbuds', 'Adaptive Audio is magical', 'Seamless Apple integration', 'Great call quality'],
        cons: ['Only ideal for Apple users', 'No lossless audio', 'Ear tips may not fit everyone'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      isActive: true,
      sortOrder: 1,
      publishedAt: new Date(),
    },
  })

  const ankerPowerBank = await prisma.product.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'anker-737-power-bank' } },
    update: {},
    create: {
      siteId: techSite.id,
      productType: 'accessory',
      slug: 'anker-737-power-bank',
      title: 'Anker 737 Power Bank (PowerCore 24K)',
      excerpt: '140W output power bank that can charge laptops, phones, and tablets simultaneously.',
      description: 'The Anker 737 is a powerhouse with 24,000mAh capacity and 140W output, capable of charging MacBooks, iPads, and iPhones simultaneously with smart power distribution.',
      featuredImage: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
      galleryImages: [],
      priceFrom: 149,
      priceCurrency: 'USD',
      priceText: '$149',
      rating: 4.6,
      reviewCount: 4500,
      affiliateLinks: [{ partner: 'amazon', url: 'https://affiliate.example.com/anker-737', label: 'Buy on Amazon', isPrimary: true }],
      primaryAffiliateUrl: 'https://affiliate.example.com/anker-737',
      metadata: {
        brand: 'Anker',
        capacity: '24,000mAh',
        output: '140W max',
        ports: '2x USB-C, 1x USB-A',
        features: ['140W USB-C output', 'Smart digital display', 'Recharge in 58 minutes', 'PowerIQ 3.0', 'Charge 3 devices'],
        pros: ['Can charge laptops', 'Fast 140W output', 'Useful display', 'Quick recharge'],
        cons: ['Heavy at 1.5 lbs', 'Expensive', 'Large size'],
      },
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      isActive: true,
      sortOrder: 2,
      publishedAt: new Date(),
    },
  })

  console.log('Created tech products')

  // ============================================
  // PRODUCT-CATEGORY RELATIONSHIPS - GAMING
  // ============================================
  const gamingProductCategories = [
    { productId: logitechG915.id, categoryId: keyboardsCategory.id, isPrimary: true },
    { productId: razerHuntsman.id, categoryId: keyboardsCategory.id, isPrimary: true },
    { productId: logitechSuperlight2.id, categoryId: miceCategory.id, isPrimary: true },
    { productId: razerDeathAdder.id, categoryId: miceCategory.id, isPrimary: true },
    { productId: steelSeriesArctis.id, categoryId: headsetsCategory.id, isPrimary: true },
    { productId: hyperXCloud3.id, categoryId: headsetsCategory.id, isPrimary: true },
    { productId: samsungOdyssey.id, categoryId: monitorsCategory.id, isPrimary: true },
    { productId: lg27gp950.id, categoryId: monitorsCategory.id, isPrimary: true },
    { productId: secretlabTitan.id, categoryId: chairsCategory.id, isPrimary: true },
    { productId: hermanMillerEmbody.id, categoryId: chairsCategory.id, isPrimary: true },
  ]

  for (const pc of gamingProductCategories) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
      update: {},
      create: pc,
    })
  }

  // ============================================
  // PRODUCT-CATEGORY RELATIONSHIPS - TECH
  // ============================================
  const techProductCategories = [
    { productId: macbookPro.id, categoryId: laptopsCategory.id, isPrimary: true },
    { productId: dellXPS15.id, categoryId: laptopsCategory.id, isPrimary: true },
    { productId: iPhone15Pro.id, categoryId: phonesCategory.id, isPrimary: true },
    { productId: samsungS24Ultra.id, categoryId: phonesCategory.id, isPrimary: true },
    { productId: iPadPro.id, categoryId: tabletsCategory.id, isPrimary: true },
    { productId: samsungTabS9.id, categoryId: tabletsCategory.id, isPrimary: true },
    { productId: appleWatchUltra2.id, categoryId: smartwatchesCategory.id, isPrimary: true },
    { productId: samsungWatch6.id, categoryId: smartwatchesCategory.id, isPrimary: true },
    { productId: airpodsPro2.id, categoryId: accessoriesCategory.id, isPrimary: true },
    { productId: ankerPowerBank.id, categoryId: accessoriesCategory.id, isPrimary: true },
  ]

  for (const pc of techProductCategories) {
    await prisma.productCategory.upsert({
      where: { productId_categoryId: { productId: pc.productId, categoryId: pc.categoryId } },
      update: {},
      create: pc,
    })
  }

  console.log('Created product-category relationships')

  // ============================================
  // GAMING ARTICLES
  // ============================================
  const gamingKeyboardRoundup = await prisma.article.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'best-gaming-keyboards-2025' } },
    update: { articleCategoryId: gamingRoundupsCategory.id },
    create: {
      siteId: gamingSite.id,
      articleCategoryId: gamingRoundupsCategory.id,
      categoryId: keyboardsCategory.id, // DEPRECATED: Kept for backwards compat
      articleType: ArticleType.ROUNDUP,
      slug: 'best-gaming-keyboards-2025',
      title: 'Best Gaming Keyboards 2025: Top Picks for Every Budget',
      excerpt: 'We tested over 30 gaming keyboards to find the best options for competitive gaming, productivity, and everyday use.',
      content: `<p>After months of testing dozens of gaming keyboards, we've narrowed down our top recommendations for 2025. Whether you're a competitive esports player or a casual gamer looking for a reliable keyboard, we have picks for every budget and preference.</p>

<h2>What We Look For in a Gaming Keyboard</h2>
<p>When evaluating gaming keyboards, we focus on several key factors: switch quality and feel, build construction, latency, software features, and of course, value for money.</p>

<h2>Our Testing Process</h2>
<p>Each keyboard undergoes rigorous testing including latency measurements, typing tests, gaming sessions across multiple genres, and long-term durability assessments.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=1200',
      author: 'Alex Chen',
      seoTitle: 'Best Gaming Keyboards 2025 - Expert Reviews & Buyer\'s Guide',
      seoDescription: 'Comprehensive guide to the best gaming keyboards in 2025. Expert reviews of mechanical, wireless, and budget options.',
      seoKeywords: ['gaming keyboard', 'mechanical keyboard', 'best keyboard 2025', 'gaming gear'],
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(),
      faqs: [
        { question: 'What switch type is best for gaming?', answer: 'Linear switches like Cherry MX Red or Gateron Red are popular for gaming due to their smooth, consistent actuation without tactile bumps.' },
        { question: 'Is wireless good for competitive gaming?', answer: 'Modern wireless gaming keyboards with technologies like Lightspeed or HyperSpeed offer latency comparable to wired connections, making them suitable for competitive play.' },
      ],
    },
  })

  const gamingMouseRoundup = await prisma.article.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'best-gaming-mice-2025' } },
    update: { articleCategoryId: gamingRoundupsCategory.id },
    create: {
      siteId: gamingSite.id,
      articleCategoryId: gamingRoundupsCategory.id,
      categoryId: miceCategory.id, // DEPRECATED
      articleType: ArticleType.ROUNDUP,
      slug: 'best-gaming-mice-2025',
      title: 'Best Gaming Mice 2025: Top Wireless & Wired Options',
      excerpt: 'From ultra-lightweight esports mice to ergonomic workhorses, here are the best gaming mice we\'ve tested this year.',
      content: `<p>The gaming mouse market has never been more competitive. We've tested the latest offerings from Logitech, Razer, Pulsar, and more to bring you our definitive rankings.</p>

<h2>Key Considerations</h2>
<p>Weight, sensor performance, shape, and wireless technology are all crucial factors when choosing a gaming mouse.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200',
      author: 'Sarah Kim',
      seoTitle: 'Best Gaming Mice 2025 - Wireless & Wired Reviews',
      seoDescription: 'Find the perfect gaming mouse with our expert reviews. Covering wireless, wired, lightweight, and ergonomic options.',
      seoKeywords: ['gaming mouse', 'wireless mouse', 'esports mouse', 'best mouse 2025'],
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 86400000), // 1 day ago
    },
  })

  await prisma.article.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'how-to-choose-gaming-keyboard' } },
    update: { articleCategoryId: gamingBuyingGuidesCategory.id },
    create: {
      siteId: gamingSite.id,
      articleCategoryId: gamingBuyingGuidesCategory.id,
      categoryId: keyboardsCategory.id, // DEPRECATED
      articleType: ArticleType.BUYING_GUIDE,
      slug: 'how-to-choose-gaming-keyboard',
      title: 'How to Choose the Perfect Gaming Keyboard: Complete Buying Guide',
      excerpt: 'Everything you need to know about switches, layouts, features, and more when shopping for a gaming keyboard.',
      content: `<p>Buying a gaming keyboard can be overwhelming with so many options available. This guide will help you understand what matters and what doesn't.</p>

<h2>Understanding Switch Types</h2>
<p>Mechanical switches come in three main categories: linear, tactile, and clicky. Each offers a different typing and gaming experience.</p>

<h2>Form Factors Explained</h2>
<p>From full-size to 60%, keyboard layouts vary widely. Your choice depends on desk space and whether you need dedicated keys.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200',
      author: 'Alex Chen',
      seoTitle: 'Gaming Keyboard Buying Guide 2025 - How to Choose',
      seoDescription: 'Complete guide to choosing a gaming keyboard. Learn about switches, layouts, and features that matter.',
      seoKeywords: ['gaming keyboard guide', 'mechanical switches', 'keyboard layout', 'how to choose keyboard'],
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 172800000), // 2 days ago
    },
  })

  const gamingHeadsetComparison = await prisma.article.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'arctis-nova-pro-vs-cloud-iii' } },
    update: { articleCategoryId: gamingComparisonsCategory.id },
    create: {
      siteId: gamingSite.id,
      articleCategoryId: gamingComparisonsCategory.id,
      categoryId: headsetsCategory.id, // DEPRECATED
      articleType: ArticleType.COMPARISON,
      slug: 'arctis-nova-pro-vs-cloud-iii',
      title: 'SteelSeries Arctis Nova Pro vs HyperX Cloud III: Which Should You Buy?',
      excerpt: 'We compare two of the most popular gaming headsets to help you decide which is right for you.',
      content: `<p>The SteelSeries Arctis Nova Pro and HyperX Cloud III are both excellent gaming headsets, but they target different audiences and price points.</p>

<h2>Build Quality</h2>
<p>The Nova Pro features premium materials including aluminum and steel, while the Cloud III uses durable plastics with metal reinforcement.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200',
      author: 'Mike Johnson',
      seoTitle: 'Arctis Nova Pro vs Cloud III - Headset Comparison 2025',
      seoDescription: 'In-depth comparison of SteelSeries Arctis Nova Pro and HyperX Cloud III gaming headsets.',
      seoKeywords: ['arctis nova pro', 'hyperx cloud iii', 'headset comparison', 'gaming headset'],
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 259200000), // 3 days ago
    },
  })

  // Article demonstrating all shortcode types
  await prisma.article.upsert({
    where: { siteId_slug: { siteId: gamingSite.id, slug: 'ultimate-gaming-setup-guide-2025' } },
    update: { articleCategoryId: gamingBuyingGuidesCategory.id },
    create: {
      siteId: gamingSite.id,
      articleCategoryId: gamingBuyingGuidesCategory.id,
      categoryId: miceCategory.id,
      articleType: ArticleType.BUYING_GUIDE,
      slug: 'ultimate-gaming-setup-guide-2025',
      title: 'Ultimate Gaming Setup Guide 2025: Build Your Dream Battlestation',
      excerpt: 'From peripherals to furniture, we break down everything you need for the perfect gaming setup with our top product recommendations.',
      content: `<p>Building the ultimate gaming setup requires careful consideration of every component. In this comprehensive guide, we'll walk you through our top recommendations for each category, complete with product picks at every price point.</p>

<h2>Our Top Overall Pick</h2>
<p>After testing dozens of gaming mice, the Logitech G Pro X Superlight 2 stands out as our editor's choice for 2025. Here's why it earned our highest recommendation:</p>

[product:logitech-g-pro-x-superlight-2,featured]

<p>The Superlight 2 improves on its predecessor in every way that matters. The new HERO 2 sensor is flawless, the weight has been reduced even further, and battery life is exceptional.</p>

<h2>Best Gaming Mice</h2>
<p>The mouse is arguably the most important peripheral for competitive gaming. Here are our top picks across different categories:</p>

[products:gaming-mice,4]

<p>Each of these mice excels in different scenarios. The Superlight 2 is perfect for FPS games, while the DeathAdder V3 Pro offers superior ergonomics for longer sessions.</p>

<h3>Head-to-Head: Logitech vs Razer</h3>
<p>Can't decide between the two biggest names in gaming peripherals? Here's how our top picks from each brand compare:</p>

[comparison:logitech-g-pro-x-superlight-2,razer-deathadder-v3-pro]

<h2>Keyboard Recommendations</h2>
<p>A great keyboard can make or break your gaming experience. For most gamers, we recommend the Razer Huntsman V3 Pro:</p>

[product:razer-huntsman-v3-pro]

<p>If you prefer a more compact option with premium wireless, the Logitech G915 TKL is an excellent alternative:</p>

[product:logitech-g915-tkl,compact]

<h2>Audio Setup</h2>
<p>Good audio gives you a competitive advantage. Hear footsteps before your enemies see you coming. Here are the best gaming headsets we've tested:</p>

[products:gaming-headsets]

<h3>Premium vs Budget</h3>
<p>Not sure whether to splurge on the premium option? Here's how the SteelSeries Arctis Nova Pro stacks up against the more affordable HyperX Cloud III:</p>

[comparison:steelseries-arctis-nova-pro,hyperx-cloud-iii-wireless]

<h2>Monitor Selection</h2>
<p>Your monitor choice depends heavily on what games you play and your GPU. For competitive esports, refresh rate is king. For immersive single-player games, resolution and HDR matter more.</p>

[products:gaming-monitors]

<h2>Don't Forget Your Chair</h2>
<p>You'll spend hours in your gaming chair, so invest wisely. A good chair prevents back pain and improves focus during long sessions.</p>

[products:gaming-chairs]

<h2>Final Thoughts</h2>
<p>Building the perfect gaming setup is a personal journey. Start with the peripherals that matter most for your favorite games, then gradually upgrade the rest. Remember: the best setup is one that fits your playstyle and budget.</p>

<p>Have questions about any of these products? Check out our individual reviews for more in-depth analysis and testing data.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=1200',
      author: 'Alex Chen',
      seoTitle: 'Ultimate Gaming Setup Guide 2025 - Complete Battlestation Build',
      seoDescription: 'Build your dream gaming setup with our comprehensive guide. Expert recommendations for mice, keyboards, headsets, monitors, and chairs.',
      seoKeywords: ['gaming setup', 'battlestation', 'gaming peripherals', 'pc gaming', 'gaming gear 2025'],
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(),
      faqs: [
        { question: 'How much should I spend on a gaming setup?', answer: 'A solid gaming setup can range from $500 for essentials to $2000+ for premium gear. We recommend prioritizing mouse and monitor first, as they have the biggest impact on gameplay.' },
        { question: 'Wireless or wired peripherals?', answer: 'Modern wireless gaming peripherals have virtually zero latency compared to wired. Go wireless for a cleaner setup without sacrificing performance.' },
        { question: 'Do I need RGB lighting?', answer: 'RGB is purely aesthetic and doesn\'t improve performance. However, it can enhance your setup\'s look and some find it helps with immersion.' },
      ],
    },
  })

  console.log('Created gaming articles')

  // ============================================
  // TECH ARTICLES
  // ============================================
  const techLaptopRoundup = await prisma.article.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'best-laptops-2025' } },
    update: { articleCategoryId: techRoundupsCategory.id },
    create: {
      siteId: techSite.id,
      articleCategoryId: techRoundupsCategory.id,
      categoryId: laptopsCategory.id, // DEPRECATED
      articleType: ArticleType.ROUNDUP,
      slug: 'best-laptops-2025',
      title: 'Best Laptops 2025: Top Picks for Work, Gaming & Creativity',
      excerpt: 'From ultrabooks to gaming powerhouses, these are the best laptops you can buy right now.',
      content: `<p>We've tested over 50 laptops this year to find the best options across every category and budget.</p>

<h2>Our Testing Methodology</h2>
<p>Each laptop undergoes extensive benchmarking, battery testing, display analysis, and real-world workflow evaluation.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
      author: 'Emma Watson',
      seoTitle: 'Best Laptops 2025 - Expert Reviews & Recommendations',
      seoDescription: 'Comprehensive guide to the best laptops in 2025. From MacBooks to gaming laptops, find your perfect match.',
      seoKeywords: ['best laptop', 'laptop 2025', 'macbook', 'gaming laptop'],
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(),
      faqs: [
        { question: 'Should I get a Mac or Windows laptop?', answer: 'It depends on your needs. Macs excel at creative work and have great battery life, while Windows offers more hardware variety and gaming options.' },
        { question: 'How much RAM do I need?', answer: 'For most users, 16GB is the sweet spot. Power users and professionals may benefit from 32GB or more.' },
      ],
    },
  })

  const techPhoneRoundup = await prisma.article.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'best-smartphones-2025' } },
    update: { articleCategoryId: techRoundupsCategory.id },
    create: {
      siteId: techSite.id,
      articleCategoryId: techRoundupsCategory.id,
      categoryId: phonesCategory.id, // DEPRECATED
      articleType: ArticleType.ROUNDUP,
      slug: 'best-smartphones-2025',
      title: 'Best Smartphones 2025: iPhone, Android & Budget Picks',
      excerpt: 'Our comprehensive guide to the best phones across all platforms and price ranges.',
      content: `<p>The smartphone market continues to evolve with AI-powered features, improved cameras, and longer battery life.</p>

<h2>What's New in 2025</h2>
<p>This year brings significant improvements in on-device AI, camera computational photography, and charging speeds.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
      author: 'David Park',
      seoTitle: 'Best Smartphones 2025 - iPhone & Android Reviews',
      seoDescription: 'Find the best smartphone for you in 2025. Covering iPhone, Samsung, Google Pixel, and budget options.',
      seoKeywords: ['best smartphone', 'iphone', 'android', 'phone 2025'],
      status: ContentStatus.PUBLISHED,
      isFeatured: true,
      publishedAt: new Date(Date.now() - 86400000),
    },
  })

  const techIphoneVsSamsung = await prisma.article.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'iphone-15-pro-vs-galaxy-s24-ultra' } },
    update: { articleCategoryId: techComparisonsCategory.id },
    create: {
      siteId: techSite.id,
      articleCategoryId: techComparisonsCategory.id,
      categoryId: phonesCategory.id, // DEPRECATED
      articleType: ArticleType.COMPARISON,
      slug: 'iphone-15-pro-vs-galaxy-s24-ultra',
      title: 'iPhone 15 Pro Max vs Samsung Galaxy S24 Ultra: The Ultimate Showdown',
      excerpt: 'Two flagship titans go head-to-head. Which premium smartphone deserves your money?',
      content: `<p>Apple and Samsung continue their battle for smartphone supremacy with their latest flagships.</p>

<h2>Design & Build</h2>
<p>Both phones feature titanium frames and premium glass construction, but with distinctly different design philosophies.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200',
      author: 'Emma Watson',
      seoTitle: 'iPhone 15 Pro Max vs Galaxy S24 Ultra - Full Comparison',
      seoDescription: 'Detailed comparison of iPhone 15 Pro Max and Samsung Galaxy S24 Ultra. Camera, performance, and value compared.',
      seoKeywords: ['iphone 15 pro', 'galaxy s24 ultra', 'phone comparison', 'flagship phone'],
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 172800000),
    },
  })

  await prisma.article.upsert({
    where: { siteId_slug: { siteId: techSite.id, slug: 'how-to-choose-laptop-2025' } },
    update: { articleCategoryId: techBuyingGuidesCategory.id },
    create: {
      siteId: techSite.id,
      articleCategoryId: techBuyingGuidesCategory.id,
      categoryId: laptopsCategory.id, // DEPRECATED
      articleType: ArticleType.BUYING_GUIDE,
      slug: 'how-to-choose-laptop-2025',
      title: 'Laptop Buying Guide 2025: Everything You Need to Know',
      excerpt: 'CPU, GPU, RAM, storage, display - we break down all the specs that matter when buying a laptop.',
      content: `<p>Choosing a laptop can be confusing with so many options and specifications to consider.</p>

<h2>Understanding Processors</h2>
<p>Intel vs AMD, performance cores vs efficiency cores - we explain what actually matters for your use case.</p>`,
      featuredImage: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1200',
      author: 'David Park',
      seoTitle: 'Laptop Buying Guide 2025 - How to Choose the Right Laptop',
      seoDescription: 'Complete laptop buying guide covering processors, graphics, RAM, storage, and displays.',
      seoKeywords: ['laptop guide', 'how to buy laptop', 'laptop specs', 'laptop buying tips'],
      status: ContentStatus.PUBLISHED,
      isFeatured: false,
      publishedAt: new Date(Date.now() - 259200000),
    },
  })

  console.log('Created tech articles')

  // ============================================
  // ARTICLE-PRODUCT RELATIONSHIPS - GAMING
  // ============================================
  const gamingArticleProducts = [
    // Keyboard Roundup
    { articleId: gamingKeyboardRoundup.id, productId: logitechG915.id, position: 1, highlight: 'Best Overall' },
    { articleId: gamingKeyboardRoundup.id, productId: razerHuntsman.id, position: 2, highlight: 'Best for Esports' },
    // Mouse Roundup
    { articleId: gamingMouseRoundup.id, productId: logitechSuperlight2.id, position: 1, highlight: 'Best Overall' },
    { articleId: gamingMouseRoundup.id, productId: razerDeathAdder.id, position: 2, highlight: 'Best Ergonomic' },
    // Headset Comparison
    { articleId: gamingHeadsetComparison.id, productId: steelSeriesArctis.id, position: 1, highlight: 'Premium Pick' },
    { articleId: gamingHeadsetComparison.id, productId: hyperXCloud3.id, position: 2, highlight: 'Best Value' },
  ]

  for (const ap of gamingArticleProducts) {
    await prisma.articleProduct.upsert({
      where: { articleId_productId: { articleId: ap.articleId, productId: ap.productId } },
      update: {},
      create: ap,
    })
  }

  // ============================================
  // ARTICLE-PRODUCT RELATIONSHIPS - TECH
  // ============================================
  const techArticleProducts = [
    // Laptop Roundup
    { articleId: techLaptopRoundup.id, productId: macbookPro.id, position: 1, highlight: 'Best Overall' },
    { articleId: techLaptopRoundup.id, productId: dellXPS15.id, position: 2, highlight: 'Best Windows Laptop' },
    // Phone Roundup
    { articleId: techPhoneRoundup.id, productId: iPhone15Pro.id, position: 1, highlight: 'Best iPhone' },
    { articleId: techPhoneRoundup.id, productId: samsungS24Ultra.id, position: 2, highlight: 'Best Android' },
    // iPhone vs Samsung Comparison
    { articleId: techIphoneVsSamsung.id, productId: iPhone15Pro.id, position: 1, highlight: null },
    { articleId: techIphoneVsSamsung.id, productId: samsungS24Ultra.id, position: 2, highlight: null },
  ]

  for (const ap of techArticleProducts) {
    await prisma.articleProduct.upsert({
      where: { articleId_productId: { articleId: ap.articleId, productId: ap.productId } },
      update: {},
      create: ap,
    })
  }

  console.log('Created article-product relationships')

  console.log('\nSeeding completed successfully!')
  console.log('\nSummary:')
  console.log('   - 2 Niches: Gaming, Tech')
  console.log('   - 2 Sites: ProGamer Hub, TechFlow')
  console.log('   - 10 Product Categories (5 per site)')
  console.log('   - 10 Article Categories (5 per site: Buying Guides, Roundups, Reviews, How-To, Comparisons)')
  console.log('   - 20 Products (10 per site)')
  console.log('   - 20 Product-Category relationships')
  console.log('   - 8 Articles (4 per site: roundups, comparisons, buying guides)')
  console.log('   - 12 Article-Product relationships')
  console.log('\nAccess your sites:')
  console.log('   - Gaming: http://localhost:3000?site=demo-gaming')
  console.log('   - Tech: http://localhost:3000?site=demo-tech')
  console.log('\nReviews section:')
  console.log('   - Gaming Reviews: http://localhost:3000/demo-gaming/reviews')
  console.log('   - Tech Articles: http://localhost:3000/demo-tech/articles')
  console.log('\nArticle Categories:')
  console.log('   - Gaming Roundups: http://localhost:3000/demo-gaming/reviews/roundups')
  console.log('   - Gaming Buying Guides: http://localhost:3000/demo-gaming/reviews/buying-guides')
  console.log('   - Tech Roundups: http://localhost:3000/demo-tech/articles/roundups')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
