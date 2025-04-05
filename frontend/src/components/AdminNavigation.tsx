import Link from 'next/link';
import { Users } from 'lucide-react';

const AdminNavigation = () => {
  return (
    <div className="flex items-center space-x-4">
      <Link to="/admin/users" className="flex items-center space-x-2 text-slate-600 hover:text-slate-900">
        <Users className="w-4 h-4" />
        <span>Users</span>
      </Link>
    </div>
  );
};

export default AdminNavigation; 