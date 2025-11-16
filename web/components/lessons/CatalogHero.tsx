import { Card, Container, Flex, Grid, Heading, Text } from "@radix-ui/themes";

type CatalogHeroProps = {
  stats: Array<{ label: string; value: number }>;
  statusMessage?: string | null;
};

export function CatalogHero({ stats, statusMessage }: CatalogHeroProps) {
  return (
    <section className="bg-slate-900 text-white">
      <Container size="3" className="py-16 lg:py-24">
        <Text size="2" className="tracking-[0.3em]" color="gray" weight="medium">
          Polaris Link Catalog
        </Text>
        <Heading size="9" className="mt-4">
          授業一覧
        </Heading>
        <Text as="p" size="4" className="mt-4 max-w-3xl">
          ダミーカタログの科目・単元・授業データをFirestoreから取得し、公開授業の構成を一覧できます。授業カードを参考にしながら、エミュレータのデータ同期やUI確認を行ってください。
        </Text>
        {statusMessage && (
          <Text
            as="p"
            size="2"
            className="mt-4"
            color={statusMessage.includes("失敗") ? "ruby" : "gray"}
          >
            {statusMessage}
          </Text>
        )}

        <Grid
          columns={{ initial: "1", sm: "3" }}
          gap="8"
          className="mt-10 text-center"
        >
          {stats.map((stat) => (
            <Card
              key={stat.label}
              variant="ghost"
              className="border border-white/15 bg-white/5 text-white backdrop-blur"
            >
              <Flex direction="column" align="center" py="4">
                <Heading size="6">
                  {stat.value.toString().padStart(2, "0")}
                </Heading>
                <Text size="2">
                  {stat.label}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  );
}
