'use client';

import { usePathname } from 'next/navigation';
import Footer from './footer';

export default function FooterWrapper() {
  const pathname = usePathname();
  
  // auth、map、post以外のページでのみfooterを表示
  const shouldShowFooter = !pathname.startsWith('/auth') && 
                          !pathname.startsWith('/map') && 
                          !pathname.startsWith('/post');
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <Footer />;
}
