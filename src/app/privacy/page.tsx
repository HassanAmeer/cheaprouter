import { LegalShell } from '@/components/legal-shell';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 1, 2026">
      <p>
        CheapAgents ("we", "us") respects your privacy. This policy explains what data we collect when you use our
        unified API, dashboard, and related services, and how we use it.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account data: name, email, and billing details you provide at signup.</li>
        <li>API usage: request metadata, token counts, and model identifiers for analytics.</li>
        <li>Provider keys: BYOK credentials you store, encrypted at rest.</li>
      </ul>

      <h2>2. How We Use Data</h2>
      <p>
        We use your data solely to operate the service, route requests, generate usage analytics, and communicate
        about your account. We never sell your data or train models on your prompts.
      </p>

      <h2>3. Data Retention</h2>
      <p>
        Usage logs are retained for 30 days for debugging and billing. Account data is kept until you delete your
        account. Encrypted provider keys are removed immediately upon revocation.
      </p>

      <h2>4. Your Rights</h2>
      <p>
        You may request export or deletion of your data at any time from the Dashboard settings. For questions,
        contact privacy@cheapagents.ai.
      </p>
    </LegalShell>
  );
}
