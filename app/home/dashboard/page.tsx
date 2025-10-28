import { getAllPlaygroundForUser } from "@/modules/dashboard/actions";
import AddNewButton from "@/modules/dashboard/components/add-new";
import AddRepo from "@/modules/dashboard/components/add-repo";
import EmptyState from "@/modules/dashboard/components/empty-state";
import ProjectTable from "@/modules/dashboard/components/project-table";
import { Project } from "@/modules/dashboard/types";

export const dynamic = "force-dynamic"; // ensures SSR works even with DB fetch

export default async function Page() {
  // Fetch all playgrounds for the user
  const data = await getAllPlaygroundForUser();

  // Ensure we always have a valid array and non-null description
  const playgrounds: Project[] = (data ?? []).map((p: any) => ({
    ...p,
    description: p.description ?? "", // convert null → empty string
  }));

  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      {/* Top section buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>

      {/* Main content section */}
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds.length === 0 ? (
          <EmptyState />
        ) : (
          <ProjectTable
            projects={playgrounds}
            onDuplicateProject={async (projectId: string) => {
              console.log("Duplicate project:", projectId);
              // optionally perform async operations here, like API calls
            }}
          />

        )}
      </div>
    </div>
  );
}
