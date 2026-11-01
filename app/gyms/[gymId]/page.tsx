import { Suspense } from "react";
import GymDetails from "./GymDetails";

type Params = Promise<{ gymId: string }>;

async function GymWithId({ params }: { params: Params }) {
  const { gymId } = await params;
  return <GymDetails gymId={gymId} />;
}

export default function GymPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <GymWithId params={params} />
    </Suspense>
  );
}
