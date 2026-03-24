import { useState } from "react";
import { Layout } from "@/components/Layout";
import { IndicationList } from "@/components/IndicationList";
import type { IndicationStatus } from "@/lib/index";
import { MOCK_INDICATIONS } from "@/data/index";
import { useToast } from "@/hooks/use-toast";

export default function AdminIndications() {
  const [indications, setIndications] = useState(MOCK_INDICATIONS);
  const { toast } = useToast();

  const handleStatusChange = (id: string, status: IndicationStatus) => {
    setIndications((prev) =>
      prev.map((ind) =>
        ind.id === id ? { ...ind, status, updatedAt: new Date().toISOString() } : ind
      )
    );
    const ind = indications.find((i) => i.id === id);
    toast({
      title: "Status atualizado!",
      description: `${ind?.clientName} movido para nova etapa.`,
    });
  };

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
