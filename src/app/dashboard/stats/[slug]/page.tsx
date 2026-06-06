import connectToDatabase from "@/lib/db";
import Link from "@/models/Link";
import Click from "@/models/Click";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Monitor, Smartphone, ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";

export default async function StatsPage({ params }: { params: Promise<{ slug: string }> }) {
  await connectToDatabase();
  const slug = (await params).slug;

  const link = await Link.findOne({ slug });

  if (!link) {
    notFound();
  }

  // Aggregate stats
  const [countryStats, browserStats, deviceStats, uniqueClicks] = await Promise.all([
    Click.aggregate([
      { $match: { slug } },
      { $group: { _id: "$country", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Click.aggregate([
      { $match: { slug } },
      { $group: { _id: "$browser", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Click.aggregate([
      { $match: { slug } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Click.distinct("ipHash", { slug }).then(hashes => hashes.length)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <NextLink href="/dashboard" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </NextLink>
        <div>
          <h1 className="text-2xl font-bold">Stats for {slug}</h1>
          <a href={link.targetUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary truncate max-w-lg block">
            {link.targetUrl}
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart2Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{link.clicks.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Clicks</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueClicks.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {countryStats.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
              {countryStats.map((stat: any) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat._id}</span>
                  <span className="text-sm font-medium">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-5 w-5 text-green-500" /> Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {browserStats.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
              {browserStats.map((stat: any) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat._id}</span>
                  <span className="text-sm font-medium">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-500" /> Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats.length === 0 && <p className="text-muted-foreground text-sm">No data yet</p>}
              {deviceStats.map((stat: any) => (
                <div key={stat._id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{stat._id}</span>
                  <span className="text-sm font-medium">{stat.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarChart2Icon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
