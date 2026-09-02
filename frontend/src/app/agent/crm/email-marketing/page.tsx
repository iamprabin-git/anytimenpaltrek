import MarketingCampaignPanel from "@/components/agent/MarketingCampaignPanel";

export default function AgentEmailMarketingPage() {
  return (
    <MarketingCampaignPanel
      title="Email Marketing"
      description="Send personalized trek deals, loyalty updates, and seasonal promotions directly to customer email addresses."
      defaultChannels={["email"]}
      filterChannel="email"
    />
  );
}
