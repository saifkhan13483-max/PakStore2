import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AnnouncementBanner from './AnnouncementBanner';
import AnnouncementPopup from './AnnouncementPopup';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnnouncementPopup />
    </div>
  );
};

export default Layout;
