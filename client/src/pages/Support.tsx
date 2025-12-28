import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MetaTagsComponent } from "@/components/MetaTags";

export default function Support() {
    const { user } = useAuth();
    const [amount, setAmount] = useState<string>("");
    const [message, setMessage] = useState("");
    const [name, setName] = useState(user?.name || "");

    // Mutation
    const createSupport = trpc.revenue.support.create.useMutation({
        onSuccess: (data) => {
            toast.success(`TRANSACTION COMPLETE: £${data.amount}`);
            setMessage("");
            if (!user) setName("");
        },
        onError: (err) => {
            toast.error(`ERROR: ${err.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("INVALID AMOUNT");
            return;
        }
        if (!name) {
            toast.error("IDENTITY REQUIRED");
            return;
        }

        createSupport.mutate({
            fanName: name,
            amount: amount,
            currency: "GBP",
            message: message,
            email: user?.email || undefined
        });
    };

    const PRESETS = ["3.00", "5.00", "10.00", "20.00", "50.00"];

    return (
        <>
            <MetaTagsComponent
                title="SUPPORT | KEEP IT LOCKED"
                description="Support the Hectic Radio movement. Buy a coffee, become a legend."
                url="/support"
            />
            <div className="min-h-screen bg-background text-foreground font-mono pt-14">
                <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-3.5rem)]">

                    {/* LEFT: Info / Context */}
                    <div className="p-6 md:p-12 border-b lg:border-b-0 lg:border-r border-foreground flex flex-col justify-between bg-background">
                        <div>
                            <h1 className="text-6xl md:text-8xl font-black uppercase leading-[0.8] tracking-tighter mb-8">
                                Support<br />Protocol
                            </h1>
                            <div className="space-y-6 max-w-md">
                                <p className="text-lg uppercase font-bold border-l-4 border-accent pl-4">
                                    Direct-to-Source funding model.
                                </p>
                                <p className="text-sm opacity-70">
                                    Hectic Radio operates on independent infrastructure. Contributions maintain server uptime, bandwidth allocation, and audio fidelity.
                                </p>
                                <ul className="text-sm space-y-2 list-disc pl-4 font-mono mt-8">
                                    <li>SERVER_HOSTING_FEES</li>
                                    <li>MUSIC_ACQUISITION</li>
                                    <li>HARDWARE_MAINTENANCE</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-12 bg-muted/20 p-6 border border-foreground">
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Top Contributor</h3>
                            <div className="flex justify-between items-end">
                                <span className="text-2xl font-black uppercase">UNKNOWN_USER</span>
                                <span className="text-xl font-bold font-mono">£0.00</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Input Terminal */}
                    <div className="p-6 md:p-12 bg-muted/10 flex flex-col justify-center">
                        <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full space-y-8">

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest block">Select Input Amount (GBP)</label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                    {PRESETS.map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            onClick={() => setAmount(val)}
                                            className={cn(
                                                "py-4 border border-foreground font-bold hover:bg-foreground hover:text-background transition-colors duration-0",
                                                amount === val ? "bg-foreground text-background" : "bg-background text-foreground"
                                            )}
                                        >
                                            £{val}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2 border-b-2 border-foreground pb-2 mt-4">
                                    <span className="text-xl font-black">£</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="CUSTOM_AMOUNT"
                                        className="bg-transparent border-none text-2xl font-bold w-full focus:ring-0 placeholder:text-muted-foreground/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest block mb-2">Identity String</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="ENTER_NAME"
                                        className="rounded-none border-foreground bg-background h-12 font-bold uppercase"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest block mb-2">Message Packet (Optional)</label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="TRANSMIT MESSAGE..."
                                        rows={3}
                                        className="w-full bg-background border border-foreground p-4 rounded-none font-mono uppercase text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={createSupport.isPending}
                                className="w-full h-16 rounded-none bg-accent text-foreground hover:bg-foreground hover:text-background border border-foreground text-xl font-black uppercase tracking-widest transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {createSupport.isPending ? "INITIATING..." : "EXECUTE TRANSFER"}
                            </Button>

                        </form>
                    </div>

                </div>
            </div>
        </>
    );
}
