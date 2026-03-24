import { Layout } from "@/components/Layout";
import { IndicationList } from "@/components/IndicationList";
import { useAuth } from "@/hooks/useAuth";
import { useIndications, useCreateIndication } from "@/hooks/useIndications";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Indication } from "@/lib/index";

export default function AffiliateIndications() {
  const { user } = useAuth();
  const { data: indications = [], isLoading } = useIndications();
  const createIndication = useCreateIndication();
  const { toast } = useToast();

  const handleAdd = async (data: Partial<Indication>) => {
    if (!data.clientName || !data.clientPhone || !data.serviceType) return;
    try {
      await createIndication.mutateAsync({
        clientName: data.clientName,
        clientPhone: data.clientPhone,
        clientEmail: data.clientEmail,
        clientAddress: data.clientAddress,
        serviceType: data.serviceType,
        notes: data.notes,
        contractValue: data.contractValue,
      });
      toast({ title: "Indicação cadastrada!", description: `${data.clientName} adicionado com sucesso.` });
    } catch {
      toast({ title: "Erro ao cadastrar", description: "Tente novamente.", variant: "destructive" });
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
          <h1 className="text-xl font-bold text-foreground">Minhas Indicações</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o status de cada indicação no pipeline
          </p>
        </div>
        <IndicationList
          indications={indications}
          onAdd={handleAdd}
          commissionRate={user?.commissionRate}
          affiliateId={user?.id}
        />
      </div>
    </Layout>
  );
}
