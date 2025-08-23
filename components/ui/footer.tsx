'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiOutlineHome, 
  HiHome, 
  HiOutlineGlobeAlt, 
  HiGlobeAlt, 
  HiOutlineCamera, 
  HiCamera, 
  HiOutlineUserCircle, 
  HiUserCircle 
} from "react-icons/hi";

const navItems = [
  { href: '/timeline', name: 'Timeline', icon: HiOutlineHome, activeIcon: HiHome },
  { href: '/map', name: 'Map', icon: HiOutlineGlobeAlt, activeIcon: HiGlobeAlt },
  { href: '/post', name: 'Post', icon: HiOutlineCamera, activeIcon: HiCamera },
  { href: '/user', name: 'User', icon: HiOutlineUserCircle, activeIcon: HiUserCircle },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-pink-100/90 backdrop-blur-md border-t border-pink-200/50 shadow-lg">
      <nav className="flex justify-around items-center h-16 px-4 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = isActive ? item.activeIcon : item.icon;

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center w-full group relative h-full">
              <div className="relative z-10">
                <Icon 
                  className={`text-3xl transition-all duration-300 ${
                    isActive 
                      ? 'text-gray-800 drop-shadow-sm' 
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`} 
                />
              </div>
              {/* アクティブ時の下線をfooterの一番下に配置 */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-800 rounded-t-full"></div>
              )}
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
