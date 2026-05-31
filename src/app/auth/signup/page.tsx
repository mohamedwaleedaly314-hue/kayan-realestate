import { Suspense } from 'react';
import SignUpForm from '@/components/auth/signup-form';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ivory dark:bg-navy-900" />}>
      <SignUpForm />
    </Suspense>
  );
}
