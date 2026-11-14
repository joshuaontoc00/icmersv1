import { createFileRoute } from "@tanstack/react-router";
import { IcmersApp } from "@/components/icmers/IcmersApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICMERS — Campus Medical Emergency Reporting" },
      {
        name: "description",
        content:
          "Integrated Campus Medical Emergency Reporting System: report an emergency and alert the campus clinic instantly.",
      },
      { property: "og:title", content: "ICMERS — Campus Medical Emergency Reporting" },
      {
        property: "og:description",
        content: "Report campus medical emergencies and get live responses from the clinic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IcmersApp,
});
