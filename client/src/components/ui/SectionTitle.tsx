interface SectionTitleProps {
  title: string;
  subtitle: string;
}

export const SectionTitle = ({ title, subtitle }: SectionTitleProps) => {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-4xl font-bold text-transparent font-orbitron bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text animate-gradient">
        {title}
      </h2>
      <p className="max-w-2xl mx-auto text-gray-400">{subtitle}</p>
    </div>
  );
};
