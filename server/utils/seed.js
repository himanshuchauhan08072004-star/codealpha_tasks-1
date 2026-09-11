require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

const DEMO_EMAILS = ['alex@demo.com', 'sam@demo.com', 'jordan@demo.com', 'priya@demo.com'];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing existing demo data...');

  await User.deleteMany({ email: { $in: DEMO_EMAILS } });

  const [alex, sam, jordan, priya] = await User.create([
    { name: 'Alex Rivera', email: 'alex@demo.com', password: 'password123' },
    { name: 'Sam Chen', email: 'sam@demo.com', password: 'password123' },
    { name: 'Jordan Lee', email: 'jordan@demo.com', password: 'password123' },
    { name: 'Priya Singh', email: 'priya@demo.com', password: 'password123' }
  ]);

  await Project.deleteMany({ owner: { $in: [alex._id, sam._id] } });

  const website = await Project.create({
    title: 'Website Redesign',
    description: 'Revamp the marketing site with a new design system.',
    owner: alex._id,
    members: [sam._id, jordan._id, priya._id],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  const mobile = await Project.create({
    title: 'Mobile App Launch',
    description: 'Ship v1 of the companion mobile app.',
    owner: sam._id,
    members: [alex._id, jordan._id],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  const activityLog = [];
  const logActivity = (project, actor, type, task, meta = {}) =>
    activityLog.push({ project: project._id, actor: actor._id, type, task: task?._id, meta });

  logActivity(website, alex, 'project_created');
  logActivity(mobile, sam, 'project_created');

  const websiteTasks = await Task.create([
    { title: 'Audit current site', description: 'Review existing pages and note UX issues.', status: 'done', priority: 'medium', assignee: sam._id, project: website._id, creator: alex._id },
    { title: 'Design new homepage', description: 'Create high-fidelity mockups for the homepage.', status: 'in_progress', priority: 'high', assignee: jordan._id, dueDate: new Date(Date.now() + 5 * 86400000), project: website._id, creator: alex._id },
    { title: 'Set up CI pipeline', description: 'Automate build and deploy on push to main.', status: 'todo', priority: 'low', assignee: alex._id, project: website._id, creator: alex._id },
    { title: 'Fix mobile nav bug', description: 'Menu does not close on link tap.', status: 'review', priority: 'urgent', assignee: sam._id, dueDate: new Date(Date.now() + 86400000), project: website._id, creator: jordan._id },
    { title: 'Write new copy for pricing page', description: 'Refresh tone, add FAQ section.', status: 'todo', priority: 'medium', assignee: priya._id, dueDate: new Date(Date.now() + 8 * 86400000), project: website._id, creator: alex._id },
    { title: 'Accessibility pass', description: 'Contrast, alt text, keyboard nav audit.', status: 'todo', priority: 'medium', assignee: jordan._id, project: website._id, creator: alex._id },
    { title: 'Optimize image assets', description: 'Compress and lazy-load hero images.', status: 'done', priority: 'low', assignee: sam._id, project: website._id, creator: alex._id }
  ]);

  const mobileTasks = await Task.create([
    { title: 'App store listing copy', description: 'Write description, keywords, screenshots plan.', status: 'in_progress', priority: 'high', assignee: alex._id, dueDate: new Date(Date.now() + 6 * 86400000), project: mobile._id, creator: sam._id },
    { title: 'Push notification service', description: 'Wire up FCM for reminders.', status: 'todo', priority: 'high', assignee: jordan._id, dueDate: new Date(Date.now() + 10 * 86400000), project: mobile._id, creator: sam._id },
    { title: 'Onboarding flow', description: 'First-run screens and permissions prompts.', status: 'review', priority: 'urgent', assignee: sam._id, dueDate: new Date(Date.now() + 2 * 86400000), project: mobile._id, creator: alex._id },
    { title: 'Crash reporting setup', description: 'Integrate Sentry for mobile.', status: 'todo', priority: 'medium', assignee: alex._id, project: mobile._id, creator: sam._id },
    { title: 'Beta tester recruitment', description: 'Reach out to 50 early users.', status: 'done', priority: 'low', assignee: jordan._id, project: mobile._id, creator: sam._id }
  ]);

  const allTasks = [...websiteTasks, ...mobileTasks];
  const users = [alex, sam, jordan, priya];
  allTasks.forEach((t) => {
    const creatorUser = users.find((u) => u._id.equals(t.creator));
    const proj = t.project.equals(website._id) ? website : mobile;
    logActivity(proj, creatorUser, 'task_created', t, { title: t.title });
    if (t.assignee) {
      logActivity(proj, creatorUser, 'task_assigned', t, { title: t.title });
    }
  });

  const comments = await Comment.create([
    { task: websiteTasks[1]._id, author: alex._id, content: 'Loving the direction on this so far.' },
    { task: websiteTasks[1]._id, author: jordan._id, content: 'Thanks! Sharing v2 by tomorrow.' },
    { task: websiteTasks[3]._id, author: sam._id, content: 'Repro steps added to the description.' },
    { task: mobileTasks[2]._id, author: sam._id, content: 'First draft of onboarding is in Figma.' },
    { task: mobileTasks[2]._id, author: alex._id, content: 'Looks great -- ship it after one more pass.' }
  ]);

  comments.forEach((c) => {
    const task = allTasks.find((t) => t._id.equals(c.task));
    const authorUser = users.find((u) => u._id.equals(c.author));
    const proj = task.project.equals(website._id) ? website : mobile;
    logActivity(proj, authorUser, 'comment_added', task, { title: task.title });
  });

  await Activity.insertMany(activityLog);

  console.log(`Seed complete: 2 projects, ${allTasks.length} tasks, ${comments.length} comments, ${activityLog.length} activity entries.`);
  console.log('Demo logins (password123): alex@demo.com, sam@demo.com, jordan@demo.com, priya@demo.com');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
