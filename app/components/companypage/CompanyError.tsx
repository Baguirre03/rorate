import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CompanyError() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-6 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
        <Card>
          <CardContent className="py-12 sm:py-16 text-center px-4">
            <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Error</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Failed to load company data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
