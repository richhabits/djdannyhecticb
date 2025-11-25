import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, LogOut, User, Settings, MessageSquare, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { AIChatBox } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { AdminDashboard } from "@/components/AdminDashboard";

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>([
    { role: 'system', content: 'You are a helpful assistant for DJ Danny Hectic B website. Help users with bookings, mixes, events, and general inquiries.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const { data: bookings } = trpc.bookings.list.useQuery(undefined, { enabled: isAuthenticated });

  const handleSendMessage = (content: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content }]);
    setIsChatLoading(true);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thanks for your message! I can help you with DJ bookings, explore our mixes, check upcoming events, or answer questions about DJ Danny Hectic B services. What would you like to know?' 
      }]);
      setIsChatLoading(false);
    }, 1000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-3xl font-bold">Sign In Required</h1>
          <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Admin View
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Music className="w-6 h-6" />
              <span className="font-bold">DJ Danny Hectic B</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold border border-purple-500/30">ADMIN</span>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <div className="container py-8">
          <AdminDashboard />
        </div>
      </div>
    );
  }

  const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <Music className="w-6 h-6" />
            <span className="font-bold">DJ Danny Hectic B</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold">{user?.name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <Link href="/bookings">
                  <Button variant="outline" className="w-full justify-start">
                    <Music className="w-4 h-4 mr-2" />
                    My Bookings
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Card */}
            <Card className="p-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/50">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0]}! 🎵</h1>
              <p className="text-muted-foreground">
                Manage your bookings, explore mixes, and stay connected with DJ Danny Hectic B.
              </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending Bookings</p>
                    <p className="text-3xl font-bold">{pendingBookings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Confirmed Bookings</p>
                    <p className="text-3xl font-bold">{confirmedBookings}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                    <p className="text-3xl font-bold">{bookings?.length || 0}</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Music className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Bookings</h2>
                <Link href="/bookings">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              {bookings && bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border">
                      <div>
                        <p className="font-semibold">{booking.eventName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.eventDate).toLocaleDateString()} • {booking.eventLocation}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No bookings yet. <Link href="/bookings" className="text-accent hover:underline">Create one now!</Link>
                </p>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/mixes">
                  <Button variant="outline" className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    Explore Mixes
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    View Events
                  </Button>
                </Link>
                <Link href="/live-studio">
                  <Button variant="outline" className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    Watch Live Studio
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="outline" className="w-full">
                    <Music className="w-4 h-4 mr-2" />
                    New Booking
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Box */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 z-40 shadow-2xl rounded-lg overflow-hidden bg-background border border-border flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 hover:bg-card rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AIChatBox
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoading={isChatLoading}
              placeholder="Ask me anything..."
              height="100%"
            />
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition z-40"
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
