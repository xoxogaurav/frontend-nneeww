import { faker } from '@faker-js/faker';

export interface DemoReward {
  id: string;
  name: string;
  amount: number;
  task: string;
  timestamp: Date;
}

const taskTypes = [
  'Website Testing',
  'Content Review',
  'Data Entry',
  'Translation',
  'Survey Completion',
  'App Testing',
  'Research Task',
  'Video Review',
];

const rewardRanges = {
  'Website Testing': { min: 15, max: 30 },
  'Content Review': { min: 20, max: 45 },
  'Data Entry': { min: 10, max: 25 },
  'Translation': { min: 25, max: 50 },
  'Survey Completion': { min: 5, max: 15 },
  'App Testing': { min: 20, max: 40 },
  'Research Task': { min: 30, max: 60 },
  'Video Review': { min: 15, max: 35 },
};

export function generateDemoReward(): DemoReward {
  const task = faker.helpers.arrayElement(taskTypes);
  const range = rewardRanges[task as keyof typeof rewardRanges];
  
  return {
    id: faker.string.uuid(),
    name: `${faker.person.firstName().charAt(0)}. ${faker.person.lastName().charAt(0)}.`,
    amount: Number(faker.number.float({ min: range.min, max: range.max, precision: 0.01 })),
    task,
    timestamp: new Date(),
  };
}