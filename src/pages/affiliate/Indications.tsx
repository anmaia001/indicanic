import { Layout } from "@/components/Layout";
import { IndicationList } from "@/components/IndicationList";
import { useAuth } from "@/hooks/useAuth";
import { MOCK_INDICATIONS } from "@/data/index";

export default function AffiliateIndications() {
  const { user } = useAuth();
  const myIndications = MOCK_INDICATIONS.filter((i) => i.affiliateId === user?.id);

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
          indications={myIndications}
          onAdd={() => {}}
          commissionRate={user?.commissionRate}
          affiliateId={user?.id}
        />
      </div>
    </Layout>
  );
}
