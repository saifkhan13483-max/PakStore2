import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import AnnouncementPopup from './AnnouncementPopup';
import MobileBottomNav from './MobileBottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <div className="pb-16 lg:pb-0">
        <Footer />
      </div>
      <AnnouncementPopup />
      <MobileBottomNav />
    </div>
  );
};

export default Layout;
