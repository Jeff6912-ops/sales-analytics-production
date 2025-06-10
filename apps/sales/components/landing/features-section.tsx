"use client";

import { BorderBeam } from "@/components/magicui/border-beam";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Target, BarChart3, Zap, ArrowRight } from "lucide-react";
import { useState } from "react";

const features = [
  {
    id: "heatscore",
    icon: <Brain className="size-8 text-purple-400" />,
    title: "HeatCheck Score™",
    subtitle: "Instant 0-100 call quality rating",
    description: "Every call gets an instant quality score based on 47 conversation factors. Know immediately which calls are gold and which need work.",
    visual: "🔥 Score: 89/100 - High conversion potential",
    color: "purple"
  },
  {
    id: "objections",
    icon: <Target className="size-8 text-red-400" />,
    title: "Objection Intelligence",
    subtitle: "Know what's killing deals before it's too late",
    description: "AI identifies objection patterns across your entire team. See exactly which objections are deal-killers and coach around them.",
    visual: "⚠️ Price objections up 34% this week",
    color: "red"
  },
  {
    id: "dashboard",
    icon: <BarChart3 className="size-8 text-blue-400" />,
    title: "Real-Time Dashboard",
    subtitle: "See the whole picture, not just call counts",
    description: "Live insights into team performance, deal risk, and coaching opportunities. Finally understand WHY some reps succeed.",
    visual: "📊 Johnson: 3x more discovery questions than Smith",
    color: "blue"
  },
  {
    id: "setup",
    icon: <Zap className="size-8 text-green-400" />,
    title: "One-Click Setup",
    subtitle: "Running in 24 hours, no IT required",
    description: "Connect your HighLevel account in 2 clicks. We handle the rest. Your first insights appear within hours, not weeks.",
    visual: "✅ Connected to HighLevel in 47 seconds",
    color: "green"
  }
];

export default function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState("heatscore");

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI Sales Coach That 
            <span className="text-blue-600 dark:text-blue-400"> Never Sleeps</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Every call analyzed. Every pattern discovered. Every coaching opportunity identified. 
            <span className="font-semibold"> Automatically.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Feature Tabs */}
          <div className="space-y-6">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  activeFeature === feature.id
                    ? `border-${feature.color}-500 bg-${feature.color}-50 dark:bg-${feature.color}-900/20`
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setActiveFeature(feature.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className={`text-${feature.color}-600 dark:text-${feature.color}-400 font-medium mb-2`}>
                      {feature.subtitle}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Feature Visual */}
          <div className="relative">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  activeFeature === feature.id ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-2xl">
                  <BorderBeam
                    size={200}
                    duration={12}
                    delay={11}
                    colorFrom={`var(--${feature.color}-500)`}
                    colorTo={`var(--${feature.color}-400)`}
                  />
                  <div className="text-center">
                    <div className="text-6xl mb-4">{feature.icon}</div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h4>
                    <div className={`inline-block px-6 py-3 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-lg text-${feature.color}-700 dark:text-${feature.color}-300 font-mono text-lg`}>
                      {feature.visual}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
            See All Features In Action
            <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    </section>
  );
} 