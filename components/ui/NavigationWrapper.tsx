'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  // mapとpostのページではNavigationを表示しない
  if (pathname === '/map' || pathname.startsWith('/post/')) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <Navigation />
    </div>
  );
}
