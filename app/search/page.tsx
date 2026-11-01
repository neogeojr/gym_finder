import { Suspense } from "react";
import SearchClient from "./SearchClient";

type SearchParams = Promise<{ q?: string | string[] }>;

async function SearchWithQuery({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  return <SearchClient initialQ={typeof q === "string" ? q : ""} />;
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <SearchWithQuery searchParams={searchParams} />
    </Suspense>
  );
}
