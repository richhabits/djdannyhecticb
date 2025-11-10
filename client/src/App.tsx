import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import History from "./pages/History";
import Mixes from "./pages/Mixes";
import Bookings from "./pages/Bookings";
import Events from "./pages/Events";
import Podcasts from "./pages/Podcasts";
import LiveStudio from "./pages/LiveStudio";
import Dashboard from "./pages/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/history"} component={History} />
      <Route path={"/mixes"} component={Mixes} />
      <Route path={"/bookings"} component={Bookings} />
      <Route path={"/events"} component={Events} />
      <Route path={"/podcasts"} component={Podcasts} />
      <Route path={"/live-studio"} component={LiveStudio} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
