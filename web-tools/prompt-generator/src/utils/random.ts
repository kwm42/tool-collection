export function weightedRandom<T extends { weight: number }>(items: T[]): T {
  if (items.length === 0) {
    throw new Error('Items array is empty');
  }
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  
  return items[items.length - 1];
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 9);
}
