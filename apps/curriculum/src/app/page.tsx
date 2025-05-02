"use client"

import { Login } from '@curriculum-services/auth';
;

export default function Home() {
  return (
    <Login 
      // onSuccess={() => toast.success('Successfully logged in')}
    />
  );
}
