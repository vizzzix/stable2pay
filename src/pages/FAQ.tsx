import { TopBar } from "@/components/TopBar";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is Stable2Pay?",
    answer: "Stable2Pay is a point-of-sale (POS) system for accepting stablecoin payments. It allows merchants to create payment invoices and receive gUSDT directly to their wallet on Stable Network.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No traditional account needed! Simply connect your crypto wallet (MetaMask, Rabby, etc.) to access the merchant dashboard. Your wallet address is your identity.",
  },
  {
    question: "What are the fees?",
    answer: "Stable2Pay charges 0% platform fees. You only pay minimal blockchain transaction fees (~$0.001 per transaction on Stable Network).",
  },
  {
    question: "How do customers pay?",
    answer: "Customers can scan the QR code with their mobile wallet, or click 'Pay with Wallet' on desktop. They'll need gUSDT on Stable Network (Chain ID 2201).",
  },
  {
    question: "Can customers pay with credit card?",
    answer: "Card payments are coming soon! We're integrating with on-ramp providers like MoonPay and Transak to allow customers to pay with cards.",
  },
  {
    question: "How fast are payments confirmed?",
    answer: "Payments are confirmed in under 1 second thanks to Stable Network's fast block time (~0.7s). You'll see real-time status updates.",
  },
  {
    question: "Is it secure?",
    answer: "Yes! Payments go directly to your wallet - we never hold your funds. All transactions are secured by Stable Network's blockchain.",
  },
  {
    question: "What is Stable Network?",
    answer: "Stable Network is a next-generation Layer 1 blockchain designed specifically for stablecoin payments. It features sub-second finality, minimal fees, and EVM compatibility.",
  },
  {
    question: "How do I get gUSDT for testing?",
    answer: "On testnet, you can get gUSDT from the Stable Network faucet. Visit the Stable Network documentation for faucet links and instructions.",
  },
  {
    question: "Can I use Stable2Pay for my business?",
    answer: "Yes! Stable2Pay is designed for businesses of all sizes - from freelancers to retail stores to e-commerce platforms. Connect your wallet and start accepting payments today.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="container max-w-3xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <HelpCircle className="w-8 h-8 text-accent" />
              <h1 className="text-4xl font-bold">FAQ</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about Stable2Pay
            </p>
          </div>

          {/* FAQ Items */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AccordionItem
                  value={`item-${i}`}
                  className="glass-card px-6 border rounded-lg"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <span className="font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* Contact */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Have more questions?{" "}
              <a
                href="https://github.com/vizzzix/stablepay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Open an issue on GitHub
              </a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
