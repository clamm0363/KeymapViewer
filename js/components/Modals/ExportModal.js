const { createElement } = React;

export function ExportModal({ isLightApp, isExporting, onExport, onClose }) {
    return createElement('div', { key: 'export-modal', className: 'fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm', onClick: () => !isExporting && onClose() }, [
        createElement('div', { key: 'export-content', className: (isLightApp ? 'bg-white' : 'bg-slate-900') + ' border rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6', onClick: (e) => e.stopPropagation() }, [
            createElement('h3', { key: 'h3', className: 'text-lg font-black uppercase tracking-wide mb-6' }, 'Export Image'),
            createElement('div', { key: 'export-body', className: 'space-y-6' }, [
                createElement('button', { 
                    key: 'dl-btn', 
                    onClick: onExport, 
                    disabled: isExporting, 
                    className: 'w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all' 
                }, isExporting ? 'Generating...' : 'Download PNG')
            ])
        ])
    ]);
}
