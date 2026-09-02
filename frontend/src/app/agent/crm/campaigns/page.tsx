import MarketingCampaignPanel from "@/components/agent/MarketingCampaignPanel";

export default function AgentCrmCampaignsPage() {
  return (
    <MarketingCampaignPanel
      title="Marketing Campaigns"
      description="Create multi-channel campaigns with in-app notifications, email marketing, and WhatsApp marketing for targeted customer segments."
      defaultChannels={["in_app"]}
      showChannelPicker
    />
  );
}
