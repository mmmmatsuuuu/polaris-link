interface SubjectCardProps {
  name: string;
  description: string;
}

export default function SubjectCard({ name, description }: SubjectCardProps) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
