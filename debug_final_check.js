
const RATE_PER_DAY = 120;
const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours

const OVERRIDES = {
    'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP': '2025-12-12T00:00:00Z',
};

const targetWallet = 'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP';

// Mock Deployments
// 1. Old (e.g., Dec 1)
// 2. New (Dec 29, 2025 10:00 AM UTC - approx 24h ago from test time)
const mockDeployments = [
    {
        id: 1,
        created_at: '2025-12-01T10:00:00.000Z',
        node_count: 1,
        wallet_address: targetWallet
    },
    {
        id: 7, // The user cited ID #7
        created_at: '2025-12-29T10:00:00.000Z',
        node_count: 9,
        wallet_address: targetWallet
    }
];

// Mock "Now" as Dec 30, 2025 10:00 AM UTC (Exactly 24h after new deployment)
const testNow = new Date('2025-12-30T10:00:00.000Z').getTime();

console.log(`Test Time: ${new Date(testNow).toISOString()}`);
console.log(`User Wallet: ${targetWallet}`);

// --- LOGIC FROM Dashboard.tsx / LiveNodes.tsx ---

// 1. Sort to find oldest
const userDeployments = mockDeployments
    .filter(ud => ud.wallet_address === targetWallet);

const oldestDeploymentId = [...userDeployments]
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0]?.id;

let totalEarnings = 0;

console.log(`\nOldest Deployment ID: ${oldestDeploymentId}`);

mockDeployments.forEach(d => {
    const overrideDate = OVERRIDES[d.wallet_address];
    const createdTime = new Date(d.created_at).getTime();
    let startDate = createdTime;
    let strategy = 'Normal';

    // Launch Floor Logic
    if (overrideDate) {
        const overrideTime = new Date(overrideDate).getTime();
        if (createdTime < overrideTime) {
            startDate = overrideTime;
            strategy = 'Clamped to Launch Date';
        }
    }

    // One-Time Delay Logic
    const delay = d.id === oldestDeploymentId ? DELAY_MS : 0;
    const effectiveStart = startDate + delay;

    let earnings = 0;
    if (testNow > effectiveStart) {
        const daysActive = (testNow - effectiveStart) / (24 * 60 * 60 * 1000);
        earnings = daysActive * RATE_PER_DAY * d.node_count;

        console.log(`\nDeployment #${d.id} (${d.node_count} nodes):`);
        console.log(`  Created: ${d.created_at}`);
        console.log(`  Start:   ${new Date(startDate).toISOString()} (${strategy})`);
        console.log(`  Delay:   ${delay / 3600000}h`);
        console.log(`  Live:    ${new Date(effectiveStart).toISOString()}`);
        console.log(`  Days:    ${daysActive.toFixed(4)}`);
        console.log(`  Earn:    $${earnings.toFixed(2)}`);

        totalEarnings += earnings;
    } else {
        console.log(`\nDeployment #${d.id}: Pending Start (Live at ${new Date(effectiveStart).toISOString()})`);
    }
});

console.log(`\nTotal Earnings: $${totalEarnings.toFixed(2)}`);
