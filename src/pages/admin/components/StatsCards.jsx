import { Users, UserCheck, Shield, TrendingUp } from 'lucide-react';

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Administrators</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.adminCount}</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Recent Signups</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.recentSignups}</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-xl">
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;