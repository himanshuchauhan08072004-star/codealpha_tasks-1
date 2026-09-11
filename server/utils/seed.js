require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing demo data...');

  await Promise.all([
    User.deleteMany({ email: { $in: ['alex@demo.com', 'sam@demo.com', 'jordan@demo.com'] } }),
  ]);

  const [alex, sam, jordan] = await User.create([
    { name: 'Alex Rivera', email: 'alex@demo.com', password: 'password123' },
    { name: 'Sam Chen', email: 'sam@demo.com', password: 'password123' },
    { name: 'Jordan Lee', email: 'jordan@demo.com', password: 'password123' }
  ]);

  await Project.deleteMany({ owner: alex._id });

  const project = await Project.create({
    title: 'Website Redesign',
    description: 'Revamp the marketing site with a new design system.',
    owner: alex._id,
    members: [sam._id, jordan._id],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  const tasks = await Task.create([
    {
      title: 'Audit current site',
      description: 'Review existing pages and note UX issues.',
      status: 'done',
      priority: 'medium',
      assignee: sam._id,
      project: project._id,
      creator: alex._id
    },
    {
      title: 'Design new homepage',
      description: 'Create high-fidelity mockups for the homepage.',
      status: 'in_progress',
      priority: 'high',
      assignee: jordan._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      project: project._id,
      creator: alex._id
    },
    {
      title: 'Set up CI pipeline',
      description: 'Automate build and deploy on push to main.',
      status: 'todo',
      priority: 'low',
      assignee: alex._id,
      project: project._id,
      creator: alex._id
    },
    {
      title: 'Fix mobile nav bug',
      description: 'Menu does not close on link tap.',
      status: 'review',
      priority: 'urgent',
      assignee: sam._id,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      project: project._id,
      creator: jordan._id
    }
  ]);

  await Comment.create([
    { task: tasks[1]._id, author: alex._id, content: 'Loving the direction on this so far.' },
    { task: tasks[1]._id, author: jordan._id, content: 'Thanks! Sharing v2 by tomorrow.' },
    { task: tasks[3]._id, author: sam._id, content: 'Repro steps added to the description.' }
  ]);

  console.log('Seed complete.');
  console.log('Demo login: alex@demo.com / password123');
  console.log('Demo login: sam@demo.com / password123');
  console.log('Demo login: jordan@demo.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
