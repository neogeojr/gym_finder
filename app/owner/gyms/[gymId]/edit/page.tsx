import { Suspense } from "react";
import EditGym from "./EditGym";

type Params = Promise<{ gymId: string }>;

async function EditGymWithId({ params }: { params: Params }) {
  const { gymId } = await params;
  return <EditGym gymId={gymId} />;
}

export default function EditGymPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <EditGymWithId params={params} />
    </Suspense>
  );
}
