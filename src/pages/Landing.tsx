import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TopBar } from "@/components/TopBar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Globe,
  QrCode,
  Wallet,
  ArrowRight,
  CheckCircle2,
  Store,
  Smartphone,
  Code,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Payments",
    description: "Transactions confirm in under 1 second on Stable Network",
  },
  {
    icon: Shield,
    title: "Secure & Trustless",
    description: "Direct blockchain payments, no intermediaries",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Accept payments from anywhere in the world",
  },
  {
    icon: QrCode,
    title: "QR Code Payments",
    description: "Customers scan and pay in seconds",
  },
];

const useCases = [
  {
    icon: Store,
    title: "Retail & POS",
    description: "Perfect for cafes, restaurants, and retail stores. Generate QR codes at checkout.",
  },
  {
    icon: Code,
    title: "E-Commerce",
    description: "Integrate via API. Receive webhook notifications on payment confirmation.",
  },
  {
    icon: Smartphone,
    title: "Freelancers",
    description: "Create invoices and share payment links with your clients.",
  },
];

const steps = [
  { step: "1", title: "Connect Wallet", description: "Sign in with your crypto wallet" },
  { step: "2", title: "Create Invoice", description: "Enter amount and generate QR" },
  { step: "3", title: "Get Paid", description: "Customer scans and pays instantly" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        {/* Hand with phone decoration - positioned to extend beyond section */}
        <div className="absolute right-0 bottom-0 translate-y-[15%] w-[600px] h-[750px] pointer-events-none hidden lg:block">
          <img
            src="/logohand.png"
            alt=""
            className="w-full h-full object-contain opacity-25"
          />
        </div>

        <div className="container max-w-6xl mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm text-accent">Powered by Stable Network</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Accept{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                Stablecoin
              </span>{" "}
              Payments Instantly
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stable2Pay is a modern POS system for accepting gUSDT payments on Stable Network.
              No fees, instant confirmation, direct to your wallet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gradient-accent hover:opacity-90 text-lg px-8"
                onClick={() => navigate("/dashboard")}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Start Accepting Payments
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8"
                onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div>
                <div className="text-3xl font-bold text-accent">0%</div>
                <div className="text-sm text-muted-foreground">Platform Fees</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">&lt;1s</div>
                <div className="text-sm text-muted-foreground">Confirmation</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">Availability</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Stable2Pay?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for merchants who want simple, reliable crypto payments
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card p-6 h-full hover:border-accent/50 transition-colors">
                  <feature.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes, no technical knowledge required
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <Card className="glass-card p-8 text-center h-full">
                  <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </Card>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-muted-foreground/30 -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Built For Everyone</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From small businesses to online platforms
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card p-6 h-full">
                  <useCase.icon className="w-10 h-10 text-accent mb-4" />
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stable Network Info */}
      <section className="py-20">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Card className="glass-card p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Powered by Stable Network</h2>
                  <p className="text-muted-foreground mb-6">
                    Stable is a next-generation Layer 1 blockchain designed specifically for stablecoin payments.
                    With sub-second finality and minimal fees, it's the perfect foundation for payment infrastructure.
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Native gUSDT with 18 decimal precision",
                      "~0.7 second block time",
                      "EVM compatible - works with MetaMask, Rabby",
                      "Built for high-volume payment processing",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0">
                  <img src="/logo.svg" alt="Stable2Pay" className="w-32 h-32" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Accept Crypto Payments?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Connect your wallet and start accepting gUSDT payments in minutes.
              No setup fees, no monthly charges.
            </p>
            <Button
              size="lg"
              className="gradient-accent hover:opacity-90 text-lg px-8"
              onClick={() => navigate("/dashboard")}
            >
              <Wallet className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="Stable2Pay" className="w-8 h-8" />
              <span className="font-semibold">Stable2Pay.app</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button onClick={() => navigate('/roadmap')} className="hover:text-accent transition-colors">
                Roadmap
              </button>
              <button onClick={() => navigate('/faq')} className="hover:text-accent transition-colors">
                FAQ
              </button>
              <span>•</span>
              <span>Built on Stable Network Testnet</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
