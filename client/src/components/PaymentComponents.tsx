import { useState } from 'react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2, Heart } from 'lucide-react';
import { toast } from 'sonner';

// Initialize Stripe - get publishable key from env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface SupportPaymentProps {
  onSuccess?: () => void;
}

export function SupportPayment({ onSuccess }: SupportPaymentProps) {
  const [amount, setAmount] = useState('5.00');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const createPaymentMutation = trpc.revenue.support.create.useMutation({
    onSuccess: () => {
      toast.success('Thank you for your support! 🙌');
      setAmount('5.00');
      setName('');
      setEmail('');
      setMessage('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Payment failed: ' + error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amountInPence = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountInPence) || amountInPence < 100) {
      toast.error('Minimum amount is £1.00');
      return;
    }

    setProcessing(true);

    try {
      await createPaymentMutation.mutateAsync({
        fanName: name,
        email: email || undefined,
        amount: amount,
        currency: 'GBP',
        message: message || undefined,
      });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const presetAmounts = ['5.00', '10.00', '20.00', '50.00'];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          Support Hectic Radio
        </CardTitle>
        <CardDescription>
          Every contribution helps keep the music playing and the vibes going! 🎧
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Preset Amounts */}
          <div>
            <Label>Quick Amount</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(preset)}
                >
                  £{preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <Label htmlFor="amount">
              Amount (GBP) <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                £
              </span>
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                required
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Danny Fan"
              required
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fan@example.com"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              For receipt and updates
            </p>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Big up Danny! Keep the vibes coming! 🔥"
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={processing || !name || !amount}
            className="w-full"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-4 w-4" />
                Support with £{amount}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
      <div className="px-6 pb-6">
        <p className="text-xs text-center text-muted-foreground">
          Secure payment powered by Stripe 🔒
        </p>
      </div>
    </Card>
  );
}

// Subscription Tiers Component
interface SubscriptionTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  tier: 'hectic_regular' | 'hectic_royalty' | 'inner_circle';
}

const tiers: SubscriptionTier[] = [
  {
    name: 'Hectic Regular',
    price: '4.99',
    tier: 'hectic_regular',
    description: 'Join the family',
    features: [
      'Ad-free listening',
      'Early access to mixes',
      'Members-only chat',
      'Monthly newsletter',
    ],
  },
  {
    name: 'Hectic Royalty',
    price: '9.99',
    tier: 'hectic_royalty',
    description: 'VIP treatment',
    features: [
      'Everything in Regular',
      'Exclusive behind-the-scenes content',
      'Priority track requests',
      'Monthly exclusive mix',
      'Discord VIP access',
    ],
  },
  {
    name: 'Inner Circle',
    price: '29.99',
    tier: 'inner_circle',
    description: 'The ultimate experience',
    features: [
      'Everything in Royalty',
      'Direct WhatsApp line to Danny',
      'Quarterly video call sessions',
      'Custom AI voice drops',
      'Your name in show credits',
      'Exclusive merch drops',
    ],
  },
];

export function SubscriptionTiers() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {tiers.map((tier) => (
        <Card
          key={tier.tier}
          className={`relative ${
            tier.tier === 'hectic_royalty'
              ? 'border-primary shadow-lg scale-105'
              : ''
          }`}
        >
          {tier.tier === 'hectic_royalty' && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </span>
            </div>
          )}
          <CardHeader>
            <CardTitle>{tier.name}</CardTitle>
            <CardDescription>{tier.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">£{tier.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tier.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={tier.tier === 'hectic_royalty' ? 'default' : 'outline'}
              onClick={() => setSelectedTier(tier.tier)}
            >
              Subscribe Now
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
