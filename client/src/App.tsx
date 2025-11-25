import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { Suspense, lazy, type ComponentType } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import LiveChat from "./components/LiveChat";
import { DashboardLayoutSkeleton } from "./components/DashboardLayoutSkeleton";

const createLazyPage = (loader: () => Promise<{ default: ComponentType }>) =>
  lazy(loader);

const NotFound = createLazyPage(() => import("./pages/NotFound"));

const routes = [
  { path: "/", component: createLazyPage(() => import("./pages/Home")) },
  { path: "/about", component: createLazyPage(() => import("./pages/About")) },
  { path: "/history", component: createLazyPage(() => import("./pages/History")) },
  {
    path: "/testimonials",
    component: createLazyPage(() => import("./pages/Testimonials")),
  },
  { path: "/shop", component: createLazyPage(() => import("./pages/Shop")) },
  { path: "/gallery", component: createLazyPage(() => import("./pages/Gallery")) },
  { path: "/blog", component: createLazyPage(() => import("./pages/Blog")) },
  { path: "/contact", component: createLazyPage(() => import("./pages/Contact")) },
  {
    path: "/tutorials",
    component: createLazyPage(() => import("./pages/Tutorials")),
  },
  {
    path: "/affiliate",
    component: createLazyPage(() => import("./pages/Affiliate")),
  },
  { path: "/members", component: createLazyPage(() => import("./pages/Members")) },
  {
    path: "/newsletter",
    component: createLazyPage(() => import("./pages/Newsletter")),
  },
  {
    path: "/analytics",
    component: createLazyPage(() => import("./pages/Analytics")),
  },
  { path: "/mixes", component: createLazyPage(() => import("./pages/Mixes")) },
  {
    path: "/bookings",
    component: createLazyPage(() => import("./pages/Bookings")),
  },
  { path: "/events", component: createLazyPage(() => import("./pages/Events")) },
  {
    path: "/podcasts",
    component: createLazyPage(() => import("./pages/Podcasts")),
  },
  {
    path: "/live-studio",
    component: createLazyPage(() => import("./pages/LiveStudio")),
  },
  {
    path: "/dashboard",
    component: createLazyPage(() => import("./pages/Dashboard")),
  },
];

function Router() {
  return (
    <Suspense fallback={<DashboardLayoutSkeleton />}>
      <Switch>
        {routes.map(route => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <LiveChat />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;