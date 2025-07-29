import { ReactNode } from 'react';
import { X, LucideIcon,AlertTriangle, CheckCircle } from 'lucide-react';
import { useModal } from '@/contexts/ModalContext';
import Preloader from '@/components/ui/Preloader';

interface ModalProps {
  // Content
  title: string;
  description?: string;
  children?: ReactNode;
  
  // Icon
  icon?: LucideIcon;
  iconColor?: 'orange' | 'blue' | 'green' | 'red' | 'purple' | 'gray';
  
  // Actions
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  
  // Styling
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  
  // Loading state
  loading?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

const iconColorClasses = {
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  gray: 'bg-gray-100 text-gray-600'
};

const buttonVariants = {
  primary: 'bg-gray-800 text-white hover:bg-gray-900',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export default function Modal({
  title,
  description,
  children,
  icon: Icon,
  iconColor = 'gray',
  primaryAction,
  secondaryAction,
  size = 'md',
  showCloseButton = true,
  loading = false
}: ModalProps) {
  const { closeModal } = useModal();

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 md:p-8 w-full ${sizeClasses[size]} shadow-xl text-center`}>
        <div className="h-48 flex items-center justify-center">
          <Preloader />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 md:p-8 w-full ${sizeClasses[size]} shadow-xl`}>
      {/* Header with close button */}
      {showCloseButton && (
        <div className="flex justify-end -mt-2 mb-2">
          <button 
            onClick={closeModal} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
      
      {/* Icon */}
      {Icon && (
        <div className="flex justify-center -mt-4 mb-4">
          <div className={`p-4 rounded-full ${iconColorClasses[iconColor]}`}>
            <Icon className="h-10 w-10" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {description && (
          <p className="text-gray-600 mt-2">{description}</p>
        )}
      </div>

      {/* Custom content */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-col gap-3">
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              disabled={primaryAction.loading}
              className={`
                w-full px-6 py-3 rounded-lg font-semibold transition-colors
                ${buttonVariants[primaryAction.variant || 'primary']}
                ${primaryAction.loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {primaryAction.loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              ) : (
                primaryAction.label
              )}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="w-full px-6 py-3 rounded-lg font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Usage Examples:

// 1. Simple confirmation modal
export function ConfirmationModal({ onConfirm, message }: { onConfirm: () => void; message: string }) {
  const { closeModal } = useModal();
  
  return (
    <Modal
      title="Confirm Action"
      description={message}
      icon={AlertTriangle}
      iconColor="red"
      primaryAction={{
        label: "Confirm",
        onClick: onConfirm,
        variant: "danger"
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: closeModal
      }}
    />
  );
}

// 2. Success modal
export function SuccessModal({ message }: { message: string }) {
  const { closeModal } = useModal();
  
  return (
    <Modal
      title="Success!"
      description={message}
      icon={CheckCircle}
      iconColor="green"
      primaryAction={{
        label: "Done",
        onClick: closeModal
      }}
    />
  );
}

// 3. Form modal (with custom content)
export function FormModal({ title, children, onSubmit, loading }: { 
  title: string; 
  children: ReactNode; 
  onSubmit: () => void;
  loading?: boolean;
}) {
  const { closeModal } = useModal();
  
  return (
    <Modal
      title={title}
      size="lg"
      primaryAction={{
        label: "Submit",
        onClick: onSubmit,
        loading
      }}
      secondaryAction={{
        label: "Cancel",
        onClick: closeModal
      }}
    >
      {children}
    </Modal>
  );
}
