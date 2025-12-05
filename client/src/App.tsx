import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
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
import AdminShouts from "./pages/AdminShouts";
import AdminStreams from "./pages/AdminStreams";
import AdminNowPlaying from "./pages/AdminNowPlaying";
import AdminShows from "./pages/AdminShows";
import AdminEmpire from "./pages/AdminEmpire";
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
import ShowPage from "./pages/ShowPage";
import ShowEpisodes from "./pages/ShowEpisodes";
import ShowEpisodeDetail from "./pages/ShowEpisodeDetail";
import AdminShowLive from "./pages/AdminShowLive";
import AdminControlTower from "./pages/AdminControlTower";
import AdminIntegrations from "./pages/AdminIntegrations";
import MediaKit from "./pages/MediaKit";
import Rider from "./pages/Rider";
import SetlistBuilder from "./pages/SetlistBuilder";
import Achievements from "./pages/Achievements";
import { GlobalBanner } from "./components/GlobalBanner";
import { LiveAudioPlayer } from "./components/LiveAudioPlayer";
import { AIDannyFloating } from "./components/AIDannyFloating";
import { HecticOnboarding } from "./components/HecticOnboarding";
import { SocialProofNotifications } from "./components/SocialProofNotifications";

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
      <Route path={"/admin/empire"} component={AdminEmpire} />
      <Route path={"/support"} component={() => <div className="container mx-auto p-6"><h1>Support Danny</h1><p>Support page coming soon...</p></div>} />
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
      <Route path={"/admin/control"} component={AdminControlTower} />
      <Route path={"/admin/integrations"} component={AdminIntegrations} />
      <Route path={"/media-kit"} component={MediaKit} />
      <Route path={"/rider"} component={Rider} />
      <Route path={"/setlist-builder"} component={SetlistBuilder} />
      <Route path={"/achievements"} component={Achievements} />
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
          <GlobalBanner />
          <SocialProofNotifications />
          <Router />
          <LiveChat />
          <LiveAudioPlayer />
          <AIDannyFloating />
          <HecticOnboarding />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;