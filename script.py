
with open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
depth = 0
for i, line in enumerate(lines):
    for c in line:
        if c == '{': depth += 1
        elif c == '}': depth -= 1
    print(f'Line {i+1}: Depth={depth}')

