import sys

with open(r'd:\PROJECTS\Mye3-Elearning\frontend\src\pages\admin\LiveMonitor.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with the button container div
start_line = None
end_line = None
for i, line in enumerate(lines):
    if 'opacity-0 group-hover/card:opacity-100' in line and 'flex items-center gap-1' in line:
        start_line = i
    if start_line is not None and '</div>' in line and i > start_line and i < start_line + 30:
        # Find the closing div for the button container (it's indented the same level)
        end_line = i
        break

if start_line is None:
    print('Could not find start line')
    sys.exit(1)

print(f'Found block at lines {start_line+1}-{end_line+1}')
for i in range(start_line, end_line+1):
    print(f'{i+1}: {repr(lines[i])}')
