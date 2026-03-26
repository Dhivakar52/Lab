type TopCardProps = {
  rank: string;
  name: string;
  org: string;
};

const TopCard = ({ rank, name, org }: TopCardProps) => (
  <div className="rounded-xl p-5 text-white bg-gradient-to-r btn-theme flex items-center gap-4">
    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
      <div className="w-10 h-10 rounded-full themeColor text-white flex items-center justify-center font-bold">
        {name?.charAt(0)}
      </div>
    </div>

    <div>
      <div className="text-sm opacity-80">{rank}</div>
      <div className="font-semibold">{name}</div>
      <div className="text-xs opacity-80">{org}</div>
    </div>
  </div>
);

export default TopCard;