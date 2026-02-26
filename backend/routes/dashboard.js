const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const [totalEmployees, totalClients, totalProjects, totalServices, pendingRequests, recentProjects, projectsByStatus] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'client' }),
      Project.countDocuments(),
      Service.countDocuments({ isActive: true }),
      ServiceRequest.countDocuments({ status: 'pending' }),
      Project.find().sort({ createdAt: -1 }).limit(5).populate('client', 'name').populate('assignedEmployees', 'name'),
      Project.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);
    res.json({ totalEmployees, totalClients, totalProjects, totalServices, pendingRequests, recentProjects, projectsByStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/employee', protect, async (req, res) => {
  try {
    const [assignedProjects, messages] = await Promise.all([
      Project.find({ assignedEmployees: req.user._id }).populate('client', 'name'),
      Message.countDocuments({ receiver: req.user._id, isRead: false })
    ]);
    const byStatus = {};
    assignedProjects.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    res.json({ totalAssigned: assignedProjects.length, unreadMessages: messages, byStatus, recentProjects: assignedProjects.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/client', protect, async (req, res) => {
  try {
    const [projects, serviceRequests, unreadMessages] = await Promise.all([
      Project.find({ client: req.user._id }).populate('assignedEmployees', 'name'),
      ServiceRequest.find({ client: req.user._id }).populate('service', 'name'),
      Message.countDocuments({ receiver: req.user._id, isRead: false })
    ]);
    const byStatus = {};
    projects.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    res.json({ totalProjects: projects.length, pendingRequests: serviceRequests.filter(r => r.status === 'pending').length, unreadMessages, byStatus, recentProjects: projects.slice(0, 5) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
