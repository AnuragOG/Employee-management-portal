const mongoose = require('mongoose');
const User = require('./models/User');
const Service = require('./models/Service');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Service.deleteMany({});

  // Create admin
  const admin = await User.create({
    name: 'Anurag Admin',
    email: 'admin@anuragtech.com',
    password: 'admin123',
    role: 'admin',
    position: 'CEO'
  });

  // Create employees
  const emp1 = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@anuragtech.com',
    password: 'emp123',
    role: 'employee',
    position: 'Full Stack Developer'
  });

  const emp2 = await User.create({
    name: 'Priya Patel',
    email: 'priya@anuragtech.com',
    password: 'emp123',
    role: 'employee',
    position: 'UI/UX Designer'
  });

  // Create clients
  const client1 = await User.create({
    name: 'Amit Verma',
    email: 'amit@techcorp.com',
    password: 'client123',
    role: 'client',
    company: 'TechCorp Pvt Ltd'
  });

  const client2 = await User.create({
    name: 'Sunita Gupta',
    email: 'sunita@startupx.com',
    password: 'client123',
    role: 'client',
    company: 'StartupX'
  });

  // Create services
  await Service.create([
    { name: 'Web Development', description: 'Full-stack web application development', price: 50000, duration: '3-6 months', category: 'Development' },
    { name: 'Mobile App Development', description: 'iOS and Android app development', price: 80000, duration: '4-8 months', category: 'Development' },
    { name: 'UI/UX Design', description: 'User interface and experience design', price: 25000, duration: '1-2 months', category: 'Design' },
    { name: 'Cloud Deployment', description: 'AWS/GCP/Azure cloud setup and deployment', price: 15000, duration: '2-4 weeks', category: 'DevOps' },
    { name: 'SEO & Digital Marketing', description: 'Search engine optimization and marketing', price: 20000, duration: 'Ongoing', category: 'Marketing' }
  ]);

  console.log('\n✅ Seeded successfully!\n');
  console.log('=== LOGIN CREDENTIALS ===');
  console.log('Admin:    admin@anuragtech.com / admin123');
  console.log('Employee: rahul@anuragtech.com / emp123');
  console.log('Employee: priya@anuragtech.com / emp123');
  console.log('Client:   amit@techcorp.com / client123');
  console.log('Client:   sunita@startupx.com / client123');
  console.log('=========================\n');

  await mongoose.disconnect();
};

seed().catch(console.error);
