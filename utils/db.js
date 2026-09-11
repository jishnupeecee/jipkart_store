const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function loadRaw() {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function saveRaw(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ---- Seed default data on first run ----
function seedIfEmpty() {
  const data = loadRaw();

  if (data.users.length === 0) {
    const adminPass = bcrypt.hashSync('admin123', 8);
    const sellerPass = bcrypt.hashSync('seller123', 8);
    const customerPass = bcrypt.hashSync('customer123', 8);

    data.users.push({
      id: data.nextUserId++,
      name: 'Jipkart Admin',
      email: 'admin@jipkart.com',
      password: adminPass,
      role: 'admin',
      phone: '9876543210'
    });

    data.users.push({
      id: data.nextUserId++,
      name: 'Ravi Building Supplies',
      email: 'seller@jipkart.com',
      password: sellerPass,
      role: 'seller',
      shopName: 'Ravi Building Supplies',
      phone: '9876500000'
    });

    data.users.push({
      id: data.nextUserId++,
      name: 'Demo Customer',
      email: 'customer@jipkart.com',
      password: customerPass,
      role: 'customer',
      phone: '9876511111',
      address: '12 MG Road, Kochi, Kerala'
    });
  }

  if (data.products.length === 0) {
    const sellerId = data.users.find(u => u.role === 'seller').id;
    const sampleProducts = [
      { name: 'UltraTech Cement (OPC 53 Grade)', category: 'Cement & Concrete', price: 345, mrp: 430, unit: 'per 50kg bag', stock: 500, image: 'https://picsum.photos/seed/cement1/500/400', description: 'High strength OPC 53 grade cement, ideal for RCC work and structural concrete. Trusted brand with consistent quality.' },
      { name: 'ACC Gold Cement', category: 'Cement & Concrete', price: 360, mrp: 400, unit: 'per 50kg bag', stock: 300, image: 'https://picsum.photos/seed/cement2/500/400', description: 'Premium cement offering superior strength and durability for all construction needs.' },
      { name: 'TMT Steel Bars Fe550 (12mm)', category: 'Steel & TMT Bars', price: 61, mrp: 68, unit: 'per kg', stock: 5000, image: 'https://picsum.photos/seed/tmt1/500/400', description: 'Corrosion resistant Fe550 grade TMT bars, ISI certified, ideal for earthquake resistant construction.' },
      { name: 'TMT Steel Bars Fe500 (8mm)', category: 'Steel & TMT Bars', price: 58, mrp: 64, unit: 'per kg', stock: 4000, image: 'https://picsum.photos/seed/tmt2/500/400', description: 'High tensile strength steel bars suitable for slabs, beams and columns.' },
      { name: 'Red Clay Bricks (Standard)', category: 'Bricks & Blocks', price: 8, mrp: 10, unit: 'per piece', stock: 20000, image: 'https://picsum.photos/seed/bricks1/500/400', description: 'Table moulded red clay bricks, well burnt, uniform size for strong masonry work.' },
      { name: 'AAC Concrete Blocks (600x200x100mm)', category: 'Bricks & Blocks', price: 55, mrp: 65, unit: 'per piece', stock: 3000, image: 'https://picsum.photos/seed/blocks1/500/400', description: 'Lightweight autoclaved aerated concrete blocks, great thermal insulation and faster construction.' },
      { name: 'River Sand (M-Sand Alternative)', category: 'Sand & Aggregates', price: 55, mrp: 60, unit: 'per cubic ft', stock: 10000, image: 'https://picsum.photos/seed/sand1/500/400', description: 'Fine quality river sand suitable for plastering and masonry work.' },
      { name: 'M-Sand (Manufactured Sand)', category: 'Sand & Aggregates', price: 48, mrp: 52, unit: 'per cubic ft', stock: 10000, image: 'https://picsum.photos/seed/sand2/500/400', description: 'Consistent quality manufactured sand, eco-friendly alternative to river sand for concrete work.' },
      { name: 'Flush Door (32mm, Teak Finish)', category: 'Doors & Windows', price: 3200, mrp: 3800, unit: 'per piece', stock: 40, image: 'https://picsum.photos/seed/door1/500/400', description: 'Solid core flush door with teak laminate finish, termite and warp resistant.' },
      { name: 'UPVC Window (4x3 ft, Sliding)', category: 'Doors & Windows', price: 5500, mrp: 6200, unit: 'per piece', stock: 25, image: 'https://picsum.photos/seed/window1/500/400', description: 'Weatherproof UPVC sliding window with mosquito mesh, energy efficient glazing.' },
      { name: 'CPVC Pipe (1 inch, 3m length)', category: 'Plumbing Supplies', price: 220, mrp: 250, unit: 'per piece', stock: 800, image: 'https://picsum.photos/seed/pipe1/500/400', description: 'Astral CPVC pipe suitable for hot and cold water plumbing lines.' },
      { name: 'PVC Elbow Fitting 90° (1 inch)', category: 'Plumbing Supplies', price: 35, mrp: 45, unit: 'per piece', stock: 2000, image: 'https://picsum.photos/seed/pipe2/500/400', description: 'Durable PVC elbow fitting for plumbing pipe connections.' },
      { name: 'Copper Wire Cable (1.5 sqmm, 90m)', category: 'Electrical Supplies', price: 1450, mrp: 1650, unit: 'per coil', stock: 150, image: 'https://picsum.photos/seed/wire1/500/400', description: 'FR grade copper wiring cable, fire retardant insulation, ideal for house wiring.' },
      { name: 'MCB Switch (16A, Single Pole)', category: 'Electrical Supplies', price: 120, mrp: 140, unit: 'per piece', stock: 600, image: 'https://picsum.photos/seed/mcb1/500/400', description: 'Miniature circuit breaker for overload and short circuit protection.' },
      { name: 'Asian Paints Exterior Emulsion', category: 'Paints & Coatings', price: 2450, mrp: 2800, unit: 'per 10L bucket', stock: 120, image: 'https://picsum.photos/seed/paint1/500/400', description: 'Weatherproof exterior emulsion paint with long lasting shine and protection.' },
      { name: 'Interior Wall Putty', category: 'Paints & Coatings', price: 550, mrp: 620, unit: 'per 20kg bag', stock: 400, image: 'https://picsum.photos/seed/putty1/500/400', description: 'White cement based wall putty for smooth, crack-free interior walls.' },
      { name: 'Stainless Steel Hinges (4 inch)', category: 'Hardware & Fasteners', price: 45, mrp: 55, unit: 'per piece', stock: 1000, image: 'https://picsum.photos/seed/hinge1/500/400', description: 'Rust resistant SS door hinges, heavy duty and long lasting.' },
      { name: 'Anchor Bolts (M10 x 100mm)', category: 'Hardware & Fasteners', price: 18, mrp: 22, unit: 'per piece', stock: 3000, image: 'https://picsum.photos/seed/bolt1/500/400', description: 'High strength anchor bolts for fixing frames and heavy fixtures.' },
      { name: 'Safety Helmet (ISI Marked)', category: 'Tools & Safety', price: 180, mrp: 220, unit: 'per piece', stock: 300, image: 'https://picsum.photos/seed/helmet1/500/400', description: 'Impact resistant construction safety helmet, adjustable strap, ISI marked.' },
      { name: 'Cordless Drill Machine (18V)', category: 'Tools & Safety', price: 2800, mrp: 3400, unit: 'per piece', stock: 60, image: 'https://picsum.photos/seed/drill1/500/400', description: 'Powerful cordless drill with 2 batteries, ideal for masonry and wood drilling.' },
      { name: 'Vitrified Floor Tiles (2x2 ft)', category: 'Tiles & Sanitary', price: 45, mrp: 55, unit: 'per sq.ft', stock: 5000, image: 'https://picsum.photos/seed/tile1/500/400', description: 'Glossy finish vitrified tiles, stain resistant and easy to clean.' },
      { name: 'Wash Basin (Ceramic, Wall Mounted)', category: 'Tiles & Sanitary', price: 1650, mrp: 1900, unit: 'per piece', stock: 80, image: 'https://picsum.photos/seed/basin1/500/400', description: 'Elegant ceramic wash basin with wall mounting fittings included.' }
    ];

    sampleProducts.forEach(p => {
      data.products.push({
        id: data.nextProductId++,
        sellerId,
        ...p,
        createdAt: new Date().toISOString()
      });
    });
  }

  saveRaw(data);
}

seedIfEmpty();

// ---- Public API ----
module.exports = {
  // Users
  getUsers() { return loadRaw().users; },
  getUserById(id) { return loadRaw().users.find(u => u.id === Number(id)); },
  getUserByEmail(email) { return loadRaw().users.find(u => u.email.toLowerCase() === String(email).toLowerCase()); },
  createUser(user) {
    const data = loadRaw();
    const newUser = { id: data.nextUserId++, ...user };
    data.users.push(newUser);
    saveRaw(data);
    return newUser;
  },
  deleteUser(id) {
    const data = loadRaw();
    data.users = data.users.filter(u => u.id !== Number(id));
    saveRaw(data);
  },

  // Products
  getProducts() { return loadRaw().products; },
  getProductById(id) { return loadRaw().products.find(p => p.id === Number(id)); },
  getProductsBySeller(sellerId) { return loadRaw().products.filter(p => p.sellerId === Number(sellerId)); },
  createProduct(product) {
    const data = loadRaw();
    const newProduct = { id: data.nextProductId++, createdAt: new Date().toISOString(), ...product };
    data.products.push(newProduct);
    saveRaw(data);
    return newProduct;
  },
  updateProduct(id, updates) {
    const data = loadRaw();
    const idx = data.products.findIndex(p => p.id === Number(id));
    if (idx === -1) return null;
    data.products[idx] = { ...data.products[idx], ...updates };
    saveRaw(data);
    return data.products[idx];
  },
  deleteProduct(id) {
    const data = loadRaw();
    data.products = data.products.filter(p => p.id !== Number(id));
    saveRaw(data);
  },
  decrementStock(id, qty) {
    const data = loadRaw();
    const p = data.products.find(pr => pr.id === Number(id));
    if (p) {
      p.stock = Math.max(0, p.stock - qty);
      saveRaw(data);
    }
  },

  // Orders
  getOrders() { return loadRaw().orders; },
  getOrdersByUser(userId) { return loadRaw().orders.filter(o => o.userId === Number(userId)); },
  getOrderById(id) { return loadRaw().orders.find(o => o.id === Number(id)); },
  createOrder(order) {
    const data = loadRaw();
    const newOrder = { id: data.nextOrderId++, createdAt: new Date().toISOString(), ...order };
    data.orders.push(newOrder);
    saveRaw(data);
    return newOrder;
  },
  updateOrderStatus(id, status) {
    const data = loadRaw();
    const o = data.orders.find(od => od.id === Number(id));
    if (o) {
      o.status = status;
      saveRaw(data);
    }
  },

  getCategories() {
    const products = loadRaw().products;
    return [...new Set(products.map(p => p.category))];
  }
};
