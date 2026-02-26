const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'anurag-software-solutions-secret-2024';

// ===== IN-MEMORY DATABASE =====
const db = {
  users: [],
  projects: [],
  services: [],
  serviceRequests: [],
  messages: [],
  companies: []
};

// Seed admin user
const seedAdmin = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.users.push({
    id: 'admin-001',
    name: 'Anurag Admin',
    email: 'admin@anurag.com',
    password: hashedPassword,
    role: 'admin',
    phone: '+1-555-0100',
    avatar: 'AA',
    createdAt: new Date().toISOString()
  });
  console.log('Admin seeded: admin@anurag.com / admin123');
};
seedAdmin();

// ===== MIDDLEWARE =====
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};

// ===== AUTH ROUTES =====
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userWithoutPass } = user;
  res.json({ token, user: userWithoutPass });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password: _, ...userWithoutPass } = user;
  res.json(userWithoutPass);
});

// ===== USER ROUTES =====
app.get('/api/users', authenticate, requireRole('admin'), (req, res) => {
  const users = db.users.map(({ password, ...u }) => u);
  res.json(users);
});

app.post('/api/users', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, password, role, phone, companyId } = req.body;
  if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name, email,
    password: hashedPassword,
    role: role || 'employee',
    phone: phone || '',
    companyId: companyId || null,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const { password: _, ...userWithoutPass } = user;
  res.status(201).json(userWithoutPass);
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  // Only admin or the user themselves can update
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) return res.status(403).json({ message: 'Forbidden' });
  const { name, email, phone, password } = req.body;
  if (name) { user.name = name; user.avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }
  if (email) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = await bcrypt.hash(password, 10);
  const { password: _, ...userWithoutPass } = user;
  res.json(userWithoutPass);
});

app.delete('/api/users/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'User not found' });
  db.users.splice(idx, 1);
  res.json({ message: 'User deleted' });
});

// ===== COMPANY ROUTES =====
app.get('/api/companies', authenticate, (req, res) => {
  res.json(db.companies);
});

app.post('/api/companies', authenticate, requireRole('admin'), (req, res) => {
  const { name, industry, email, phone } = req.body;
  const company = { id: uuidv4(), name, industry: industry || '', email: email || '', phone: phone || '', createdAt: new Date().toISOString() };
  db.companies.push(company);
  res.status(201).json(company);
});

app.put('/api/companies/:id', authenticate, requireRole('admin'), (req, res) => {
  const company = db.companies.find(c => c.id === req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  Object.assign(company, req.body);
  res.json(company);
});

app.delete('/api/companies/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.companies.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Company not found' });
  db.companies.splice(idx, 1);
  res.json({ message: 'Company deleted' });
});

// ===== SERVICE ROUTES =====
app.get('/api/services', authenticate, (req, res) => {
  res.json(db.services);
});

app.post('/api/services', authenticate, requireRole('admin'), (req, res) => {
  const { name, description, price, category } = req.body;
  const service = { id: uuidv4(), name, description: description || '', price: price || 0, category: category || 'General', createdAt: new Date().toISOString() };
  db.services.push(service);
  res.status(201).json(service);
});

app.put('/api/services/:id', authenticate, requireRole('admin'), (req, res) => {
  const service = db.services.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  Object.assign(service, req.body);
  res.json(service);
});

app.delete('/api/services/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Service not found' });
  db.services.splice(idx, 1);
  res.json({ message: 'Service deleted' });
});

// ===== SERVICE REQUEST ROUTES =====
app.get('/api/service-requests', authenticate, (req, res) => {
  let requests = db.serviceRequests;
  if (req.user.role === 'client') {
    requests = requests.filter(r => r.clientId === req.user.id);
  }
  res.json(requests);
});

