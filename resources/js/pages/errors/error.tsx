import { Head } from '@inertiajs/react';
import { QuickFindInput } from '@/components/quick-find-input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"

interface Props {
  status: number;
}

export default function ErrorPage({ status }: Props) {
  const safeStatus = status || 404;

  const titleText = {
    503: 'Service Unavailable',
    500: 'Server Error',
    404: 'Not Found',
    403: 'Forbidden',
  }[safeStatus] || 'Error';

  const description = {
    503: 'Sorry, we are doing some maintenance. Please check back soon.',
    500: 'Whoops, something went wrong on our servers.',
    404: "The page you&apos;re looking for doesn&apos;t exist. Try searching for what you need below.",
    403: 'Sorry, you are forbidden from accessing this page.',
  }[safeStatus] || 'An unexpected error occurred.';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <Head title={`${safeStatus} - ${titleText}`} />
      
      <Empty className="max-w-md w-full border-none shadow-none">
        <EmptyHeader>
          <EmptyTitle className="text-4xl font-bold">{safeStatus} - {titleText}</EmptyTitle>
          <EmptyDescription dangerouslySetInnerHTML={{ __html: description }} />
        </EmptyHeader>
        <EmptyContent className="max-w-md">
          <QuickFindInput className="w-full sm:w-3/4" />
          
          <EmptyDescription>
            Need help? <a href="#">Contact support</a>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
