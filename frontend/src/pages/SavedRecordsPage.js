import React, { useState } from "react";

const SavedRecordsPage = () => {
  const dummyRecords = [
    {
      id: 1,
      name: "John Doe",
      visitDate: "2024-04-20",
      complaint: "Headache and fatigue",
      assessment: "Mild dehydration, stressed",
      diagnosis: "Tension headache",
      management: "Rest, hydrate, paracetamol",
      followUp: "Return if symptoms persist",
    },
    {
      id: 2,
      name: "Jane Smith",
      visitDate: "2024-04-15",
      complaint: "Cough for 2 weeks",
      assessment: "Persistent dry cough",
      diagnosis: "Possible bronchitis",
      management: "Prescribed antibiotics",
      followUp: "Check-up in 7 days",
    },
    {
      id: 3,
      name: "Bob Johnson",
      visitDate: "2024-04-10",
      complaint: "Back pain after sports",
      assessment: "Muscle strain",
      diagnosis: "Lower back strain",
      management: "Physiotherapy, ibuprofen",
      followUp: "Return in 2 weeks",
    },
    {
      id: 4,
      name: "Alice Williams",
      visitDate: "2024-04-01",
      complaint: "Stomach pain",
      assessment: "Tenderness in abdomen",
      diagnosis: "Gastritis",
      management: "Antacids, diet advice",
      followUp: "Review in 1 week",
    },
  ];

  const [records] = useState(dummyRecords);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredRecords = records.filter(
    (rec) =>
      rec.name.toLowerCase().includes(search.toLowerCase()) ||
      rec.id.toString().includes(search)
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Saved Records
      </h1>

      {/* Search bar */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Patient Name, Student Number, or Patient ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg shadow-lg border border-gray-200">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
              <th className="px-6 py-3 text-left font-semibold">Patient Name</th>
              <th className="px-6 py-3 text-left font-semibold">Visit Date</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">{record.name}</td>
                  <td className="px-6 py-4">{record.visitDate}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for record details */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Record for {selectedRecord.name}
            </h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Date:</strong> {selectedRecord.visitDate}
              </p>
              <p>
                <strong>Main Complaint:</strong> {selectedRecord.complaint}
              </p>
              <p>
                <strong>Assessment:</strong> {selectedRecord.assessment}
              </p>
              <p>
                <strong>Diagnosis:</strong> {selectedRecord.diagnosis}
              </p>
              <p>
                <strong>Management:</strong> {selectedRecord.management}
              </p>
              <p>
                <strong>Follow-Up:</strong> {selectedRecord.followUp}
              </p>
            </div>
            <button
              onClick={() => setSelectedRecord(null)}
              className="mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedRecordsPage;
