export default function PlaygroundModal() {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg shadow-lg w-3/4 h-3/4">
        <h3>Playground Modal</h3>
        {/* Code editor and execution result area */}
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
      </div>
    </div>
  );
}
