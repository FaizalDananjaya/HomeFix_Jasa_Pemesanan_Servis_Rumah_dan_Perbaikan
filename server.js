const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve payment gateway static files
app.use('/payment', express.static(path.join(__dirname, '../payment_gateway')));

// Mock data for services
const services = [
  {
    id: 'SVC001',
    name: 'Perbaikan Plumbing',
    description: 'Layanan perbaikan sistem perpipaan, keran bocor, toilet mampet, dan instalasi sanitasi. Teknisi berpengalaman dengan peralatan modern.',
    price: 'Rp 75.000 - Rp 350.000',
    basePrice: 75000,
    category: 'Perbaikan',
    duration: '1-3 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
    features: ['Pemeriksaan menyeluruh', 'Perbaikan permanen', 'Garansi 30 hari', 'Pembersihan area kerja']
  },
  {
    id: 'SVC002',
    name: 'Instalasi Listrik',
    description: 'Pemasangan instalasi listrik baru, perbaikan korsleting, pemasangan stop kontak, dan pengecekan kelistrikan rumah.',
    price: 'Rp 125.000 - Rp 750.000',
    basePrice: 125000,
    category: 'Instalasi',
    duration: '2-6 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop',
    features: ['Sertifikasi tenaga listrik', 'Material berkualitas', 'Safety check', 'Garansi 6 bulan']
  },
  {
    id: 'SVC003',
    name: 'Renovasi Interior',
    description: 'Renovasi ruangan dalam rumah, pengecatan dinding, pemasangan wallpaper, dan dekorasi interior yang modern.',
    price: 'Rp 500.000 - Rp 3.500.000',
    basePrice: 500000,
    category: 'Renovasi',
    duration: '1-5 hari',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    features: ['Desain konsultasi gratis', 'Material premium', 'Finishing rapi', 'Garansi 1 tahun']
  },
  {
    id: 'SVC004',
    name: 'Perawatan Taman',
    description: 'Perawatan taman, pemangkasan tanaman, penanaman bunga, dan pembuatan landscape taman yang indah.',
    price: 'Rp 150.000 - Rp 800.000',
    basePrice: 150000,
    category: 'Perawatan',
    duration: '2-8 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    features: ['Konsultasi landscape', 'Tanaman berkualitas', 'Perawatan berkala', 'Garansi tanaman hidup']
  },
  {
    id: 'SVC005',
    name: 'Pembersihan Rumah',
    description: 'Layanan pembersihan rumah menyeluruh, cuci sofa, cuci karpet, dan general cleaning untuk hunian bersih.',
    price: 'Rp 200.000 - Rp 1.200.000',
    basePrice: 200000,
    category: 'Pembersihan',
    duration: '3-8 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    features: ['Pembersihan menyeluruh', 'Produk eco-friendly', 'Deep cleaning', 'Sanitasi lengkap']
  },
  {
    id: 'SVC006',
    name: 'Perbaikan Atap',
    description: 'Perbaikan kebocoran atap, penggantian genteng, pemasangan talang air, dan waterproofing atap rumah.',
    price: 'Rp 300.000 - Rp 2.000.000',
    basePrice: 300000,
    category: 'Perbaikan',
    duration: '4-12 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    features: ['Inspeksi struktur', 'Material anti bocor', 'Pekerjaan rapi', 'Garansi 2 tahun']
  },
  {
    id: 'SVC007',
    name: 'Service AC',
    description: 'Pembersihan AC, pengisian freon, perbaikan kompresor, dan instalasi AC baru dengan garansi resmi.',
    price: 'Rp 85.000 - Rp 650.000',
    basePrice: 85000,
    category: 'Service',
    duration: '1-4 jam',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
    features: ['Teknisi bersertifikat', 'Freon R32', 'Cuci menyeluruh', 'Garansi 3 bulan']
  },
  {
    id: 'SVC008',
    name: 'Pengecatan Rumah',
    description: 'Jasa pengecatan interior dan eksterior rumah dengan cat berkualitas, finishing halus, dan hasil maksimal.',
    price: 'Rp 400.000 - Rp 2.500.000',
    basePrice: 400000,
    category: 'Renovasi',
    duration: '1-3 hari',
    status: 'active',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop',
    features: ['Konsultasi warna gratis', 'Cat premium', 'Finishing sempurna', 'Garansi 1 tahun']
  }
];

