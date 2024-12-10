export default function CompanyAdminDashboard({
    params,
  }: {
    params: { companyName: string };
  }) {
    return (
      <div className="ml-[65px] p-8">
        <h1>{decodeURIComponent(params.companyName)} Dashboard</h1>
      </div>
    );
  }