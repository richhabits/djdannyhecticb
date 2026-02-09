/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 * 
 * This is proprietary software. Reverse engineering, decompilation, or 
 * disassembly is strictly prohibited and may result in legal action.
 */


/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LiveChat from "./components/LiveChat";
import { AnimatedBackground } from "./components/AnimatedBackground";
import Home from "./pages/Home";
import About from "./pages/About";
import History from "./pages/History";
import Testimonials from "./pages/Testimonials";
import Shop from "./pages/Shop";
import BeatportShop from "./pages/BeatportShop";
import BeatportSearch from "./pages/BeatportSearch";
import BeatportChart from "./pages/BeatportChart";
import BeatportGenre from "./pages/BeatportGenre";
import Checkout from "./pages/Checkout";
import Pricing from "./pages/Pricing";
import FAQ from "./pages/FAQ";
import VideoGallery from "./pages/VideoGallery";
import Equipment from "./pages/Equipment";
import Discography from "./pages/Discography";
import Awards from "./pages/Awards";
import Press from "./pages/Press";
import Portfolio from "./pages/Portfolio";
import TrackID from "./pages/TrackID";
import SocialFeed from "./pages/SocialFeed";
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
import Signup from "./pages/Signup";
import Mixes from "./pages/Mixes";
import Bookings from "./pages/Bookings";
import Events from "./pages/Events";
import Podcasts from "./pages/Podcasts";
import LiveStudio from "./pages/LiveStudio";
import Dashboard from "./pages/Dashboard";
import AdminShouts from "./pages/AdminShouts";
import AdminStreams from "./pages/AdminStreams";
import AdminNowPlaying from "./pages/AdminNowPlaying";
import AdminShows from "./pages/AdminShows";
import AdminEmpire from "./pages/AdminEmpire";
import AdminMixes from "./pages/AdminMixes";
import AdminTracks from "./pages/AdminTracks";
import AdminBookings from "./pages/AdminBookings";
import AdminPodcasts from "./pages/AdminPodcasts";
import AdminStreamingLinks from "./pages/AdminStreamingLinks";
import AdminMarketingHub from "./pages/AdminMarketingHub";
import ListenerLeaderboard from "./pages/ListenerLeaderboard";
import Live from "./pages/Live";
import BookDanny from "./pages/BookDanny";
import AIDanny from "./pages/AIDanny";
import Profile from "./pages/Profile";
import World from "./pages/World";
import Vault from "./pages/Vault";
import BookingsPage from "./pages/BookingsPage";
import EventsPage from "./pages/EventsPage";
import PartnersPage from "./pages/PartnersPage";
import Backstage from "./pages/Backstage";
import AIShout from "./pages/AIShout";
import AdminAIStudio from "./pages/AdminAIStudio";
import AdminAIScripts from "./pages/AdminAIScripts";
import AdminAIVoice from "./pages/AdminAIVoice";
import AdminAIVideo from "./pages/AdminAIVideo";
import Wallet from "./pages/Wallet";
import Rewards from "./pages/Rewards";
import AdminEconomy from "./pages/AdminEconomy";
import AdminVideos from "./pages/AdminVideos"; // New
import AdminBlog from "./pages/AdminBlog"; // New
import AdminMedia from "./pages/AdminMedia"; // New
import ShowPage from "./pages/ShowPage";
import ShowEpisodes from "./pages/ShowEpisodes";
import ShowEpisodeDetail from "./pages/ShowEpisodeDetail";
import AdminShowLive from "./pages/AdminShowLive";
import AdminControlTower from "./pages/AdminControlTower";
import AdminIntegrations from "./pages/AdminIntegrations";
import { GlobalBanner } from "./components/GlobalBanner";
import { LiveAudioPlayer } from "./components/LiveAudioPlayer";
import { AIDannyFloating } from "./components/AIDannyFloating";
import { HecticOnboarding } from "./components/HecticOnboarding";
import { GlobalSearch } from "./components/GlobalSearch";
import { SocialProofNotifications } from "./components/SocialProofNotifications";
import { GlobalNav } from "./components/GlobalNav";

