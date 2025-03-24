"use client"

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.5, ease: 'anticipate' }}
        className="relative w-6 h-6"
      >
        <motion.div
          initial={false}
          animate={{ opacity: theme === 'dark' ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Moon className="w-6 h-6" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ opacity: theme === 'dark' ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Sun className="w-6 h-6" />
        </motion.div>
      </motion.div>
    </Button>
  );
}