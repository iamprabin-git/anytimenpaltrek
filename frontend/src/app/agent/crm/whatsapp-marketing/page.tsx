import MarketingCampaignPanel from "@/components/agent/MarketingCampaignPanel";

export default function AgentWhatsappMarketingPage() {
  return (
    <MarketingCampaignPanel
      title="WhatsApp Marketing"
      description="Prepare personalized WhatsApp messages for customers with saved WhatsApp or phone numbers, then open each chat with one click."
      defaultChannels={["whatsapp"]}
      filterChannel="whatsapp"
      showWhatsAppRecipients
    />
  );
}
