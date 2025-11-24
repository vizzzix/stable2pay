import { TopBar } from "@/components/TopBar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Rocket, CheckCircle2 } from "lucide-react";

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed",
    description: "Core payment infrastructure and merchant tools",
    items: [
      "Core POS functionality",
      "QR code payments",
      "Wallet integration (MetaMask, Rabby)",
      "Real-time payment detection via WebSocket",
      "Merchant dashboard with invoice management",
      "Stable Testnet integration (Chain ID 2201)",
    ],
  },
  {
    phase: "Phase 2",
    title: "Enhanced Payments",
    status: "in-progress",
    description: "Expanding payment options and improving UX",
    items: [
      "Card payments via MoonPay/Transak",
      "Multi-currency support",
      "Payment links & invoicing",
      "Mobile-optimized experience",
      "Email notifications",
    ],
  },
  {
    phase: "Phase 3",
    title: "Business Tools",
    status: "upcoming",
    description: "Enterprise features for growing businesses",
    items: [
      "Merchant API & webhooks",
      "Analytics dashboard",
      "Multi-store support",
      "Team management & roles",
      "Custom branding",
      "Recurring payments",
    ],
  },
  {
    phase: "Phase 4",
    title: "Scale",
    status: "upcoming",
    description: "Mainnet launch and ecosystem integrations",
    items: [
      "Stable Mainnet launch",
      "Plugin for Shopify",
      "Plugin for WooCommerce",
      "Point-of-sale hardware integration",
      "Enterprise features",
      "SDK for developers",
    ],
  },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="container max-w-5xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Rocket className="w-8 h-8 text-accent" />
              <h1 className="text-4xl font-bold">Roadmap</h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our vision for building the best payment infrastructure on Stable Network
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {roadmapItems.map((phase, i) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-6 w-5 h-5 rounded-full border-4 hidden md:block ${
                    phase.status === 'completed'
                      ? 'bg-accent border-accent'
                      : phase.status === 'in-progress'
                      ? 'bg-warning border-warning'
                      : 'bg-background border-muted-foreground/30'
                  }`} />

                  <Card className={`glass-card p-6 md:ml-16 ${
                    phase.status === 'completed' ? 'border-accent/50' : ''
                  }`}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        phase.status === 'completed'
                          ? 'bg-accent/20 text-accent'
                          : phase.status === 'in-progress'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {phase.phase}
                      </span>
                      <h2 className="text-xl font-bold">{phase.title}</h2>
                      {phase.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      )}
                      {phase.status === 'in-progress' && (
                        <span className="flex items-center gap-1 text-sm text-warning">
                          <span className="w-2 h-2 bg-warning rounded-full animate-pulse" />
                          In Progress
                        </span>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4">{phase.description}</p>

                    <ul className="grid sm:grid-cols-2 gap-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            phase.status === 'completed' ? 'text-accent' : 'text-muted-foreground/30'
                          }`} />
                          <span className={phase.status === 'completed' ? '' : 'text-muted-foreground'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              Roadmap is subject to change based on community feedback and priorities.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
