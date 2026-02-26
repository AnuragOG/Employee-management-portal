const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

// Get projects (role-based)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'client') filter = { client: req.user._id };
    else if (req.user.role === 'employee') filter = { assignedEmployees: req.user._id };
    const projects = await Project.find(filter)
      .populate('client', 'name email company')
      .populate('assignedEmployees', 'name email position')
      .populate('service', 'name')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single project
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email company phone')
      .populate('assignedEmployees', 'name email position phone')
      .populate('service', 'name description');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description, client, assignedEmployees, service, budget, deadline, serviceRequest } = req.body;
    const project = await Project.create({ name, description, client, assignedEmployees: assignedEmployees || [], service, budget, deadline, serviceRequest });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role === 'admin') {
      // Admin can update everything
      Object.assign(project, req.body);
    } else if (req.user.role === 'employee') {
      // Employee can only update status
      if (req.body.status) project.status = req.body.status;
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    project.updatedAt = new Date();
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
