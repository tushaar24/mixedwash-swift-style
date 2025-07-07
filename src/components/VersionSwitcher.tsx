
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useHomepageVersion } from "@/hooks/useHomepageVersion";

export const VersionSwitcher = () => {
  const { version, toggleVersion } = useHomepageVersion();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleVersion}
      className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
    >
      {version === 'v1' ? (
        <>
          <Zap className="h-4 w-4 text-purple-600" />
          <span className="text-sm">Gen Z Mode</span>
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm">Classic</span>
        </>
      )}
    </Button>
  );
};
