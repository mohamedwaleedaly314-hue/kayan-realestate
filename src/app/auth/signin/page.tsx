import { Suspense } from 'react';
import SignInForm from '@/components/auth/signin-form';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory dark:bg-navy-900" />}>
      <SignInForm />
    </Suspense>
  );
}
