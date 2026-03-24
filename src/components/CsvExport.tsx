import { useState } from "react";
import { Download, Copy, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CsvExportResult {
  filename: string;
  csvContent: string;
}

// Hook para exportar CSV com fallback completo
export function useCsvExport() {
  const { toast } = useToast();

  const exportCSV = (rows: string[][], filename: string): CsvExportResult => {
    const csv =
      "\uFEFF" +
      rows
        .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
        .join("\r\n");

    // Tenta download via link no DOM
    try {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.cssText = "position:fixed;top:-100px;left:-100px;opacity:0;";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 300);
    } catch {
      // silencia — fallback via modal
    }

    return { filename, csvContent: csv };
  };

  return { exportCSV };
}

// Modal de fallback com link direto e botão de copiar
interface CsvFallbackModalProps {
  open: boolean;
  onClose: () => void;
  filename: string;
  csvContent: string;
}

export function CsvFallbackModal({ open, onClose, filename, csvContent }: CsvFallbackModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Gera link de download como data URI (funciona dentro de iframes)
  const dataUri =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copiado!", description: "Cole em um editor de texto e salve como .csv" });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  const lineCount = csvContent.split("\n").length - 1; // -1 para o cabeçalho

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md dark">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Download size={16} className="text-primary" />
            Exportar CSV — {filename}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {lineCount} registro{lineCount !== 1 ? "s" : ""} prontos para exportar.
            Escolha uma das opções abaixo:
          </p>

          {/* Opção 1: link direto */}
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">📥 Opção 1 — Download direto</p>
            <p className="text-xs text-muted-foreground">
              Clique com o botão direito no link abaixo e escolha{" "}
              <strong>"Salvar link como..."</strong>
            </p>
            <a
              href={dataUri}
              download={filename}
              className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2 hover:text-primary/80 break-all"
            >
              <Download size={12} />
              {filename}
            </a>
          </div>

          {/* Opção 2: copiar conteúdo */}
          <div className="rounded-lg border border-border p-3 space-y-1.5">
            <p className="text-xs font-medium text-foreground">📋 Opção 2 — Copiar conteúdo</p>
            <p className="text-xs text-muted-foreground">
              Copie o conteúdo e cole no Bloco de Notas ou Excel, depois salve como <strong>.csv</strong>
            </p>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs w-full"
              onClick={handleCopy}
            >
              {copied ? (
                <><Check size={13} className="mr-1.5 text-emerald-400" /> Copiado!</>
              ) : (
                <><Copy size={13} className="mr-1.5" /> Copiar CSV</>
              )}
            </Button>
          </div>

          {/* Preview das primeiras linhas */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Prévia do arquivo:</p>
            <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all max-h-28 overflow-y-auto">
              {csvContent
                .split("\r\n")
                .slice(0, 4)
                .join("\n")}
              {csvContent.split("\r\n").length > 4 ? "\n..." : ""}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
