import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  FileText,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Globe,
  Type,
  Image as ImageIcon,
  Code
} from 'lucide-react'

const ContentManagement = () => {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingContent, setEditingContent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newContent, setNewContent] = useState({
    page: '',
    section: '',
    content_type: 'text',
    title: '',
    content: ''
  })

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('page', { ascending: true })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateContent = async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .update({
          ...updatedData,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)

      if (error) throw error

      // Log admin activity
      await supabase.from('admin_activity_log').insert({
        action: 'Updated site content',
        target_type: 'content',
        target_id: id,
        details: { page: updatedData.page, section: updatedData.section }
      })

      fetchContent()
      setEditingContent(null)
    } catch (error) {
      console.error('Error updating content:', error)
    }
  }

  const createContent = async () => {
    try {
      const { error } = await supabase
        .from('site_content')
        .insert({
          ...newContent,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })

      if (error) throw error

      // Log admin activity
      await supabase.from('admin_activity_log').insert({
        action: 'Created site content',
        target_type: 'content',
        details: { page: newContent.page, section: newContent.section }
      })

      fetchContent()
      setShowAddModal(false)
      setNewContent({
        page: '',
        section: '',
        content_type: 'text',
        title: '',
        content: ''
      })
    } catch (error) {
      console.error('Error creating content:', error)
    }
  }

  const deleteContent = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Log admin activity
      await supabase.from('admin_activity_log').insert({
        action: 'Deleted site content',
        target_type: 'content',
        target_id: id
      })

      fetchContent()
    } catch (error) {
      console.error('Error deleting content:', error)
    }
  }

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return <Type className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'html':
        return <Code className="h-4 w-4" />
      case 'json':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'text':
        return 'text-blue-600 bg-blue-100'
      case 'image':
        return 'text-green-600 bg-green-100'
      case 'html':
        return 'text-purple-600 bg-purple-100'
      case 'json':
        return 'text-orange-600 bg-orange-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const groupedContent = content.reduce((acc, item) => {
    if (!acc[item.page]) {
      acc[item.page] = []
    }
    acc[item.page].push(item)
    return acc
  }, {})

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
            Content Management
          </h2>
          <p className="text-gray-600">
            Manage website content and copy
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </button>
      </div>

      {/* Content Groups */}
      <div className="space-y-6">
        {Object.entries(groupedContent).map(([page, pageContent]) => (
          <div key={page} className="card">
            <div className="flex items-center space-x-2 mb-6">
              <Globe className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-display font-semibold text-gray-900 capitalize">
                {page} Page
              </h3>
              <span className="text-sm text-gray-500">
                ({pageContent.length} item{pageContent.length !== 1 ? 's' : ''})
              </span>
            </div>

            <div className="space-y-4">
              {pageContent.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-colors"
                >
                  {editingContent?.id === item.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                          </label>
                          <input
                            type="text"
                            value={editingContent.section}
                            onChange={(e) =>
                              setEditingContent({ ...editingContent, section: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={editingContent.content_type}
                            onChange={(e) =>
                              setEditingContent({ ...editingContent, content_type: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image URL</option>
                            <option value="html">HTML</option>
                            <option value="json">JSON</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editingContent.title || ''}
                          onChange={(e) =>
                            setEditingContent({ ...editingContent, title: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={editingContent.content || ''}
                          onChange={(e) =>
                            setEditingContent({ ...editingContent, content: e.target.value })
                          }
                          rows={editingContent.content_type === 'html' ? 6 : 4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateContent(item.id, editingContent)}
                          className="btn-primary inline-flex items-center"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingContent(null)}
                          className="btn-outline inline-flex items-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-1 rounded ${getContentTypeColor(item.content_type)}`}>
                            {getContentTypeIcon(item.content_type)}
                          </div>
                          <h4 className="font-medium text-gray-900">{item.section}</h4>
                          {item.title && (
                            <span className="text-sm text-gray-500">• {item.title}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                          {item.content_type === 'html' ? (
                            <div
                              dangerouslySetInnerHTML={{ __html: item.content }}
                              className="prose prose-sm max-w-none"
                            />
                          ) : (
                            <pre className="whitespace-pre-wrap font-sans">
                              {item.content || 'No content'}
                            </pre>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingContent(item)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit content"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteContent(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete content"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedContent).length === 0 && (
        <div className="card text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-6">
            Start by adding some content to manage your website copy
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Content
          </button>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-4">
                Add New Content
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Page
                    </label>
                    <input
                      type="text"
                      value={newContent.page}
                      onChange={(e) => setNewContent({ ...newContent, page: e.target.value })}
                      placeholder="home, about, contact..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section
                    </label>
                    <input
                      type="text"
                      value={newContent.section}
                      onChange={(e) => setNewContent({ ...newContent, section: e.target.value })}
                      placeholder="hero_title, description..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newContent.content_type}
                    onChange={(e) => setNewContent({ ...newContent, content_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image URL</option>
                    <option value="html">HTML</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={newContent.title}
                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    value={newContent.content}
                    onChange={(e) => setNewContent({ ...newContent, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <button
                  onClick={createContent}
                  disabled={!newContent.page || !newContent.section || !newContent.content}
                  className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline inline-flex items-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContentManagement