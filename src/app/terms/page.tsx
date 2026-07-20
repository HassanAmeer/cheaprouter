import { LegalShell } from '@/components/legal-shell';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 1, 2026">
      <p>
        By accessing or using CheapAgents ("the Service"), you agree to be bound by these Terms. If you do not agree,
        do not use the Service.
      </p>

      <h2>1. Use of the Service</h2>
      <ul>
        <li>You must be at least 18 years old to use the Service.</li>
        <li>You are responsible for all activity under your API keys.</li>
        <li>Do not use the Service for illegal, harmful, or abusive purposes.</li>
      </ul>

      <h2>2. API Keys &amp; BYOK</h2>
      <p>
        You are responsible for safeguarding your CheapAgents API keys and any provider keys you connect. We store
        provider keys encrypted and route requests on your behalf.
      </p>

      <h2>3. Billing</h2>
      <p>
        Paid plans are billed in advance on a monthly or annual basis. Token overages are charged at the published
        per-token rates. Plan changes take effect at the next billing cycle unless otherwise noted.
      </p>

      <h2>4. Termination</h2>
      <p>
        We may suspend or terminate your account for violations of these Terms. You may cancel anytime from your
        Dashboard; no refunds are provided for partial periods.
      </p>

      <h2>5. Disclaimers</h2>
      <p>
        The Service is provided "as is" without warranties. We are not liable for model outputs, downtime, or indirect
        damages arising from use of the Service.
      </p>
    </LegalShell>
  );
}
