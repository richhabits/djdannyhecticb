import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LiveChat from "./components/LiveChat";
import Home from "./pages/Home";
import About from "./pages/About";
import History from "./pages/History";
import Testimonials from "./pages/Testimonials";
import Shop from "./pages/Shop";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Tutorials from "./pages/Tutorials";
import Affiliate from "./pages/Affiliate";
import Members from "./pages/Members";
import Newsletter from "./pages/Newsletter";
import Analytics from "./pages/Analytics";
import Integrations from "./pages/Integrations";
import EPK from "./pages/EPK";
import Login from "./pages/Login";
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
      <Route path={"/testimonials"} component={Testimonials} />
      <Route path={"/shop"} component={Shop} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/tutorials"} component={Tutorials} />
      <Route path={"/affiliate"} component={Affiliate} />
      <Route path={"/members"} component={Members} />
      <Route path={"/newsletter"} component={Newsletter} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/epk"} component={EPK} />
      <Route path={"/login"} component={Login} />
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
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <LiveChat />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;