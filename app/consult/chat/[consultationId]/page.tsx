'use client';

import { useRouter, useParams } from 'next/navigation';
import { ChatInterface } from '@/components/ui/ChatInterface';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = params.consultationId as string;

  return (
    <div className="h-screen">
      <ChatInterface
        consultationId={consultationId}
        specialistName="Dr. Sarah Jenkins"
        onClose={() => router.push('/consult')}
      />
    </div>
  );
}
