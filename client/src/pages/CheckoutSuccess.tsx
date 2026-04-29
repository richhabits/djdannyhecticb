import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useSearch } from "wouter";

export default function CheckoutSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const purchaseId = params.get("purchaseId");

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Purchase Successful!</h1>
            <p className="text-muted-foreground">Thank you for your purchase</p>
          </div>
        </div>

        {purchaseId && (
          <div className="bg-muted p-4 rounded text-center">
            <p className="text-sm text-muted-foreground">Purchase ID</p>
            <p className="font-mono text-sm">{purchaseId}</p>
          </div>
        )}

        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            You will receive a confirmation email shortly
          </p>
          <Link href="/">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
