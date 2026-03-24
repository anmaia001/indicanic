import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IndicationList } from "@/components/IndicationList";
import { useIndications, useUpdateIndicationStatus } from "@/hooks/useIndications";
import type { IndicationStatus } from "@/lib/index";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminIndications() {
  const { data: indications = [], isLoading } = useIndications();
  const updateStatus = useUpdateIndicationStatus();
  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: IndicationStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      const ind = indications.find((i) => i.id === id);
      toast({ title: "Status atualizado!", description: `${ind?.clientName} movido para nova etapa.` });
    } catch {
      toast({ title: "Erro ao atualizar", description: "Tente novamente.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Todas as Indicações</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e atualize o status de todas as indicações
          </p>
        </div>
        <IndicationList
          indications={indications}
          showAffiliate
          onStatusChange={handleStatusChange}
        />
      </div>
    </Layout>
  );
}
