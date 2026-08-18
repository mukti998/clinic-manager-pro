import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-gradient-mesh bg-dots"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-lg mx-auto text-center px-4">
          <div className="glass-strong rounded-2xl p-12">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 mx-auto mb-6">
              <Activity className="size-8 text-primary" />
            </div>
            <h1 className="text-6xl font-extrabold text-primary font-mono mb-4">404</h1>
            <p className="text-xl font-semibold text-foreground mb-2">Page Not Found</p>
            <p className="text-sm text-muted-foreground mb-8">
              The route you requested does not exist in this system.
            </p>
            <button
              onClick={() => navigate("/")}
              className="glass glass-strong flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 mx-auto"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
