interface PlaygroundModalProps {
  onClose: () => void;
}

export default function PlaygroundModal({ onClose }: PlaygroundModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Playground</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-2 rounded-lg flex flex-col">
            <h4 className="text-lg font-medium mb-2">Code Editor</h4>
            <textarea
              className="flex-grow w-full p-2 border rounded-md font-mono text-sm"
              placeholder="Write your code here..."
              rows={10}
            ></textarea>
          </div>
          <div className="border p-2 rounded-lg flex flex-col">
            <h4 className="text-lg font-medium mb-2">Execution Result</h4>
            <pre className="flex-grow w-full p-2 border rounded-md bg-gray-50 font-mono text-sm overflow-auto">{/* Result will appear here */}</pre>
          </div>
        </div>
        <button
          onClick={() => alert('Execute Code (functionality not implemented)')}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 self-end"
        >
          Run Code
        </button>
      </div>
    </div>
  );
}
