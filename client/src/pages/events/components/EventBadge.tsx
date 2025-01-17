// interface EventBadgeProps {
//   status: string;
//   className?: string;
// }

// export const EventBadge = ({ status, className = "" }: EventBadgeProps) => {
//   console.log(status);
//   const styles = {
//     REGISTRATION_OPEN: "bg-green-500/20 text-green-400 border-green-500",
//     COMING_SOON: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
//     REGISTRATION_CLOSED: "bg-red-500/20 text-red-400 border-red-500",
//     LIVE: "bg-purple-500/20 text-purple-400 border-purple-500",
//   };

//   const labels = {
//     REGISTRATION_OPEN: "Registration Open",
//     COMING_SOON: "Coming Soon",
//     REGISTRATION_CLOSED: "Registration Closed",
//     LIVE: "Live Now",
//   };

//   return (
//     <span
//       className={`
//       px-3 py-1 rounded-full text-sm font-medium
//       border backdrop-blur-sm
//       ${styles[status]}
//       ${className}
//     `}
//     >
//       {labels[status]}
//     </span>
//   );
// };

interface EventBadgeProps {
  status: string;
  className?: string;
}

export const EventBadge = ({ status, className = "" }: EventBadgeProps) => {
  // console.log("Original Status:", status);

  // Normalize the status string
  const normalizedStatus = status
    .toUpperCase()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/-/g, "_"); // Replace hyphens with underscores

  // console.log("Normalized Status:", normalizedStatus);

  // Define styles for each valid status
  const styles: Record<string, string> = {
    REGISTRATION_OPEN: "bg-green-500/20 text-green-400 border-green-500",
    COMING_SOON: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
    REGISTRATION_CLOSED: "bg-red-500/20 text-red-400 border-red-500",
    LIVE: "bg-purple-500/20 text-purple-400 border-purple-500",
  };

  // Define labels for each valid status
  const labels: Record<string, string> = {
    REGISTRATION_OPEN: "Registration Open",
    COMING_SOON: "Coming Soon",
    REGISTRATION_CLOSED: "Registration Closed",
    LIVE: "Live Now",
  };

  // Handle unknown statuses
  const defaultStyle = "bg-gray-500/20 text-gray-400 border-gray-500";
  const defaultLabel = "Unknown Status";

  const badgeStyle = styles[normalizedStatus] || defaultStyle;
  const badgeLabel = labels[normalizedStatus] || defaultLabel;

  return (
    <span
      className={`
      px-3 py-1 rounded-full text-sm font-medium
      border backdrop-blur-sm
      ${badgeStyle}
      ${className}
    `}
    >
      {badgeLabel}
    </span>
  );
};
