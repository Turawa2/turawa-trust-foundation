import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Turawa Trust</h3>
                <p className="text-xs text-muted-foreground">Foundation</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Restoring donor trust through blockchain transparency. Every donation
              is recorded on the Cardano blockchain, ensuring complete accountability.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Donate
                </Link>
              </li>
              <li>
                <Link
                  to="/transparency"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Transparency Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Blockchain */}
          <div>
            <h4 className="font-display font-semibold mb-4">Blockchain</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://cardanoscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cardano Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://cardano.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Cardano
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Turawa Trust Foundation. Built on Cardano.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">
              Powered by
            </span>
            <div className="flex items-center gap-1 text-primary font-display font-semibold">
              <span>₳</span>
              <span>Cardano</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
