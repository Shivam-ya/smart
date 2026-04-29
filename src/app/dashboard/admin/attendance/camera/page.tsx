"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const ClientCamera = dynamic(() => import('./ClientCamera'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center p-24 text-primary"><Loader2 className="w-8 h-8 animate-spin" /></div>
});

export default function CameraPage() {
  return <ClientCamera />;
}
