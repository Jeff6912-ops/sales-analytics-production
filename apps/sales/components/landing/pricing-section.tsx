"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { CheckIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { Shield, Clock, Zap, Users } from "lucide-react";
import { useState } from "react";

const features = [
  "Unlimited call analysis",
  "All AI-powered insights",
  "Real-time dashboard",
  "HeatCheck Score™ for every call",
  "Objection intelligence",
  "Industry-specific intelligence",
  "24-hour setup support",
  "No contracts, cancel anytime",
  "SOC 2 compliant security",
  "API access included"
];

const bonuses = [
  {
    icon: <Users className="size-5" />,
    title: "Personalized Onboarding Session",
    description: "1-on-1 setup call with our team",
    value: "$297 value"
  },
  {
    icon: <Zap className="size-5" />,
    title: "Custom Integration Support",
    description: "We'll connect your specific HighLevel setup",
    value: "$497 value"
  },
  {
    icon: <Shield className="size-5" />,
    title: "90-Day Success Guarantee",
    description: "We guarantee measurable improvements",
    value: "Priceless"
  }
];

export default function PricingSection() {
  const [isLoading, setIsLoading] = useState(false);

  const onStartTrial = async () => {
    setIsLoading(true);
    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Clock className="size-4" />
            Limited Time: Next 50 Signups Only
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Simple Pricing. 
            <span className="text-blue-600 dark:text-blue-400"> Massive Impact.</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            One price. All features. No surprises. Start seeing results in 24 hours.
          </p>
        </div>

        {/* Main Pricing Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="relative border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 overflow-hidden">
            <BorderBeam
              size={200}
              duration={12}
              delay={0}
              colorFrom="#3b82f6"
              colorTo="#1d4ed8"
            />
            
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Left Side - Pricing */}
                <div className="p-8 md:p-12">
                  <div className="text-center md:text-left">
                    <div className="flex items-baseline justify-center md:justify-start gap-2 mb-6">
                      <span className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
                        $27
                      </span>
                      <span className="text-xl text-gray-600 dark:text-gray-400">
                        /month per seat
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <CheckIcon className="size-5" />
                        <span className="font-semibold">14-day FREE trial</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <CheckIcon className="size-5" />
                        <span className="font-semibold">No credit card required</span>
                      </div>
                      <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                        <CheckIcon className="size-5" />
                        <span className="font-semibold">Cancel anytime</span>
                      </div>
                    </div>

                    <motion.div className="space-y-4">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold gap-2"
                        onClick={onStartTrial}
                        disabled={isLoading}
                      >
                        {isLoading ? "Starting Your Trial..." : "Start Your 14-Day FREE Trial"}
                        {!isLoading && <ArrowRightIcon className="size-5" />}
                      </Button>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Setup in under 5 minutes
                      </p>
                    </motion.div>

                    <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-200 font-semibold text-center">
                        💰 30-day money back guarantee if you don't uncover game-changing insights
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Features */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-8 md:p-12">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Everything Included:
                  </h3>
                  
                  <div className="space-y-3 mb-8">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <CheckIcon className="size-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                      🎁 Limited-Time Bonuses:
                    </h4>
                    <div className="space-y-3">
                      {bonuses.map((bonus, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
                            {bonus.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              {bonus.title}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              {bonus.description}
                            </p>
                            <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                              {bonus.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Stats */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            This pays for itself by preventing just one lost deal per month
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div>✓ SOC 2 Compliant</div>
            <div>✓ 99.9% Uptime</div>
            <div>✓ 24/7 Support</div>
            <div>✓ GDPR Ready</div>
          </div>
        </div>
      </div>
    </section>
  );
} 