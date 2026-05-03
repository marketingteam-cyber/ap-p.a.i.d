import Badge from './Badge';
import ChannelTag from './ChannelTag';
import { formatINR, formatPct } from '../../utils/formatters';

const scoreBorder = {
  winning: 'border-t-winning',
  failing:  'border-t-failing',
  fatigue:  'border-t-fatigue',
  neutral:  'border-t-brand-gray-700',
};

export default function CreativeCard({ creative }) {
  const { score, ad_name, channel, ctr, cpl, frequency, score_reason, impressions, spend } = creative;
  const border = scoreBorder[score] || scoreBorder.neutral;

  return (
    <div className={`bg-brand-gray-900 rounded-card border border-brand-gray-700 border-t-2 ${border} p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-brand-gray-100 line-clamp-2 leading-snug">{ad_name || 'Unnamed Ad'}</p>
        <Badge variant={score}>{score}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <ChannelTag channel={channel} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {cpl != null && (
          <div>
            <div className="text-xs text-brand-gray-500">CPL</div>
            <div className="text-sm font-mono text-brand-gray-100">{formatINR(cpl)}</div>
          </div>
        )}
        {ctr != null && (
          <div>
            <div className="text-xs text-brand-gray-500">CTR</div>
            <div className="text-sm font-mono text-brand-gray-100">{formatPct(ctr)}</div>
          </div>
        )}
        {frequency != null && (
          <div>
            <div className="text-xs text-brand-gray-500">Frequency</div>
            <div className={`text-sm font-mono ${frequency >= 3 ? 'text-fatigue' : 'text-brand-gray-100'}`}>
              {Number(frequency).toFixed(2)}x
            </div>
          </div>
        )}
        {spend != null && (
          <div>
            <div className="text-xs text-brand-gray-500">Spend</div>
            <div className="text-sm font-mono text-brand-gray-100">{formatINR(spend)}</div>
          </div>
        )}
      </div>

      {score_reason && (
        <p className="text-xs text-brand-gray-500 border-t border-brand-gray-700 pt-2 italic">
          {score_reason}
        </p>
      )}
    </div>
  );
}