// Mock data for orders
const orders = [
  {
    id: 'ORD001',
    customer: 'Budi Santoso',
    service: 'Perbaikan Plumbing',
    date: '2024-01-15',
    cost: 'Rp 185.000',
    status: 'completed',
    technician: 'Pak Ahmad',
    rating: 5,
    review: 'Pekerjaan sangat rapi dan cepat. Masalah keran bocor teratasi dengan baik.'
  },
  {
    id: 'ORD002',
    customer: 'Siti Nurhaliza',
    service: 'Service AC',
    date: '2024-01-14',
    cost: 'Rp 125.000',
    status: 'completed',
    technician: 'Pak Budi',
    rating: 4,
    review: 'AC sekarang dingin kembali. Teknisi datang tepat waktu dan profesional.'
  },
  {
    id: 'ORD003',
    customer: 'Hendro Wijaya',
    service: 'Instalasi Listrik',
    date: '2024-01-13',
    cost: 'Rp 450.000',
    status: 'in-progress',
    technician: 'Pak Candra',
    rating: null,
    review: null
  },
  {
    id: 'ORD004',
    customer: 'Maya Sari',
    service: 'Pembersihan Rumah',
    date: '2024-01-12',
    cost: 'Rp 350.000',
    status: 'completed',
    technician: 'Tim Cleaning',
    rating: 5,
    review: 'Rumah jadi sangat bersih dan wangi. Pelayanan excellent!'
  },
  {
    id: 'ORD005',
    customer: 'Agus Setiawan',
    service: 'Perawatan Taman',
    date: '2024-01-11',
    cost: 'Rp 275.000',
    status: 'completed',
    technician: 'Pak Dedi',
    rating: 4,
    review: 'Taman terlihat lebih rapi dan tanaman lebih sehat. Terima kasih!'
  },
  {
    id: 'ORD006',
    customer: 'Rina Kartika',
    service: 'Renovasi Interior',
    date: '2024-01-10',
    cost: 'Rp 1.250.000',
    status: 'in-progress',
    technician: 'Tim Renovasi',
    rating: null,
    review: null
  },
  {
    id: 'ORD007',
    customer: 'Tono Prasetyo',
    service: 'Perbaikan Atap',
    date: '2024-01-09',
    cost: 'Rp 650.000',
    status: 'completed',
    technician: 'Pak Eko',
    rating: 5,
    review: 'Atap tidak bocor lagi. Pekerjaan sangat teliti dan hasilnya memuaskan.'
  },
  {
    id: 'ORD008',
    customer: 'Dewi Lestari',
    service: 'Pengecatan Rumah',
    date: '2024-01-08',
    cost: 'Rp 850.000',
    status: 'pending',
    technician: null,
    rating: null,
    review: null
  }
];

// Mock data for users
const users = [
  { id: 'USR001', name: 'Bambang Subagio', email: 'bambang.subagio@gmail.com', phone: '+628112940563', address: 'Jl. Melati Indah Raya No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12120', password: 'password123', role: 'user', status: 'active', joinDate: '2024-01-15' },
  { id: 'USR002', name: 'Jhon Kendy', email: 'jhon.kendy@yahoo.com', phone: '+628112942564', address: 'Jl. Melati Indah Raya No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12120', password: 'password456', role: 'user', status: 'active', joinDate: '2024-01-16' },
  { id: 'ADM001', name: 'Administrator', email: 'admin@homefix.com', password: 'admin', phone: '+62 813-4567-8901', role: 'admin', status: 'active', joinDate: '2023-01-01' }
];

// API Endpoints

// Get all services
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Get service by ID
app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Create new service
app.post('/api/services', (req, res) => {
  const newService = { id: `SVC${Date.now()}`, ...req.body };
  services.push(newService);
  res.status(201).json(newService);
});

// Update service
app.put('/api/services/:id', (req, res) => {
  const index = services.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    services[index] = { ...services[index], ...req.body };
    res.json(services[index]);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Delete service
app.delete('/api/services/:id', (req, res) => {
  const index = services.findIndex(s => s.id === req.params.id);
  if (index !== -1) {
    const deletedService = services.splice(index, 1);
    res.json(deletedService[0]);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Get order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Create new order
app.post('/api/orders', (req, res) => {
  const newOrder = { id: `ORD${Date.now()}`, ...req.body };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// Update order status
app.put('/api/orders/:id/status', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (order) {
    order.status = req.body.status;
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Create new user
app.post('/api/users', (req, res) => {
  const newUser = { id: `USR${Date.now()}`, ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    res.json(users[index]);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Toggle user status
app.put('/api/users/:id/status', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (user) {
    user.status = user.status === 'active' ? 'inactive' : 'active';
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    totalServices: services.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseInt(o.cost.replace(/\D/g, '')), 0)
  };
  res.json(stats);
});

// Get reports data
app.get('/api/reports', (req, res) => {
  const reports = {
    ordersByService: services.map(service => ({
      service: service.name,
      orders: orders.filter(o => o.service === service.name).length
    })),
    revenueByMonth: [
      { month: 'Januari', revenue: 12000000 },
      { month: 'Februari', revenue: 19000000 },
      { month: 'Maret', revenue: 15000000 },
      { month: 'April', revenue: 25000000 },
      { month: 'Mei', revenue: 22000000 },
      { month: 'Juni', revenue: 30000000 }
    ]
  };
  res.json(reports);
});

// Authentication Endpoints

// User Registration
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phone, password, address } = req.body;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email sudah terdaftar' });
  }

  // Create new user
  const newUser = {
    id: `USR${Date.now()}`,
    name: fullName,
    email: email,
    phone: phone,
    password: password, // In production, hash the password
    address: address,
    role: 'user',
    status: 'active',
    joinDate: new Date().toISOString().split('T')[0]
  };

  users.push(newUser);

  // Return user data without password
  const { password: _, ...userResponse } = newUser;
  res.status(201).json({
    message: 'Registrasi berhasil',
    user: userResponse
  });
});

// User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  if (user.status !== 'active') {
    return res.status(401).json({ error: 'Akun tidak aktif' });
  }

  // Return user data without password
  const { password: _, ...userResponse } = user;
  res.json({
    message: 'Login berhasil',
    user: userResponse
  });
});

// Admin Login
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;

  // Find admin user
  const admin = users.find(u => u.email === email && u.password === password && u.role === 'admin');

  if (!admin) {
    return res.status(401).json({ error: 'Email atau password admin salah' });
  }

  if (admin.status !== 'active') {
    return res.status(401).json({ error: 'Akun admin tidak aktif' });
  }

  // Return admin data without password
  const { password: _, ...adminResponse } = admin;
  res.json({
    message: 'Login admin berhasil',
    user: adminResponse
  });
});

// Get current user profile
app.get('/api/auth/profile', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Payment Gateway Endpoints
app.post('/payment/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
