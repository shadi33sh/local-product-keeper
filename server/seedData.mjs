export function generateSeedData(count = 2000) {
  const data = [];
  const now = new Date().toISOString();

  for (let i = 1; i <= count; i++) {
    const name = `Product ${i}`;
    const price = parseFloat((Math.random() * 200 + 0.99).toFixed(2));
    const description = `This is a generated test description for product #${i} to verify virtualization and table performance.`;

    data.push([name, price, description, now]);
  }

  return data;
}
