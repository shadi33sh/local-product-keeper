import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import ProductTestView from "../components/ProductTestView";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Product Storage Test" },
      { name: "description", content: "Local SQLite product list and add-product test screen." },
      { property: "og:title", content: "Product Storage Test" },
      {
        property: "og:description",
        content: "Local SQLite product list and add-product test screen.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={null}>
      <ProductTestView />
    </ClientOnly>
  );
}
