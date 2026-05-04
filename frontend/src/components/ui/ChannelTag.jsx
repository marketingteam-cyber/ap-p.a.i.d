import { channelLabel } from '../../utils/formatters';

const channelStyles = {
  google_ads:   'bg-[#4285F4]/20 text-[#4285F4] border-[#4285F4]/30',
  facebook_ads: 'bg-brand-blue/20 text-brand-blue-light border-brand-blue/30',
  linkedin_ads: 'bg-[#0A66C2]/20 text-[#5BA4E5] border-[#0A66C2]/30',
};

export default function ChannelTag({ channel }) {
  const style = channelStyles[channel] || 'bg-brand-gray-700 text-brand-gray-300 border-brand-gray-500/30';
  return (
    <span className={`inline-flex items-center text-xs font-mono font-medium px-2 py-0.5 rounded-tag border ${style}`}>
      {channelLabel(channel)}
    </span>
  );
}
