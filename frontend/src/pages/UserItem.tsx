  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      New Deadline
    </label>
    <input
      type="datetime-local"
      value={newDeadline}
      onChange={(e) => {
        setNewDeadline(e.target.value);
        setNewDescription(""); // Clear description when date changes
      }}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
      min={new Date().toISOString().slice(0, 16)}
      disabled={!!newDescription}
    />
  </div>
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      New Description
    </label>
    <textarea
      value={newDescription}
      onChange={(e) => {
        setNewDescription(e.target.value);
        setNewDeadline(""); // Clear deadline when description changes
      }}
      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
      rows={4}
      disabled={!!newDeadline}
      placeholder={newDeadline ? "Description cannot be changed when updating deadline" : "Enter new description"}
    />
  </div> 