import Bio from "./pages/Bio";
import Support from "./pages/Support";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/about"} component={About} />
      <Route path={"/bio"} component={Bio} />
      <Route path={"/history"} component={History} />
      <Route path={"/testimonials"} component={Testimonials} />
      <Route path={"/shop"} component={BeatportShop} />
      <Route path={"/shop/search"} component={BeatportSearch} />
      <Route path={"/shop/charts/:id"} component={BeatportChart} />
      <Route path={"/shop/genres/:slug"} component={BeatportGenre} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/pricing"} component={Pricing} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/videos"} component={VideoGallery} />
      <Route path={"/equipment"} component={Equipment} />
      <Route path={"/discography"} component={Discography} />
      <Route path={"/awards"} component={Awards} />
      <Route path={"/press"} component={Press} />
      <Route path={"/portfolio"} component={Portfolio} />
      <Route path={"/track-id"} component={TrackID} />
      <Route path={"/social-feed"} component={SocialFeed} />
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
      <Route path={"/signup"} component={Signup} />
      <Route path={"/register"} component={Signup} />
      <Route path={"/mixes"} component={Mixes} />
      <Route path={"/bookings"} component={Bookings} />
      <Route path={"/events"} component={Events} />
      <Route path={"/podcasts"} component={Podcasts} />
      <Route path={"/live-studio"} component={LiveStudio} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/hectic"}>
        <Redirect to="/live" />
      </Route>
      <Route path={"/go-live"}>
        <Redirect to="/live" />
      </Route>
      <Route path={"/live"} component={Live} />
      <Route path={"/listeners"} component={ListenerLeaderboard} />
      <Route path={"/book-danny"} component={BookDanny} />
      <Route path={"/admin/shouts"} component={AdminShouts} />
      <Route path={"/admin/streams"} component={AdminStreams} />
      <Route path={"/admin/now-playing"} component={AdminNowPlaying} />
      <Route path={"/admin/shows"} component={AdminShows} />
      <Route path={"/admin/mixes"} component={AdminMixes} />
      <Route path={"/admin/tracks"} component={AdminTracks} />
      <Route path={"/admin/bookings"} component={AdminBookings} />
      <Route path={"/admin/podcasts"} component={AdminPodcasts} />
      <Route path={"/admin/streaming-links"} component={AdminStreamingLinks} />
      <Route path={"/admin/marketing"} component={AdminMarketingHub} />
      <Route path={"/admin/empire"} component={AdminEmpire} />
      <Route path={"/support"} component={Support} />
      <Route path={"/ai-danny"} component={AIDanny} />
      <Route path={"/profile/:username"} component={Profile} />
      <Route path={"/world"} component={World} />
      <Route path={"/vault"} component={Vault} />
      <Route path={"/bookings"} component={BookingsPage} />
      <Route path={"/events"} component={EventsPage} />
      <Route path={"/partners"} component={PartnersPage} />
      <Route path={"/backstage"} component={Backstage} />
      <Route path={"/ai-shout"} component={AIShout} />
      <Route path={"/admin/ai-studio"} component={AdminAIStudio} />
      <Route path={"/admin/ai-scripts"} component={AdminAIScripts} />
      <Route path={"/admin/ai-voice"} component={AdminAIVoice} />
      <Route path={"/admin/ai-video"} component={AdminAIVideo} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/rewards"} component={Rewards} />
      <Route path={"/admin/economy"} component={AdminEconomy} />
      <Route path={"/show"} component={ShowPage} />
      <Route path={"/show/episodes"} component={ShowEpisodes} />
      <Route path={"/show/episode/:slug"} component={ShowEpisodeDetail} />
      <Route path={"/admin/show-live"} component={AdminShowLive} />
      <Route path={"/admin/videos"} component={AdminVideos} />
      <Route path={"/admin/blog"} component={AdminBlog} />
      <Route path={"/admin/media"} component={AdminMedia} />
      <Route path={"/admin/control"} component={AdminControlTower} />
      <Route path={"/admin/integrations"} component={AdminIntegrations} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

import { initGA, logPageView } from "./lib/analytics";
import { useEffect } from "react";
import { useLocation } from "wouter";

import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [location] = useLocation();
  console.log("App Component Rendering");

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView();
  }, [location]);

  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <AnimatedBackground />
            <div className="fixed inset-0 pointer-events-none z-[60] vignette-orange" />
            <Toaster />
            <GlobalBanner />
            <GlobalNav />
            <Router />
            <LiveAudioPlayer />
            <AIDannyFloating />
            {/* <HecticOnboarding /> */}
            <SocialProofNotifications />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;