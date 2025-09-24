/**
 * HomeFix Backend Server
 * Main API server for the HomeFix home service platform
 * Handles services, orders, users, dashboard, and payment processing
 */

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_4eC39HqLyjWDarjtT1zdp7dc');

// Initialize Express app
const app = express();

// Middleware configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/payment', express.static(path.join(__dirname, '../payment_gateway')));

// Mock data storage (in production, this would be a database)
const services = [
  { id: 'SVC001', name: 'Perbaikan Rumah', description: 'Layanan perbaikan rumah tangga', price: 'Rp 150.000 - Rp 500.000', status: 'active' },
  { id: 'SVC002', name: 'Renovasi Interior', description: 'Renovasi dan dekorasi interior', price: 'Rp 300.000 - Rp 1.000.000', status: 'active' },
  { id: 'SVC003', name: 'Perawatan Taman', description: 'Layanan perawatan taman', price: 'Rp 100.000 - Rp 300.000', status: 'active' },
  { id: 'SVC004', name: 'Pembersihan Rumah', description: 'Layanan pembersihan rumah', price: 'Rp 200.000 - Rp 400.000', status: 'active' },
  { id: 'SVC005', name: 'Instalasi Listrik', description: 'Layanan instalasi listrik', price: 'Rp 250.000 - Rp 600.000', status: 'active' },
  { id: 'SVC006', name: 'Perbaikan Plumbing', description: 'Layanan perbaikan plumbing', price: 'Rp 180.000 - Rp 450.000', status: 'active' }
];

const orders = [
  { id: 'ORD001', customer: 'Budi Santoso', service: 'Perbaikan Plumbing', date: '2024-01-15', cost: 'Rp 185.000', status: 'completed', technician: 'Pak Ahmad', rating: 5, review: 'Pekerjaan sangat rapi dan cepat. Masalah keran bocor teratasi dengan baik.' },
  { id: 'ORD002', customer: 'Siti Nurhaliza', service: 'Service AC', date: '2024-01-14', cost: 'Rp 125.000', status: 'completed', technician: 'Pak Budi', rating: 4, review: 'AC sekarang dingin kembali. Teknisi datang tepat waktu dan profesional.' },
  { id: 'ORD003', customer: 'Hendro Wijaya', service: 'Instalasi Listrik', date: '2024-01-13', cost: 'Rp 450.000', status: 'in-progress', technician: 'Pak Candra', rating: null, review: null }
];

const users = [
  { id: 'USR001', name: 'Bambang Subagio', email: 'bambang.subagio@gmail.com', phone: '+628112940563', address: 'Jl. Melati Indah Raya No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12120', password: 'password123', role: 'user', status: 'active', joinDate: '2024-01-15' },
  { id: 'USR002', name: 'Jhon Kendy', email: 'jhon.kendy@yahoo.com', phone: '+628112942564', address: 'Jl. Melati Indah Raya No. 45, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12120', password: 'password456', role: 'user', status: 'active', joinDate: '2024-01-16' },
  { id: 'ADM001', name: 'Administrator', email: 'admin@homefix.com', password: 'admin', phone: '+62 813-4567-8901', role: 'admin', status: 'active', joinDate: '2023-01-01' }
];

// Utility functions
const generateId = (prefix) => `${prefix}${Date.now()}`;
const parsePrice = (priceStr) => parseInt(priceStr.replace(/\D/g, '')) || 0;
const validateRequired = (fields, data) => {
  const missing = fields.filter(field => !data[field]);
  return missing.length === 0 ? null : missing;
};

// API Routes

// Services endpoints
app.get('/api/services', (req, res) => {
  try {
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/services/:id', (req, res) => {
  try {
    const service = services.find(s => s.id === req.params.id);
    if (service) {
      res.json({ success: true, data: service });
    } else {
      res.status(404).json({ success: false, error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/services', (req, res) => {
  try {
    const missingFields = validateRequired(['name', 'description', 'price'], req.body);
    if (missingFields) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const newService = {
      id: generateId('SVC'),
      ...req.body,
      status: req.body.status || 'active'
    };
    services.push(newService);
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/services/:id', (req, res) => {
  try {
    const index = services.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      services[index] = { ...services[index], ...req.body };
      res.json({ success: true, data: services[index] });
    } else {
      res.status(404).json({ success: false, error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  try {
    const index = services.findIndex(s => s.id === req.params.id);
    if (index !== -1) {
      const deletedService = services.splice(index, 1)[0];
      res.json({ success: true, data: deletedService });
    } else {
      res.status(404).json({ success: false, error: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Orders endpoints
app.get('/api/orders', (req, res) => {
  try {
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      res.json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const missingFields = validateRequired(['customer', 'service', 'cost'], req.body);
    if (missingFields) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const newOrder = {
      id: generateId('ORD'),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0],
      status: req.body.status || 'pending'
    };
    orders.push(newOrder);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    if (!req.body.status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const order = orders.find(o => o.id === req.params.id);
    if (order) {
      order.status = req.body.status;
      res.json({ success: true, data: order });
    } else {
      res.status(404).json({ success: false, error: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Users endpoints
app.get('/api/users', (req, res) => {
  try {
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/users/:id', (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const missingFields = validateRequired(['name', 'email', 'phone', 'role'], req.body);
    if (missingFields) {
      return res.status(400).json({ success: false, error: `Missing required fields: ${missingFields.join(', ')}` });
    }

    const newUser = {
      id: generateId('USR'),
      ...req.body,
      status: req.body.status || 'active',
      joinDate: req.body.joinDate || new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    res.status(201).json({ success: true, data: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...req.body };
      res.json({ success: true, data: users[index] });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.put('/api/users/:id/status', (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (user) {
      user.status = user.status === 'active' ? 'inactive' : 'active';
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const stats = {
      totalServices: services.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalRevenue: orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + parsePrice(o.cost), 0)
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Reports endpoints
app.get('/api/reports', (req, res) => {
  try {
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
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Payment endpoints
app.post('/payment/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount < 50) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 50 cents'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
      }
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Payment processing failed'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HomeFix API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HomeFix server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`💳 Payment: http://localhost:${PORT}/payment`);
});

module.exports = app;
