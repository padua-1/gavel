// One-time setup: creates a sandbox product and monthly plan, then prints the plan id.
// Run with: npm run setup:plans   (then paste the id into .env as PLAN_ID_COFFEE)
import { config } from '../src/config.js';
import { ppFetch } from '../src/paypal.js';

if (!config.paypal.clientId || !config.paypal.clientSecret) {
  throw new Error('Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env first.');
}

const product = await ppFetch<{ id: string }>('/v1/catalogs/products', {
  method: 'POST',
  body: JSON.stringify({ name: 'Gavel Coffee Club', type: 'SERVICE', category: 'SOFTWARE' }),
});

const plan = await ppFetch<{ id: string }>('/v1/billing/plans', {
  method: 'POST',
  body: JSON.stringify({
    product_id: product.id,
    name: 'Monthly coffee subscription',
    billing_cycles: [
      {
        frequency: { interval_unit: 'MONTH', interval_count: 1 },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: '19.99', currency_code: 'USD' } },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 3,
    },
  }),
});

console.log(`PLAN_ID_COFFEE=${plan.id}`);