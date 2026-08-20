import os
import re

# Mapping of light mode classes to their dark mode counterparts
MAPPING = {
    "bg-white": "dark:bg-slate-900",
    "bg-gray-50": "dark:bg-slate-950",
    "bg-gray-100": "dark:bg-slate-800",
    "bg-gray-200": "dark:bg-slate-700",
    "text-gray-900": "dark:text-gray-100",
    "text-gray-800": "dark:text-gray-200",
    "text-gray-700": "dark:text-gray-300",
    "text-gray-600": "dark:text-gray-400",
    "text-gray-500": "dark:text-gray-400",
    "border-gray-100": "dark:border-slate-800",
    "border-gray-200": "dark:border-slate-700",
    "border-gray-300": "dark:border-slate-600",
    "bg-blue-50": "dark:bg-blue-900/30",
    "text-blue-600": "dark:text-blue-400",
    "text-blue-700": "dark:text-blue-400",
    "text-blue-800": "dark:text-blue-300",
    "hover:bg-blue-100": "dark:hover:bg-blue-900/50",
    "hover:text-blue-800": "dark:hover:text-blue-300",
    "bg-red-50": "dark:bg-red-900/30",
    "text-red-600": "dark:text-red-400",
    "text-red-700": "dark:text-red-400",
    "text-red-800": "dark:text-red-300",
    "hover:bg-red-100": "dark:hover:bg-red-900/50",
    "hover:text-red-800": "dark:hover:text-red-300",
    "bg-green-50": "dark:bg-green-900/30",
    "text-green-700": "dark:text-green-400",
    "hover:bg-gray-50": "dark:hover:bg-slate-800/50",
    "hover:bg-gray-100": "dark:hover:bg-slate-800",
    "hover:text-gray-900": "dark:hover:text-gray-100",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    new_lines = []
    changed = False
    
    for line in lines:
        original_line = line
        for light_cls, dark_cls in MAPPING.items():
            # Check if light_cls exists as a whole word
            if re.search(r'\b' + re.escape(light_cls) + r'\b', line):
                # Check if dark_cls doesn't exist on this line
                if not re.search(r'\b' + re.escape(dark_cls) + r'\b', line):
                    # Replace light_cls with light_cls + " " + dark_cls
                    line = re.sub(r'\b' + re.escape(light_cls) + r'\b', f"{light_cls} {dark_cls}", line)
        
        new_lines.append(line)
        if line != original_line:
            changed = True
            
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))
        print(f"Updated {filepath}")
        return True
    return False

def main():
    base_dir = r"d:\ldk-al-hidayah\src"
    updated_count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    updated_count += 1
    
    print(f"Total files updated: {updated_count}")

if __name__ == "__main__":
    main()
