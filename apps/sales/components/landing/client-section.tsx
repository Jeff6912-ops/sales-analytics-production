"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Finally understand why Johnson closes 3x more than Smith",
    author: "Marcus R., Sales Director"
  },
  {
    text: "Found our biggest objection pattern in 2 days",
    author: "Sarah M., VP Sales"
  },
  {
    text: "Team close rate up 18% in first month",
    author: "David L., Sales Manager"
  }
];

export default function ClientSection() {
  return (
    <section
      id="clients"
      className="text-center mx-auto max-w-[80rem] px-6 md:px-8 py-20"
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <h2 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-8">
          TRUSTED BY 500+ HIGHLEVEL SALES TEAMS
        </h2>
        
        {/* Logo Placeholder Section */}
        <div className="mb-16">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 opacity-60">
            <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-36 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-30 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Testimonial Ticker */}
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-100%"] }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="flex gap-8 whitespace-nowrap"
          >
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-w-[300px]"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  "{testimonial.text}"
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {testimonial.author}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
} 