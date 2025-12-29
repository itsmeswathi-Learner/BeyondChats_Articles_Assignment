import React, { useState, useEffect } from 'react';
import { Search, Download, Moon, Sun, ChevronLeft, ChevronRight, Loader2, AlertCircle, FileText, Sparkles, ExternalLink, Calendar, User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const BeyondChatsApp = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, filterType]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/articles?limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;

    if (filterType === 'original') {
      filtered = filtered.filter(article => !article.isUpdated);
    } else if (filterType === 'updated') {
      filtered = filtered.filter(article => article.isUpdated);
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredArticles(filtered);
    setCurrentPage(1);
  };

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredArticles, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beyondchats-articles-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textClass = darkMode ? 'text-gray-100' : 'text-gray-900';
  const textMutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';

  const stats = {
    total: articles.length,
    original: articles.filter(a => !a.isUpdated).length,
    updated: articles.filter(a => a.isUpdated).length
  };

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardClass} border-b sticky top-0 z-10 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                BeyondChats Articles
              </h1>
              <p className={`text-sm ${textMutedClass} mt-2`}>
                Original and AI-Enhanced Content Library
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:scale-110 transition-transform`}
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`${cardClass} border rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Total Articles</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} border rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>Original</p>
                  <p className="text-2xl font-bold">{stats.original}</p>
                </div>
              </div>
            </div>
            <div className={`${cardClass} border rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className={`text-xs ${textMutedClass}`}>AI-Enhanced</p>
                  <p className="text-2xl font-bold">{stats.updated}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${textMutedClass}`} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Articles</option>
              <option value="original">Original Only</option>
              <option value="updated">AI-Enhanced Only</option>
            </select>

            <button
              onClick={exportToJSON}
              disabled={filteredArticles.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg">Loading articles...</p>
          </div>
        )}

        {error && (
          <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-6 mb-6`}>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-400 text-lg">Error Loading Articles</h3>
                <p className={`text-sm ${textMutedClass} mt-2`}>{error}</p>
                <button
                  onClick={fetchArticles}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <FileText className={`w-20 h-20 mx-auto ${textMutedClass} mb-4`} />
            <h3 className="text-2xl font-semibold mb-2">No articles found</h3>
            <p className={textMutedClass}>Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && !error && currentArticles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentArticles.map((article) => (
                <div
                  key={article._id}
                  className={`${cardClass} border rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1`}
                  onClick={() => setSelectedArticle(article)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      article.isUpdated 
                        ? 'bg-purple-500/20 text-purple-600' 
                        : 'bg-green-500/20 text-green-600'
                    }`}>
                      {article.isUpdated ? (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI-Enhanced
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" /> Original
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                  
                  <p className={`${textMutedClass} text-sm mb-4 line-clamp-3`}>
                    {article.content.substring(0, 150)}...
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(article.createdAt)}
                    </div>
                  </div>

                  {article.references && article.references.length > 0 && (
                    <div className={`text-xs ${textMutedClass} flex items-center gap-1`}>
                      <ExternalLink className="w-3 h-3" />
                      {article.references.length} references
                    </div>
                  )}

                  <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Read Full Article
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <span className={`px-4 py-2 ${textMutedClass}`}>
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedArticle(null)}>
          <div className={`${cardClass} rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                    selectedArticle.isUpdated ? 'bg-white/20' : 'bg-white/20'
                  }`}>
                    {selectedArticle.isUpdated ? '✨ AI-Enhanced Article' : '📄 Original Article'}
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedArticle.title}</h2>
                  <div className="flex items-center gap-4 text-sm opacity-90">
                    <span>By {selectedArticle.author}</span>
                    <span>•</span>
                    <span>{formatDate(selectedArticle.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {selectedArticle.content}
                </div>
              </div>

              {selectedArticle.references && selectedArticle.references.length > 0 && (
                <div className={`mt-8 p-6 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    References
                  </h3>
                  <ul className="space-y-3">
                    {selectedArticle.references.map((ref, index) => (
                      <li key={index} className={`${textMutedClass}`}>
                        <strong>{index + 1}. {ref.title}</strong>
                        <br />
                        <a 
                          href={ref.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline text-sm"
                        >
                          {ref.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
              href="https://www.beyondchats.com/blogs"
  target="_blank"
  rel="noopener noreferrer"
  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
>
  View BeyondChats Blog
  <ExternalLink className="w-4 h-4" />
</a>



               
            </div>
          </div>
        </div>
      )}

      <footer className={`${cardClass} border-t mt-12`}>
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className={`text-sm ${textMutedClass}`}>
            BeyondChats Full Stack Developer Internship Assignment
          </p>
          <p className={`text-xs ${textMutedClass} mt-2`}>
            Built with React, Node.js, MongoDB, and Claude AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BeyondChatsApp;