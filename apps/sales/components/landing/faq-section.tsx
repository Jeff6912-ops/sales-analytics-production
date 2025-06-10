"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Shield, Zap, DollarSign, Clock, Users, BarChart3 } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    id: 1,
    icon: <DollarSign className="size-5 text-blue-500" />,
    question: "How is this different from Gong or Chorus?",
    answer: "We're built specifically for HighLevel at 1/10th the cost. While Gong costs $1,200+ per user annually, we're $324/year. Plus, we understand HighLevel's unique workflow and integrate seamlessly with your existing setup. No complex enterprise implementation - just plug and play.",
    highlight: "1/10th the cost of enterprise solutions"
  },
  {
    id: 2,
    icon: <Zap className="size-5 text-green-500" />,
    question: "Do I need technical skills to set this up?",
    answer: "If you can fill out a form, you can set this up. Connect your HighLevel account in 2 clicks, and we handle everything else. Most customers are analyzing calls within 24 hours. We also include free setup support to make sure everything runs smoothly.",
    highlight: "Setup in under 5 minutes"
  },
  {
    id: 3,
    icon: <Shield className="size-5 text-purple-500" />,
    question: "What about our call privacy and security?",
    answer: "Bank-level encryption, SOC 2 compliant, and GDPR ready. Your calls are processed securely and never shared. We use the same security standards as major financial institutions. Your data stays yours, and we never train our models on your specific conversations.",
    highlight: "Bank-level security standards"
  },
  {
    id: 4,
    icon: <Clock className="size-5 text-orange-500" />,
    question: "Can I try it first before committing?",
    answer: "Absolutely! 14-day free trial, no credit card required. See your first insights within hours. If you're not amazed by what you discover about your team's performance, just cancel. No questions asked. We're that confident you'll love it.",
    highlight: "14-day free trial, no credit card"
  },
  {
    id: 5,
    icon: <Users className="size-5 text-red-500" />,
    question: "Will this work with my existing HighLevel setup?",
    answer: "Yes! We integrate with all HighLevel accounts - whether you're using the basic plan or white-label version. Works with your existing phone systems, CRM workflows, and team structure. No disruption to your current process.",
    highlight: "Works with all HighLevel plans"
  },
  {
    id: 6,
    icon: <BarChart3 className="size-5 text-indigo-500" />,
    question: "How quickly will I see results?",
    answer: "Most managers see their first 'aha moment' within 48 hours. That's when you discover why your top performer is crushing it while others struggle. Full team transformation typically happens within 30-60 days as you implement the insights.",
    highlight: "First insights within 48 hours"
  }
];

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Questions? 
            <span className="text-blue-600 dark:text-blue-400"> We've Got Answers</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to know about transforming your sales team with AI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      {faq.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {faq.highlight}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {openFAQ === faq.id ? (
                      <Minus className="size-5 text-gray-500" />
                    ) : (
                      <Plus className="size-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openFAQ === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="pl-16">
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Still have questions? We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Start Free Trial
            </button>
            <button className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors">
              Schedule Demo Call
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 