import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Eye, Heart, Users, Coins, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import ProgressBar from '@/components/ProgressBar';
import { useDonations } from '@/contexts/DonationContext';

const LandingPage: React.FC = () => {
  const { totalDonated, donorCount, targetAmount } = useDonations();

  const features = [
    {
      icon: Shield,
      title: 'Immutable Records',
      description: 'Every donation is permanently recorded on the Cardano blockchain, impossible to alter or delete.',
    },
    {
      icon: Eye,
      title: 'Full Transparency',
      description: 'Anyone can verify donations in real-time. No hidden transactions, no secret accounts.',
    },
    {
      icon: Heart,
      title: 'Direct Impact',
      description: 'Your ADA goes directly to the cause. Smart contracts ensure funds are used as intended.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-turawa-gold/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                Built on Cardano Blockchain
              </span>
            </motion.div>

            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Transparency
              <br />
              <span className="text-primary">Restores Trust</span>
            </motion.h1>

            <motion.p
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Every donation to Turawa Trust Foundation is recorded on the Cardano blockchain.
              See exactly where your money goes. No secrets. No corruption. Just trust.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/donate">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-primary hover:bg-primary/90 glow-effect">
                  Donate with Confidence
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/transparency">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-primary/30 hover:bg-primary/10">
                  <Eye className="h-5 w-5" />
                  View All Donations
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Live Stats Preview */}
          <motion.div
            className="mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="glass-card p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-3 mb-6">
                <StatsCard
                  title="Total Donated"
                  value={totalDonated}
                  suffix=" ₳"
                  icon={Coins}
                  delay={0.6}
                />
                <StatsCard
                  title="Unique Donors"
                  value={donorCount}
                  icon={Users}
                  delay={0.7}
                />
                <StatsCard
                  title="Verified On-Chain"
                  value={100}
                  suffix="%"
                  icon={CheckCircle}
                  delay={0.8}
                  animate={false}
                />
              </div>
              <ProgressBar current={totalDonated} target={targetAmount} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Blockchain Transparency?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Traditional charity lacks accountability. With blockchain, every transaction is visible,
              permanent, and verifiable by anyone.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/20 p-8 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-primary/30 blur-3xl" />

            <div className="relative text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Your donation is protected by the Cardano blockchain. 
                Join the movement for transparent giving in Africa.
              </p>
              <Link to="/donate">
                <Button size="lg" className="gap-2 text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                  <Heart className="h-5 w-5" />
                  Donate Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
