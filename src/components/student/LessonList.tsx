interface LessonListProps {
  name: string;
  description: string;
}

export default function LessonList({ name, description }: LessonListProps) {
  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
