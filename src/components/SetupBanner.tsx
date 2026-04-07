import { Card } from '../ui/Card';
import { Stack } from '../ui/Stack';

export function SetupBanner() {
  return (
    <Card padding="md" style={{ borderColor: 'rgba(245, 166, 35, 0.4)', background: 'rgba(245, 166, 35, 0.06)' }}>
      <Stack gap={2}>
        <strong style={{ color: 'var(--color-warning)' }}>Firebase not configured</strong>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
          Copy <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>.env.example</code> to{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>.env</code> and paste your Firebase
          web app keys. Enable Firestore and Email/Password sign-in for admins. Deploy the included{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85em' }}>firestore.rules</code> or equivalent
          rules so guests can read products and only signed-in users can write.
        </p>
      </Stack>
    </Card>
  );
}
