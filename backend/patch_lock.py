import sys

with open(r'd:\PROJECTS\Mye3-Elearning\frontend\src\pages\admin\LiveMonitor.jsx', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.splitlines(keepends=True)

# Find lines 764-783 (0-indexed: 763-782)
start = 763
end = 783

print('Lines to replace:')
for i in range(start, end):
    print(f'{i+1}: {repr(lines[i])}')

# Build the new block using the exact indentation from line 764
indent = '                                                                                                '
indent2 = indent + '    '
indent3 = indent + '        '
indent4 = indent + '            '
indent5 = indent + '                '
indent6 = indent + '                    '

new_lines = [
    indent + '<div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">\n',
    indent2 + '{!isEnded && !isLive && (() => {\n',
    indent3 + 'const isPast = new Date(s.startTime) < new Date();\n',
    indent3 + 'if (deleteConfirmId === s._id) {\n',
    indent4 + 'return (\n',
    indent5 + '<button onClick={() => handleDeleteSession(s._id)} className="p-1 text-white bg-rose-600 rounded flex gap-1 items-center">\n',
    indent6 + '<Trash2 className="w-3 h-3" />\n',
    indent5 + '</button>\n',
    indent4 + ');\n',
    indent3 + '}\n',
    indent3 + 'if (isPast) {\n',
    indent4 + 'return (\n',
    indent5 + '<>\n',
    indent5 + '    <span title="Session time has passed \u2014 cannot edit" className="p-1 text-slate-300 cursor-not-allowed">\n',
    indent5 + '        <Lock className="w-3 h-3" />\n',
    indent5 + '    </span>\n',
    indent5 + '    <button onClick={() => setDeleteConfirmId(s._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete">\n',
    indent5 + '        <Trash2 className="w-3 h-3" />\n',
    indent5 + '    </button>\n',
    indent5 + '</>\n',
    indent4 + ');\n',
    indent3 + '}\n',
    indent3 + 'return (\n',
    indent4 + '<>\n',
    indent4 + '    <button onClick={() => openCellScheduler(lvl, date, s)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">\n',
    indent4 + '        <Edit2 className="w-3 h-3" />\n',
    indent4 + '    </button>\n',
    indent4 + '    <button onClick={() => setDeleteConfirmId(s._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Delete">\n',
    indent4 + '        <Trash2 className="w-3 h-3" />\n',
    indent4 + '    </button>\n',
    indent4 + '</>\n',
    indent3 + ');\n',
    indent2 + '})()}\n',
    indent + '</div>\n',
]

new_content_lines = lines[:start] + new_lines + lines[end:]
new_content = ''.join(new_content_lines)

with open(r'd:\PROJECTS\Mye3-Elearning\frontend\src\pages\admin\LiveMonitor.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'\nSUCCESS: Replaced lines {start+1}-{end} with {len(new_lines)} new lines')
