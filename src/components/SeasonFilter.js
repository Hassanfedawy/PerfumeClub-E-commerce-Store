'use client';

export default function SeasonFilter({ selectedSeason, onSeasonChange }) {
  return (
    <div className="flex items-center space-x-4">
      <label className="font-medium text-gray-700">Season:</label>
      <select
        value={selectedSeason}
        onChange={(e) => onSeasonChange(e.target.value)}
        className="border rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Seasons</option>
        <option value="summer">Summer</option>
        <option value="winter">Winter</option>
      </select>
    </div>
  );
}
