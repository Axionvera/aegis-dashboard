import { ReactNode } from 'react';
import { useRouteAccess } from '@/features/auth/useRouteAccess';
import AccessUnavailable from '@/components/AccessUnavailable';

interface RouteGuardProps {
  path: string;
  children: ReactNode;
}

export default function RouteGuard({ path, children }: RouteGuardProps) {
  const access = useRouteAccess(path);

  if (access.state !== 'allowed') {
    return <AccessUnavailable access={access} />;
  }

  return <>{children}</>;
}
