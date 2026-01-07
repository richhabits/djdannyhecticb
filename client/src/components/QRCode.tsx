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

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QRCodeProps {
  url: string;
  title?: string;
  size?: number;
  className?: string;
}

export function QRCode({ url, title = "Scan to open", size = 200, className }: QRCodeProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    toast.success("Live link copied to clipboard!");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG value={url} size={size} level="M" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center break-all">{url}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={copyLink}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Live Link
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

