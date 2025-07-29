import { ElementType } from 'react';
import { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  Icon: ElementType<LucideProps>;
  message: string;
  description: string;
}

export default function EmptyState({ Icon, message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-8 bg-gray-50 rounded-lg">
      <div className="p-3 bg-gray-200 rounded-full">
        <Icon className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="mt-4 font-semibold text-gray-800">{message}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}