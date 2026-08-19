import { JobDetail } from "../../ui";
export default async function Page({ params }: { params: Promise<{ jobId: string }> }) { return <JobDetail id={(await params).jobId} />; }
