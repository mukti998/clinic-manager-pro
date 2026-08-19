import { Activity } from "lucide-react";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh bg-dots">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="glass-card p-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
              <Activity className="size-8 text-primary" />
            </div>
            <h1 className="text-5xl font-extrabold text-primary font-mono mb-3">404</h1>
            <p className="text-lg font-semibold text-foreground mb-2">Page Not Found</p>
            <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
              The route you requested does not exist in this system. Please check the URL or return to the dashboard.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
