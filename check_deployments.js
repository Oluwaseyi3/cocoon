
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manually load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envLines = envFile.split('\n');
    for (const line of envLines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
            const val = values.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
            process.env[key.trim()] = val;
        }
    }
} catch (e) {
    console.error('Failed to read .env file', e);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RATE_PER_DAY = 119.72;
const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
const LIFECYCLE_DAYS = 30;
const LIFECYCLE_MS = LIFECYCLE_DAYS * 24 * 60 * 60 * 1000;

const OVERRIDES = {
    'k26A3XrW4gx7UXA3D8DhxcYQiwZjqc1gddb7f6LzgQP': '2025-12-12T00:00:00Z',
    'GkWMf255xX2chqNgnV8B2djGa2eSsFBBC8ASdgtohFUb': '2025-12-21T00:00:00Z',
    'EmZvBGFYh8XCS9nXu7F372abwMSEeX8e5LWuJxfMigby': '2025-12-23T00:00:00Z'
};

async function checkDeployments() {
    console.log('Fetching deployments #2 and #3...');
    const { data: deployments, error } = await supabase
        .from('deployments')
        .select('*')
        .in('id', [2, 3]);

    if (error) {
        console.error('Error fetching deployments:', error);
        return;
    }

    if (!deployments || deployments.length === 0) {
        console.log('No deployments found with IDs 2 or 3.');
        return;
    }

    deployments.forEach(d => {
        const walletAddress = d.wallet_address;
        const overrideDate = OVERRIDES[walletAddress];
        const createdTime = new Date(d.created_at).getTime();
        let startDate = createdTime;
        let note = '';

        if (overrideDate) {
            const overrideTime = new Date(overrideDate).getTime();
            if (createdTime < overrideTime) {
                startDate = overrideTime;
                note = `(Override: ${overrideDate})`;
            }
        }

        const effectiveStart = startDate + DELAY_MS;
        const completionDate = effectiveStart + LIFECYCLE_MS;
        const now = Date.now();

        let status = 'Active';
        if (now > completionDate) {
            status = 'Completed';
        } else if (now < effectiveStart) {
            status = 'Provisioning';
        }

        console.log(`\nDeployment #${d.id}`);
        console.log(`----------------------------------------`);
        console.log(`Wallet:           ${d.wallet_address}`);
        console.log(`Created:          ${d.created_at}`);
        console.log(`Start Date:       ${new Date(startDate).toISOString()} ${note}`);
        console.log(`Effective Start:  ${new Date(effectiveStart).toISOString()} (+24h)`);
        console.log(`Completion Date:  ${new Date(completionDate).toISOString()} (+30 days)`);
        console.log(`Current Status:   ${status}`);

        // Calculate time remaining
        if (status === 'Active') {
            const msRemaining = completionDate - now;
            const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);
            console.log(`Time Remaining:   ${daysRemaining.toFixed(2)} days`);
        }
    });
}

checkDeployments();
