import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import AnnouncementPopup from './AnnouncementPopup';
import AdvertPopup from './AdvertPopup';
import MobileBottomNav from './MobileBottomNav';
import AIChatWidget from '@/components/AIChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <div className="hidden lg:block">
        <Footer />
      </div>
      <AnnouncementPopup />
      <AdvertPopup />
      <MobileBottomNav />
      <AIChatWidget />
    </div>
  );
};

export default Layout;
