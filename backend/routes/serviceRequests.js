const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'client') filter = { client: req.user._id };
    const requests = await ServiceRequest.find(filter)
      .populate('client', 'name email company')
      .populate('service', 'name price')
      .populate('project', 'name status')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'client') return res.status(403).json({ message: 'Clients only' });
    const request = await ServiceRequest.create({ ...req.body, client: req.user._id });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('service');
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    request.status = 'approved';
    request.adminNote = req.body.adminNote || '';
    
    // Create project
    const project = await Project.create({
      name: req.body.projectName || `${request.service.name} Project`,
      description: req.body.description || request.message,
      client: request.client,
      service: request.service._id,
      serviceRequest: request._id,
      assignedEmployees: [],
      budget: req.body.budget || request.service.price || 0
    });
    
    request.project = project._id;
    await request.save();
    res.json({ request, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = 'rejected';
    request.adminNote = req.body.adminNote || '';
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await ServiceRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
