/**
 * COPYRIGHT NOTICE
 * Copyright (c) 2024 DJ Danny Hectic B / Hectic Radio
 * All rights reserved. Unauthorized copying, distribution, or use prohibited.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Twitter, Facebook, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
    title: string;
    url: string;
    trigger?: React.ReactNode;
}

export function ShareModal({ title, url, trigger }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success("Link copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    const shareLinks = [
        {
            name: "Twitter",
            icon: Twitter,
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            color: "hover:text-blue-400",
        },
        {
            name: "Facebook",
            icon: Facebook,
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            color: "hover:text-blue-600",
        },
        {
            name: "Email",
            icon: Mail,
            href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
            color: "hover:text-red-500",
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || <Button variant="outline" size="sm">Share</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
                <DialogHeader>
                    <DialogTitle>Share this</DialogTitle>
                </DialogHeader>
                <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{url}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center gap-6 py-4">
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-muted-foreground transition-colors ${link.color}`}
                        >
                            <link.icon className="h-8 w-8" />
                            <span className="sr-only">{link.name}</span>
                        </a>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
