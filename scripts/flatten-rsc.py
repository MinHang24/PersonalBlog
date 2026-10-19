import os, shutil

# 把 out/**/__next.HASH/<route>/__PAGE__.txt 复制为扁平命名 __next.HASH.<route>.__PAGE__.txt
count = 0
for root, dirs, files in os.walk("out"):
    for f in files:
        if f == "__PAGE__.txt":
            src = os.path.join(root, f)
            parts = root.replace(os.sep, "/").split("/")
            for i, p in enumerate(parts):
                if p.startswith("__next."):
                    hash_seg = p
                    route_parts = parts[i + 1:]
                    route = ".".join(route_parts)
                    flat_name = f"{hash_seg}.{route}.__PAGE__.txt"
                    flat_dir = os.path.join(*parts[:i]) if parts[:i] else "out"
                    dst = os.path.join(flat_dir, flat_name)
                    shutil.copy2(src, dst)
                    count += 1
                    print(dst.replace(os.sep, "/"))
print(f"生成扁平副本: {count} 个")
