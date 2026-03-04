import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { WoundCase } from '../types';

export const reportGenerator = {
  getFileName: (currentCaseName: string) => {
    // Sanitize filename: Replace non-alphanumeric (except . - _) with underscore
    const sanitizedCaseName = currentCaseName.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `WoundReport_${sanitizedCaseName}_${timestamp}.html`;
  },

  generateReportHtml: (currentCase: WoundCase, sortedHistory: any[], currentScore: number, improvement: number, t: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${t('woundProgressReport' as any) || 'Wound Progress Report'} - ${currentCase.name}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #f9fbff; }
          .container { background: white; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          h1 { color: #8B5CF6; font-size: 2.25rem; margin-bottom: 0.5rem; }
          .case-header { border-bottom: 2px solid #f3f4f6; margin-bottom: 2rem; padding-bottom: 1.5rem; }
          .case-title { font-size: 1.5rem; font-weight: 700; color: #111827; }
          .case-meta { color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem; }
          .summary-box { background: #8B5CF6; color: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
          .summary-metric { text-align: center; flex: 1; }
          .summary-label { font-size: 0.75rem; text-transform: uppercase; opacity: 0.9; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
          .summary-value { font-size: 1.5rem; font-weight: 700; }
          .section-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem; }
          .scan-card { background: white; border: 1px solid #e5e7eb; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1rem; }
          .scan-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
          .scan-date { font-weight: 600; color: #4b5563; }
          .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: white; }
          .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .metric-item { background: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; text-align: center; }
          .metric-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
          .metric-value { font-size: 1rem; font-weight: 600; color: #111827; }
          .rec-box { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f3f4f6; font-size: 0.875rem; color: #4b5563; }
          @media print { body { background: white; padding: 0; } .container { box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="case-header">
            <h1>${t('woundCareProgress' as any) || 'Wound Care Progress'}</h1>
            <div class="case-title">${currentCase.name}</div>
            <div class="case-meta">Case ID: ${currentCase.id} • Started: ${new Date(currentCase.createdAt).toLocaleDateString()}</div>
          </div>
 
          <div class="summary-box">
             <div class="summary-metric">
                <div class="summary-label">${t('currentScore' as any) || 'Current Score'}</div>
                <div class="summary-value">${currentScore}%</div>
             </div>
             <div class="summary-metric">
                <div class="summary-label">${t('totalScans' as any) || 'Total Scans'}</div>
                <div class="summary-value">${sortedHistory.length}</div>
             </div>
             <div class="summary-metric">
                <div class="summary-label">${t('healingProgress' as any) || 'Healing Progress'}</div>
                <div class="summary-value">${improvement > 0 ? '+' : ''}${improvement}%</div>
             </div>
          </div>
 
          <p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 2rem;">
            ${currentCase.description || 'No additional case description provided.'}
          </p>
 
          <div class="section-title">${t('timelineAnalysis' as any) || 'Timeline & Detailed Analysis'}</div>
          
          ${sortedHistory.map((scan) => `
            <div class="scan-card">
              <div class="scan-header">
                <div class="scan-date">${new Date(scan.date || scan.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div class="status-badge" style="background: ${scan.analysis?.statusColor || '#27AE60'}">
                  ${scan.analysis?.statusLabel || 'Healthy'}
                </div>
              </div>
              <div class="metric-grid">
                <div class="metric-item">
                  <div class="metric-label">${t('healingScore' as any) || 'Healing Score'}</div>
                  <div class="metric-value">${scan.analysis?.healingScore || 0}%</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">${t('redness' as any) || 'Redness'}</div>
                  <div class="metric-value">${scan.analysis?.rednessLevel || 0}/10</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">${t('swelling' as any) || 'Swelling'}</div>
                  <div class="metric-value">${scan.analysis?.swellingLevel || 0}/10</div>
                </div>
              </div>
              ${scan.analysis?.backendResults?.recommendation ? `
                <div class="rec-box">
                  <strong>Recommendation:</strong> ${scan.analysis.backendResults.recommendation}
                </div>
              ` : ''}
            </div>
          `).join('')}
 
          <div style="margin-top: 4rem; text-align: center; color: #9ca3af; font-size: 0.75rem;">
            Generated by WoundCare AI on ${new Date().toLocaleString()}
          </div>
        </div>
      </body>
      </html>
    `;
  },

  shareReport: async (currentCase: WoundCase, sortedHistory: any[], currentScore: number, improvement: number, t: any, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => {
    const reportHtml = reportGenerator.generateReportHtml(currentCase, sortedHistory, currentScore, improvement, t);
    const fileName = reportGenerator.getFileName(currentCase.name);

    if (Capacitor.isNativePlatform()) {
      try {
        // 1. Write to Cache first (sharing needs a file URI)
        const result = await Filesystem.writeFile({
          path: fileName,
          data: reportHtml,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        // 2. Share the file
        await Share.share({
          title: 'Wound Progress Report',
          text: `Progress report for ${currentCase.name}`,
          url: result.uri,
          dialogTitle: 'Share Wound Report',
        });
      } catch (e) {
        console.error('Error sharing report:', e);
        showToast('Failed to share report.', 'error');
      }
    } else {
      // Fallback for Web: Just download
      showToast('Sharing is not available on web. Downloading instead.', 'info');
      await reportGenerator.downloadReport(currentCase, sortedHistory, currentScore, improvement, t, showToast);
    }
  },

  downloadReport: async (currentCase: WoundCase, sortedHistory: any[], currentScore: number, improvement: number, t: any, showToast: (msg: string, type?: 'success' | 'error' | 'info') => void) => {
    const reportHtml = reportGenerator.generateReportHtml(currentCase, sortedHistory, currentScore, improvement, t);
    const fileName = reportGenerator.getFileName(currentCase.name);

    if (Capacitor.isNativePlatform()) {
      try {
        // Request permissions first
        const perm = await Filesystem.requestPermissions();
        if (perm.publicStorage !== 'granted') {
          showToast('Storage permission required to download report.', 'error');
          return;
        }

        // Try writing to Documents (primary target)
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: reportHtml,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
          });
          showToast(`${t('reportDownloadedSuccess' as any) || 'Report saved to Documents'}: ${fileName}`, 'success');
        } catch (docError) {
          console.warn('Failed to save to Documents, trying External storage:', docError);

          // Fallback to External storage (often more accessible for sharing)
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: reportHtml,
              directory: Directory.External,
              encoding: Encoding.UTF8,
            });
            showToast(`Report saved to External storage: ${fileName}`, 'success');
          } catch (extError) {
            console.warn('Failed to save to External, trying Cache:', extError);

            // Last resort: Cache directory (always accessible)
            await Filesystem.writeFile({
              path: fileName,
              data: reportHtml,
              directory: Directory.Cache,
              encoding: Encoding.UTF8,
            });
            showToast(`Report saved to Cache: ${fileName}. Use Share to export.`, 'info');
          }
        }
      } catch (e) {
        console.error('Error saving report:', e);
        showToast('Failed to save report. Please check storage permissions.', 'error');
        throw e;
      }
    } else {
      const blob = new Blob([reportHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
};
