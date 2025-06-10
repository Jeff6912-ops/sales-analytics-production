"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Clock, TrendingDown, Users } from "lucide-react";

const painPoints = [
  {
    icon: <AlertTriangle className="size-6 text-red-500" />,
    title: "73 calls from Smith. 52 from Johnson.",
    subtitle: "Johnson closed 3 deals. Smith closed 0. Why?",
    description: "You're drowning in data but starving for insights."
  },
  {
    icon: <Users className="size-6 text-orange-500" />,
    title: "Another top performer just quit",
    subtitle: "because you couldn't show them how to level up",
    description: "Your best people leave when they hit their ceiling."
  },
  {
    icon: <TrendingDown className="size-6 text-red-500" />,
    title: "Monday's pipeline review:",
    subtitle: "'What's the bottleneck?' You'll guess. Again.",
    description: "Every decision based on hunches, not data."
  },
  {
    icon: <Clock className="size-6 text-purple-500" />,
    title: "It's 2 AM. You're reviewing calls",
    subtitle: "from two weeks ago. The deal's already dead.",
    description: "By the time you find the problem, it's too late."
  }
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Sound <span className="text-red-400">Familiar?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            You're not alone. Every sales manager faces the same impossible math:
          </p>
          <div className="mt-8 p-6 bg-red-900/20 border border-red-500/30 rounded-lg inline-block">
            <p className="text-2xl font-bold text-red-300">
              40+ hours to understand one week of performance
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {painPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.1)"
              }}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-gray-700 rounded-lg">
                  {point.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {point.title}
                  </h3>
                  <p className="text-red-300 font-medium mb-2">
                    {point.subtitle}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {point.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-xl text-gray-300 font-semibold">
            The math doesn't work. There has to be a better way.
          </p>
        </div>
      </div>
    </section>
  );
} 