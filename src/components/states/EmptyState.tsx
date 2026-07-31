import { LucideIcon } from 'lucide-react';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  href?: string;
}

export interface EmptyStateProps {
  /**
   * Icon component to display in the empty state
   */
  icon?: LucideIcon;
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description explaining the empty state
   */
  description: string;
  /**
   * Optional actions the user can take
   */
  actions?: EmptyStateAction[];
  /**
   * Optional documentation link
   */
  docsLink?: {
    label: string;
    href: string;
  };
  /**
   * Variant of empty state
   * - 'no-data': No data exists yet (neutral/informative)
   * - 'unavailable': Data exists but is temporarily unavailable (warning/error)
   */
  variant?: 'no-data' | 'unavailable';
  /**
   * Optional custom className
   */
  className?: string;
}

const variantStyles = {
  'no-data': {
    container: 'border-slate-300 bg-slate-50',
    icon: 'text-slate-400',
    title: 'text-slate-800',
    description: 'text-slate-500',
  },
  'unavailable': {
    container: 'border-amber-300 bg-amber-50',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    description: 'text-amber-600',
  },
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  docsLink,
  variant = 'no-data',
  className = '',
}: EmptyStateProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`text-center py-16 border border-dashed rounded-xl ${styles.container} ${className}`}>
      {Icon && <Icon className={`mx-auto mb-4 ${styles.icon}`} size={48} />}
      <h3 className={`text-lg font-semibold ${styles.title}`}>{title}</h3>
      <p className={`mt-2 max-w-md mx-auto ${styles.description}`}>{description}</p>

      {actions && actions.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => {
            const baseClasses =
              action.variant === 'primary'
                ? 'bg-aegis-brand hover:bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50';

            if (action.href) {
              return (
                <a
                  key={index}
                  href={action.href}
                  className={`${baseClasses} px-5 py-2 rounded-md font-medium transition`}
                >
                  {action.label}
                </a>
              );
            }

            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`${baseClasses} px-5 py-2 rounded-md font-medium transition`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {docsLink && (
        <a
          href={docsLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-slate-500 hover:text-slate-700 underline"
        >
          {docsLink.label}
        </a>
      )}
    </div>
  );
}
