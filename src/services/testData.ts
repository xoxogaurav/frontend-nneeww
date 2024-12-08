import { db } from '../db/database';
import { faker } from '@faker-js/faker';

export async function initializeTestData() {
  // Clear existing data
  await Promise.all([
    db.users.clear(),
    db.tasks.clear(),
    db.transactions.clear(),
    db.taskSubmissions.clear(),
    db.notifications.clear()
  ]);

  // Create admin user
  const adminId = await db.users.add({
    name: 'Admin',
    email: 'admin@taskflow.com',
    password: 'admin123',
    isAdmin: true,
    balance: 0,
    pendingEarnings: 0,
    totalWithdrawn: 0,
    tasksCompleted: 0,
    successRate: 0,
    averageRating: 0,
    createdAt: new Date()
  });

  // Create test users
  const userIds = await Promise.all(
    Array.from({ length: 5 }, async (_, i) => {
      const balance = faker.number.float({ min: 100, max: 1000, precision: 0.01 });
      const tasksCompleted = faker.number.int({ min: 5, max: 30 });
      
      return db.users.add({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        isAdmin: false,
        balance,
        pendingEarnings: faker.number.float({ min: 0, max: 100, precision: 0.01 }),
        totalWithdrawn: faker.number.float({ min: 0, max: balance, precision: 0.01 }),
        tasksCompleted,
        successRate: faker.number.float({ min: 80, max: 100, precision: 0.1 }),
        averageRating: faker.number.float({ min: 4, max: 5, precision: 0.1 }),
        country: faker.location.countryCode(),
        age: faker.number.int({ min: 18, max: 60 }),
        phoneNumber: faker.phone.number(),
        bio: faker.person.bio(),
        timezone: faker.location.timeZone(),
        language: 'en',
        emailNotifications: true,
        createdAt: faker.date.past()
      });
    })
  );

  // Create test tasks
  const taskCategories = ['Testing', 'Data Entry', 'Content Writing', 'Research', 'Translation'];
  const taskIds = await Promise.all(
    Array.from({ length: 10 }, async () => {
      const difficulty = faker.helpers.arrayElement(['Easy', 'Medium', 'Hard']) as 'Easy' | 'Medium' | 'Hard';
      const reward = difficulty === 'Easy' ? 
        faker.number.float({ min: 5, max: 15, precision: 0.01 }) :
        difficulty === 'Medium' ?
          faker.number.float({ min: 15, max: 30, precision: 0.01 }) :
          faker.number.float({ min: 30, max: 50, precision: 0.01 });

      return db.tasks.add({
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        reward,
        timeEstimate: faker.helpers.arrayElement(['15 minutes', '30 minutes', '1 hour', '2 hours']),
        category: faker.helpers.arrayElement(taskCategories),
        difficulty,
        timeInSeconds: faker.number.int({ min: 900, max: 7200 }),
        steps: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, () => faker.lorem.sentence()),
        approvalType: faker.helpers.arrayElement(['automatic', 'manual']),
        createdAt: faker.date.recent()
      });
    })
  );

  // Create test transactions and submissions
  for (const userId of userIds) {
    const userTaskCount = faker.number.int({ min: 2, max: 5 });
    const selectedTasks = faker.helpers.arrayElements(taskIds, userTaskCount);

    for (const taskId of selectedTasks) {
      const task = await db.tasks.get(taskId);
      if (!task) continue;

      const status = faker.helpers.arrayElement(['completed', 'pending', 'failed']);
      
      // Create submission
      await db.taskSubmissions.add({
        taskId,
        userId,
        screenshotUrl: faker.image.url(),
        status: status === 'completed' ? 'approved' : status === 'pending' ? 'pending' : 'rejected',
        submittedAt: faker.date.recent()
      });

      // Create transaction
      await db.transactions.add({
        userId,
        taskId,
        amount: task.reward,
        type: 'earning',
        status,
        createdAt: faker.date.recent()
      });
    }

    // Add some withdrawal transactions
    const withdrawalCount = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < withdrawalCount; i++) {
      await db.transactions.add({
        userId,
        amount: faker.number.float({ min: 20, max: 100, precision: 0.01 }),
        type: 'withdrawal',
        status: faker.helpers.arrayElement(['completed', 'pending']),
        createdAt: faker.date.recent()
      });
    }

    // Create notifications
    const notificationCount = faker.number.int({ min: 2, max: 8 });
    for (let i = 0; i < notificationCount; i++) {
      const type = faker.helpers.arrayElement(['success', 'info', 'warning', 'error']) as 'success' | 'info' | 'warning' | 'error';
      await db.notifications.add({
        userId,
        title: faker.helpers.arrayElement([
          'Task Completed',
          'New Task Available',
          'Withdrawal Processed',
          'Profile Updated',
          'Payment Received'
        ]),
        message: faker.lorem.sentence(),
        type,
        isRead: faker.datatype.boolean(),
        createdAt: faker.date.recent()
      });
    }
  }

  console.log('Test data initialized successfully');
}