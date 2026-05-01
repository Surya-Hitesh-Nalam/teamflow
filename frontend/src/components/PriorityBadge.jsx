export default function PriorityBadge({ priority }) {
  const colors = {
    LOW: 'bg-gray-100 text-gray-600',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    URGENT: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[priority] || colors.MEDIUM}`}>
      {priority}
    </span>
  );
}
