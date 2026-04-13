// src/app/tags/detail/page.tsx
import { AppLayout } from '@/components/templates/AppLayout';
import { TagDetailClient } from './TagDetailClient';

export default function TagDetailWrapperPage() {
  return (
    <AppLayout>
      <TagDetailClient />
    </AppLayout>
  );
}
