
const RATE_PER_DAY = 119.72;
const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
const LIFECYCLE_DAYS = 30;
const LIFECYCLE_MS = LIFECYCLE_DAYS * 24 * 60 * 60 * 1000;

const OVERRIDES = {
    'OVERRIDE_WALLET': '2025-12-12T00:00:00Z'
};

function calculateStatus(createdStr, walletAddress, mockNow) {
    const overrideDate = OVERRIDES[walletAddress];
    const createdTime = new Date(createdStr).getTime();
    let startDate = createdTime;
    let isOverridden = false;

    if (overrideDate) {
        const overrideTime = new Date(overrideDate).getTime();
        if (createdTime < overrideTime) {
            startDate = overrideTime;
            isOverridden = true;
        }
    }

    const effectiveStart = startDate + DELAY_MS;
    const completionDate = effectiveStart + LIFECYCLE_MS;

    // Use mockNow if provided, else real now
    const now = mockNow ? new Date(mockNow).getTime() : Date.now();

    let status = 'Active';
    let earnings = 0;
    const nodeCount = 1; // Assume 1 node for simplicity

    if (now > completionDate) {
        earnings = LIFECYCLE_DAYS * RATE_PER_DAY * nodeCount;
        status = 'Completed';
    } else if (now > effectiveStart) {
        const daysActive = (now - effectiveStart) / (24 * 60 * 60 * 1000);
        earnings = daysActive * RATE_PER_DAY * nodeCount;
    } else {
        status = 'Provisioning';
        earnings = 0;
    }

    return {
        status,
        earnings,
        startDate: new Date(startDate).toISOString(),
        effectiveStart: new Date(effectiveStart).toISOString(),
        completionDate: new Date(completionDate).toISOString(),
        isOverridden
    };
}

function runTests() {
    const NOW = '2026-01-15T12:00:00Z'; // Fixed reference time for testing
    console.log(`Running Verification Tests (Reference Time: ${NOW})\n`);

    const tests = [
        {
            name: 'Standard Case: Just Created',
            created: '2026-01-15T10:00:00Z', // 2 hours ago
            wallet: 'NORMAL_WALLET',
            expectedStatus: 'Provisioning',
            expectedEarnings: 0
        },
        {
            name: 'Standard Case: Active (2 days old)',
            created: '2026-01-13T10:00:00Z', // > 24h ago
            wallet: 'NORMAL_WALLET',
            expectedStatus: 'Active',
            expectedEarnings: 119.72 * ((new Date(NOW) - (new Date('2026-01-13T10:00:00Z').getTime() + DELAY_MS)) / (86400000))
        },
        {
            name: 'Standard Case: Completed (> 30 days after start)',
            // Start = Created + 1 day. Lifecycle = 30 days. Total = 31 days.
            // Created 35 days ago
            created: '2025-12-10T00:00:00Z',
            wallet: 'NORMAL_WALLET',
            expectedStatus: 'Completed',
            expectedEarnings: 30 * 119.72 // Max cap
        },
        {
            name: 'Override Case: Created before Override',
            // Created way back in Nov 2025
            created: '2025-11-01T00:00:00Z',
            wallet: 'OVERRIDE_WALLET', // Override is Dec 12
            // Effective Start = Dec 12 + 1 day = Dec 13
            // Now is Jan 15. Days active = Jan 15 - Dec 13 = ~33 days -> Should be Completed?
            // Wait, Dec 13 + 30 days = Jan 12. So Jan 15 > Jan 12.
            expectedStatus: 'Completed',
            expectedEarnings: 30 * 119.72
        },
        {
            name: 'Override Case: "Recent" relative to Override',
            // Override is Dec 12. Created Nov 1.
            // Effective Start: Dec 13.
            // Test Point: Dec 20 (7 days active)
            customNow: '2025-12-20T12:00:00Z',
            created: '2025-11-01T00:00:00Z',
            wallet: 'OVERRIDE_WALLET',
            expectedStatus: 'Active',
            // Earnings: (Dec 20 - Dec 13) * 120
            expectedEarnings: 119.72 * 7.5 // approx
        }
    ];

    tests.forEach(t => {
        const result = calculateStatus(t.created, t.wallet, t.customNow || NOW);
        const earningsMatch = Math.abs(result.earnings - t.expectedEarnings) < 0.1; // Float tolerance
        const statusMatch = result.status === t.expectedStatus;

        console.log(`[${statusMatch && earningsMatch ? 'PASS' : 'FAIL'}] ${t.name}`);
        if (!statusMatch || !earningsMatch) {
            console.log(`   Expected Status: ${t.expectedStatus}, Got: ${result.status}`);
            console.log(`   Expected Earnings: ${t.expectedEarnings.toFixed(2)}, Got: ${result.earnings.toFixed(2)}`);
            console.log(`   Details:`, result);
        }
    });
}

runTests();
