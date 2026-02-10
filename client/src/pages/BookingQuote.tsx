/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, MapPin, Calendar, CreditCard, ShieldCheck, Download, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { motion } from "framer-motion";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");

export default function BookingQuote() {
    const { id } = useParams();
    const bookingId = parseInt(id || "0");
    const { data: booking, isLoading } = trpc.bookings.getQuote.useQuery({ id: bookingId });

    if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest animate-pulse">Retrieving Secured Quote...</div>;
    if (!booking) return <div className="min-h-screen flex items-center justify-center">Quote not found.</div>;

    const breakdown = JSON.parse(booking.pricingBreakdown || "[]");

    return (
        <div className="min-h-screen bg-black pt-20 pb-20">
            <div className="container max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Invoice Main Body */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white text-black rounded-[40px] overflow-hidden shadow-2xl relative"
                    >
                        {/* Branded Header */}
                        <div className="bg-zinc-950 p-12 text-white flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">HECTIC <span className="text-orange-500">OPS</span></h1>
                                <p className="text-xs font-bold tracking-[0.4em] text-gray-500 mt-2 uppercase">Official Booking Quote</p>
                            </div>
                            <div className="text-right">
                                <Badge variant="outline" className="border-orange-500/50 text-orange-500 font-bold px-4 py-1">
                                    #{bookingId.toString().padStart(6, '0')}
                                </Badge>
                                <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">
                                    ISSUED: {format(new Date(booking.createdAt), "PPP")}
                                </p>
                            </div>
                        </div>

                        <div className="p-12 space-y-12">
                            {/* Client & Event Context */}
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Client Information</h3>
                                    <div>
                                        <p className="text-xl font-bold">{booking.organisation || "Private Client"}</p>
                                        <p className="text-zinc-500 font-medium">{booking.name}</p>
                                        <p className="text-zinc-400 text-sm mt-1">{booking.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Event Details</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <Calendar className="w-4 h-4 text-orange-500" />
                                            {format(parseISO(booking.eventDate), "EEEE, MMMM do yyyy")} @ {booking.eventTime}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            {booking.location}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Line Items */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Performance Breakdown</h3>
                                <div className="space-y-4">
                                    {breakdown.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center py-2">
                                            <div className="font-bold text-lg">{item.label}</div>
                                            <div className="font-mono text-xl">£{parseFloat(item.amount).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Footer */}
                            <div className="bg-zinc-50 -mx-12 px-12 py-8 flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Total Performance Value</p>
                                    <p className="text-sm font-bold text-zinc-600">Locked and guaranteed upon deposit</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                        £{parseFloat(booking.totalAmount || "0").toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Action Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-zinc-900 border-orange-500/20 shadow-2xl overflow-hidden relative">
                        {booking.depositPaid ? (
                            <div className="p-8 space-y-6 text-center">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Deposit Secured</h3>
                                    <p className="text-gray-400 text-sm mt-1">Your date is locked in Danny's master schedule.</p>
                                </div>
                                <Separator className="bg-white/5" />
                                <div className="space-y-4">
                                    <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold rounded-full">
                                        <Download className="w-4 h-4 mr-2" /> Download Receipt
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-white">Deposit Action</h3>
                                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 animate-pulse">Required</Badge>
                                </div>

                                <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">Minimum Deposit</p>
                                    <p className="text-4xl font-black italic tracking-tighter text-orange-500">
                                        £{parseFloat(booking.depositAmount || "0").toFixed(2)}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 uppercase font-black tracking-widest">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        Expires: {format(new Date(booking.depositExpiresAt), "MMM do, HH:mm")}
                                    </div>

                                    <DepositPaymentWrapper bookingId={bookingId} />

                                    <p className="text-[10px] text-gray-500 leading-relaxed text-center italic">
                                        By paying the deposit, you agree to the Hectic Empire performance terms and guarantee Danny's availability for the specified date.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Trust Box */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[30px] p-6 space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <span className="text-xs font-black uppercase tracking-widest">Secured Transaction</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase leading-relaxed font-bold tracking-widest">
                            All payments are processed through encrypted Stripe rails. Danny never sees your financial data.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

function DepositPaymentWrapper({ bookingId }: { bookingId: number }) {
    const [showPayment, setShowPayment] = useState(false);
    const depositIntent = trpc.bookings.createDepositIntent.useMutation();

    const handleStartPayment = async () => {
        try {
            await depositIntent.mutateAsync({ bookingId });
            setShowPayment(true);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (!showPayment) {
        return (
            <Button
                onClick={handleStartPayment}
                disabled={depositIntent.isPending}
                className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest italic rounded-2xl shadow-lg shadow-orange-900/30"
            >
                {depositIntent.isPending ? "Generating Secure Link..." : "Lock My Date Now"}
            </Button>
        );
    }

    return (
        <div className="space-y-6 pt-4">
            <Elements stripe={stripePromise} options={{ clientSecret: depositIntent.data?.clientSecret }}>
                <DepositPaymentForm bookingId={bookingId} />
            </Elements>
        </div>
    );
}

function DepositPaymentForm({ bookingId }: { bookingId: number }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/booking/success?bookingId=${bookingId}`,
            },
        });

        if (error) {
            toast.error(error.message || "Payment failed");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-white rounded-2xl">
                <PaymentElement />
            </div>
            <Button
                type="submit"
                disabled={isProcessing}
                className="w-full h-12 bg-green-600 hover:bg-green-700 font-bold rounded-xl shadow-lg shadow-green-900/20"
            >
                {isProcessing ? "Authorizing..." : "Authorize Deposit"}
            </Button>
        </form>
    );
}
