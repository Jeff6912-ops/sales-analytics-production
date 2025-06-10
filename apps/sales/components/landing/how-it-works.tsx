"use client";

import { motion } from "framer-motion";
import { ArrowRight, Link, Brain, Target, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Link className="size-8 text-blue-500" />,
    title: "Connect",
    subtitle: "Link your HighLevel account in 2 clicks",
    description: "Simple OAuth connection - no complex setup, no IT team required. We securely connect to your HighLevel account and start monitoring your calls immediately.",
    visual: "⚡ Connected in 47 seconds",
    color: "blue"
  },
  {
    number: "02", 
    icon: <Brain className="size-8 text-purple-500" />,
    title: "Capture",
    subtitle: "We automatically analyze every call going forward",
    description: "Our AI listens to every sales call, identifying patterns, objections, successful techniques, and areas for improvement. No manual work required.",
    visual: "🎯 847 calls analyzed automatically",
    color: "purple"
  },
  {
    number: "03",
    icon: <Target className="size-8 text-green-500" />,
    title: "Coach",
    subtitle: "Get instant insights and coaching recommendations",
    description: "Receive actionable insights about each rep's performance, deal risk factors, and specific coaching opportunities. Know exactly what to focus on.",
    visual: "📊 Johnson needs more discovery questions",
    color: "green"
  },
  {
    number: "04",
    icon: <TrendingUp className="size-8 text-orange-500" />,
    title: "Convert",
    subtitle: "Watch your team's performance transform",
    description: "Implement the insights and watch close rates improve, deal cycles shorten, and your team become more confident and effective.",
    visual: "📈 +23% close rate improvement",
    color: "orange"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            From Chaos to Clarity in 
            <span className="text-blue-600 dark:text-blue-400"> 24 Hours</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Stop spending 40+ hours a week trying to understand your team's performance. 
            Get instant insights that actually help.
          </p>
        </div>

        {/* Desktop Flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Lines */}
            <div className="absolute top-24 left-0 right-0 flex justify-between px-32">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex justify-center">
                  <ArrowRight className="size-6 text-gray-400 mt-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center"
                >
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${step.color}-100 dark:bg-${step.color}-900/30 text-${step.color}-600 dark:text-${step.color}-400 font-bold text-xl mb-6`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-${step.color}-50 dark:bg-${step.color}-900/20 mb-6`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className={`text-${step.color}-600 dark:text-${step.color}-400 font-semibold mb-4`}>
                    {step.subtitle}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Visual Example */}
                  <div className={`inline-block px-4 py-2 bg-${step.color}-100 dark:bg-${step.color}-900/30 rounded-lg text-${step.color}-700 dark:text-${step.color}-300 font-mono text-sm`}>
                    {step.visual}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Flow */}
        <div className="lg:hidden space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-${step.color}-100 dark:bg-${step.color}-900/30 text-${step.color}-600 dark:text-${step.color}-400 font-bold flex items-center justify-center`}>
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-${step.color}-50 dark:bg-${step.color}-900/20 mb-4`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className={`text-${step.color}-600 dark:text-${step.color}-400 font-semibold mb-3`}>
                  {step.subtitle}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>
                <div className={`inline-block px-3 py-1 bg-${step.color}-100 dark:bg-${step.color}-900/30 rounded text-${step.color}-700 dark:text-${step.color}-300 font-mono text-sm`}>
                  {step.visual}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Team?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join 500+ sales managers who sleep better at night knowing exactly what's happening with their team.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Your 24-Hour Transformation
            </button>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              14-day free trial • Setup in 5 minutes • No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 