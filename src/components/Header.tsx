import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, BarChart3, Home, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';
import WalletButton from './WalletButton';

const Header: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/donate', label: 'Donate', icon: Heart },
    { path: '/transparency', label: 'Transparency', icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-display text-lg font-bold text-foreground">
                Turawa Trust
              </h1>
              <p className="text-xs text-muted-foreground">Foundation</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="font-medium">{link.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center gap-4">
            <WalletButton />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden py-4 border-t border-border/50"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
              >
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </div>
              </Link>
            ))}
          </motion.nav>
        )}
      </div>
    </header>
  );
};

export default Header;
