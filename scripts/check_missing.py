#!/usr/bin/env python3
import re, os

svc_path = 'src/services/operationalService.ts'
store_path = 'src/store/useCoopStore.ts'

with open(svc_path) as f:
    svc = f.read()
svc_funcs = set(re.findall(r'export (?:const|interface|function) (\w+)', svc))

with open(store_path) as f:
    store = f.read()

# Find imports from operationalService
imp_match = re.search(r"from ['\"]\.\./services/operationalService['\"]\s*\n(\s*\(?)([^;]+?)\1;", store, re.DOTALL)
print("=== imports from operationalService (in store) ===")
if imp_match:
    names = re.findall(r'(\w+)', imp_match.group(2))
    for n in names:
        print(f"  {n:45s}  in_service={'YES' if n in svc_funcs else 'NO ----- MISSING'}")
else:
    print("  (none yet)")

print("\n=== all fetchXxxFromSupabase referenced in store ===")
for m in sorted(set(re.findall(r'fetch\w+FromSupabase', store))):
    print(f"  {m:45s}  in_service={'YES' if m in svc_funcs else 'NO ----- MISSING'}")

print("\n=== other xyzInSupabase referenced in store ===")
for m in sorted(set(re.findall(r'(?:create|update|delete|replyTo|markNotification|toggle)\w+InSupabase', store))):
    print(f"  {m:45s}  in_service={'YES' if m in svc_funcs else 'NO ----- MISSING'}")
