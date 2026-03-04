import { useState } from 'react';
import { Screen, WoundImage, WoundCase } from '../types';
import { useAnalysis } from '../context/AnalysisContext';
import { useAppSettings } from '../context/AppSettingsContext';

interface HistoryScreenProps {
  onNavigate: (screen: Screen) => void;
  onGoBack: () => void;
  history: WoundImage[];
  onSelectWound: (wound: WoundImage) => void;
}

export function HistoryScreen({ onNavigate, onGoBack, history: _history, onSelectWound: _onSelectWound }: HistoryScreenProps) {
  const { woundCases, createNewCase, setCurrentCase, deleteCase } = useAnalysis();
  const { t, settings } = useAppSettings();
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseDesc, setNewCaseDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('next'); // Or a "New" key if I added one
    return new Date(dateString).toLocaleDateString(settings.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleCreateCase = async () => {
    if (!newCaseName.trim()) return;
    setIsCreating(true);
    try {
      const newCase = await createNewCase(newCaseName, newCaseDesc);
      setShowNewCaseModal(false);
      setNewCaseName('');
      setNewCaseDesc('');
      setCurrentCase(newCase);
      onNavigate('wound-progress');
    } catch (e) {
      console.error('Failed to create case', e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectCase = (woundCase: WoundCase) => {
    if (confirmDeleteId) { setConfirmDeleteId(null); return; }
    setCurrentCase(woundCase);
    onNavigate('wound-progress');
  };

  const handleDeletePress = (e: React.MouseEvent, caseId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === caseId) {
      setDeletingCaseId(caseId);
      setConfirmDeleteId(null);
      deleteCase(caseId).finally(() => setDeletingCaseId(null));
    } else {
      setConfirmDeleteId(caseId);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const filteredCases = woundCases.filter(c =>
    c.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  );


  return (
    <div className="min-h-screen bg-[#F9FBFF] p-4 pb-20 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onGoBack}
            className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{t('myCases')}</h1>
            <p className="text-sm text-gray-500">{t('activeCases', { count: woundCases.length })}</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewCaseModal(true)}
          className="w-10 h-10 bg-[#8B5CF6] rounded-xl shadow-md flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchCases')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] transition-all text-gray-800"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Cases List */}
      {filteredCases.length > 0 ? (
        <div className="space-y-4">
          {filteredCases.map((woundCase) => (
            <div key={woundCase.id} className="relative">
              {/* Card */}
              <button
                onClick={() => handleSelectCase(woundCase)}
                className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left pr-20"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {woundCase.latestImage ? (
                      <img src={woundCase.latestImage} alt={woundCase.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-800 text-lg truncate">{woundCase.name}</h3>
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                        {t('scans', { count: woundCase.woundCount })}
                      </span>
                    </div>
                    {woundCase.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{woundCase.description}</p>
                    )}

                    {/* Status Badge */}
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: (woundCase as any).latest_risk === 'critical' ? '#EB5757' : (woundCase as any).latest_risk === 'infected' ? '#F2994A' : (woundCase as any).latest_risk === 'warning' ? '#F2C94C' : '#27AE60' }}
                      >
                        {(woundCase as any).latest_risk || 'Normal'}
                      </div>
                      <div className="text-xs font-semibold text-gray-700">
                        {(woundCase as any).latest_score || 0}% Score
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{t('startedOn', { date: formatDate(woundCase.createdAt) })}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-gray-300 self-center flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Case Actions — overlaid top-right */}
              <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                {confirmDeleteId === woundCase.id ? (
                  <>
                    <button
                      onClick={(e) => handleDeletePress(e, woundCase.id)}
                      disabled={deletingCaseId === woundCase.id}
                      className="text-xs text-white bg-red-500 px-3 py-1.5 rounded-lg font-semibold shadow"
                    >
                      {deletingCaseId === woundCase.id ? t('deleting') : `✓ ${t('confirmDelete')}`}
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg"
                    >
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleDeletePress(e, woundCase.id)}
                      className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors shadow-sm"
                      title="Delete case"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchQuery ? t('noMatchingCases') : t('noCasesYet')}
          </h3>
          <p className="text-gray-500 max-w-xs mb-6">
            {searchQuery
              ? t('noMatchingDesc', { query: searchQuery })
              : t('noCasesDesc')}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="bg-[#8B5CF6] text-white px-6 py-3 rounded-xl font-medium shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('createCase')}
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#8B5CF6] font-medium"
            >
              {t('clearSearch')}
            </button>
          )}
        </div>
      )}

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{t('newWoundCase')}</h2>
              <button onClick={() => setShowNewCaseModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('caseNameLabel')}</label>
                <input
                  type="text"
                  placeholder={t('caseNamePlaceholder')}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]"
                  value={newCaseName}
                  onChange={(e) => setNewCaseName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('descriptionOptional')}</label>
                <textarea
                  placeholder={t('notesPlaceholder')}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] h-24 resize-none"
                  value={newCaseDesc}
                  onChange={(e) => setNewCaseDesc(e.target.value)}
                />
              </div>
              <button
                onClick={handleCreateCase}
                disabled={!newCaseName.trim() || isCreating}
                className="w-full bg-[#8B5CF6] text-white py-3 rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreating && (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t('createCase')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
