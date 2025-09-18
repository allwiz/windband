import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Shield,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  Plus
} from 'lucide-react'

const MemberManagement = () => {
  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedMember, setSelectedMember] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, statusFilter, roleFilter])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          role,
          status,
          joined_date,
          last_login,
          created_at
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => member.role === roleFilter)
    }

    setFilteredMembers(filtered)
  }

  const updateMemberStatus = async (memberId, newStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', memberId)

      if (error) throw error

      // Log admin activity
      await supabase.from('admin_activity_log').insert({
        action: `Updated member status to ${newStatus}`,
        target_type: 'member',
        target_id: memberId
      })

      // Refresh members list
      fetchMembers()
    } catch (error) {
      console.error('Error updating member status:', error)
    }
  }

  const updateMemberRole = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      // Log admin activity
      await supabase.from('admin_activity_log').insert({
        action: `Updated member role to ${newRole}`,
        target_type: 'member',
        target_id: memberId
      })

      // Refresh members list
      fetchMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin':
        return <Shield className="h-4 w-4 text-accent-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || badges.pending}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold text-gray-900">
            Member Management
          </h2>
          <p className="text-gray-600">
            Manage band members, roles, and permissions
          </p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="all">All Roles</option>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Member</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Joined</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="bg-accent-100 w-10 h-10 rounded-full flex items-center justify-center">
                        <span className="text-accent-600 font-semibold text-sm">
                          {member.full_name?.charAt(0) || member.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.full_name || 'No name provided'}
                        </p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <span>{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {member.role?.replace('_', ' ') || 'Member'}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {getStatusBadge(member.status)}
                  </td>

                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      {member.joined_date ? (
                        new Date(member.joined_date).toLocaleDateString()
                      ) : (
                        new Date(member.created_at).toLocaleDateString()
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* Quick Status Toggle */}
                      {member.status === 'active' ? (
                        <button
                          onClick={() => updateMemberStatus(member.id, 'inactive')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Deactivate member"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateMemberStatus(member.id, 'active')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate member"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setSelectedMember(member)
                          setShowEditModal(true)
                        }}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* More Actions */}
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No members have been added yet'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{members.length}</div>
          <div className="text-sm text-gray-600">Total Members</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {members.filter(m => m.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">
            {members.filter(m => m.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <div className="text-2xl font-bold text-accent-600">
            {members.filter(m => m.role === 'admin' || m.role === 'super_admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
      </div>
    </div>
  )
}

export default MemberManagement