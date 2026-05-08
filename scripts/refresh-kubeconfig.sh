#!/bin/bash
# Refresh WSL kubeconfig from Windows minikube — run this every time minikube restarts

echo "Syncing kubeconfig from Windows..."
python3 -c "
import re
raw = open('/mnt/c/Users/shrey/.kube/config').read()

# Normalise all Windows path variants to WSL paths
raw = raw.replace('C:\\\\\\\\Users\\\\\\\\shrey\\\\\\\\', '/mnt/c/Users/shrey/')
raw = raw.replace('C:\\\\Users\\\\shrey\\\\',            '/mnt/c/Users/shrey/')
raw = raw.replace('C:/Users/shrey/',                   '/mnt/c/Users/shrey/')

# Fix any remaining backslashes inside what should be forward-slash paths
import re as re2
# Replace backslash sequences inside value strings
raw = re2.sub(r'(?<=\.minikube)\\\\', '/', raw)
raw = re2.sub(r'(?<=minikube)\\\\',   '/', raw)
raw = raw.replace('\\\\', '/')

open('/home/shreyas/.kube/config', 'w').write(raw)
print('Done.')
for line in raw.splitlines():
    if 'server' in line or 'certificate' in line:
        print(' ', line.strip())
"

echo ""
echo "Testing cluster..."
kubectl get nodes 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "Cluster is live! Run the watcher:"
    echo "  cd watcher-agent && KUBECONFIG=/home/shreyas/.kube/config WATCHER_BACKEND_URL=http://localhost:8000 python3 k8s_watcher.py"
else
    echo ""
    echo "Cluster not reachable. Start minikube from Windows PowerShell first:"
    echo "  minikube start --driver=docker"
fi
