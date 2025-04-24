"use client"

import { Login } from '@curriculum-services/auth';
import { toast } from 'sonner';

export default function Home() {
  return (
    <Login 
      // onSuccess={() => toast.success('Successfully logged in')}
    />
  );
}