app.post('/api/service-requests', authenticate, requireRole('client'), (req, res) => {
  const { serviceId, notes } = req.body;
  const service = db.services.find(s => s.id === serviceId);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  const client = db.users.find(u => u.id === req.user.id);
  const request = {
    id: uuidv4(),
    serviceId,
    serviceName: service.name,
    clientId: req.user.id,
    clientName: client.name,
    notes: notes || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  db.serviceRequests.push(request);
  res.status(201).json(request);
});

app.put('/api/service-requests/:id/approve', authenticate, requireRole('admin'), (req, res) => {
  const request = db.serviceRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  request.status = 'approved';
  // Auto-create project
  const project = {
    id: uuidv4(),
    name: `${request.serviceName} - ${request.clientName}`,
    description: request.notes || `Project for ${request.serviceName}`,
    clientId: request.clientId,
    clientName: request.clientName,
    serviceId: request.serviceId,
    serviceName: request.serviceName,
    assignedEmployees: [],
    status: 'planning',
    createdAt: new Date().toISOString(),
    serviceRequestId: request.id
  };
  db.projects.push(project);
  res.json({ request, project });
});

app.put('/api/service-requests/:id/reject', authenticate, requireRole('admin'), (req, res) => {
  const request = db.serviceRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  request.status = 'rejected';
  res.json(request);
});

// ===== PROJECT ROUTES =====
app.get('/api/projects', authenticate, (req, res) => {
  let projects = db.projects;
  if (req.user.role === 'client') {
    projects = projects.filter(p => p.clientId === req.user.id);
  } else if (req.user.role === 'employee') {
    projects = projects.filter(p => p.assignedEmployees.some(e => e.id === req.user.id));
  }
  res.json(projects);
});

app.get('/api/projects/:id', authenticate, (req, res) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

app.post('/api/projects', authenticate, requireRole('admin'), (req, res) => {
  const { name, description, clientId, status } = req.body;
  const client = db.users.find(u => u.id === clientId);
  const project = {
    id: uuidv4(),
    name,
    description: description || '',
    clientId,
    clientName: client ? client.name : '',
    assignedEmployees: [],
    status: status || 'planning',
    createdAt: new Date().toISOString()
  };
  db.projects.push(project);
  res.status(201).json(project);
});

app.put('/api/projects/:id', authenticate, (req, res) => {
  const project = db.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const { name, description, status, assignedEmployees } = req.body;
  // Employees can only update status
  if (req.user.role === 'employee') {
    if (status) project.status = status;
    return res.json(project);
  }
  // Admin can update all
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (status) project.status = status;
  if (assignedEmployees) project.assignedEmployees = assignedEmployees;
  res.json(project);
});

app.delete('/api/projects/:id', authenticate, requireRole('admin'), (req, res) => {
  const idx = db.projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  db.projects.splice(idx, 1);
  res.json({ message: 'Project deleted' });
});

// ===== MESSAGE ROUTES =====
app.get('/api/messages', authenticate, (req, res) => {
  const { withUserId } = req.query;
  let messages = db.messages.filter(m =>
    (m.senderId === req.user.id && m.receiverId === withUserId) ||
    (m.senderId === withUserId && m.receiverId === req.user.id)
  );
  res.json(messages);
});

app.get('/api/messages/conversations', authenticate, (req, res) => {
  const userId = req.user.id;
  const conversations = new Map();
  db.messages.forEach(m => {
    if (m.senderId === userId || m.receiverId === userId) {
      const otherId = m.senderId === userId ? m.receiverId : m.senderId;
      const otherName = m.senderId === userId ? m.receiverName : m.senderName;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, { userId: otherId, userName: otherName, lastMessage: m.content, lastTime: m.createdAt, unread: 0 });
      } else {
        const c = conversations.get(otherId);
        if (new Date(m.createdAt) > new Date(c.lastTime)) {
          c.lastMessage = m.content;
          c.lastTime = m.createdAt;
        }
      }
    }
  });
  res.json(Array.from(conversations.values()));
});

app.post('/api/messages', authenticate, (req, res) => {
  const { receiverId, content } = req.body;
  const receiver = db.users.find(u => u.id === receiverId);
  if (!receiver) return res.status(404).json({ message: 'Receiver not found' });
  const message = {
    id: uuidv4(),
    senderId: req.user.id,
    senderName: req.user.name,
    receiverId,
    receiverName: receiver.name,
    content,
    createdAt: new Date().toISOString()
  };
  db.messages.push(message);
  res.status(201).json(message);
});

// ===== DASHBOARD STATS =====
app.get('/api/dashboard/stats', authenticate, requireRole('admin'), (req, res) => {
  res.json({
    totalUsers: db.users.length,
    totalEmployees: db.users.filter(u => u.role === 'employee').length,
    totalClients: db.users.filter(u => u.role === 'client').length,
    totalProjects: db.projects.length,
    activeProjects: db.projects.filter(p => p.status === 'in-progress').length,
    completedProjects: db.projects.filter(p => p.status === 'completed').length,
    totalServices: db.services.length,
    pendingRequests: db.serviceRequests.filter(r => r.status === 'pending').length,
    totalMessages: db.messages.length
  });
});

// ===== CONTACTS (who can a user message) =====
app.get('/api/contacts', authenticate, (req, res) => {
  let contacts = [];
  if (req.user.role === 'admin') {
    contacts = db.users.filter(u => u.id !== req.user.id).map(({ password, ...u }) => u);
  } else if (req.user.role === 'employee') {
    // Can message admin and clients on shared projects
    const myProjects = db.projects.filter(p => p.assignedEmployees.some(e => e.id === req.user.id));
    const clientIds = new Set(myProjects.map(p => p.clientId));
    contacts = db.users.filter(u => u.id !== req.user.id && (u.role === 'admin' || clientIds.has(u.id))).map(({ password, ...u }) => u);
  } else if (req.user.role === 'client') {
    // Can message admin and assigned employees
    const myProjects = db.projects.filter(p => p.clientId === req.user.id);
    const employeeIds = new Set(myProjects.flatMap(p => p.assignedEmployees.map(e => e.id)));
    contacts = db.users.filter(u => u.id !== req.user.id && (u.role === 'admin' || employeeIds.has(u.id))).map(({ password, ...u }) => u);
  }
  res.json(contacts);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
