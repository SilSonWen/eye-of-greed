import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (key: string) => void;
  initialKey?: string;
}

export function ApiKeyDialog({ open, onOpenChange, onSave, initialKey = "" }: Props) {
  const [value, setValue] = useState(initialKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold bg-card ornate-frame">
        <DialogHeader>
          <DialogTitle className="display text-2xl text-gold-gradient">The Sacred Key</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Greed's Eye sees only what you allow it to see. Provide your Brave Search API key — it is stored
            in your browser, never on our altar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="brave-key" className="text-foreground/80">Brave Search API Key</Label>
          <Input
            id="brave-key"
            type="password"
            placeholder="BSA..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="bg-input border-gold font-mono"
            autoFocus
          />
          <p className="text-xs text-muted-foreground">
            Get a free key from{" "}
            <a
              href="https://api-dashboard.search.brave.com/"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              api-dashboard.search.brave.com
            </a>
            .
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave(value.trim());
              onOpenChange(false);
            }}
            disabled={!value.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
          >
            Seal the Pact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
