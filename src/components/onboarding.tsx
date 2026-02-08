import { motion } from 'framer-motion';

export function Onboarding({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center bg-gradient-to-br from-background via-background to-primary/20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center text-4xl shadow-lg shadow-primary/50">
          T
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to TemPay</h1>
        <p className="text-muted-foreground">
          The future of stablecoin payments. Fast, secure, and gasless.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onClick={onCreate}
        className="w-full max-w-xs py-4 rounded-xl bg-white text-black font-bold text-lg shadow-xl hover:scale-105 transition-transform active:scale-95"
      >
        Create Account
      </motion.button>
      
      <p className="text-xs text-muted-foreground pt-4">This will generate a burner wallet in your browser.</p>
    </div>
  );
}
